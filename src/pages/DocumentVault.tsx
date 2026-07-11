import { useMemo, useRef, useState } from 'react'
import {
  FolderHeart,
  FileText,
  UploadCloud,
  AlertCircle,
  Search,
  Download,
  Trash2,
} from 'lucide-react'
import { PageHeader, Card, EmptyState, Modal } from '../components/ui'
import { AiNote, SourceBadge, WhyThisMatters } from '../components/ai'
import { docCategories, type DocFile } from '../data/documents'
import { useFamily } from '../store/FamilyContext'
import { firstName } from '../store/selectors'
import { analyzeDocument, type DocumentAnalysis } from '../intelligence/documents'
import { vaultGaps } from '../intelligence/insights'
import { apiDeleteDocument, apiUploadDocument, documentContentUrl, fileToBase64 } from '../api'
import { cx, accentChip } from '../lib/cx'

export default function DocumentVault() {
  const { state, dispatch } = useFamily()
  const documents = state.documents
  const [activeCat, setActiveCat] = useState<string>('all')
  const [query, setQuery] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const [uploadName, setUploadName] = useState('')
  const [uploadCat, setUploadCat] = useState(docCategories[0].id)
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [analysis, setAnalysis] = useState<{ docName: string; result: DocumentAnalysis } | null>(null)

  const filtered = useMemo(() => {
    return documents.filter(
      (f) =>
        (activeCat === 'all' || f.categoryId === activeCat) &&
        f.name.toLowerCase().includes(query.toLowerCase()),
    )
  }, [documents, activeCat, query])

  const flaggedCount = documents.filter((f) => f.flagged).length
  const catName = (id: string) => docCategories.find((c) => c.id === id)?.name ?? id
  const catColor = (id: string) => docCategories.find((c) => c.id === id)?.color ?? 'teal'

  const resetUpload = () => {
    setUploadName('')
    setFile(null)
    setUploadError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const humanSize = (bytes: number) =>
    bytes < 1024 ? `${bytes} B` : bytes < 1_048_576 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1_048_576).toFixed(1)} MB`

  const addDocument = async () => {
    const name = uploadName.trim() || file?.name?.trim() || ''
    if (!name || busy) return
    setBusy(true)
    setUploadError(null)
    // The intelligent part: the platform reads what kind of moment this
    // document is and responds — analysis modal + record updates.
    const result = analyzeDocument(name, uploadCat, state)
    try {
      if (file) {
        // Real bytes: store them server-side, then file the returned id/size.
        const dataBase64 = await fileToBase64(file)
        const saved = await apiUploadDocument(name, file.type || 'application/octet-stream', dataBase64)
        dispatch({
          type: 'add-document',
          name,
          categoryId: uploadCat,
          id: saved.id,
          size: humanSize(saved.size),
          hasFile: true,
        })
      } else {
        // Metadata-only entry (no file chosen) — still tracked in the record.
        dispatch({ type: 'add-document', name, categoryId: uploadCat })
      }
      setShowUpload(false)
      resetUpload()
      setActiveCat('all')
      setQuery('')
      setAnalysis({ docName: name, result })
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const removeDocument = async (doc: DocFile) => {
    if (!window.confirm(`Remove “${doc.name}” from the vault?`)) return
    if (doc.hasFile) await apiDeleteDocument(doc.id).catch(() => {})
    dispatch({ type: 'remove-document', id: doc.id })
  }

  const gaps = vaultGaps(state)

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
            <p className="font-display text-2xl font-semibold text-ink">{documents.length}</p>
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

      <WhyThisMatters
        matters="Every service, benefit, and legal step downstream asks for paperwork you already have — the current IEP, a recent evaluation, benefits letters. A family that can produce the right document in a moment moves faster and gets taken more seriously."
        now="Documents scatter across email, folders, and backpacks exactly when you're busiest. Gathering them into one place before you need them turns future emergencies into quiet lookups."
        connects="When you add a document, I read what it is, flag deadlines and gaps, and update your briefing, meeting prep, and Look Ahead — nothing sits in isolation."
      />

      {/* Vault health — what the record is missing for this stage */}
      {documents.length > 0 && (
        <AiNote title="Vault health">
          {gaps.length === 0 ? (
            <>
              Your vault covers what this stage usually calls for. {flaggedCount > 0 && (
                <>
                  {flaggedCount} {flaggedCount === 1 ? 'document needs' : 'documents need'} your
                  attention — look for the amber flags below.
                </>
              )}
              {flaggedCount === 0 && <>Nothing appears incomplete right now.</>}
            </>
          ) : (
            <>
              {gaps.length === 1 ? 'One gap' : `${gaps.length} gaps`} worth closing for this stage:{' '}
              {gaps.map((g, i) => (
                <span key={g.id}>
                  <span className="font-semibold text-ink">{g.label.toLowerCase()}</span>
                  {i < gaps.length - 1 ? ' · ' : ''}
                </span>
              ))}
              . {gaps[0].why}
            </>
          )}
        </AiNote>
      )}

      {/* Search + category filter */}
      <div className="space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents…"
            aria-label="Search documents"
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
            All ({documents.length})
          </button>
          {docCategories.map((c) => {
            const count = documents.filter((f) => f.categoryId === c.id).length
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
        {documents.length === 0 ? (
          <EmptyState
            icon={<FolderHeart className="h-6 w-6" />}
            title={`Start ${firstName(state.child.name)}’s record`}
            body="Every report, IEP, and letter you add becomes part of one living history — ready the moment a school, agency, or attorney asks."
            action={
              <button onClick={() => setShowUpload(true)} className="btn-primary">
                <UploadCloud className="h-4 w-4" /> Add your first document
              </button>
            }
          />
        ) : filtered.length === 0 ? (
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
                  {f.hasFile && (
                    <a
                      href={documentContentUrl(f.id)}
                      className="rounded-lg p-2 text-ink-faint hover:bg-canvas hover:text-ink-soft"
                      title={`Download ${f.name}`}
                      aria-label={`Download ${f.name}`}
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  )}
                  <button
                    onClick={() => removeDocument(f)}
                    className="rounded-lg p-2 text-ink-faint hover:bg-rose-50 hover:text-rose-500"
                    aria-label={`Remove ${f.name}`}
                    title={`Remove ${f.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Upload workflow — stores real file bytes on the server */}
      <Modal
        open={showUpload}
        onClose={() => {
          setShowUpload(false)
          resetUpload()
        }}
        title="Add a document"
      >
        <p className="mt-1 text-sm text-ink-soft">
          Choose a file to store securely in your record, or add a named placeholder if the document
          isn’t handy yet. Either way it’s filed and ready for the moment you need it.
        </p>

        <div className="mt-4">
          <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-line bg-canvas/40 p-5 text-center hover:border-teal-300">
            <input
              ref={fileInputRef}
              type="file"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null
                setFile(f)
                if (f && !uploadName.trim()) setUploadName(f.name)
              }}
            />
            <UploadCloud className="mx-auto h-6 w-6 text-teal-500" />
            <p className="mt-2 text-sm font-medium text-ink">
              {file ? file.name : 'Choose a file'}
            </p>
            <p className="text-xs text-ink-faint">
              {file ? `${humanSize(file.size)} · click to change` : 'PDF, image, or document · up to 10 MB'}
            </p>
          </label>
        </div>

        <div className="mt-4">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Document name</span>
            <input
              value={uploadName}
              onChange={(e) => setUploadName(e.target.value)}
              placeholder="e.g. 2026 IEP — Annual Review.pdf"
              className="mt-1.5 w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-teal-300"
            />
          </label>
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Category</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {docCategories.map((c) => (
              <button
                key={c.id}
                onClick={() => setUploadCat(c.id)}
                role="radio"
                aria-checked={uploadCat === c.id}
                className={cx(
                  'chip border transition-colors',
                  uploadCat === c.id
                    ? 'border-teal-300 bg-teal-50 text-teal-700'
                    : cx('border-transparent', accentChip[c.color]),
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {uploadError && (
          <p className="mt-4 rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-500" role="alert">
            {uploadError}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={() => {
              setShowUpload(false)
              resetUpload()
            }}
            className="btn-soft"
          >
            Cancel
          </button>
          <button onClick={addDocument} disabled={busy || (!uploadName.trim() && !file)} className="btn-primary">
            <UploadCloud className="h-4 w-4" /> {busy ? 'Saving…' : 'Add to vault'}
          </button>
        </div>
      </Modal>

      {/* Document intelligence — what the platform noticed and how the record responds */}
      <Modal open={analysis !== null} onClose={() => setAnalysis(null)} title="Added — here’s what I noticed">
        {analysis && (
          <div className="mt-3 max-h-[65vh] space-y-3 overflow-y-auto pr-1">
            <div>
              <SourceBadge kind="record" />
            </div>
            <p className="text-sm leading-relaxed text-ink">{analysis.result.summary}</p>

            {(
              [
                ['Action items', analysis.result.actionItems],
                ['Deadlines to verify', analysis.result.deadlines],
                ['Worth double-checking', analysis.result.checkFor],
                ['How your record responds', analysis.result.updates],
              ] as const
            )
              .filter(([, items]) => items.length > 0)
              .map(([heading, items]) => (
                <div key={heading} className="rounded-xl bg-canvas p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">{heading}</p>
                  <ul className="mt-1.5 space-y-1.5">
                    {items.map((item) => (
                      <li key={item} className="flex gap-2 text-sm leading-relaxed text-ink-soft">
                        <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-teal-300" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

            {analysis.result.professionalNote && (
              <p className="rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-ink-soft">
                <span className="font-semibold text-amber-700">Bring this to a professional: </span>
                {analysis.result.professionalNote}
              </p>
            )}

            <p className="text-[11px] leading-relaxed text-ink-faint">
              Guidance is generated from the document’s type and your family record — always verify
              dates and requirements against the document itself.
            </p>

            <div className="flex justify-end">
              <button onClick={() => setAnalysis(null)} className="btn-primary">
                Got it
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
