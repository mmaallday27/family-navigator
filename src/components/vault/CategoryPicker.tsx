// The vault's information architecture made visible: categories presented
// under the six journey areas of a developmental life, so a family always
// files (and finds) paperwork by where it belongs on the road — not in a
// flat pile of folders.

import { docCategories, docGroups } from '../../data/documents'
import { cx, accentChip } from '../../lib/cx'

export function GroupedCategoryPicker({
  value,
  onChange,
  counts,
  colored = false,
  showGroupDescriptions = false,
}: {
  /** The selected category id ('all' or none selects nothing). */
  value: string
  onChange: (id: string) => void
  /** Optional per-category document count, shown inside each chip. */
  counts?: (id: string) => number
  /** Tint unselected chips with their category accent (upload-modal style). */
  colored?: boolean
  /** Show each journey area's one-line description under its name. */
  showGroupDescriptions?: boolean
}) {
  return (
    <div className="space-y-3.5">
      {docGroups.map((group) => (
        <div key={group.id}>
          <p
            className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint"
            title={group.description}
          >
            {group.name}
          </p>
          {showGroupDescriptions && (
            <p className="mt-0.5 text-xs text-ink-faint">{group.description}</p>
          )}
          <div className="mt-1.5 flex flex-wrap gap-2">
            {docCategories
              .filter((cat) => cat.group === group.id)
              .map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onChange(cat.id)}
                  aria-pressed={value === cat.id}
                  title={cat.description}
                  className={cx(
                    'chip border transition-colors',
                    value === cat.id
                      ? 'border-teal-300 bg-teal-50 text-teal-700'
                      : colored
                        ? cx('border-transparent', accentChip[cat.color])
                        : 'border-line bg-surface text-ink-soft hover:bg-canvas',
                  )}
                >
                  {cat.name}
                  {counts ? ` (${counts(cat.id)})` : ''}
                </button>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}
