// Server-side navigator proxy, delivered as a Vite dev-server plugin so that
// `npm run dev` "just works" once an ANTHROPIC_API_KEY is present — with the
// key held in Node, never shipped to the browser. The same handler shape is
// reused by the serverless function under /api for production (see README).
//
// Design guarantees:
//   • The model is GROUNDED. It receives the family's real facts plus the
//     deterministic engine's own answer as reference material, and is told to
//     rely on them — so it cannot invent dates, progress, or eligibility.
//   • The trust layer SURVIVES. Output is forced to a structured schema that
//     carries the fact-vs-guidance label and the professional-consultation note.
//   • It DEGRADES. No key → the status endpoint reports unconfigured and the
//     client uses the deterministic engine. Any error → 500, same fallback.

import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import { loadEnv } from 'vite'
import Anthropic from '@anthropic-ai/sdk'

const MODEL = 'claude-opus-4-8'

const SYSTEM_PROMPT = `You are the Navigator inside Family Navigator — a lifelong guide for a family raising a person with autism or a developmental disability. You are speaking to the parent-coordinator.

VOICE: A calm, prepared, grounded expert peer. Warm but never saccharine, never clinical, never chirpy, never dramatic. Confidence comes from competence. Short sentences. Lead with what matters.

WHAT YOU DO: brief, explain, prepare, compare, and organize the family's thinking. WHAT YOU NEVER DO: make a medical, legal, or financial decision for them; diagnose; or invent facts.

GROUNDING — this is the most important rule: You are given a FACT SHEET about this specific family and a REFERENCE ANSWER already computed by the platform's deterministic engine. Every concrete claim you make — dates, ages, progress numbers, checklist items, document names, deadlines, eligibility — MUST come from the fact sheet or reference answer. If a needed fact is not present, say plainly that you don't have it and would need to check, rather than guessing. Never fabricate a date, dollar amount, statute, or eligibility determination.

TRUST LABELING: Set "kind" to "record" when the answer is built primarily from this family's own fact sheet (their progress, their documents, their dates). Set it to "educational" when it is general guidance about how the system works. For any topic touching legal decisions (guardianship, powers of attorney), benefits eligibility (SSI, Medicaid, waivers), or medical matters, fill "professionalNote" with one sentence naming the kind of professional they should bring it to; otherwise set "professionalNote" to an empty string.

STYLE OF ANSWER: Open with a direct, personalized "intro" (use the child's first name). Use "points" for a few short titled explanations, or "sections" for grouped bullet lists (agendas, option comparisons, scenarios) — use whichever fits, and leave the other empty. Offer 1–3 concrete, small "nextSteps" sized in minutes, not weekends. Prefer the least-restrictive, strengths-first framing. Reduce uncertainty; never add cognitive load.

You must respond ONLY with a JSON object matching the provided schema. Do not include any prose outside the JSON.`

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
} as const

function factSheet(facts: any): string {
  const lines: string[] = []
  const push = (label: string, value: unknown) => {
    if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) return
    lines.push(`${label}: ${Array.isArray(value) ? value.join('; ') : value}`)
  }
  push('Child', `${facts.childName} (goes by ${facts.childFirst})`)
  push('Parent/coordinator', facts.parentFirst)
  push('Age', facts.age)
  push('Pronouns', facts.pronouns)
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

function readBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', (chunk) => {
      raw += chunk
      if (raw.length > 1_000_000) reject(new Error('payload too large'))
    })
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {})
      } catch (e) {
        reject(e)
      }
    })
    req.on('error', reject)
  })
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status
  res.setHeader('content-type', 'application/json')
  res.end(JSON.stringify(body))
}

async function generate(client: Anthropic, payload: any) {
  const { message, facts, grounding, history } = payload
  const historyText =
    Array.isArray(history) && history.length > 0
      ? history
          .slice(-8)
          .map((m: any) => `${m.role === 'user' ? 'Parent' : 'You'}: ${m.text}`)
          .join('\n')
      : '(none yet)'

  const userContent = `FACT SHEET (the only source of concrete facts about this family):
${factSheet(facts)}

REFERENCE ANSWER (the platform's deterministic engine already answered this question — use it as your grounding; you may rephrase, deepen, and personalize, but do not contradict its facts):
${JSON.stringify(grounding, null, 2)}

RECENT CONVERSATION:
${historyText}

The parent just asked:
"${message}"

Respond with the JSON object only.`

  // `output_config` (structured outputs) and `effort` are newer than this
  // pinned SDK's request types, but the SDK forwards them in the body verbatim.
  // Cast around the type gap; the response is read defensively.
  const body = {
    model: MODEL,
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    output_config: { format: { type: 'json_schema', schema: OUTPUT_SCHEMA }, effort: 'medium' },
    messages: [{ role: 'user', content: userContent }],
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response: any = await client.messages.create(body as any)

  const blocks = (response?.content ?? []) as Array<{ type: string; text?: string }>
  const textBlock = blocks.find((b) => b.type === 'text' && typeof b.text === 'string')
  if (!textBlock?.text) throw new Error('no text block in response')
  const parsed = JSON.parse(textBlock.text)
  // Normalize the empty-string professionalNote back to undefined for the UI.
  if (parsed.professionalNote === '') delete parsed.professionalNote
  return parsed
}

export function navigatorPlugin(): Plugin {
  let apiKey = ''
  let client: Anthropic | null = null

  return {
    name: 'family-navigator-ai',
    configResolved(config) {
      // loadEnv reads .env files including unprefixed vars (server-side only).
      const env = loadEnv(config.mode, process.cwd(), '')
      apiKey = env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY || ''
      if (apiKey) client = new Anthropic({ apiKey })
    },
    configureServer(server) {
      server.middlewares.use('/api/navigator/status', (_req, res) => {
        sendJson(res, 200, { configured: !!client })
      })
      server.middlewares.use('/api/navigator', async (req, res) => {
        if (req.method !== 'POST') {
          sendJson(res, 405, { ok: false, error: 'method not allowed' })
          return
        }
        if (!client) {
          sendJson(res, 503, { ok: false, error: 'navigator not configured' })
          return
        }
        try {
          const payload = await readBody(req)
          if (!payload?.message || !payload?.facts || !payload?.grounding) {
            sendJson(res, 400, { ok: false, error: 'missing message, facts, or grounding' })
            return
          }
          const response = await generate(client, payload)
          sendJson(res, 200, { ok: true, response, source: 'ai' })
        } catch (err) {
          // Never leak internals; the client falls back to deterministic on any non-ok.
          sendJson(res, 500, { ok: false, error: 'generation failed' })
          // eslint-disable-next-line no-console
          console.error('[navigator]', err instanceof Error ? err.message : err)
        }
      })
    },
  }
}
