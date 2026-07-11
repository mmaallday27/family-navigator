// The AI navigator, now living in the real backend (moved from the Vite dev
// plugin) so there is one coherent server. Same guarantees: the key stays
// server-side, the model is grounded in the family's facts + the deterministic
// reference answer, output is forced to the trust-labeled schema, and it
// reasons with docs/REASONING.md loaded as a cached foundation.

import type { Request, Response } from 'express'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import Anthropic from '@anthropic-ai/sdk'

const MODEL = 'claude-opus-4-8'

const SYSTEM_PROMPT = `You are the Navigator inside Family Navigator — a lifelong guide for a family raising a person with autism or a developmental disability. You are speaking to the parent-coordinator.

VOICE: A calm, prepared, grounded expert peer. Warm but never saccharine, never clinical, never chirpy, never dramatic. Confidence comes from competence. Short sentences. Lead with what matters.

WHAT YOU DO: brief, explain, prepare, compare, and organize the family's thinking. WHAT YOU NEVER DO: make a medical, legal, or financial decision for them; diagnose; or invent facts.

GROUNDING — this is the most important rule: You are given a FACT SHEET about this specific family and a REFERENCE ANSWER already computed by the platform's deterministic engine. Every concrete claim you make — dates, ages, progress numbers, checklist items, document names, deadlines, eligibility — MUST come from the fact sheet or reference answer. If a needed fact is not present, say plainly that you don't have it and would need to check, rather than guessing. Never fabricate a date, dollar amount, statute, or eligibility determination.

TRUST LABELING: Set "kind" to "record" when the answer is built primarily from this family's own fact sheet (their progress, their documents, their dates). Set it to "educational" when it is general guidance about how the system works. For any topic touching legal decisions (guardianship, powers of attorney), benefits eligibility (SSI, Medicaid, waivers), or medical matters, fill "professionalNote" with one sentence naming the kind of professional they should bring it to; otherwise set "professionalNote" to an empty string.

STYLE OF ANSWER: Open with a direct, personalized "intro" (use the child's first name). Use "points" for a few short titled explanations, or "sections" for grouped bullet lists (agendas, option comparisons, scenarios) — use whichever fits, and leave the other empty. Offer 1–3 concrete, small "nextSteps" sized in minutes, not weekends. Prefer the least-restrictive, strengths-first framing. Reduce uncertainty; never add cognitive load.

You must respond ONLY with a JSON object matching the provided schema. Do not include any prose outside the JSON.`

const RELEVANT_DOMAINS: Record<string, string> = {
  recognition:
    'Special Education, Healthcare Transition (early awareness), Insurance, Financial Planning (start early), Long-Term Planning (a letter of intent can begin now)',
  early:
    'IEP Planning, Special Education, Insurance, Medicaid, Financial Planning, ABLE & Special Needs Trusts (set up early), Long-Term Planning',
  school:
    'IEP Planning, Special Education, Transition Planning (begins mid-teens), Healthcare Transition, Insurance, Medicaid, Financial Planning',
  transition:
    'Transition Planning, IEP Planning, Employment, Vocational Rehabilitation, College, Independent Living, SSI, SSDI/DAC, Medicaid, Waivers, Guardianship, Supported Decision-Making, Legal Planning, ABLE, Special Needs Trusts, Healthcare Transition',
  adult:
    'Employment, Adult Services, Housing, Waivers, Medicaid, Community Participation, Safety, Emergency Planning, Long-Term Planning, Future Caregiving, Aging Parents, Sibling Transitions',
}

const OUTPUT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    kind: { type: 'string', enum: ['record', 'educational'] },
    intro: { type: 'string' },
    points: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: { title: { type: 'string' }, body: { type: 'string' } },
        required: ['title', 'body'],
      },
    },
    sections: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          heading: { type: 'string' },
          items: { type: 'array', items: { type: 'string' } },
        },
        required: ['heading', 'items'],
      },
    },
    nextSteps: { type: 'array', items: { type: 'string' } },
    professionalNote: { type: 'string' },
  },
  required: ['kind', 'intro', 'points', 'sections', 'nextSteps', 'professionalNote'],
}

let client: Anthropic | null = null
let systemText = SYSTEM_PROMPT

export function initNavigator() {
  const key = process.env.ANTHROPIC_API_KEY || ''
  client = key ? new Anthropic({ apiKey: key }) : null
  try {
    const doc = readFileSync(resolve(process.cwd(), 'docs/REASONING.md'), 'utf8')
    systemText = `${SYSTEM_PROMPT}

=== REASONING FOUNDATION ===
Reason in accordance with the architecture below. It is how our best multidisciplinary team thinks: the reasoning loop, the expert panel, the confidence ladder, the domain modules, and the cross-domain knowledge graph. It teaches METHOD — it is never a source of this family's facts (use only the fact sheet and reference answer for those), and its benefit/legal specifics are marked "verify" precisely because you must not state them as settled.

${doc}
=== END REASONING FOUNDATION ===

Reminder: rely only on the fact sheet and reference answer for concrete facts about this family. Trace the knowledge-graph edges and surface the dependency they didn't ask about but most need to see. Respond ONLY with the JSON object matching the schema.`
  } catch {
    systemText = SYSTEM_PROMPT
  }
  return !!client
}

