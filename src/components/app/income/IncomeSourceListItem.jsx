export default function IncomeSourceListItem({
  source,
  onEdit,
  onToggleArchive,
  isToggling = false,
}) {
  return (
    <div className="rounded-[1.1rem] bg-[var(--fundly-canvas)] px-4 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-base font-medium text-[var(--fundly-deep)]">{source.name}</p>
          {source.description ? (
            <p className="mt-2 text-sm leading-6 text-[rgba(var(--fundly-primary-rgb),0.72)]">{source.description}</p>
          ) : (
            <p className="mt-2 text-sm leading-6 text-[rgba(var(--fundly-primary-rgb),0.52)]">No description added yet.</p>
          )}
        </div>

        <span
          className="shrink-0 rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.14em]"
          style={{
            backgroundColor: source.isArchived ? 'rgba(var(--fundly-warm-rgb),0.08)' : 'rgba(var(--fundly-accent-rgb),0.08)',
            color: source.isArchived ? 'var(--fundly-warm)' : 'var(--fundly-accent)',
          }}
        >
          {source.isArchived ? 'Archived' : 'Active'}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onEdit(source)}
          className="fundly-button-secondary"
        >
          Edit
        </button>

        <button
          type="button"
          onClick={() => onToggleArchive(source)}
          disabled={isToggling}
          className="fundly-button-accent"
        >
          {isToggling ? 'Saving...' : source.isArchived ? 'Restore' : 'Archive'}
        </button>
      </div>
    </div>
  );
}
