import { useState } from 'react';
import { defaultCategoryColor } from '../../../lib/categories';
import { formatTransactionAmount, formatTransactionDate } from '../../../lib/transactions';

function DetailRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-[0.72rem] font-medium uppercase tracking-[0.14em] text-[rgba(var(--fundly-primary-rgb),0.52)]">
        {label}
      </span>
      <span className="text-right text-sm text-[var(--fundly-primary)]">{value}</span>
    </div>
  );
}

export default function TransactionListItem({ transaction }) {
  const [isOpen, setIsOpen] = useState(false);

  const title = transaction.title || transaction.merchant_or_source || 'Untitled transaction';
  const categoryColor = transaction.categoryColor || defaultCategoryColor;
  const formattedAmount = formatTransactionAmount(transaction.amount_original, transaction.currency_code);
  const formattedDate = formatTransactionDate(transaction.transaction_date);

  const detailRows = [
    { label: 'Category', value: transaction.categoryName || 'Uncategorized' },
    { label: 'Date', value: formattedDate },
    ...(transaction.merchant_or_source ? [{ label: 'Merchant', value: transaction.merchant_or_source }] : []),
    ...(transaction.note ? [{ label: 'Note', value: transaction.note }] : []),
    ...(transaction.is_from_savings ? [{ label: 'Source', value: 'Savings' }] : []),
  ];

  return (
    <button
      type="button"
      onClick={() => setIsOpen((current) => !current)}
      className="w-full rounded-[1.2rem] bg-[var(--fundly-canvas)] px-4 py-4 text-left transition hover:bg-[rgba(var(--fundly-primary-rgb),0.03)]"
      aria-expanded={isOpen}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: categoryColor }}
              aria-hidden="true"
            />
            <p className="truncate text-base font-medium text-[var(--fundly-deep)]">{title}</p>
          </div>
          <p className="mt-2 text-sm text-[rgba(var(--fundly-primary-rgb),0.68)]">
            {transaction.categoryName} - {formattedDate}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-base font-semibold text-[var(--fundly-deep)]">{formattedAmount}</p>
          <p className="mt-2 text-[0.72rem] font-medium uppercase tracking-[0.14em] text-[rgba(var(--fundly-primary-rgb),0.46)]">
            {isOpen ? 'Hide details' : 'Details'}
          </p>
        </div>
      </div>

      {isOpen ? (
        <div className="mt-4 space-y-3 border-t border-[rgba(var(--fundly-primary-rgb),0.08)] pt-4">
          {detailRows.map((row) => (
            <DetailRow key={row.label} label={row.label} value={row.value} />
          ))}
        </div>
      ) : null}
    </button>
  );
}