function factSheet(facts: any): string {
  const lines: string[] = []
  const push = (label: string, value: unknown) => {
    if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) return
    lines.push(`${label}: ${Array.isArray(value) ? value.join('; ') : value}`)
  }
  push('Child', `${facts.childName} (goes by ${facts.childFirst})`)
  push('Parent/coordinator', facts.parentFirst)
  push('Age', facts.age)
  push('Diagnosis', facts.diagnosis)
  push('Current lifecycle stage', `${facts.stageTitle} (${facts.stageId})`)
  push('Strengths', facts.strengths)
  push('Interests', facts.interests)
  push('Communication', facts.communication)
  if (facts.transition) {
    const t = facts.transition
    push(
      'Transition progress',
      `${t.done} of ${t.total} steps done (${t.pct}%); current focus track: ${t.currentTrackAge} — ${t.currentTrackTitle}`,
    )
    push('Open transition steps', t.openItems)
  }
  if (Array.isArray(facts.documents) && facts.documents.length > 0) {
    push(
      'Documents in vault',
      facts.documents.map((d: any) => `${d.name} [${d.category}]${d.flagged ? ` — FLAGGED: ${d.note ?? 'needs attention'}` : ''}`),
    )
  }
  push('Saved resources', facts.savedResources)
  if (Array.isArray(facts.goals) && facts.goals.length > 0) {
    push('Goals', facts.goals.map((g: any) => `${g.title} (${g.area}, due ${g.due}, ${g.progress}%)`))
  }
  if (Array.isArray(facts.keyDates) && facts.keyDates.length > 0) {
    push('Key upcoming dates', facts.keyDates.map((d: any) => `${d.title} — ${d.dateLabel}`))
  }
  push('Topics already discussed with you', facts.topicsDiscussed)
  return lines.join('\n')
}

async function generate(payload: any) {
  const { message, facts, grounding, history } = payload
  const historyText =
    Array.isArray(history) && history.length > 0
      ? history.slice(-8).map((m: any) => `${m.role === 'user' ? 'Parent' : 'You'}: ${m.text}`).join('\n')
      : '(none yet)'
  const relevant = RELEVANT_DOMAINS[facts?.stageId] ?? ''
  const stageHint = relevant
    ? `\nMost relevant reasoning modules for this family right now (from the Reasoning Foundation): ${relevant}.`
    : ''

  const userContent = `FACT SHEET (the only source of concrete facts about this family):
${factSheet(facts)}${stageHint}

REFERENCE ANSWER (the platform's deterministic engine already answered this question — use it as your grounding; you may rephrase, deepen, and personalize, but do not contradict its facts):
${JSON.stringify(grounding, null, 2)}

RECENT CONVERSATION:
${historyText}

The parent just asked:
"${message}"

Respond with the JSON object only.`

  const body = {
    model: MODEL,
    max_tokens: 2048,
    system: [{ type: 'text', text: systemText, cache_control: { type: 'ephemeral' } }],
    output_config: { format: { type: 'json_schema', schema: OUTPUT_SCHEMA }, effort: 'medium' },
    messages: [{ role: 'user', content: userContent }],
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response: any = await client!.messages.create(body as any)
  const blocks = (response?.content ?? []) as Array<{ type: string; text?: string }>
  const textBlock = blocks.find((b) => b.type === 'text' && typeof b.text === 'string')
  if (!textBlock?.text) throw new Error('no text block in response')
  const parsed = JSON.parse(textBlock.text)
  if (parsed.professionalNote === '') delete parsed.professionalNote
  return parsed
}

export function navigatorStatus(_req: Request, res: Response) {
  res.json({ configured: !!client })
}

export async function navigatorHandler(req: Request, res: Response) {
  if (!client) return res.status(503).json({ ok: false, error: 'navigator not configured' })
  try {
    const payload = req.body
    if (!payload?.message || !payload?.facts || !payload?.grounding) {
      return res.status(400).json({ ok: false, error: 'missing message, facts, or grounding' })
    }
    const response = await generate(payload)
    res.json({ ok: true, response, source: 'ai' })
  } catch (err) {
    res.status(500).json({ ok: false, error: 'generation failed' })
    // eslint-disable-next-line no-console
    console.error('[navigator]', err instanceof Error ? err.message : err)
  }
}
