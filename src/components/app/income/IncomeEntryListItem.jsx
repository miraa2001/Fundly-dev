import { formatIncomeAmount, formatIncomeDate } from '../../../lib/income';

export default function IncomeEntryListItem({ entry, onEdit }) {
  const usesBaseCurrency = entry.currency_code === entry.base_currency_code;

  return (
    <div className="rounded-[1.1rem] bg-[var(--fundly-canvas)] px-4 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: entry.categoryColor }}
              aria-hidden="true"
            />
            <p className="truncate text-base font-medium text-[var(--fundly-deep)]">{entry.sourceName}</p>
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
          <span className="text-sm font-semibold text-[var(--fundly-deep)]">
            {formatIncomeAmount(entry.amountOriginalValue, entry.currency_code)}
          </span>

          <button
            type="button"
            onClick={() => onEdit(entry)}
            className="fundly-button-secondary"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}
