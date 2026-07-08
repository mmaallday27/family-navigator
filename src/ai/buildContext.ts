// Assembles the grounded fact sheet the navigator reasons over — built
// entirely from the family store and the deterministic selectors, so the
// live model is anchored to the same source of truth as every other screen.

import type { FamilyState } from '../store/FamilyContext'
import { docCategories } from '../data/documents'
import { resources } from '../data/resources'
import {
  currentTrack,
  firstName,
  getAge,
  keyMoments,
  personalize,
  stageIdForAge,
  transitionOverview,
} from '../store/selectors'
import { journeyStages } from '../data/journey'
import type { NavigatorFacts } from './types'

export function buildFacts(state: FamilyState): NavigatorFacts {
  const age = getAge(state.child)
  const stageId = stageIdForAge(age)
  const stage = journeyStages.find((s) => s.id === stageId)
  const catName = (id: string) => docCategories.find((c) => c.id === id)?.name ?? id
  const resName = (id: string) => resources.find((r) => r.id === id)?.name ?? id

  let transition: NavigatorFacts['transition'] = null
  if (stageId === 'transition') {
    const overview = transitionOverview(state.checks)
    const track = currentTrack(age)
    transition = {
      done: overview.done,
      total: overview.total,
      pct: overview.pct,
      currentTrackAge: track.age,
      currentTrackTitle: track.title,
      openItems: track.checklist
        .filter((i) => !state.checks[i.id])
        .map((i) => personalize(i.label, state.child.name)),
    }
  }

  return {
    childName: state.child.name,
    childFirst: firstName(state.child.name),
    parentFirst: firstName(state.parent.name),
    age,
    diagnosis: state.child.diagnosis,
    stageId,
    stageTitle: stage?.title ?? '',
    strengths: state.child.strengths,
    interests: state.child.interests,
    communication: state.child.communication,
    transition,
    documents: state.documents.map((d) => ({
      name: d.name,
      category: catName(d.categoryId),
      flagged: !!d.flagged,
      note: d.note,
    })),
    savedResources: state.savedResources.map(resName),
    goals: state.goals.map((g) => ({
      title: g.title,
      area: g.area,
      due: g.due,
      progress: g.progress,
    })),
    keyDates: keyMoments(state.child).map((m) => ({ title: m.title, dateLabel: m.dateLabel })),
    topicsDiscussed: state.aiMemory.topicsDiscussed,
  }
}
