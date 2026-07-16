// The wire contract between the browser and the server-side navigator proxy.
// The client assembles a fully-grounded request (family facts + the
// deterministic engine's own answer as reference material) and the server
// relays it to Claude. Grounding everything means the model reasons over
// real facts and cannot fabricate dates, progress, or eligibility.

import type { CompanionResponse } from '../data/companion'

export interface NavigatorFacts {
  childName: string
  childFirst: string
  parentFirst: string
  age: number
  diagnosis: string
  /** 'Rockland County, NY' style — '' when the family hasn't shared it. */
  location: string
  stageId: string
  stageTitle: string
  strengths: string[]
  interests: string[]
  communication: string
  transition: {
    done: number
    total: number
    pct: number
    currentTrackAge: string
    currentTrackTitle: string
    openItems: string[]
  } | null
  documents: { name: string; category: string; flagged: boolean; note?: string }[]
  savedResources: string[]
  goals: { title: string; area: string; due: string; progress: number }[]
  keyDates: { title: string; dateLabel: string }[]
  topicsDiscussed: string[]
}

export interface NavigatorRequest {
  message: string
  facts: NavigatorFacts
  /** The deterministic engine's answer to this same message — reference + fallback. */
  grounding: CompanionResponse
  /** Recent conversation, oldest first, compacted. */
  history: { role: 'user' | 'assistant'; text: string }[]
}

export type NavigatorReply =
  | { ok: true; response: CompanionResponse; source: 'ai' }
  | { ok: false; error: string }
