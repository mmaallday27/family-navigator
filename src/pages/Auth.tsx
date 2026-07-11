// The front door. A calm sign-in / create-account screen — the first thing a
// family sees. Same warm language as the rest of the product; no jargon, no
// friction beyond an email and a password. Real accounts, real sessions.

import { useState, type FormEvent } from 'react'
import { Compass, Heart, ArrowRight } from 'lucide-react'
import { useAuth } from '../store/AuthContext'

export default function Auth() {
  const { login, signup } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      if (mode === 'signup') await signup(email.trim(), password)
      else await login(email.trim(), password)
      // On success the auth context updates and the router moves us into the app.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="flex items-center px-6 py-5 sm:px-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500 text-white shadow-soft">
            <Compass className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <p className="font-display text-lg font-semibold text-ink">Family Navigator</p>
            <p className="text-xs text-ink-faint">See the road ahead</p>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 pb-16 sm:px-6">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
            <Heart className="h-6 w-6" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            {mode === 'signup' ? 'Create your family’s account' : 'Welcome back'}
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">
            {mode === 'signup'
              ? 'Your record follows you across every device, and it’s always yours to export or delete.'
              : 'Sign in to pick up exactly where you left off.'}
          </p>
        </div>

        <form onSubmit={submit} className="card space-y-4 p-6">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Email</span>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1.5 w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-teal-300"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Password</span>
            <input
              type="password"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? 'At least 8 characters' : 'Your password'}
              className="mt-1.5 w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-teal-300"
            />
          </label>

          {error && (
            <p className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-500" role="alert">
              {error}
            </p>
          )}

          <button type="submit" disabled={busy} className="btn-primary w-full py-3">
            {busy ? 'One moment…' : mode === 'signup' ? 'Create account' : 'Sign in'}
            {!busy && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-ink-soft">
          {mode === 'signup' ? 'Already have an account?' : 'New here?'}{' '}
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'signup' ? 'login' : 'signup')
              setError(null)
            }}
            className="font-semibold text-teal-600 hover:underline"
          >
            {mode === 'signup' ? 'Sign in' : 'Create an account'}
          </button>
        </p>

        <p className="mt-6 text-center text-xs text-ink-faint">
          A prototype. All content is illustrative. Your record is stored on this server and is yours
          to export or delete at any time.
        </p>
      </main>
    </div>
  )
}
