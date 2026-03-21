import { defaultCategoryColor } from '../../../lib/categories';
import { formatTransactionAmount, formatTransactionDate } from '../../../lib/transactions';

export default function TransactionListItem({ transaction }) {
  const title = transaction.title || transaction.merchant_or_source || 'Untitled transaction';
  const categoryColor = transaction.categoryColor || defaultCategoryColor;

  return (
    <div className="rounded-[1.35rem] border border-[#d3efed] bg-white/75 px-4 py-4 shadow-[0_14px_32px_rgba(3,41,53,0.05)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-3">
            <span
              className="mt-1 h-3.5 w-3.5 shrink-0 rounded-full border border-white/80 shadow-[0_0_0_3px_rgba(255,255,255,0.55)]"
              style={{ backgroundColor: categoryColor }}
              aria-hidden="true"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-[#16323b] sm:text-base">{title}</p>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.14em]">
                <span className="rounded-full border border-[#d3efed] bg-[#eef9f8] px-2.5 py-1 text-[#087f98]">
                  {transaction.categoryName}
                </span>
                <span className="rounded-full border border-[#d3efed] bg-white px-2.5 py-1 text-[#5a727b]">
                  {formatTransactionDate(transaction.transaction_date)}
                </span>
                {transaction.is_from_savings ? (
                  <span className="rounded-full border border-[#ffd45a]/45 bg-[#fff2c8] px-2.5 py-1 text-[#8b5202]">
                    Savings
                  </span>
                ) : null}
              </div>

              {transaction.merchant_or_source ? (
                <p className="mt-3 text-sm text-[#5a727b]">{transaction.merchant_or_source}</p>
              ) : null}

              {transaction.note ? <p className="mt-2 text-sm leading-6 text-[#39545d]">{transaction.note}</p> : null}
            </div>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-sm font-bold text-[#0e2f39] sm:text-base">
            {formatTransactionAmount(transaction.amount_original, transaction.currency_code)}
          </p>
          <p className="mt-1 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#087f98]">Manual expense</p>
        </div>
      </div>
    </div>
  );
}
