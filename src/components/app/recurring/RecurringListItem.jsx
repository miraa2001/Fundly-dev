import { defaultCategoryColor } from '../../../lib/categories';
import {
  formatRecurringAmount,
  formatRecurringDate,
  formatRecurringDueRule,
  formatRecurringFrequency,
} from '../../../lib/recurring';

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

export default function RecurringListItem({
  recurringExpense,
  isBusy,
  onEdit,
  onToggleActive,
}) {
  const categoryColor = recurringExpense.categoryColor || defaultCategoryColor;
  const activeTone = recurringExpense.is_active ? 'var(--fundly-accent)' : 'var(--fundly-warm)';
  const activeBackground = recurringExpense.is_active
    ? 'rgba(var(--fundly-accent-rgb),0.12)'
    : 'rgba(var(--fundly-warm-rgb),0.12)';

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
            <p className="truncate text-base font-bold text-[var(--fundly-primary)]">{recurringExpense.title}</p>
            <span
              className="rounded-full px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.18em]"
              style={{ backgroundColor: activeBackground, color: activeTone }}
            >
              {recurringExpense.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[rgba(var(--fundly-primary-rgb),0.72)]">
            <span>{formatRecurringFrequency(recurringExpense.frequency, recurringExpense.interval_count)}</span>
            <span>{formatRecurringDueRule(recurringExpense)}</span>
            <span>{recurringExpense.categoryName}</span>
            {recurringExpense.merchant_or_source ? <span>{recurringExpense.merchant_or_source}</span> : null}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold uppercase tracking-[0.14em] text-[rgba(var(--fundly-primary-rgb),0.58)]">
            <span>Starts {formatRecurringDate(recurringExpense.start_date)}</span>
            {recurringExpense.end_date ? <span>Ends {formatRecurringDate(recurringExpense.end_date)}</span> : null}
            {recurringExpense.last_generated_for_date ? (
              <span>Last generated {formatRecurringDate(recurringExpense.last_generated_for_date)}</span>
            ) : (
              <span>Not generated yet</span>
            )}
          </div>

          {recurringExpense.note ? (
            <p className="mt-3 text-sm leading-6 text-[rgba(var(--fundly-primary-rgb),0.76)]">{recurringExpense.note}</p>
          ) : null}
        </div>

        <div className="shrink-0 text-left sm:text-right">
          <p className="text-base font-bold text-[var(--fundly-primary)]">
            {formatRecurringAmount(recurringExpense.default_amount_original, recurringExpense.currency_code)}
          </p>
          <p className="mt-1 text-sm text-[rgba(var(--fundly-primary-rgb),0.7)]">
            Every {Math.max(1, Number(recurringExpense.interval_count) || 1)}
          </p>
          {recurringExpense.due_day ? (
            <p className="mt-1 text-sm text-[rgba(var(--fundly-primary-rgb),0.7)]">Due day {recurringExpense.due_day}</p>
          ) : null}
          {recurringExpense.due_weekday !== null && recurringExpense.due_weekday !== undefined ? (
            <p className="mt-1 text-sm text-[rgba(var(--fundly-primary-rgb),0.7)]">Weekday {recurringExpense.due_weekday}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[rgba(var(--fundly-primary-rgb),0.10)] pt-4">
        <ActionButton onClick={onEdit} disabled={isBusy}>
          Edit
        </ActionButton>

        <ActionButton
          tone={recurringExpense.is_active ? 'danger' : 'accent'}
          onClick={onToggleActive}
          disabled={isBusy}
        >
          {isBusy ? 'Working...' : recurringExpense.is_active ? 'Deactivate' : 'Activate'}
        </ActionButton>
      </div>
    </div>
  );
}
