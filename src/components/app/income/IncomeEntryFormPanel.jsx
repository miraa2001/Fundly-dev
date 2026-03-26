import StatusMessage from '../../auth/StatusMessage';
import { defaultCategoryColor } from '../../../lib/categories';
import { formatIncomeAmount } from '../../../lib/income';

const fieldClassName =
  'w-full rounded-[1.15rem] border border-[rgba(var(--fundly-primary-rgb),0.18)] bg-white/6 px-4 py-3 text-sm text-[var(--fundly-surface)] outline-none transition focus:border-[rgba(var(--fundly-accent-rgb),0.50)] focus:bg-white/10 focus:ring-2 focus:ring-[rgba(var(--fundly-accent-rgb),0.14)] placeholder:text-white/30';
const errorFieldClassName =
  'w-full rounded-[1.15rem] border border-[rgba(var(--fundly-warm-rgb),0.45)] bg-white/5 px-4 py-3 text-sm text-[var(--fundly-surface)] outline-none ring-2 ring-[rgba(var(--fundly-warm-rgb),0.16)] placeholder:text-white/30';
const labelClassName = 'text-xs font-bold uppercase tracking-[0.18em] text-[rgba(var(--fundly-accent-rgb),0.88)]';

export default function IncomeEntryFormPanel({
  sources,
  categories,
  form,
  calculatedValues,
  errors,
  status,
  isSubmitting,
  isEditing,
  onCancel,
  onChange,
  onSubmit,
}) {
  const selectedSource = sources.find((source) => source.id === form.incomeSourceId) ?? null;
  const selectedCategory = categories.find((category) => category.id === form.categoryId) ?? null;
  const categoryColor = selectedCategory?.color || defaultCategoryColor;
  const previewName = selectedSource?.name || 'Income entry';
  const previewAmount = formatIncomeAmount(form.amountOriginal || '0', form.currencyCode || form.baseCurrencyCode);
  const usesBaseCurrency = calculatedValues.currencyCode === calculatedValues.baseCurrencyCode;

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
            height: '92px',
            borderRadius: '12px',
            background: `linear-gradient(135deg, ${categoryColor}cc 0%, rgba(var(--fundly-primary-rgb),0.95) 56%, rgba(var(--fundly-accent-rgb),0.16) 100%)`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              borderBottomRightRadius: '10px',
              height: '24px',
              width: '132px',
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
              bottom: 0,
              left: 0,
              right: 0,
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div>
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
                Income
              </p>
              <p
                style={{
                  margin: '2px 0 0',
                  fontSize: '1rem',
                  fontWeight: 800,
                  color: 'var(--fundly-surface)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                }}
              >
                {previewName}
              </p>
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--fundly-accent)' }}>{previewAmount}</span>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between px-2">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[rgba(var(--fundly-accent-rgb),0.82)]">
            Base currency {calculatedValues.baseCurrencyCode}
          </p>
          <span className="rounded-full bg-[rgba(var(--fundly-accent-rgb),0.12)] px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[var(--fundly-accent)]">
            {calculatedValues.amountBase
              ? formatIncomeAmount(calculatedValues.amountBase, calculatedValues.baseCurrencyCode)
              : `0 ${calculatedValues.baseCurrencyCode}`}
          </span>
        </div>
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
          <label htmlFor="income-entry-source" className={labelClassName}>
            Income source
          </label>
          <select
            id="income-entry-source"
            value={form.incomeSourceId}
            onChange={(event) => onChange('incomeSourceId', event.target.value)}
            className={errors.incomeSourceId ? errorFieldClassName : fieldClassName}
            style={{ background: 'var(--fundly-primary)' }}
            disabled={sources.length === 0}
          >
            {sources.map((source) => (
              <option key={source.id} value={source.id}>
                {source.name}
              </option>
            ))}
          </select>
          {errors.incomeSourceId ? <p className="text-sm text-[var(--fundly-accent)]">{errors.incomeSourceId}</p> : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="income-entry-amount" className={labelClassName}>
              Amount
            </label>
            <input
              id="income-entry-amount"
              type="number"
              min="0.01"
              step="0.01"
              inputMode="decimal"
              value={form.amountOriginal}
              onChange={(event) => onChange('amountOriginal', event.target.value)}
              placeholder="0.00"
              autoFocus
              className={errors.amountOriginal ? errorFieldClassName : fieldClassName}
            />
            {errors.amountOriginal ? <p className="text-sm text-[var(--fundly-accent)]">{errors.amountOriginal}</p> : null}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="income-entry-currency" className={labelClassName}>
              Currency
            </label>
            <input
              id="income-entry-currency"
              type="text"
              value={form.currencyCode}
              onChange={(event) => onChange('currencyCode', event.target.value.toUpperCase())}
              placeholder={form.baseCurrencyCode}
              maxLength={8}
              className={errors.currencyCode ? errorFieldClassName : fieldClassName}
            />
            {errors.currencyCode ? <p className="text-sm text-[var(--fundly-accent)]">{errors.currencyCode}</p> : null}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="income-entry-rate" className={labelClassName}>
              Conversion rate
            </label>
            <input
              id="income-entry-rate"
              type="number"
              min="0.000001"
              step="0.000001"
              inputMode="decimal"
              value={form.conversionRate}
              onChange={(event) => onChange('conversionRate', event.target.value)}
              disabled={usesBaseCurrency}
              className={errors.conversionRate ? errorFieldClassName : fieldClassName}
            />
            <p className="text-xs leading-5 text-[rgba(var(--fundly-surface-rgb),0.62)]">
              {usesBaseCurrency
                ? 'Currency matches your base currency, so the conversion rate stays at 1.'
                : `Enter the rate from ${calculatedValues.currencyCode} to ${calculatedValues.baseCurrencyCode}.`}
            </p>
            {errors.conversionRate ? <p className="text-sm text-[var(--fundly-accent)]">{errors.conversionRate}</p> : null}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="income-entry-date" className={labelClassName}>
              Entry date
            </label>
            <input
              id="income-entry-date"
              type="date"
              value={form.entryDate}
              onChange={(event) => onChange('entryDate', event.target.value)}
              className={errors.entryDate ? errorFieldClassName : fieldClassName}
              style={{ colorScheme: 'dark' }}
            />
            {errors.entryDate ? <p className="text-sm text-[var(--fundly-accent)]">{errors.entryDate}</p> : null}
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="income-entry-category" className={labelClassName}>
            Income category <span style={{ opacity: 0.5 }}>(optional)</span>
          </label>
          <select
            id="income-entry-category"
            value={form.categoryId}
            onChange={(event) => onChange('categoryId', event.target.value)}
            className={errors.categoryId ? errorFieldClassName : fieldClassName}
            style={{ background: 'var(--fundly-primary)' }}
          >
            <option value="">No category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId ? <p className="text-sm text-[var(--fundly-accent)]">{errors.categoryId}</p> : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="income-entry-merchant" className={labelClassName}>
            Merchant or source <span style={{ opacity: 0.5 }}>(optional)</span>
          </label>
          <input
            id="income-entry-merchant"
            type="text"
            value={form.merchantOrSource}
            onChange={(event) => onChange('merchantOrSource', event.target.value)}
            placeholder="Employer, client, transfer label..."
            className={fieldClassName}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="income-entry-note" className={labelClassName}>
            Note <span style={{ opacity: 0.5 }}>(optional)</span>
          </label>
          <textarea
            id="income-entry-note"
            rows={3}
            value={form.note}
            onChange={(event) => onChange('note', event.target.value)}
            placeholder="Any extra details about this income entry."
            className={`${fieldClassName} resize-none`}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={isSubmitting || sources.length === 0}
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
          {isSubmitting ? (isEditing ? 'Saving...' : 'Creating...') : isEditing ? 'Save income' : 'Create income'}
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
