import StatusMessage from '../../auth/StatusMessage';
import { defaultCategoryColor } from '../../../lib/categories';
import {
  RECURRING_FREQUENCY,
  formatRecurringAmount,
  formatRecurringDueRule,
  formatRecurringFrequency,
  recurringFrequencyOptions,
  recurringWeekdayOptions,
  supportedTransactionCurrencies,
} from '../../../lib/recurring';
import { defaultTransactionCurrency } from '../../../lib/transactions';

const fieldClassName =
  'w-full rounded-[1.15rem] border border-[rgba(var(--fundly-primary-rgb),0.18)] bg-white/6 px-4 py-3 text-sm text-[var(--fundly-surface)] outline-none transition focus:border-[rgba(var(--fundly-accent-rgb),0.50)] focus:bg-white/10 focus:ring-2 focus:ring-[rgba(var(--fundly-accent-rgb),0.14)] placeholder:text-white/30';
const errorFieldClassName =
  'w-full rounded-[1.15rem] border border-[rgba(var(--fundly-warm-rgb),0.45)] bg-white/5 px-4 py-3 text-sm text-[var(--fundly-surface)] outline-none ring-2 ring-[rgba(var(--fundly-warm-rgb),0.16)] placeholder:text-white/30';
const labelClassName = 'text-xs font-bold uppercase tracking-[0.18em] text-[rgba(var(--fundly-accent-rgb),0.88)]';

function getFrequencyLabel(frequency) {
  return frequency.charAt(0).toUpperCase() + frequency.slice(1);
}

