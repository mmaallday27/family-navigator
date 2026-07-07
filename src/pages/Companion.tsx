// The AI Companion — the conversational surface of the intelligence layer.
// It routes every question to the right reasoning module (live status, scenario
// planning, meeting preparation, decision support, the weekly briefing, or the
// knowledge base), remembers what the family has already discussed, and
// resumes the conversation across sessions. Trust is visible: every answer is
// badged as record-derived or general guidance, and legal/medical/benefits
// topics carry an explicit "bring this to a professional" note.

import { useRef, useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  MessageCircleHeart,
  Send,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ListChecks,
  Scale,
  RotateCcw,
} from 'lucide-react'
import { PageHeader } from '../components/ui'
import { SourceBadge } from '../components/ai'
import {
  companionKnowledge,
  fallbackAnswer,
  statusMatch,
  type CompanionResponse,
} from '../data/companion'
import { journeyStages } from '../data/journey'
import { useFamily, type FamilyState, type StoredMessage } from '../store/FamilyContext'
import {
  currentTrack,
  firstName,
  getAge,
  personalize,
  stageIdForAge,
  transitionOverview,
} from '../store/selectors'
import { buildBriefing } from '../intelligence/insights'
import { matchScenario, scenarios } from '../intelligence/scenarios'
import { buildMeetingKit, detectMeetingType } from '../intelligence/meetings'
import { decisionTopics, matchDecision } from '../intelligence/decisions'
import { cx } from '../lib/cx'

/** Personalize every string in a response with the child's name. */
function personalizeResponse(r: CompanionResponse, childName: string): CompanionResponse {
  return {
    ...r,
    intro: personalize(r.intro, childName),
    points: r.points.map((p) => ({
      title: personalize(p.title, childName),
      body: personalize(p.body, childName),
    })),
    sections: r.sections?.map((s) => ({
      heading: personalize(s.heading, childName),
      items: s.items.map((i) => personalize(i, childName)),
    })),
    nextSteps: r.nextSteps?.map((s) => personalize(s, childName)),
  }
}

/** The live "where are we?" answer, built from actual family state. */
function buildStatusAnswer(state: FamilyState): CompanionResponse {
  const age = getAge(state.child)
  const stageId = stageIdForAge(age)
  const stage = journeyStages.find((s) => s.id === stageId)!
  const name = firstName(state.child.name)

  if (stageId !== 'transition') {
    return {
      kind: 'record',
      intro: `${name} is ${age}, which puts your family in the ${stage.title} stage (stage ${stage.index} of 6). ${stage.tagline}`,
      points: stage.nextSteps.slice(0, 3).map((s) => ({
        title: 'Worth doing in this stage',
        body: s,
      })),
      nextSteps: ['See the full stage on the Journey Map', 'Peek one stage ahead so nothing surprises you'],
      moduleLink: { label: 'Open the Journey Map', to: '/journey' },
    }
  }

  const overview = transitionOverview(state.checks)
  const track = currentTrack(age)
  const open = track.checklist.filter((i) => !state.checks[i.id])
  return {
    kind: 'record',
    intro: `You're in the Transition to Adulthood stage — ${overview.done} of ${overview.total} preparation steps are done (${overview.pct}%). At ${age}, the “${track.title}” track deserves your attention most.`,
    points: open.slice(0, 3).map((i) => ({
      title: personalize(i.label, state.child.name),
      body: personalize(i.why ?? i.detail ?? 'A small step that keeps momentum.', state.child.name),
    })),
    nextSteps:
      open.length > 0
        ? [`Open the ${track.age} track and pick one step`, 'Even 10 minutes counts today']
        : ['This track is fully prepared — look at the next one when you’re ready'],
    moduleLink: { label: 'Open the Transition Navigator', to: '/transition' },
  }
}

