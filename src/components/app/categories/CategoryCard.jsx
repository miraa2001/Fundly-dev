import AppSurface from '../AppSurface';
import { formatCategoryKind, getCategoryAccentColor } from '../../../lib/categories';

const actionButtonClassName =
  'inline-flex items-center justify-center rounded-full border px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] transition';

export default function CategoryCard({ category, isArchiving = false, onEdit, onArchive }) {
  const accentColor = getCategoryAccentColor(category.color);

  return (
    <AppSurface className={category.is_archived ? 'border-[#d8e8e7] bg-[linear-gradient(180deg,rgba(252,253,253,0.96),rgba(240,246,245,0.88))]' : ''}>
      <div className="flex items-start gap-3">
        <div
          className="h-12 w-12 shrink-0 rounded-[1.1rem] border border-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
          style={{ backgroundColor: accentColor }}
          aria-hidden="true"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold tracking-[-0.02em] text-[#16323b]">{category.name}</h3>
            <span className="rounded-full bg-[#eefcff] px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[#0d5b70]">
              {formatCategoryKind(category.kind)}
            </span>
            {category.is_archived ? (
              <span className="rounded-full bg-[#eef4f3] px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[#5f747c]">
                Archived
              </span>
            ) : null}
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
        </div>
      </div>
    </AppSurface>
  );
}
