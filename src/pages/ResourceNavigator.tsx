import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  LifeBuoy,
  Search,
  MapPin,
  Phone,
  BadgeCheck,
  Bookmark,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react'
import { PageHeader, Card } from '../components/ui'
import { AiNote } from '../components/ai'
import { resources, resourceTypes } from '../data/resources'
import { isDeepCoverage, stateGuidanceFor, verifiedResourcesFor } from '../data/stateRegistry'
import { useFamily } from '../store/FamilyContext'
import { firstName, getAge, locationLabel } from '../store/selectors'
import { matchResources } from '../intelligence/insights'
import { cx } from '../lib/cx'

/** Parent-facing labels for the verified-resource domain vocabulary. */
const domainLabels: Record<string, string> = {
  'dd-services': 'Disability services',
  vocational: 'Vocational rehab',
  education: 'School & education',
  benefits: 'Benefits',
  medicaid: 'Medicaid',
  able: 'ABLE savings',
  'decision-making': 'Decision-making',
  advocacy: 'Advocacy',
  'independent-living': 'Independent living',
  housing: 'Housing',
  transportation: 'Transportation',
  employment: 'Employment',
  'family-support': 'Family support',
  'future-planning': 'Future planning',
}

// County names that fall inside the 'NYC' sub-jurisdiction used in the data.
const nycCountyNames = new Set([
  'new york',
  'kings',
  'brooklyn',
  'queens',
  'bronx',
  'richmond',
  'staten island',
  'manhattan',
  'nyc',
  'new york city',
])

/** Does a resource's jurisdiction cover this family? Statewide and national
 *  always do; county-scoped ones only when the family's county matches (or is
 *  unknown — then we show it with its scope labeled rather than hide it). */
function jurisdictionCovers(jurisdiction: string, county: string): boolean {
  const sub = jurisdiction.split(':')[1]
  if (!sub) return true
  const c = county.trim().toLowerCase().replace(/\s+county$/, '')
  if (!c) return true
  if (sub === 'NYC') return nycCountyNames.has(c)
  return sub.toLowerCase() === c
}

/** A small scope chip for sub-state or national listings. */
function scopeLabel(jurisdiction: string): string | null {
  if (jurisdiction === 'national') return 'National'
  const sub = jurisdiction.split(':')[1]
  if (!sub) return null // statewide — the section header already names the state
  return sub === 'NYC' ? 'New York City' : `${sub} County`
}

