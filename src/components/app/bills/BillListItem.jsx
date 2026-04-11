import { formatBillAmount, formatBillDate } from '../../../lib/bills';

export default function BillListItem({
  bill,
  onDelete,
  onEdit,
  onPay,
  onViewHistory,
  isDeleting = false,
  isPaying = false,
  isViewingHistory = false,
}) {
  const hasPayments = (bill.paymentCount ?? 0) > 0;
  const lastPaidLabel = hasPayments
    ? `Last paid ${formatBillDate(bill.lastPaidAt)}${bill.lastPaidAmount ? ` - ${formatBillAmount(bill.lastPaidAmount, bill.lastPaidCurrencyCode)}` : ''}${bill.lastPaidFromSavings ? ' - from savings' : ''}`
    : 'Never paid yet';

  return (
    <div className="rounded-[1.1rem] bg-[var(--fundly-canvas)] px-4 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: bill.categoryColor }}
              aria-hidden="true"
            />
            <p className="truncate text-base font-medium text-[var(--fundly-deep)]">{bill.name}</p>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[rgba(var(--fundly-primary-rgb),0.72)]">
            <span>{bill.categoryName}</span>
            <span>Template amount {formatBillAmount(bill.defaultAmount)}</span>
          </div>

          <p className="mt-2 text-sm text-[rgba(var(--fundly-primary-rgb),0.64)]">{lastPaidLabel}</p>

          {bill.note ? (
            <p className="mt-3 text-sm leading-6 text-[rgba(var(--fundly-primary-rgb),0.72)]">{bill.note}</p>
          ) : null}
        </div>

        <span className="shrink-0 rounded-full bg-[rgba(var(--fundly-accent-rgb),0.08)] px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-[var(--fundly-accent)]">
          Quick pay
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onPay(bill)}
          disabled={isPaying}
          className="fundly-button-primary"
        >
          {isPaying ? 'Opening...' : 'Pay bill'}
        </button>

        <button
          type="button"
          onClick={() => onEdit(bill)}
          className="fundly-button-secondary"
        >
          Edit
        </button>

        <button
          type="button"
          onClick={() => onViewHistory(bill)}
          disabled={isViewingHistory}
          className="fundly-button-accent"
        >
          {isViewingHistory ? 'Loading...' : 'View history'}
        </button>

        <button
          type="button"
          onClick={() => onDelete(bill)}
          disabled={isDeleting}
          className="fundly-button-danger"
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  );
}
