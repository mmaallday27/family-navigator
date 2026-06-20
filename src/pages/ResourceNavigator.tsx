import { useMemo, useState } from 'react'
import {
  LifeBuoy,
  Search,
  MapPin,
  Phone,
  BadgeCheck,
  Bookmark,
  ArrowUpRight,
} from 'lucide-react'
import { PageHeader, Card } from '../components/ui'
import { resources, resourceTypes } from '../data/resources'
import { cx } from '../lib/cx'

export default function ResourceNavigator() {
  const [type, setType] = useState('all')
  const [query, setQuery] = useState('')
  const [saved, setSaved] = useState<Set<string>>(new Set(['r2']))

  const filtered = useMemo(() => {
    return resources.filter(
      (r) =>
        (type === 'all' || r.typeId === type) &&
        (r.name.toLowerCase().includes(query.toLowerCase()) ||
          r.description.toLowerCase().includes(query.toLowerCase()) ||
          r.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))),
    )
  }, [type, query])

  const toggleSave = (id: string) =>
    setSaved((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="The right help, when you need it"
        title="Resource Navigator"
        subtitle="A curated map of the people and programs that make transition real — support organizations, coordinators, attorneys, vocational programs, and adult services."
        icon={<LifeBuoy className="h-6 w-6" />}
      />

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search resources, e.g. “employment”, “waiver”…"
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
      </div>

      {/* Results */}
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((r) => {
          const isSaved = saved.has(r.id)
          return (
            <Card key={r.id} className="card-hover flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="chip bg-lav-50 text-lav-600">{r.type}</span>
                  <h3 className="section-title mt-2 text-base font-semibold">{r.name}</h3>
                </div>
                <button
                  onClick={() => toggleSave(r.id)}
                  className={cx(
                    'rounded-lg p-2 transition-colors',
                    isSaved ? 'bg-amber-50 text-amber-500' : 'text-ink-faint hover:bg-canvas',
                  )}
                  aria-label={isSaved ? 'Saved' : 'Save'}
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

              <div className="mt-4 flex items-center justify-between">
                {r.free ? (
                  <span className="chip bg-sage-50 text-sage-600">
                    <BadgeCheck className="h-3.5 w-3.5" /> Free / publicly funded
                  </span>
                ) : (
                  <span className="chip bg-canvas text-ink-soft">Fees may apply</span>
                )}
                <button className="inline-flex items-center gap-1 text-sm font-semibold text-teal-600 hover:gap-2">
                  Learn more <ArrowUpRight className="h-4 w-4 transition-all" />
                </button>
              </div>
            </Card>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <Card className="text-center text-ink-faint">
          <LifeBuoy className="mx-auto mb-3 h-8 w-8 opacity-40" />
          No resources match. Try another category or search term.
        </Card>
      )}

      <p className="rounded-xl bg-canvas px-4 py-3 text-xs leading-relaxed text-ink-faint">
        Listings are illustrative examples for this prototype. In the live product, resources would be
        verified and localized to your area.
      </p>
    </div>
  )
}