/** The weekly briefing, as a conversation. */
function buildBriefingAnswer(state: FamilyState): CompanionResponse {
  const b = buildBriefing(state)
  return {
    kind: 'record',
    intro: `${b.narrative}${b.priorities.length > 0 ? ` Altogether it’s about ${b.totalMinutes} minutes of focused attention.` : ''}`,
    sections: [
      {
        heading: 'This week’s priorities',
        items:
          b.priorities.length > 0
            ? b.priorities.map((p) => `${p.title}${p.minutes ? ` (~${p.minutes} min)` : ''}`)
            : ['Nothing urgent — the road is quiet this week.'],
      },
      ...(b.newSinceLastVisit.length > 0 ? [{ heading: 'New since your last visit', items: b.newSinceLastVisit }] : []),
    ],
    points: [],
    nextSteps: ['Your home base keeps this list in view — each item links straight to the right screen'],
    moduleLink: { label: 'Open your home base', to: '/' },
  }
}

interface Resolved {
  response: CompanionResponse
  topic?: string
}

function resolveAnswer(input: string, state: FamilyState): Resolved {
  const q = input.toLowerCase()

  if (statusMatch.some((m) => q.includes(m))) return { response: buildStatusAnswer(state) }

  const scenario = matchScenario(input)
  if (scenario) return { response: scenario.build(state, new Date()), topic: `scenario-${scenario.id}` }

  const meeting = detectMeetingType(input)
  if (meeting) return { response: buildMeetingKit(meeting, state), topic: `meeting-${meeting}` }

  const decision = matchDecision(input)
  if (decision) return { response: decision.build(state), topic: `decision-${decision.id}` }

  if (/(this week|priorit|briefing|weekly|what should (we|i) do today)/.test(q)) {
    return { response: buildBriefingAnswer(state) }
  }

  const hit = companionKnowledge.find((p) => p.match.some((m) => q.includes(m)))
  if (hit) {
    return {
      response: personalizeResponse({ kind: 'educational', ...hit.response }, state.child.name),
      topic: `topic-${hit.category}`,
    }
  }
  return { response: personalizeResponse(fallbackAnswer, state.child.name) }
}

