import AppSurface from '../AppSurface';
import { formatCategoryKind, getCategoryAccentColor } from '../../../lib/categories';

const actionButtonClassName =
  'inline-flex items-center justify-center rounded-full border px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] transition';

export default function CategoryCard({ category, isArchiving = false, onEdit, onArchive }) {
  const accentColor = getCategoryAccentColor(category.color);
  const previewIcon = category.icon || category.name.slice(0, 1).toUpperCase();

  return (
    <AppSurface className={category.is_archived ? 'border-[#d8e8e7] bg-[linear-gradient(180deg,rgba(252,253,253,0.96),rgba(240,246,245,0.88))]' : ''}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.1rem] border text-lg font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]"
            style={{
              backgroundColor: `${accentColor}22`,
              borderColor: `${accentColor}44`,
              color: accentColor,
            }}
          >
            <span className="max-w-full truncate px-1 text-center text-sm leading-none">{previewIcon}</span>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold tracking-[-0.02em] text-[#16323b]">{category.name}</h3>
              {category.is_archived ? (
                <span className="rounded-full bg-[#eef4f3] px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[#5f747c]">
                  Archived
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-[#5a727b]">{formatCategoryKind(category.kind)}</p>
          </div>
        </div>

        <span
          className="h-4 w-4 shrink-0 rounded-full border border-white/80 shadow-[0_0_0_4px_rgba(255,255,255,0.55)]"
          style={{ backgroundColor: accentColor }}
          aria-hidden="true"
        />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[1.1rem] border border-[#d3efed] bg-white/70 px-3 py-3">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[#087f98]">Icon</p>
          <p className="mt-2 truncate text-sm font-bold text-[#16323b]">{category.icon || 'Not set'}</p>
        </div>
        <div className="rounded-[1.1rem] border border-[#d3efed] bg-white/70 px-3 py-3">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[#087f98]">Color</p>
          <p className="mt-2 truncate text-sm font-bold text-[#16323b]">{accentColor}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onEdit(category)}
          className={`${actionButtonClassName} border-[#d3efed] bg-white/80 text-[#16323b] hover:border-[#35d9ef]/40 hover:text-[#087f98]`}
        >
          Edit
        </button>

        {!category.is_archived ? (
          <button
            type="button"
            onClick={() => onArchive(category)}
            disabled={isArchiving}
            className={`${actionButtonClassName} border-[#efc7b8] bg-[#fff2ec] text-[#934d33] hover:border-[#e3a28a] disabled:cursor-not-allowed disabled:opacity-70`}
          >
            {isArchiving ? 'Archiving...' : 'Archive'}
          </button>
        ) : (
          <p className="text-xs leading-5 text-[#5a727b]">Hidden from the default active list.</p>
        )}
      </div>
    </AppSurface>
  );
}