const fmtVerified = (iso: string) => {
  const d = new Date(`${iso}T00:00:00`)
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function ResourceNavigator() {
  const { state, dispatch } = useFamily()
  const saved = state.savedResources
  const [type, setType] = useState('all')
  const [query, setQuery] = useState('')
  const [domain, setDomain] = useState('all')
  const matches = useMemo(() => matchResources(state).slice(0, 3), [state])

  const location = state.location
  const guidance = stateGuidanceFor(location.state)
  const deep = isDeepCoverage(location.state)
  const age = getAge(state.child)
  const childFirst = firstName(state.child.name)
  const showTransitionRelevance = age >= 14 && age <= 22

  // Verified resources for this family: age-relevant, within their jurisdiction.
  const verified = useMemo(
    () =>
      verifiedResourcesFor(location.state).filter(
        (r) =>
          (!r.ageRange || (age >= r.ageRange[0] && age <= r.ageRange[1])) &&
          jurisdictionCovers(r.jurisdiction, location.county),
      ),
    [location.state, location.county, age],
  )
  const domainsPresent = useMemo(
    () => Object.keys(domainLabels).filter((d) => verified.some((r) => r.domains.includes(d))),
    [verified],
  )
  const verifiedShown = domain === 'all' ? verified : verified.filter((r) => r.domains.includes(domain))

  const filtered = useMemo(() => {
    return resources.filter(
      (r) =>
        (type === 'all' || (type === 'saved' ? saved.includes(r.id) : r.typeId === type)) &&
        (r.name.toLowerCase().includes(query.toLowerCase()) ||
          r.description.toLowerCase().includes(query.toLowerCase()) ||
          r.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))),
    )
  }, [type, query, saved])

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="The right help, when you need it"
        title="Resource Navigator"
        subtitle="A curated map of the people and programs that make each stage real — support organizations, coordinators, attorneys, vocational programs, and adult services. Saved resources stay in your record."
        icon={<LifeBuoy className="h-6 w-6" />}
      />

      {/* ---- State-aware layer: verified resources, or an honest account of coverage ---- */}
      {deep && guidance ? (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-teal-600" />
            <h2 className="section-title text-lg font-semibold">
              Verified for {guidance.displayName}
            </h2>
            <span className="text-xs text-ink-faint">{locationLabel(location)}</span>
          </div>
          <AiNote title="Real programs, checked against official sources">
            Because you told us you live in {locationLabel(location) || guidance.displayName},
            these are the actual agencies and programs {childFirst ? `${childFirst}’s` : 'your'}{' '}
            road runs through — each one verified against its official source, with the concrete
            first step. Details change; the “Verified” date tells you when we last checked.
          </AiNote>

          {/* Domain filter */}
          {domainsPresent.length > 1 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setDomain('all')}
                className={cx(
                  'chip border transition-colors',
                  domain === 'all'
                    ? 'border-teal-300 bg-teal-50 text-teal-700'
                    : 'border-line bg-surface text-ink-soft hover:bg-canvas',
                )}
              >
                Everything
              </button>
              {domainsPresent.map((d) => (
                <button
                  key={d}
                  onClick={() => setDomain(d)}
                  className={cx(
                    'chip border transition-colors',
                    domain === d
                      ? 'border-teal-300 bg-teal-50 text-teal-700'
                      : 'border-line bg-surface text-ink-soft hover:bg-canvas',
                  )}
                >
                  {domainLabels[d]}
                </button>
              ))}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {verifiedShown.map((r) => {
              const scope = scopeLabel(r.jurisdiction)
              return (
                <Card key={r.id} className="card-hover flex flex-col border-teal-100">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-wrap gap-1.5">
                      {scope && <span className="chip bg-lav-50 text-lav-600">{scope}</span>}
                      {r.domains.map((d) => (
                        <span key={d} className="chip bg-canvas text-ink-soft">
                          {domainLabels[d] ?? d}
                        </span>
                      ))}
                    </div>
                    <span className="chip shrink-0 bg-sage-50 text-sage-600">
                      <BadgeCheck className="h-3.5 w-3.5" /> Verified {fmtVerified(r.lastVerified)}
                    </span>
                  </div>
                  <h3 className="section-title mt-2 text-base font-semibold">{r.name}</h3>
                  <p className="text-xs text-ink-faint">{r.organization}</p>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{r.description}</p>

                  {showTransitionRelevance && r.transitionRelevance && (
                    <p className="mt-3 rounded-xl bg-amber-50/70 px-3 py-2 text-sm leading-relaxed text-ink-soft">
                      <span className="font-medium text-amber-600">Why it matters at {age}: </span>
                      {r.transitionRelevance}
                    </p>
                  )}

                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                    <span className="font-medium text-teal-700">How to start: </span>
                    {r.howToStart}
                  </p>

                  {r.verifyNote && (
                    <p className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-ink-faint">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                      {r.verifyNote}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-line pt-3 text-sm">
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-medium text-teal-600 hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" /> Official site
                    </a>
                    {r.phone && (
                      <span className="inline-flex items-center gap-1.5 text-ink-soft">
                        <Phone className="h-4 w-4 text-ink-faint" /> {r.phone}
                      </span>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
          {verifiedShown.length === 0 && (
            <Card className="text-center text-sm text-ink-faint">
              Nothing verified in this category fits {childFirst || 'your child'}’s age right now —
              try another category, or browse the general directory below.
            </Card>
          )}
        </section>
      ) : location.state ? (
        <Card className="flex items-start gap-3">
          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-ink-faint" />
          <p className="text-sm leading-relaxed text-ink-soft">
            We haven’t deeply mapped{' '}
            <span className="font-medium text-ink">{locationLabel(location)}</span> yet — New York
            is our first deeply-mapped state, and more are coming. The general guidance below still
            applies everywhere; your state’s specifics (agency names, exact deadlines) will need
            verifying with local sources for now.
          </p>
        </Card>
      ) : (
        <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
            <p className="text-sm leading-relaxed text-ink-soft">
              Tell us where you live and we’ll ground this in your state’s actual system — verified
              agencies, real phone numbers, and your state’s own deadlines.
            </p>
          </div>
          <Link to="/" className="btn-soft shrink-0">
            Add it via Edit on {childFirst || 'your child'}’s profile card
          </Link>
        </Card>
      )}

      {/* ---- The general directory — honest about what it is ---- */}
      <div className="border-t border-line pt-6">
        <h2 className="section-title text-lg font-semibold">General directory (illustrative)</h2>
        <p className="mt-1 text-sm text-ink-soft">
          The kinds of help that exist in every state — useful for orientation, with illustrative
          example listings rather than verified local programs.
        </p>
      </div>

      {/* Matched for this family — computed from stage, concerns, and open gaps */}
      {matches.length > 0 && (
        <section className="space-y-3">
          <AiNote title={`Matched for ${firstName(state.child.name)}`}>
            I compared the directory against {firstName(state.child.name)}’s stage, what you said is
            on your mind, and the preparation steps still open. {matches.length}{' '}
            {matches.length === 1 ? 'program stands' : 'programs stand'} out — saving one keeps it in
            your record.
          </AiNote>
          <div className="grid gap-4 md:grid-cols-3">
            {matches.map(({ resource: r, reason }) => (
              <Card key={r.id} className="card-hover flex flex-col border-teal-100 bg-teal-50/30">
                <div className="flex items-start justify-between gap-2">
                  <span className="chip bg-surface text-ink-soft">{r.type}</span>
                  {r.addedRecently && <span className="chip bg-amber-50 text-amber-600">New</span>}
                </div>
                <h3 className="section-title mt-2 text-base font-semibold">{r.name}</h3>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-ink-soft">
                  <span className="font-medium text-teal-700">Why: </span>
                  {reason}.
                </p>
                <button
                  onClick={() => dispatch({ type: 'toggle-saved', id: r.id })}
                  className="btn-ghost mt-3 w-full"
                >
                  <Bookmark className="h-4 w-4" /> Save to your record
                </button>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search resources, e.g. “employment”, “waiver”…"
          aria-label="Search resources"
          className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-ink-faint focus:border-teal-300"
        />
      </div>

      {/* Type filter */}
      <div className="flex flex-wrap gap-2">
        {resourceTypes.map((t) => (
          <button
            key={t.id}
            onClick={() => setType(t.id)}
            className={cx(
              'chip border transition-colors',
              type === t.id ? 'border-teal-300 bg-teal-50 text-teal-700' : 'border-line bg-surface text-ink-soft hover:bg-canvas',
            )}
          >
            {t.label}
          </button>
        ))}
        <button
          onClick={() => setType('saved')}
          className={cx(
            'chip border transition-colors',
            type === 'saved' ? 'border-amber-300 bg-amber-50 text-amber-600' : 'border-line bg-surface text-ink-soft hover:bg-canvas',
          )}
        >
          <Bookmark className="h-3 w-3" /> Saved ({saved.length})
        </button>
      </div>

      {/* Results */}
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((r) => {
          const isSaved = saved.includes(r.id)
          return (
            <Card key={r.id} className="card-hover flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="chip bg-lav-50 text-lav-600">{r.type}</span>
                  <h3 className="section-title mt-2 text-base font-semibold">{r.name}</h3>
                </div>
                <button
                  onClick={() => dispatch({ type: 'toggle-saved', id: r.id })}
                  className={cx(
                    'rounded-lg p-2 transition-colors',
                    isSaved ? 'bg-amber-50 text-amber-500' : 'text-ink-faint hover:bg-canvas',
                  )}
                  aria-pressed={isSaved}
                  aria-label={isSaved ? `Remove ${r.name} from saved` : `Save ${r.name}`}
                >
                  <Bookmark className={cx('h-4 w-4', isSaved && 'fill-current')} />
                </button>
              </div>

              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{r.description}</p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {r.tags.map((t) => (
                  <span key={t} className="chip bg-canvas text-ink-soft">{t}</span>
                ))}
              </div>

              <div className="mt-4 space-y-1.5 border-t border-line pt-3 text-sm text-ink-soft">
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-ink-faint" /> {r.serves}
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-ink-faint" /> {r.contact}
                </p>
              </div>

              <div className="mt-4 flex items-center">
                {r.free ? (
                  <span className="chip bg-sage-50 text-sage-600">
                    <BadgeCheck className="h-3.5 w-3.5" /> Free / publicly funded
                  </span>
                ) : (
                  <span className="chip bg-canvas text-ink-soft">Fees may apply</span>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <Card className="text-center text-ink-faint">
          <LifeBuoy className="mx-auto mb-3 h-8 w-8 opacity-40" />
          {type === 'saved'
            ? 'Nothing saved yet — tap the bookmark on any resource to keep it here.'
            : 'No resources match. Try another category or search term.'}
        </Card>
      )}

      <p className="rounded-xl bg-canvas px-4 py-3 text-xs leading-relaxed text-ink-faint">
        General directory listings are illustrative examples for this prototype.
        {deep
          ? ' Only the “Verified” section above reflects checked, real programs.'
          : ' In the live product, resources would be verified and localized to your area.'}
      </p>
    </div>
  )
}
