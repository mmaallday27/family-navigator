// The Lifelong Family Vault — not a file manager, but the documentary memory
// of a person's developmental life. Documents are organized by the six journey
// areas of the road (education → clinical → benefits → adult life → legal →
// family), storage is a first-class honest system, and every uploaded file can
// be genuinely read by the navigator. The family owns the record, always.

import { useEffect, useMemo, useRef, useState } from 'react'
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
import { docCategories, docGroups, type DocFile } from '../data/documents'
import { useFamily } from '../store/FamilyContext'
import { firstName } from '../store/selectors'
import { analyzeDocument, type DocumentAnalysis } from '../intelligence/documents'
import { vaultGaps } from '../intelligence/insights'
import {
  apiDeleteDocument,
  apiStorage,
  apiUploadDocument,
  documentContentUrl,
  fileToBase64,
  type StorageInfo,
} from '../api'
import { cx, accentChip } from '../lib/cx'
import { StorageMeter, humanBytes } from '../components/vault/StorageMeter'
import { GroupedCategoryPicker } from '../components/vault/CategoryPicker'
import { DocumentInsightsPanel } from '../components/vault/DocumentInsightsPanel'

const FALLBACK_MAX_FILE_BYTES = 10 * 1_048_576

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
  const [removeError, setRemoveError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [analysis, setAnalysis] = useState<{ docName: string; result: DocumentAnalysis } | null>(null)
  const [storage, setStorage] = useState<StorageInfo | null>(null)

  // Storage is a first-class system: load it with the page, refresh it after
  // every upload and delete. A failed fetch is quiet — the vault still works.
  const refreshStorage = () => {
    apiStorage()
      .then(setStorage)
      .catch(() => {})
  }
  useEffect(refreshStorage, [])

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
  const catCount = (id: string) => documents.filter((f) => f.categoryId === id).length
  const selectedUploadCat = docCategories.find((c) => c.id === uploadCat)

  const maxFileBytes = storage?.maxFileBytes ?? FALLBACK_MAX_FILE_BYTES
  const storageFull = storage !== null && storage.remainingBytes <= 0

  const resetUpload = () => {
    setUploadName('')
    setFile(null)
    setUploadError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const addDocument = async () => {
    const name = uploadName.trim() || file?.name?.trim() || ''
    if (!name || busy) return
    if (file && file.size > maxFileBytes) {
      setUploadError(
        `That file is ${humanBytes(file.size)} — over the ${humanBytes(maxFileBytes)} per-file limit. A smaller scan or a compressed PDF will file just fine.`,
      )
      return
    }
    // Quota guard: if the file won't fit, explain instead of trying. Nothing
    // already stored is affected either way.
    if (file && storage && file.size > storage.remainingBytes) {
      setUploadError(
        storage.remainingBytes <= 0
          ? 'Your storage is full, so file uploads are paused for now. Everything already in your vault stays viewable and exportable — see “About storage plans” on the vault page for how to preserve more. You can still add a named placeholder today.'
          : `This file needs ${humanBytes(file.size)}, but your vault has ${humanBytes(storage.remainingBytes)} of space left. Everything already stored stays safe — see “About storage plans” on the vault page for how to preserve more.`,
      )
      return
    }
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
          size: humanBytes(saved.size),
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
      refreshStorage()
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const removeDocument = async (doc: DocFile) => {
    if (!window.confirm(`Remove “${doc.name}” from the vault?`)) return
    setRemoveError(null)
    if (doc.hasFile) {
      // The stored file must be gone from the server before the entry leaves
      // the record — otherwise the bytes would linger with no way to reach them.
      try {
        await apiDeleteDocument(doc.id)
      } catch {
        setRemoveError(
          `“${doc.name}” couldn’t be removed just now — it’s still safe in your vault. Please try again in a moment.`,
        )
        return
      }
    }
    dispatch({ type: 'remove-document', id: doc.id })
    refreshStorage()
  }

  const gaps = vaultGaps(state)
  const childName = firstName(state.child.name)

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="The documentary memory of a lifetime"
        title="Lifelong Family Vault"
        subtitle={`Every evaluation, plan, letter, and note — one living record of ${childName ? `${childName}’s` : 'your child’s'} developmental life, owned by your family and organized around the journey itself.`}
        icon={<FolderHeart className="h-6 w-6" />}
        action={
          <button onClick={() => setShowUpload(true)} className="btn-primary">
            <UploadCloud className="h-4 w-4" /> Add a document
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
            <p className="text-xs text-ink-faint">Documents in the record</p>
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
            <p className="font-display text-2xl font-semibold text-ink">{docGroups.length}</p>
            <p className="text-xs text-ink-faint">Areas of the journey</p>
          </div>
        </Card>
      </div>

      {/* Storage — honest and first-class. Quietly absent if it can't load. */}
      {storage && <StorageMeter info={storage} />}

      <WhyThisMatters
        matters="Every service, benefit, and legal step downstream asks for paperwork you already have — the current IEP, a recent evaluation, benefits letters. A family that can produce the right document in a moment moves faster and gets taken more seriously."
        now="Documents scatter across email, folders, and backpacks exactly when you're busiest. Gathering them into one place before you need them turns future emergencies into quiet lookups."
        connects="When you add a document, I can read the actual file — pulling out its dates, action items, and open questions — and connect it to your briefing, meeting prep, and Look Ahead. Nothing sits in isolation."
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

      {/* Search + journey-grouped browse */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search documents…"
              aria-label="Search documents"
              className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-ink-faint focus:border-teal-300"
            />
          </div>
          <button
            onClick={() => setActiveCat('all')}
            aria-pressed={activeCat === 'all'}
            className={cx(
              'chip border transition-colors',
              activeCat === 'all'
                ? 'border-teal-300 bg-teal-50 text-teal-700'
                : 'border-line bg-surface text-ink-soft hover:bg-canvas',
            )}
          >
            All documents ({documents.length})
          </button>
        </div>
        <GroupedCategoryPicker
          value={activeCat}
          onChange={(id) => setActiveCat(id === activeCat ? 'all' : id)}
          counts={catCount}
        />
      </div>

      {removeError && (
        <p className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-700" role="alert">
          {removeError}
        </p>
      )}

      {/* File list */}
      <Card className="p-0">
        {documents.length === 0 ? (
          <EmptyState
            icon={<FolderHeart className="h-6 w-6" />}
            title={childName ? `Start ${childName}’s record` : 'Start your family’s record'}
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
              <li key={f.id} className="p-4 hover:bg-canvas/50">
                <div className="flex items-center gap-4">
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
                </div>
                {/* Document intelligence — grounded in the file's real bytes */}
                <div className="mt-2 pl-14">
                  <DocumentInsightsPanel
                    doc={f}
                    onStore={(insights) =>
                      dispatch({ type: 'set-document-insights', id: f.id, insights })
                    }
                  />
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

        {storageFull && (
          <p className="mt-3 rounded-xl bg-amber-50 px-4 py-2.5 text-xs leading-relaxed text-ink-soft">
            Your storage is currently full, so new file uploads are paused. Everything already
            stored stays viewable and exportable — and you can still add a named placeholder today.
          </p>
        )}

        <div className="mt-4">
          <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-line bg-canvas/40 p-5 text-center hover:border-teal-300">
            <input
              ref={fileInputRef}
              type="file"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null
                setFile(f)
                setUploadError(null)
                if (f && !uploadName.trim()) setUploadName(f.name)
              }}
            />
            <UploadCloud className="mx-auto h-6 w-6 text-teal-500" />
            <p className="mt-2 text-sm font-medium text-ink">
              {file ? file.name : 'Choose a file'}
            </p>
            <p className="text-xs text-ink-faint">
              {file
                ? `${humanBytes(file.size)} · click to change`
                : `PDF, image, or document · up to ${humanBytes(maxFileBytes)}`}
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
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
            Where does it belong on the journey?
          </p>
          <div className="mt-2 max-h-56 overflow-y-auto pr-1">
            <GroupedCategoryPicker value={uploadCat} onChange={setUploadCat} colored />
          </div>
          {selectedUploadCat && (
            <p className="mt-2 text-xs text-ink-faint">{selectedUploadCat.description}</p>
          )}
          <p className="mt-1.5 text-xs text-ink-faint">
            Nothing has to fit a box — <span className="font-medium text-ink-soft">Family Records</span>{' '}
            is always open, and it’s your call what belongs there.
          </p>
        </div>

        {uploadError && (
          <p className="mt-4 rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-700" role="alert">
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
              dates and requirements against the document itself. Once the file is in your vault,
              use “Analyze this document” to have the actual document read.
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
