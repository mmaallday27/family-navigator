// The state registry — the single extension point for state-aware navigation.
//
// Adding a state = add its data files (a StateGuidance module and a
// VerifiedResource[] module, researched and verified like the NY ones) and
// register them in the two maps below. Consuming code must always go through
// stateGuidanceFor / verifiedResourcesFor / isDeepCoverage — no state is ever
// special-cased in pages or intelligence code.

import { stateGuidanceNY } from './stateGuidanceNY'
import { resourcesNY } from './resourcesNY'
import type { StateGuidance } from './stateGuidanceNY'
import type { VerifiedResource } from './resourcesNY'

export type { StateGuidance, StateMilestone } from './stateGuidanceNY'
export type { VerifiedResource } from './resourcesNY'

/** All 50 states + DC — the location picker's vocabulary. */
export const supportedStates: { code: string; name: string }[] = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'DC', name: 'District of Columbia' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
]

// Register deeply-mapped states here (guidance + verified resources together).
const guidanceByState: Record<string, StateGuidance> = {
  NY: stateGuidanceNY,
}

const verifiedResourcesByState: Record<string, VerifiedResource[]> = {
  NY: resourcesNY,
}

/** Verified state guidance (milestones, agencies, aging-out rule) — null if the state isn't deeply mapped. */
export function stateGuidanceFor(state: string): StateGuidance | null {
  return guidanceByState[state] ?? null
}

/** Verified resources for a state — empty for states without deep coverage. */
export function verifiedResourcesFor(state: string): VerifiedResource[] {
  return verifiedResourcesByState[state] ?? []
}

/** True when a state has verified guidance AND verified resources. */
export function isDeepCoverage(state: string): boolean {
  return !!guidanceByState[state] && (verifiedResourcesByState[state]?.length ?? 0) > 0
}
