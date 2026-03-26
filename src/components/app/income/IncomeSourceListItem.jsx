export default function IncomeSourceListItem({
  source,
  onEdit,
  onToggleArchive,
  isToggling = false,
}) {
  return (
    <div className="rounded-[1.3rem] border border-[rgba(var(--fundly-primary-rgb),0.12)] bg-white/70 px-4 py-4 shadow-[0_14px_32px_rgba(var(--fundly-deep-rgb),0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-base font-bold text-[var(--fundly-primary)]">{source.name}</p>
          {source.description ? (
            <p className="mt-2 text-sm leading-6 text-[rgba(var(--fundly-primary-rgb),0.72)]">{source.description}</p>
          ) : (
            <p className="mt-2 text-sm leading-6 text-[rgba(var(--fundly-primary-rgb),0.52)]">No description added yet.</p>
          )}
        </div>

        <span
          className="shrink-0 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.16em]"
          style={{
            backgroundColor: source.isArchived ? 'rgba(var(--fundly-warm-rgb),0.12)' : 'rgba(var(--fundly-accent-rgb),0.12)',
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
          className="inline-flex items-center justify-center rounded-full border border-[rgba(var(--fundly-primary-rgb),0.16)] bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--fundly-primary)] transition hover:border-[rgba(var(--fundly-accent-rgb),0.40)] hover:text-[var(--fundly-accent)]"
        >
          Edit
        </button>

        <button
          type="button"
          onClick={() => onToggleArchive(source)}
          disabled={isToggling}
          className="inline-flex items-center justify-center rounded-full border border-[rgba(var(--fundly-accent-rgb),0.24)] bg-[rgba(var(--fundly-accent-rgb),0.10)] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--fundly-accent)] transition hover:border-[rgba(var(--fundly-accent-rgb),0.40)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isToggling ? 'Saving...' : source.isArchived ? 'Restore' : 'Archive'}
        </button>
      </div>
    </div>
  );
}
