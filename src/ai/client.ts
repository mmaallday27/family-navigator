// The browser side of the navigator. Talks only to the same-origin proxy at
// /api/navigator — the Anthropic key never reaches the client. Every call
// degrades gracefully: if the AI isn't configured or a request fails, the
// caller falls back to the deterministic engine, so the app always works.

import type { CompanionResponse } from '../data/companion'
import type { NavigatorFacts, NavigatorReply } from './types'

// Don't leave a family staring at a typing indicator — the deterministic
// answer is already computed, so failing fast costs nothing.
const REQUEST_TIMEOUT_MS = 20_000

let statusCache: boolean | null = null
let statusCheckedAt = 0
const STATUS_RETRY_MS = 60_000

/**
 * Whether a live navigator is configured (server holds an API key).
 * "Configured" is cached for the session; "not configured" is re-checked
 * after a minute so a transient failure doesn't stick as Guided forever.
 */
export async function getNavigatorStatus(): Promise<boolean> {
  if (statusCache === true) return true
  if (statusCache === false && Date.now() - statusCheckedAt < STATUS_RETRY_MS) return false
  try {
    const res = await fetch('/api/navigator/status')
    const data = res.ok ? ((await res.json()) as { configured?: boolean }) : { configured: false }
    statusCache = !!data.configured
  } catch {
    statusCache = false
  }
  statusCheckedAt = Date.now()
  return statusCache
}

/**
 * Ask the live navigator. Returns a generated CompanionResponse, or null on
 * any failure — the caller then uses its already-computed deterministic answer.
 */
export async function askNavigator(payload: {
  message: string
  facts: NavigatorFacts
  grounding: CompanionResponse
  history: { role: 'user' | 'assistant'; text: string }[]
}): Promise<CompanionResponse | null> {
  try {
    const res = await fetch('/api/navigator', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
    if (!res.ok) return null
    const data = (await res.json()) as NavigatorReply
    if (!data.ok) return null
    // Reuse the deterministic grounding's safe module link — never let the
    // model invent an in-app route.
    return { ...data.response, moduleLink: payload.grounding.moduleLink }
  } catch {
    return null
  }
}
