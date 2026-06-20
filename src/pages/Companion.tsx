import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  MessageCircleHeart,
  Send,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ListChecks,
} from 'lucide-react'
import { PageHeader } from '../components/ui'
import {
  suggestedPrompts,
  fallbackAnswer,
  type CompanionAnswer,
} from '../data/companion'
import { cx } from '../lib/cx'

interface Msg {
  id: number
  role: 'user' | 'assistant'
  text?: string
  answer?: CompanionAnswer['response']
}

function resolveAnswer(input: string): CompanionAnswer['response'] {
  const q = input.toLowerCase()
  const hit = suggestedPrompts.find((p) => p.match.some((m) => q.includes(m)))
  return hit ? hit.response : fallbackAnswer
}

function AssistantBubble({ answer }: { answer: CompanionAnswer['response'] }) {
  return (
    <div className="max-w-2xl space-y-3 rounded-2xl rounded-tl-sm border border-line bg-surface p-4 shadow-soft">
      <p className="text-sm leading-relaxed text-ink">{answer.intro}</p>
      <div className="space-y-2.5">
        {answer.points.map((p) => (
          <div key={p.title} className="rounded-xl bg-canvas p-3">
            <p className="text-sm font-semibold text-teal-700">{p.title}</p>
            <p className="mt-0.5 text-sm leading-relaxed text-ink-soft">{p.body}</p>
          </div>
        ))}
      </div>
      {answer.nextSteps && (
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
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: 0,
      role: 'assistant',
      answer: {
        intro:
          'Hi Maya — I’m your navigation companion. I can help you understand what’s ahead, organize your thinking, and prepare for meetings and decisions. Ask me anything, or tap a question below to start.',
        points: [],
      },
    },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const idRef = useRef(1)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const send = (text: string) => {
    const value = text.trim()
    if (!value || typing) return
    const userMsg: Msg = { id: idRef.current++, role: 'user', text: value }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setTyping(true)
    // Simulate a thoughtful pause, then reply with a mock answer.
    window.setTimeout(() => {
      const answer = resolveAnswer(value)
      setMessages((m) => [...m, { id: idRef.current++, role: 'assistant', answer }])
      setTyping(false)
    }, 850)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="A calm, knowledgeable guide"
        title="AI Companion"
        subtitle="Ask questions in plain language. The companion helps you learn, organize, and prepare — it won’t diagnose or give medical or legal advice."
        icon={<MessageCircleHeart className="h-6 w-6" />}
      />

      {/* Scope assurance banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-teal-100 bg-teal-50/60 p-4">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
        <p className="text-sm leading-relaxed text-ink-soft">
          <span className="font-semibold text-teal-700">What I do: </span>
          educate, organize, and help you prepare.{' '}
          <span className="font-semibold text-teal-700">What I don’t do: </span>
          diagnose, or give medical or legal advice — I’ll help you get ready to talk with the right
          professional instead.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Chat column */}
        <div className="lg:col-span-2">
          <div className="card flex h-[560px] flex-col overflow-hidden">
            {/* messages */}
            <div className="flex-1 space-y-4 overflow-y-auto p-5">
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

            {/* input */}
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
                  placeholder="Ask about transition planning, turning 18, adult services…"
                  className="flex-1 rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus:border-teal-300"
                />
                <button type="submit" className="btn-primary h-[46px]" disabled={!input.trim() || typing}>
                  <Send className="h-4 w-4" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Suggested prompts */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <h3 className="section-title text-sm font-semibold">Try asking</h3>
          </div>
          {suggestedPrompts.map((p) => (
            <button
              key={p.prompt}
              onClick={() => send(p.prompt)}
              disabled={typing}
              className="card card-hover w-full p-4 text-left"
            >
              <span className="chip mb-2 bg-lav-50 text-lav-600">{p.category}</span>
              <p className={cx('text-sm font-medium text-ink')}>{p.prompt}</p>
            </button>
          ))}
          <p className="rounded-xl bg-canvas px-4 py-3 text-xs leading-relaxed text-ink-faint">
            Responses in this prototype are illustrative examples, not live AI output.
          </p>
        </div>
      </div>
    </div>
  )
}
