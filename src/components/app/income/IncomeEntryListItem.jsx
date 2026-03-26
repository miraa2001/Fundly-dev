import { formatIncomeAmount, formatIncomeDate } from '../../../lib/income';

export default function IncomeEntryListItem({ entry, onEdit }) {
  const usesBaseCurrency = entry.currency_code === entry.base_currency_code;

  return (
    <div className="rounded-[1.3rem] border border-[rgba(var(--fundly-primary-rgb),0.12)] bg-white/70 px-4 py-4 shadow-[0_14px_32px_rgba(var(--fundly-deep-rgb),0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: entry.categoryColor }}
              aria-hidden="true"
            />
            <p className="truncate text-base font-bold text-[var(--fundly-primary)]">{entry.sourceName}</p>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[rgba(var(--fundly-primary-rgb),0.72)]">
            <span>{formatIncomeDate(entry.entry_date)}</span>
            <span>{entry.categoryName}</span>
            {entry.merchantOrSource ? <span>{entry.merchantOrSource}</span> : null}
          </div>

          {!usesBaseCurrency ? (
            <p className="mt-2 text-sm text-[rgba(var(--fundly-primary-rgb),0.64)]">
              Base amount {formatIncomeAmount(entry.amountBaseValue, entry.base_currency_code)}
            </p>
          ) : null}

          {entry.note ? (
            <p className="mt-3 text-sm leading-6 text-[rgba(var(--fundly-primary-rgb),0.72)]">{entry.note}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-3">
          <span className="text-sm font-bold text-[var(--fundly-primary)]">
            {formatIncomeAmount(entry.amountOriginalValue, entry.currency_code)}
          </span>

          <button
            type="button"
            onClick={() => onEdit(entry)}
            className="inline-flex items-center justify-center rounded-full border border-[rgba(var(--fundly-primary-rgb),0.16)] bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--fundly-primary)] transition hover:border-[rgba(var(--fundly-accent-rgb),0.40)] hover:text-[var(--fundly-accent)]"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}