function AssistantBubble({ answer }: { answer: CompanionResponse }) {
  return (
    <div className="max-w-2xl space-y-3 rounded-2xl rounded-tl-sm border border-line bg-surface p-4 shadow-soft">
      {answer.kind && (
        <div>
          <SourceBadge kind={answer.kind} />
        </div>
      )}
      <p className="text-sm leading-relaxed text-ink">{answer.intro}</p>
      {answer.points.length > 0 && (
        <div className="space-y-2.5">
          {answer.points.map((p, i) => (
            <div key={`${p.title}-${i}`} className="rounded-xl bg-canvas p-3">
              <p className="text-sm font-semibold text-teal-700">{p.title}</p>
              <p className="mt-0.5 text-sm leading-relaxed text-ink-soft">{p.body}</p>
            </div>
          ))}
        </div>
      )}
      {answer.sections?.map((s) => (
        <div key={s.heading} className="rounded-xl bg-canvas p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">{s.heading}</p>
          <ul className="mt-1.5 space-y-1.5">
            {s.items.map((item) => (
              <li key={item} className="flex gap-2 text-sm leading-relaxed text-ink-soft">
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-teal-300" /> {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
      {answer.nextSteps && answer.nextSteps.length > 0 && (
        <div>
          <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-faint">
            <ListChecks className="h-3.5 w-3.5" /> Suggested next steps
          </div>
          <ul className="space-y-1">
            {answer.nextSteps.map((s) => (
              <li key={s} className="flex gap-2 text-sm text-ink-soft">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-400" /> {s}
              </li>
            ))}
          </ul>
        </div>
      )}
      {answer.professionalNote && (
        <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3">
          <Scale className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-xs leading-relaxed text-ink-soft">
            <span className="font-semibold text-amber-700">Bring this to a professional: </span>
            {answer.professionalNote}
          </p>
        </div>
      )}
      {answer.moduleLink && (
        <Link
          to={answer.moduleLink.to}
          className="inline-flex items-center gap-1 text-sm font-semibold text-teal-600 hover:gap-2"
        >
          {answer.moduleLink.label} <ArrowRight className="h-4 w-4 transition-all" />
        </Link>
      )}
    </div>
  )
}

export default function Companion() {
  const { state, dispatch } = useFamily()
  const age = getAge(state.child)
  const stageId = stageIdForAge(age)
  const childFirst = firstName(state.child.name)

  const greetingMessage: StoredMessage = useMemo(
    () => ({
      id: 0,
      role: 'assistant',
      answer: {
        intro:
          state.aiMemory.topicsDiscussed.length > 0
            ? `Welcome back, ${firstName(state.parent.name)}. I’ve kept our conversation — and everything in ${childFirst}’s record — so we never start from zero. Ask me anything, or try “what are our priorities this week?”`
            : `Hi ${firstName(state.parent.name)} — I’m your navigator, and I know where ${childFirst} is on the road. I can brief you on the week, walk through “what happens if…” scenarios, prepare you for meetings, and compare the big decisions. Try “where are we right now?”`,
        points: [],
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  // Resume the saved conversation; fall back to a fresh greeting.
  const [messages, setMessages] = useState<StoredMessage[]>(() =>
    state.aiMemory.messages.length > 0 ? state.aiMemory.messages : [greetingMessage],
  )
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const idRef = useRef(messages.reduce((m, x) => Math.max(m, x.id), 0) + 1)

  // Showcase the reasoning modules, then stage-relevant knowledge.
  const suggestions = useMemo(() => {
    const items: { label: string; prompt: string; category: string }[] = [
      { label: 'What are our priorities this week?', prompt: 'What are our priorities this week?', category: 'Weekly briefing' },
    ]
    if (stageId === 'transition') {
      items.push({
        label: personalize(scenarios[0].prompt, state.child.name),
        prompt: personalize(scenarios[0].prompt, state.child.name),
        category: 'Scenario',
      })
      items.push({ label: 'Prepare me for an IEP meeting', prompt: 'Prepare me for an IEP meeting', category: 'Meeting prep' })
      items.push({
        label: decisionTopics[0].prompt,
        prompt: decisionTopics[0].prompt,
        category: 'Compare options',
      })
    } else {
      items.push({ label: 'Prepare me for an IEP meeting', prompt: 'Prepare me for an IEP meeting', category: 'Meeting prep' })
      const relevant = companionKnowledge.filter((p) => p.stages.includes(stageId)).slice(0, 2)
      for (const p of relevant) items.push({ label: p.prompt, prompt: p.prompt, category: p.category })
    }
    return items.slice(0, 4)
  }, [stageId, state.child.name])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const send = (text: string) => {
    const value = text.trim()
    if (!value || typing) return
    const userMsg: StoredMessage = { id: idRef.current++, role: 'user', text: value }
    const withUser = [...messages, userMsg]
    setMessages(withUser)
    setInput('')
    setTyping(true)
    // Simulate a thoughtful pause, then answer from the reasoning modules + live state.
    window.setTimeout(() => {
      const { response, topic } = resolveAnswer(value, state)
      const remembered = topic && state.aiMemory.topicsDiscussed.includes(topic)
      const answer: CompanionResponse = remembered
        ? { ...response, intro: `Picking up where we left off on this — ${response.intro}` }
        : response
      const withAnswer = [...withUser, { id: idRef.current++, role: 'assistant' as const, answer }]
      setMessages(withAnswer)
      setTyping(false)
      // Persist: the conversation and the topic memory both survive the session.
      dispatch({ type: 'set-companion-messages', messages: withAnswer })
      if (topic) dispatch({ type: 'companion-topic', topic })
    }, 850)
  }

  const clearConversation = () => {
    setMessages([greetingMessage])
    dispatch({ type: 'set-companion-messages', messages: [] })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="A guide who remembers"
        title="Your Navigator"
        subtitle={`Ask in plain language. I know ${childFirst}’s stage, progress, documents, and what we’ve already talked about — and I’ll always tell you when a question belongs with a professional.`}
        icon={<MessageCircleHeart className="h-6 w-6" />}
      />

      {/* Scope assurance banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-teal-100 bg-teal-50/60 p-4">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
        <p className="text-sm leading-relaxed text-ink-soft">
          <span className="font-semibold text-teal-700">What I do: </span>
          brief, explain, prepare, compare, and remember.{' '}
          <span className="font-semibold text-teal-700">What I don’t do: </span>
          diagnose, or give medical or legal advice — answers are labeled, and the big decisions
          come with the professional you should bring them to.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Chat column */}
        <div className="lg:col-span-2">
          <div className="card flex h-[560px] flex-col overflow-hidden">
            <div className="flex-1 space-y-4 overflow-y-auto p-5" role="log" aria-live="polite" aria-label="Conversation">
              {messages.map((m) =>
                m.role === 'user' ? (
                  <div key={m.id} className="flex justify-end">
                    <p className="max-w-md rounded-2xl rounded-tr-sm bg-teal-500 px-4 py-2.5 text-sm text-white">
                      {m.text}
                    </p>
                  </div>
                ) : (
                  <div key={m.id} className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-600">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    {m.answer ? (
                      <AssistantBubble answer={m.answer} />
                    ) : (
                      <p className="max-w-2xl rounded-2xl rounded-tl-sm border border-line bg-surface p-4 text-sm text-ink shadow-soft">
                        {m.text}
                      </p>
                    )}
                  </div>
                ),
              )}
              {typing && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-600">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-line bg-surface px-4 py-3 shadow-soft">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="h-2 w-2 animate-pulse-soft rounded-full bg-teal-300"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                send(input)
              }}
              className="border-t border-line bg-canvas/40 p-3"
            >
              <div className="flex items-end gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Try “what happens when ${childFirst} turns 18?” or “prepare me for an IEP meeting”`}
                  aria-label="Message your navigator"
                  className="flex-1 rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus:border-teal-300"
                />
                <button type="submit" className="btn-primary h-[46px]" disabled={!input.trim() || typing}>
                  <Send className="h-4 w-4" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </div>
            </form>
          </div>
          {messages.length > 1 && (
            <button
              onClick={clearConversation}
              className="mt-2 inline-flex items-center gap-1.5 text-xs text-ink-faint hover:text-ink-soft"
            >
              <RotateCcw className="h-3 w-3" /> Clear this conversation (your record is untouched)
            </button>
          )}
        </div>

        {/* Suggested prompts — the reasoning modules, front and center */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <h3 className="section-title text-sm font-semibold">Try asking</h3>
          </div>
          <button
            onClick={() => send('Where are we right now?')}
            disabled={typing}
            className="card card-hover w-full p-4 text-left"
          >
            <span className="chip mb-2 bg-teal-50 text-teal-700">Live from your record</span>
            <p className="text-sm font-medium text-ink">Where are we right now, and what’s next?</p>
          </button>
          {suggestions.map((p) => (
            <button
              key={p.prompt}
              onClick={() => send(p.prompt)}
              disabled={typing}
              className="card card-hover w-full p-4 text-left"
            >
              <span className="chip mb-2 bg-lav-50 text-lav-600">{p.category}</span>
              <p className={cx('text-sm font-medium text-ink')}>{p.label}</p>
            </button>
          ))}
          <p className="rounded-xl bg-canvas px-4 py-3 text-xs leading-relaxed text-ink-faint">
            Responses in this prototype are generated from your family record and a curated
            knowledge base — not a live AI model. Always verify dates against official letters.
          </p>
        </div>
      </div>
    </div>
  )
}