export default function RecurringFormPanel({
  mode,
  categories,
  form,
  errors,
  status,
  isSubmitting,
  onCancel,
  onChange,
  onSubmit,
}) {
  const selectedCategory = categories.find((category) => category.id === form.categoryId) ?? null;
  const categoryColor = selectedCategory?.color || defaultCategoryColor;
  const previewTitle = form.title.trim() || form.merchantOrSource.trim() || 'Recurring expense';
  const previewAmount = formatRecurringAmount(form.amount || '0', form.currency || defaultTransactionCurrency);
  const previewFrequency = formatRecurringFrequency(form.frequency, form.intervalCount);
  const previewDueRule = formatRecurringDueRule({
    frequency: form.frequency,
    interval_count: form.intervalCount,
    due_day: form.dueDay ? Number(form.dueDay) : null,
    due_weekday: form.dueWeekday ? Number(form.dueWeekday) : null,
    start_date: form.startDate,
  });
  const isEditing = mode === 'edit';
  const usesDueWeekday = form.frequency === RECURRING_FREQUENCY.WEEKLY;
  const usesDueDay = form.frequency === RECURRING_FREQUENCY.MONTHLY || form.frequency === RECURRING_FREQUENCY.YEARLY;
  const topGradient = `linear-gradient(135deg, ${categoryColor}cc 0%, rgba(var(--fundly-primary-rgb),0.95) 56%, rgba(var(--fundly-accent-rgb),0.16) 100%)`;

  return (
    <form className="space-y-4 pb-2" onSubmit={onSubmit} noValidate>
      <div
        style={{
          borderRadius: '16px',
          background: 'var(--fundly-deep)',
          padding: '4px',
          overflow: 'hidden',
          boxShadow: '0 7px 28px rgba(0,0,0,0.4)',
        }}
      >
        <div
          style={{
            minHeight: '96px',
            borderRadius: '12px',
            background: topGradient,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              borderBottomRightRadius: '10px',
              height: '24px',
              width: '110px',
              background: 'var(--fundly-deep)',
              position: 'absolute',
              top: 0,
              left: 0,
              transform: 'skew(-38deg)',
              boxShadow: '-10px -10px 0 0 var(--fundly-deep)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '24px',
              left: 0,
              height: '12px',
              width: '12px',
              borderTopLeftRadius: '12px',
              boxShadow: '-5px -5px 0 2px var(--fundly-deep)',
              background: 'transparent',
            }}
          />

          <div
            style={{
              position: 'absolute',
              top: '4px',
              left: '14px',
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: categoryColor,
              boxShadow: `0 0 8px ${categoryColor}99`,
              border: '2px solid rgba(255,255,255,0.35)',
            }}
            aria-hidden="true"
          />

          <div
            style={{
              position: 'absolute',
              inset: '0',
              padding: '18px 14px 12px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              gap: '4px',
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: '0.6rem',
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'rgba(var(--fundly-accent-rgb),0.88)',
              }}
            >
              Preview
            </p>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: '1rem',
                    fontWeight: 800,
                    color: 'var(--fundly-surface)',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.1,
                  }}
                >
                  {previewTitle}
                </p>
                <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: 'rgba(var(--fundly-surface-rgb),0.76)' }}>
                  {previewFrequency} . {previewDueRule}
                </p>
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--fundly-accent)' }}>{previewAmount}</span>
            </div>
          </div>
        </div>

        {selectedCategory ? (
          <p
            style={{
              margin: '6px 8px 4px',
              fontSize: '0.6rem',
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: `${categoryColor}cc`,
            }}
          >
            {selectedCategory.name}
          </p>
        ) : null}
      </div>

      <StatusMessage tone={status?.tone} message={status?.message} />

      <div
        style={{
          background: 'var(--fundly-deep)',
          borderRadius: '16px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        <div className="space-y-1.5">
          <label htmlFor="recurring-title" className={labelClassName}>
            Title
          </label>
          <input
            id="recurring-title"
            type="text"
            value={form.title}
            onChange={(event) => onChange('title', event.target.value)}
            placeholder="Rent"
            autoFocus
            className={errors.title ? errorFieldClassName : fieldClassName}
          />
          {errors.title ? <p className="text-sm text-[var(--fundly-accent)]">{errors.title}</p> : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="space-y-1.5">
            <label htmlFor="recurring-amount" className={labelClassName}>
              Default amount
            </label>
            <input
              id="recurring-amount"
              type="number"
              min="0.01"
              step="0.01"
              inputMode="decimal"
              value={form.amount}
              onChange={(event) => onChange('amount', event.target.value)}
              placeholder="0.00"
              className={errors.amount ? errorFieldClassName : fieldClassName}
            />
            {errors.amount ? <p className="text-sm text-[var(--fundly-accent)]">{errors.amount}</p> : null}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="recurring-currency" className={labelClassName}>
              Currency
            </label>
            <select
              id="recurring-currency"
              value={form.currency}
              onChange={(event) => onChange('currency', event.target.value)}
              className={`${errors.currency ? errorFieldClassName : fieldClassName} min-w-[90px]`}
              style={{ background: 'var(--fundly-primary)' }}
            >
              {supportedTransactionCurrencies.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
          <div className="space-y-1.5">
            <label htmlFor="recurring-frequency" className={labelClassName}>
              Frequency
            </label>
            <select
              id="recurring-frequency"
              value={form.frequency}
              onChange={(event) => onChange('frequency', event.target.value)}
              className={errors.frequency ? errorFieldClassName : fieldClassName}
              style={{ background: 'var(--fundly-primary)' }}
            >
              {recurringFrequencyOptions.map((frequency) => (
                <option key={frequency} value={frequency}>
                  {getFrequencyLabel(frequency)}
                </option>
              ))}
            </select>
            {errors.frequency ? <p className="text-sm text-[var(--fundly-accent)]">{errors.frequency}</p> : null}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="recurring-interval" className={labelClassName}>
              Interval
            </label>
            <input
              id="recurring-interval"
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              value={form.intervalCount}
              onChange={(event) => onChange('intervalCount', event.target.value)}
              className={errors.intervalCount ? errorFieldClassName : fieldClassName}
            />
            {errors.intervalCount ? <p className="text-sm text-[var(--fundly-accent)]">{errors.intervalCount}</p> : null}
          </div>
        </div>

        <div className={`grid gap-3 ${usesDueWeekday || usesDueDay ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
          <div className="space-y-1.5">
            <label htmlFor="recurring-start-date" className={labelClassName}>
              Start date
            </label>
            <input
              id="recurring-start-date"
              type="date"
              value={form.startDate}
              onChange={(event) => onChange('startDate', event.target.value)}
              className={errors.startDate ? errorFieldClassName : fieldClassName}
              style={{ colorScheme: 'dark' }}
            />
            {errors.startDate ? <p className="text-sm text-[var(--fundly-accent)]">{errors.startDate}</p> : null}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="recurring-end-date" className={labelClassName}>
              End date <span style={{ opacity: 0.5 }}>(optional)</span>
            </label>
            <input
              id="recurring-end-date"
              type="date"
              value={form.endDate}
              onChange={(event) => onChange('endDate', event.target.value)}
              className={errors.endDate ? errorFieldClassName : fieldClassName}
              style={{ colorScheme: 'dark' }}
            />
            {errors.endDate ? <p className="text-sm text-[var(--fundly-accent)]">{errors.endDate}</p> : null}
          </div>

          {usesDueWeekday ? (
            <div className="space-y-1.5">
              <label htmlFor="recurring-due-weekday" className={labelClassName}>
                Due weekday
              </label>
              <select
                id="recurring-due-weekday"
                value={form.dueWeekday}
                onChange={(event) => onChange('dueWeekday', event.target.value)}
                className={errors.dueWeekday ? errorFieldClassName : fieldClassName}
                style={{ background: 'var(--fundly-primary)' }}
              >
                {recurringWeekdayOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.dueWeekday ? <p className="text-sm text-[var(--fundly-accent)]">{errors.dueWeekday}</p> : null}
            </div>
          ) : null}

          {usesDueDay ? (
            <div className="space-y-1.5">
              <label htmlFor="recurring-due-day" className={labelClassName}>
                Due day
              </label>
              <input
                id="recurring-due-day"
                type="number"
                min="1"
                max="31"
                step="1"
                inputMode="numeric"
                value={form.dueDay}
                onChange={(event) => onChange('dueDay', event.target.value)}
                className={errors.dueDay ? errorFieldClassName : fieldClassName}
              />
              {errors.dueDay ? <p className="text-sm text-[var(--fundly-accent)]">{errors.dueDay}</p> : null}
            </div>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="recurring-category" className={labelClassName}>
            Category
          </label>
          <select
            id="recurring-category"
            value={form.categoryId}
            onChange={(event) => onChange('categoryId', event.target.value)}
            className={errors.categoryId ? errorFieldClassName : fieldClassName}
            style={{ background: 'var(--fundly-primary)' }}
            disabled={categories.length === 0}
          >
            {categories.length === 0 ? <option value="">No active categories</option> : null}
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId ? <p className="text-sm text-[var(--fundly-accent)]">{errors.categoryId}</p> : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="recurring-merchant" className={labelClassName}>
            Merchant / Source <span style={{ opacity: 0.5 }}>(optional)</span>
          </label>
          <input
            id="recurring-merchant"
            type="text"
            value={form.merchantOrSource}
            onChange={(event) => onChange('merchantOrSource', event.target.value)}
            placeholder="e.g. Utility Company"
            className={fieldClassName}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="recurring-note" className={labelClassName}>
            Note <span style={{ opacity: 0.5 }}>(optional)</span>
          </label>
          <textarea
            id="recurring-note"
            rows={3}
            value={form.note}
            onChange={(event) => onChange('note', event.target.value)}
            placeholder="Any extra context..."
            className={`${fieldClassName} resize-none`}
          />
        </div>

        <label className="flex items-center justify-between gap-4 rounded-[1.15rem] border border-[rgba(var(--fundly-primary-rgb),0.18)] bg-white/6 px-4 py-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[rgba(var(--fundly-accent-rgb),0.88)]">
              Active
            </p>
            <p className="mt-1 text-sm text-[rgba(var(--fundly-surface-rgb),0.68)]">
              Inactive recurring expenses stay on the page but stop generating planned items.
            </p>
          </div>
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) => onChange('isActive', event.target.checked)}
            className="h-5 w-5 accent-[var(--fundly-accent)]"
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={isSubmitting || categories.length === 0}
          style={{
            flex: 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '999px',
            border: '1px solid var(--fundly-accent)',
            background: 'linear-gradient(180deg,var(--fundly-primary) 0%,var(--fundly-primary-soft) 46%,var(--fundly-deep) 100%)',
            padding: '12px 20px',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: 'var(--fundly-surface)',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            opacity: isSubmitting ? 0.7 : 1,
            letterSpacing: '0.04em',
          }}
        >
          {isSubmitting ? (isEditing ? 'Saving...' : 'Creating...') : isEditing ? 'Save changes' : 'Create recurring item'}
        </button>

        <button
          type="button"
          onClick={onCancel}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '999px',
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(255,255,255,0.06)',
            padding: '12px 20px',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: 'rgba(255,255,255,0.6)',
            cursor: 'pointer',
            letterSpacing: '0.04em',
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
