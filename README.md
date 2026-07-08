# AI Family Navigator

**A Development Lifecycle Platform for families raising children with autism and developmental differences.** XPRIZE-oriented high-fidelity prototype.

> This is not an autism chatbot, a medical application, or a therapy replacement. It is a navigation system that helps families understand *where they are, what comes next, and how to prepare for major life transitions.*

Today, parents are forced to become the operating system — coordinating schools, therapists, doctors, insurance, benefits, legal planning, and adult services. This platform becomes the AI-supported integration layer instead, so families can finally **see the road ahead.**

## The journey it maps

The full developmental lifecycle, visible from day one:

1. **Recognition & Diagnosis**
2. **Early Foundation**
3. **School Years**
4. **Transition to Adulthood** ← the wedge, and the deepest part of the prototype
5. **Adult Life**
6. **Future Planning & Legacy** (lifelong — runs alongside the others)

## The intelligence layer

The AI is not a chatbot on one page — it is the operating system of the product. A deterministic reasoning engine (`src/intelligence/`) continuously evaluates the family record and powers every screen:

- **The Family Command Center** (home) — every visit opens with a daily navigation briefing: a plain-language orientation ("Today you're helping Eli prepare for adulthood"), this week's priorities ranked by urgency with a total time estimate, reassuring "on track" wins, a welcome-back acknowledgment after time away, and what's new since the last visit. All derived, never canned.
- **Look Ahead** — the unknown, made visible: everything approaching across five horizons (30 days → 5 years), projected from the child's real birthday, open preparation steps, and known deadlines. Items whose ideal window has arrived are marked *Start now*.
- **Family Timeline** — the road already walked: a living history assembled from the record (birth, diagnosis, milestones, documents, decisions, services), so families see progress over years, not just today's tasks.
- **"Why this matters"** — every major screen can explain, in the navigator's voice, why it matters, why now, and how it connects to the larger journey.
- **Proactive guidance** — age-triggered legal deadlines (14 / 18 / 22 computed from the real birthday), unmet preparation steps, flagged and *missing* documents, team gaps, and newly matched programs surface before anyone asks.
- **Document understanding** — adding a document (an IEP, a benefits denial, waiver paperwork…) triggers an analysis: what it is, action items, deadline patterns to verify, what's commonly missing, and how the rest of the record responds.
- **Scenario planning** — "What happens when Eli turns 18?" "What if SSI is denied?" "What if we move states?" — honest maps of the paths, personalized with real names and dates.
- **Meeting preparation** — IEP, attorney, benefits, and medical meeting kits: agenda, questions generated from the family's actual open items, and a documents list cross-checked against the real vault.
- **Decision support** — guardianship vs. supported decision-making, SSI vs. SSDI, housing models, employment pathways: options, honest tradeoffs, and the questions that reveal fit. Educational, never prescriptive.
- **Persistent memory** — the navigator resumes conversations across sessions, remembers topics already discussed ("picking up where we left off…"), and tracks visits and dismissed insights.
- **Trust layer** — every answer is visibly badged (*From your family record* vs. *General guidance*), deadline patterns are phrased as verify-against-the-letter guidance, and legal/medical/benefits topics carry an explicit "bring this to a professional" note.

The engine is intentionally deterministic in this prototype (reliable, offline, honest about what it is); its interfaces — `deriveInsights`, `analyzeDocument`, `buildMeetingKit`, scenario/decision builders — are the seam where a live model slots in without touching any screen.

## How it works

**It starts with your family, not a menu.** A first-run welcome journey (`/welcome`) asks who you are, who your child is, and what's weighing on you — then derives the current lifecycle stage from the child's age and turns your concerns into starter goals. Or explore instantly with a fully-populated sample family.

**The platform remembers.** All interactive state — profile, transition checklists, goals, documents, saved resources — lives in a single persistent family store (`src/store/FamilyContext.tsx`, localStorage-backed). Close the tab, come back next month: your progress is exactly where you left it.

**Every number is derived, never asserted.** Stage status, progress percentages, "open priorities," legal milestone dates (turning 14 / 18 / 22), and dashboard recommendations are all computed from live state in `src/store/selectors.ts`. Check an item in the Transition Navigator and the dashboard, companion, and stats all change together.

**The AI Companion knows this family.** It answers with the child's name, filters suggested prompts by lifecycle stage, and "where are we right now?" is answered live from the family record — real progress, real next steps.

## Modules

| Module | What it does |
| --- | --- |
| **Welcome journey** | Onboarding that personalizes the entire product in under two minutes |
| **Home Dashboard** | Where are we, what's coming, what to do next — all derived from live state |
| **Journey Map** | All six life stages with "you are here" computed from the child's age |
| **Transition Navigator** | The wedge: Age 14 / 18 / 21–22 tracks with guidance + persistent checklists |
| **AI Companion** | Stage-aware conversational guide (educates & organizes; never diagnoses or gives medical/legal advice) |
| **Document Vault** | Categorized, searchable document record with a working add-to-vault flow |
| **Resource Navigator** | Filterable directory with persistent saves |
| **Family Circle** | The coordinated support network — with stage-relevant open roles suggested for new families |

## Design intent

Light, warm, calm, and accessible — the opposite of a dark AI dashboard. Parents should feel **calmer** after opening the product, not more overwhelmed. Keyboard-visible focus rings, labelled dialogs with Escape/focus handling, live-region chat, and `prefers-reduced-motion` support throughout.

## Architecture

```
src/
  store/         FamilyContext (persistent state incl. AI memory + activity log)
                 + selectors (all derived data)
  intelligence/  The reasoning engine: insights & briefing (with wins),
                 look-ahead horizons & timeline, document analysis,
                 scenarios, meeting kits, decision support
  data/          Pure content: journey stages, transition tracks, companion
                 knowledge, resources (with matching metadata), sample family
  components/    Layout, shared UI primitives, and the AI visual language
                 (source badges, insight cards, contextual notes)
  pages/         Onboarding, Dashboard (Command Center), JourneyMap, LookAhead,
                 Timeline, TransitionNavigator, Companion, DocumentVault,
                 ResourceNavigator, FamilyCircle
```

React + Vite + TypeScript + Tailwind CSS · React Router · lucide-react. All content is illustrative; no backend, auth, or billing. State persists per-device in localStorage.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
npm run preview  # preview the production build
```

Use the ↺ button next to your name in the sidebar to reset and go through onboarding again.
