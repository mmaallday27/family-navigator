// The browser side of the navigator. Talks only to the same-origin proxy at
// /api/navigator — the Anthropic key never reaches the client. Every call
// degrades gracefully: if the AI isn't configured or a request fails, the
// caller falls back to the deterministic engine, so the app always works.

import type { CompanionResponse } from '../data/companion'
import type { NavigatorFacts, NavigatorReply } from './types'

let statusCache: boolean | null = null

/** Whether a live navigator is configured (server holds an API key). Cached. */
export async function getNavigatorStatus(): Promise<boolean> {
  if (statusCache !== null) return statusCache
  try {
    const res = await fetch('/api/navigator/status')
    if (!res.ok) {
      statusCache = false
      return false
    }
    const data = (await res.json()) as { configured?: boolean }
    statusCache = !!data.configured
    return statusCache
  } catch {
    statusCache = false
    return false
  }
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
