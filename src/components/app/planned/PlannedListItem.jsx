import { defaultCategoryColor } from '../../../lib/categories';
import {
  formatPlannedAmount,
  formatPlannedDate,
  formatPlannedStatus,
} from '../../../lib/planned';
import { defaultBaseCurrency } from '../../../lib/transactions';

function ActionButton({ children, onClick, disabled = false, tone = 'default' }) {
  const stylesByTone = {
    default: {
      borderColor: 'rgba(var(--fundly-primary-rgb),0.14)',
      background: 'rgba(var(--fundly-surface-rgb),0.78)',
      color: 'var(--fundly-primary)',
    },
    accent: {
      borderColor: 'var(--fundly-accent)',
      background: 'linear-gradient(180deg,var(--fundly-primary) 0%,var(--fundly-primary-soft) 46%,var(--fundly-deep) 100%)',
      color: 'var(--fundly-surface)',
    },
    danger: {
      borderColor: 'rgba(var(--fundly-warm-rgb),0.24)',
      background: 'rgba(var(--fundly-warm-rgb),0.10)',
      color: 'var(--fundly-warm)',
    },
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center justify-center rounded-full border px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] transition disabled:cursor-not-allowed disabled:opacity-55"
      style={stylesByTone[tone]}
    >
      {children}
    </button>
  );
}

export default function PlannedListItem({
  plannedTransaction,
  isBusy,
  onConfirm,
  onEdit,
  onCancel,
}) {
  const categoryColor = plannedTransaction.categoryColor || defaultCategoryColor;
  const baseAmountLine =
    plannedTransaction.base_currency_code && plannedTransaction.base_currency_code !== plannedTransaction.currency_code
      ? formatPlannedAmount(plannedTransaction.amount_base, plannedTransaction.base_currency_code || defaultBaseCurrency)
      : '';

  const statusTone = plannedTransaction.isCancelled
    ? 'var(--fundly-warm)'
    : plannedTransaction.isCompleted
      ? 'var(--fundly-primary)'
      : 'var(--fundly-accent)';
  const statusBackground = plannedTransaction.isCancelled
    ? 'rgba(var(--fundly-warm-rgb),0.12)'
    : plannedTransaction.isCompleted
      ? 'rgba(var(--fundly-primary-rgb),0.10)'
      : 'rgba(var(--fundly-accent-rgb),0.12)';

  return (
    <div className="rounded-[1.3rem] border border-[rgba(var(--fundly-primary-rgb),0.12)] bg-white/70 px-4 py-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: categoryColor }}
              aria-hidden="true"
            />
            <p className="truncate text-base font-bold text-[var(--fundly-primary)]">{plannedTransaction.title}</p>
            <span
              className="rounded-full px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.18em]"
              style={{ backgroundColor: statusBackground, color: statusTone }}
            >
              {formatPlannedStatus(plannedTransaction.status)}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[rgba(var(--fundly-primary-rgb),0.72)]">
            <span>{formatPlannedDate(plannedTransaction.planned_date)}</span>
            <span>{plannedTransaction.categoryName}</span>
            {plannedTransaction.merchant_or_source ? <span>{plannedTransaction.merchant_or_source}</span> : null}
          </div>

          {plannedTransaction.note ? (
            <p className="mt-3 text-sm leading-6 text-[rgba(var(--fundly-primary-rgb),0.76)]">{plannedTransaction.note}</p>
          ) : null}

          {plannedTransaction.isCompleted && plannedTransaction.created_transaction_id ? (
            <p className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-[var(--fundly-accent)]">
              Confirmed into a real transaction
            </p>
          ) : null}
        </div>

        <div className="shrink-0 text-left sm:text-right">
          <p className="text-base font-bold text-[var(--fundly-primary)]">
            {formatPlannedAmount(plannedTransaction.amount_original, plannedTransaction.currency_code)}
          </p>
          {baseAmountLine ? (
            <p className="mt-1 text-sm text-[rgba(var(--fundly-primary-rgb),0.7)]">{baseAmountLine} base</p>
          ) : null}
        </div>
      </div>

      {plannedTransaction.isOpen || plannedTransaction.isCancelled ? (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[rgba(var(--fundly-primary-rgb),0.10)] pt-4">
          {plannedTransaction.isOpen ? (
            <ActionButton tone="accent" onClick={onConfirm} disabled={isBusy}>
              {isBusy ? 'Working...' : 'Confirm'}
            </ActionButton>
          ) : null}

          <ActionButton onClick={onEdit} disabled={isBusy}>
            Edit
          </ActionButton>

          {plannedTransaction.isOpen ? (
            <ActionButton tone="danger" onClick={onCancel} disabled={isBusy}>
              Cancel
            </ActionButton>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
