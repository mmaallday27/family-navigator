import { useMemo, useState } from 'react'
import {
  FolderHeart,
  FileText,
  UploadCloud,
  AlertCircle,
  Search,
  Download,
  MoreHorizontal,
  Plus,
} from 'lucide-react'
import { PageHeader, Card } from '../components/ui'
import { docCategories, docFiles } from '../data/documents'
import { cx, accentChip } from '../lib/cx'

export default function DocumentVault() {
  const [activeCat, setActiveCat] = useState<string>('all')
  const [query, setQuery] = useState('')
  const [showUpload, setShowUpload] = useState(false)

  const filtered = useMemo(() => {
    return docFiles.filter(
      (f) =>
        (activeCat === 'all' || f.categoryId === activeCat) &&
        f.name.toLowerCase().includes(query.toLowerCase()),
    )
  }, [activeCat, query])

  const flaggedCount = docFiles.filter((f) => f.flagged).length
  const catName = (id: string) => docCategories.find((c) => c.id === id)?.name ?? id
  const catColor = (id: string) => docCategories.find((c) => c.id === id)?.color ?? 'teal'

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Everything in one calm place"
        title="Document Vault"
        subtitle="The paperwork of a lifetime, organized so you can find the right document the moment a meeting, application, or deadline calls for it."
        icon={<FolderHeart className="h-6 w-6" />}
        action={
          <button onClick={() => setShowUpload(true)} className="btn-primary">
            <UploadCloud className="h-4 w-4" /> Upload document
          </button>
        }
      />

      {/* Summary row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-2xl font-semibold text-ink">{docFiles.length}</p>
            <p className="text-xs text-ink-faint">Documents stored</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-2xl font-semibold text-ink">{flaggedCount}</p>
            <p className="text-xs text-ink-faint">Need your attention</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sage-50 text-sage-600">
            <FolderHeart className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-2xl font-semibold text-ink">{docCategories.length}</p>
            <p className="text-xs text-ink-faint">Organized categories</p>
          </div>
        </Card>
      </div>

      {/* Search + category filter */}
      <div className="space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents…"
            className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-ink-faint focus:border-teal-300"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCat('all')}
            className={cx(
              'chip border transition-colors',
              activeCat === 'all' ? 'border-teal-300 bg-teal-50 text-teal-700' : 'border-line bg-surface text-ink-soft hover:bg-canvas',
            )}
          >
            All ({docFiles.length})
          </button>
          {docCategories.map((c) => {
            const count = docFiles.filter((f) => f.categoryId === c.id).length
            return (
              <button
                key={c.id}
                onClick={() => setActiveCat(c.id)}
                className={cx(
                  'chip border transition-colors',
                  activeCat === c.id ? 'border-teal-300 bg-teal-50 text-teal-700' : 'border-line bg-surface text-ink-soft hover:bg-canvas',
                )}
              >
                {c.name} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* File list */}
      <Card className="p-0">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-ink-faint">
            <FileText className="mx-auto mb-3 h-8 w-8 opacity-40" />
            No documents match. Try a different category or search.
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {filtered.map((f) => (
              <li key={f.id} className="flex items-center gap-4 p-4 hover:bg-canvas/50">
                <div
                  className={cx(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                    accentChip[catColor(f.categoryId)],
                  )}
                >
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium text-ink">{f.name}</p>
                    {f.flagged && (
                      <span className="chip bg-amber-50 text-amber-600">
                        <AlertCircle className="h-3 w-3" /> Attention
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-ink-faint">
                    {catName(f.categoryId)} · {f.date} · {f.size}
                  </p>
                  {f.note && <p className="mt-0.5 text-xs text-amber-600">{f.note}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button className="rounded-lg p-2 text-ink-faint hover:bg-canvas hover:text-ink-soft" aria-label="Download">
                    <Download className="h-4 w-4" />
                  </button>
                  <button className="rounded-lg p-2 text-ink-faint hover:bg-canvas hover:text-ink-soft" aria-label="More">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Upload modal (mock workflow) */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/30" onClick={() => setShowUpload(false)} />
          <div className="relative w-full max-w-lg animate-fade-in rounded-3xl bg-surface p-6 shadow-lift">
            <h3 className="section-title text-lg font-semibold">Upload a document</h3>
            <p className="mt-1 text-sm text-ink-soft">
              Add it to the right category so it’s ready when you need it. (Prototype — no file is
              actually stored.)
            </p>

            <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-line bg-canvas/50 p-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
                <UploadCloud className="h-6 w-6" />
              </div>
              <p className="mt-3 text-sm font-medium text-ink">Drag a file here, or browse</p>
              <p className="text-xs text-ink-faint">PDF, image, or document</p>
              <button className="btn-soft mt-4">
                <Plus className="h-4 w-4" /> Choose file
              </button>
            </div>

            <div className="mt-4">
              <label className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                Category
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {docCategories.map((c) => (
                  <span key={c.id} className={cx('chip cursor-pointer', accentChip[c.color])}>
                    {c.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setShowUpload(false)} className="btn-soft">
                Cancel
              </button>
              <button onClick={() => setShowUpload(false)} className="btn-primary">
                Add to vault
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
