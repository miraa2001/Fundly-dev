import { formatBillAmount } from '../../../lib/bills';

export default function BillListItem({
  bill,
  onEdit,
  onPay,
  onViewHistory,
  isPaying = false,
  isViewingHistory = false,
}) {
  return (
    <div className="rounded-[1.3rem] border border-[rgba(var(--fundly-primary-rgb),0.12)] bg-white/70 px-4 py-4 shadow-[0_14px_32px_rgba(var(--fundly-deep-rgb),0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: bill.categoryColor }}
              aria-hidden="true"
            />
            <p className="truncate text-base font-bold text-[var(--fundly-primary)]">{bill.name}</p>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[rgba(var(--fundly-primary-rgb),0.72)]">
            <span>{bill.categoryName}</span>
            <span>Template amount {formatBillAmount(bill.defaultAmount)}</span>
          </div>

          {bill.note ? (
            <p className="mt-3 text-sm leading-6 text-[rgba(var(--fundly-primary-rgb),0.72)]">{bill.note}</p>
          ) : null}
        </div>

        <span className="shrink-0 rounded-full bg-[rgba(var(--fundly-accent-rgb),0.12)] px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[var(--fundly-accent)]">
          Quick Pay
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onPay(bill)}
          disabled={isPaying}
          className="inline-flex items-center justify-center rounded-full border border-[var(--fundly-accent)] bg-[linear-gradient(180deg,var(--fundly-primary)_0%,var(--fundly-primary-soft)_46%,var(--fundly-deep)_100%)] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--fundly-surface)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPaying ? 'Opening...' : 'Pay bill'}
        </button>

        <button
          type="button"
          onClick={() => onEdit(bill)}
          className="inline-flex items-center justify-center rounded-full border border-[rgba(var(--fundly-primary-rgb),0.16)] bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--fundly-primary)] transition hover:border-[rgba(var(--fundly-accent-rgb),0.40)] hover:text-[var(--fundly-accent)]"
        >
          Edit
        </button>

        <button
          type="button"
          onClick={() => onViewHistory(bill)}
          disabled={isViewingHistory}
          className="inline-flex items-center justify-center rounded-full border border-[rgba(var(--fundly-primary-rgb),0.16)] bg-[rgba(var(--fundly-accent-rgb),0.10)] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--fundly-accent)] transition hover:border-[rgba(var(--fundly-accent-rgb),0.34)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isViewingHistory ? 'Loading...' : 'View history'}
        </button>
      </div>
    </div>
  );
}
