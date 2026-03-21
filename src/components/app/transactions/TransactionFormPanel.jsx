import StatusMessage from '../../auth/StatusMessage';
import { defaultCategoryColor } from '../../../lib/categories';
import { defaultTransactionCurrency, formatTransactionAmount, supportedTransactionCurrencies } from '../../../lib/transactions';

const fieldClassName =
  'w-full rounded-[1.15rem] border border-[#d3efed] bg-white/80 px-4 py-3 text-sm text-[#16323b] outline-none transition focus:border-[#35d9ef]/60 focus:bg-white focus:ring-4 focus:ring-[#35d9ef]/12';
const errorFieldClassName =
  'w-full rounded-[1.15rem] border border-[#e3a28a] bg-[#fffaf8] px-4 py-3 text-sm text-[#16323b] outline-none ring-4 ring-[#efc7b8]/25';

export default function TransactionFormPanel({
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
  const previewTitle = form.title.trim() || form.merchantOrSource.trim() || 'New transaction';
  const previewAmount = formatTransactionAmount(form.amount || '0', form.currency || defaultTransactionCurrency);

  return (
    <form className="space-y-4 pb-2" onSubmit={onSubmit} noValidate>
      <div className="rounded-[1.35rem] border border-[#d3efed] bg-white/70 p-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.1rem] border border-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
            style={{ backgroundColor: categoryColor }}
            aria-hidden="true"
          >
            <span className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-white/90">
              {(selectedCategory?.name || 'TX').slice(0, 2)}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[#087f98]">Preview</p>
            <p className="mt-1 truncate text-sm font-bold text-[#16323b]">{previewTitle}</p>
            <p className="mt-1 text-xs text-[#5a727b]">
              {previewAmount}
              {selectedCategory ? ` • ${selectedCategory.name}` : ' • Pick a category'}
              {form.isFromSavings ? ' • Savings' : ''}
            </p>
          </div>
        </div>
      </div>

      <StatusMessage tone={status?.tone} message={status?.message} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="transaction-title" className="text-sm font-bold text-[#16323b]">
            Title
          </label>
          <input
            id="transaction-title"
            type="text"
            value={form.title}
            onChange={(event) => onChange('title', event.target.value)}
            placeholder="Weekly groceries"
            autoFocus
            className={errors.title ? errorFieldClassName : fieldClassName}
          />
          {errors.title ? <p className="text-sm text-[#934d33]">{errors.title}</p> : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="transaction-amount" className="text-sm font-bold text-[#16323b]">
            Amount
          </label>
          <input
            id="transaction-amount"
            type="number"
            min="0.01"
            step="0.01"
            inputMode="decimal"
            value={form.amount}
            onChange={(event) => onChange('amount', event.target.value)}
            placeholder="0.00"
            className={errors.amount ? errorFieldClassName : fieldClassName}
          />
          {errors.amount ? <p className="text-sm text-[#934d33]">{errors.amount}</p> : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="transaction-currency" className="text-sm font-bold text-[#16323b]">
            Currency
          </label>
          <select
            id="transaction-currency"
            value={form.currency}
            onChange={(event) => onChange('currency', event.target.value)}
            className={errors.currency ? errorFieldClassName : fieldClassName}
          >
            {supportedTransactionCurrencies.map((currencyCode) => (
              <option key={currencyCode} value={currencyCode}>
                {currencyCode}
              </option>
            ))}
          </select>
          <p className="text-xs leading-5 text-[#5a727b]">NIS is active for now while exchange-rate logic stays simple.</p>
          {errors.currency ? <p className="text-sm text-[#934d33]">{errors.currency}</p> : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="transaction-date" className="text-sm font-bold text-[#16323b]">
            Date
          </label>
          <input
            id="transaction-date"
            type="date"
            value={form.transactionDate}
            onChange={(event) => onChange('transactionDate', event.target.value)}
            className={errors.transactionDate ? errorFieldClassName : fieldClassName}
          />
          {errors.transactionDate ? <p className="text-sm text-[#934d33]">{errors.transactionDate}</p> : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="transaction-category" className="text-sm font-bold text-[#16323b]">
            Category
          </label>
          <select
            id="transaction-category"
            value={form.categoryId}
            onChange={(event) => onChange('categoryId', event.target.value)}
            className={errors.categoryId ? errorFieldClassName : fieldClassName}
            disabled={categories.length === 0}
          >
            {categories.length === 0 ? <option value="">No active categories available</option> : null}
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId ? <p className="text-sm text-[#934d33]">{errors.categoryId}</p> : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="transaction-merchant" className="text-sm font-bold text-[#16323b]">
            Merchant or source
          </label>
          <input
            id="transaction-merchant"
            type="text"
            value={form.merchantOrSource}
            onChange={(event) => onChange('merchantOrSource', event.target.value)}
            placeholder="Optional"
            className={errors.merchantOrSource ? errorFieldClassName : fieldClassName}
          />
          {errors.merchantOrSource ? <p className="text-sm text-[#934d33]">{errors.merchantOrSource}</p> : null}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="transaction-note" className="text-sm font-bold text-[#16323b]">
          Note
        </label>
        <textarea
          id="transaction-note"
          rows={4}
          value={form.note}
          onChange={(event) => onChange('note', event.target.value)}
          placeholder="Optional"
          className={errors.note ? errorFieldClassName : `${fieldClassName} resize-none`}
        />
        {errors.note ? <p className="text-sm text-[#934d33]">{errors.note}</p> : null}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-bold text-[#16323b]">Use savings</p>
        <button
          type="button"
          role="switch"
          aria-checked={form.isFromSavings}
          onClick={() => onChange('isFromSavings', !form.isFromSavings)}
          className="flex w-full items-center justify-between rounded-[1.2rem] border border-[#d3efed] bg-white/80 px-4 py-3 text-left transition hover:border-[#35d9ef]/35"
        >
          <div>
            <p className="text-sm font-bold text-[#16323b]">{form.isFromSavings ? 'Savings enabled' : 'Regular spending'}</p>
            <p className="mt-1 text-xs leading-5 text-[#5a727b]">
              Mark this if the transaction should be treated as coming from savings.
            </p>
          </div>
          <span
            className={[
              'relative inline-flex h-7 w-12 shrink-0 rounded-full border transition',
              form.isFromSavings
                ? 'border-[#0a6a83] bg-[linear-gradient(180deg,#44e8f4_0%,#15aeca_42%,#0a6a83_100%)]'
                : 'border-[#d3efed] bg-[#e7f6f5]',
            ].join(' ')}
            aria-hidden="true"
          >
            <span
              className={[
                'absolute top-1 h-5 w-5 rounded-full bg-white shadow-[0_6px_16px_rgba(7,55,70,0.18)] transition',
                form.isFromSavings ? 'left-6' : 'left-1',
              ].join(' ')}
            />
          </span>
        </button>
      </div>

      <div className="sticky bottom-0 z-[1] -mx-1 flex flex-wrap items-center gap-3 border-t border-[#d3efed]/75 bg-[linear-gradient(180deg,rgba(239,251,248,0.18)_0%,rgba(239,251,248,0.96)_22%,rgba(239,251,248,0.99)_100%)] px-1 pb-1 pt-4 sm:static sm:mx-0 sm:border-t-0 sm:bg-transparent sm:px-0 sm:pb-0 sm:pt-0">
        <button
          type="submit"
          disabled={isSubmitting || categories.length === 0}
          className="inline-flex w-full items-center justify-center rounded-[1.2rem] border border-[#073746] bg-[linear-gradient(180deg,#44e8f4_0%,#15aeca_42%,#0a6a83_100%)] px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
        >
          {isSubmitting ? 'Creating...' : 'Create transaction'}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="inline-flex w-full items-center justify-center rounded-[1.2rem] border border-[#d3efed] bg-white/80 px-4 py-3 text-sm font-bold text-[#16323b] transition hover:border-[#35d9ef]/40 hover:text-[#087f98] sm:w-auto"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
