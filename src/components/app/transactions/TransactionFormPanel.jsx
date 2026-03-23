import StatusMessage from '../../auth/StatusMessage';
import { defaultCategoryColor } from '../../../lib/categories';
import {
  defaultTransactionCurrency,
  formatTransactionAmount,
  supportedTransactionCurrencies,
} from '../../../lib/transactions';

const fieldClassName =
  'w-full rounded-[1.15rem] border border-[#0C2A46]/18 bg-white/6 px-4 py-3 text-sm text-[#F2F2F2] outline-none transition focus:border-[#A67A53]/50 focus:bg-white/10 focus:ring-2 focus:ring-[#A67A53]/14 placeholder:text-white/30';
const errorFieldClassName =
  'w-full rounded-[1.15rem] border border-[#401F14]/45 bg-white/5 px-4 py-3 text-sm text-[#F2F2F2] outline-none ring-2 ring-[#401F14]/16 placeholder:text-white/30';
const labelClassName = 'text-xs font-bold uppercase tracking-[0.18em] text-[rgba(166,122,83,0.88)]';

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
  const selectedCategory = categories.find((c) => c.id === form.categoryId) ?? null;
  const categoryColor = selectedCategory?.color || defaultCategoryColor;
  const previewTitle = form.title.trim() || form.merchantOrSource.trim() || 'New transaction';
  const previewAmount = formatTransactionAmount(form.amount || '0', form.currency || defaultTransactionCurrency);
  const topGradient = `linear-gradient(135deg, ${categoryColor}cc 0%, #0C2A46f2 56%, rgba(166,122,83,0.16) 100%)`;

  return (
    <form className="space-y-4 pb-2" onSubmit={onSubmit} noValidate>
      <div
        style={{
          borderRadius: '16px',
          background: '#011826',
          padding: '4px',
          overflow: 'hidden',
          boxShadow: '0 7px 28px rgba(0,0,0,0.4)',
        }}
      >
        <div
          style={{
            height: '80px',
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
              background: '#011826',
              position: 'absolute',
              top: 0,
              left: 0,
              transform: 'skew(-38deg)',
              boxShadow: '-10px -10px 0 0 #011826',
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
              boxShadow: '-5px -5px 0 2px #011826',
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
                  color: 'rgba(166,122,83,0.88)',
                }}
              >
                Preview
              </p>
              <p
                style={{
                  margin: '2px 0 0',
                  fontSize: '1rem',
                  fontWeight: 800,
                  color: '#F2F2F2',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                }}
              >
                {previewTitle}
              </p>
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#A67A53' }}>{previewAmount}</span>
          </div>
        </div>

        {selectedCategory && (
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
        )}
      </div>

      <StatusMessage tone={status?.tone} message={status?.message} />

      <div
        style={{
          background: '#011826',
          borderRadius: '16px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        <div className="space-y-1.5">
          <label htmlFor="transaction-title" className={labelClassName}>
            Title
          </label>
          <input
            id="transaction-title"
            type="text"
            value={form.title}
            onChange={(e) => onChange('title', e.target.value)}
            placeholder="Weekly groceries"
            autoFocus
            className={errors.title ? errorFieldClassName : fieldClassName}
          />
          {errors.title && <p className="text-sm text-[#A67A53]">{errors.title}</p>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px' }}>
          <div className="space-y-1.5">
            <label htmlFor="transaction-amount" className={labelClassName}>
              Amount
            </label>
            <input
              id="transaction-amount"
              type="number"
              min="0.01"
              step="0.01"
              inputMode="decimal"
              value={form.amount}
              onChange={(e) => onChange('amount', e.target.value)}
              placeholder="0.00"
              className={errors.amount ? errorFieldClassName : fieldClassName}
            />
            {errors.amount && <p className="text-sm text-[#A67A53]">{errors.amount}</p>}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="transaction-currency" className={labelClassName}>
              Currency
            </label>
            <select
              id="transaction-currency"
              value={form.currency}
              onChange={(e) => onChange('currency', e.target.value)}
              className={`${errors.currency ? errorFieldClassName : fieldClassName} min-w-[80px]`}
              style={{ background: '#0C2A46' }}
            >
              {supportedTransactionCurrencies.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="transaction-date" className={labelClassName}>
            Date
          </label>
          <input
            id="transaction-date"
            type="date"
            value={form.transactionDate}
            onChange={(e) => onChange('transactionDate', e.target.value)}
            className={errors.transactionDate ? errorFieldClassName : fieldClassName}
            style={{ colorScheme: 'dark' }}
          />
          {errors.transactionDate && <p className="text-sm text-[#A67A53]">{errors.transactionDate}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="transaction-category" className={labelClassName}>
            Category
          </label>
          <select
            id="transaction-category"
            value={form.categoryId}
            onChange={(e) => onChange('categoryId', e.target.value)}
            className={errors.categoryId ? errorFieldClassName : fieldClassName}
            style={{ background: '#0C2A46' }}
            disabled={categories.length === 0}
          >
            {categories.length === 0 && <option value="">No active categories</option>}
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.categoryId && <p className="text-sm text-[#A67A53]">{errors.categoryId}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="transaction-merchant" className={labelClassName}>
            Merchant / Source <span style={{ opacity: 0.5 }}>(optional)</span>
          </label>
          <input
            id="transaction-merchant"
            type="text"
            value={form.merchantOrSource}
            onChange={(e) => onChange('merchantOrSource', e.target.value)}
            placeholder="e.g. Rami Levy"
            className={fieldClassName}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="transaction-note" className={labelClassName}>
            Note <span style={{ opacity: 0.5 }}>(optional)</span>
          </label>
          <textarea
            id="transaction-note"
            rows={3}
            value={form.note}
            onChange={(e) => onChange('note', e.target.value)}
            placeholder="Any extra context..."
            className={`${fieldClassName} resize-none`}
          />
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={form.isFromSavings}
          onClick={() => onChange('isFromSavings', !form.isFromSavings)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '10px 14px',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
        >
          <div style={{ textAlign: 'left' }}>
            <p
              style={{
                margin: 0,
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'rgba(166,122,83,0.88)',
              }}
            >
              Use savings
            </p>
            <p
              style={{
                margin: '2px 0 0',
                fontSize: '0.75rem',
                color: form.isFromSavings ? '#A67A53' : 'rgba(242,242,242,0.46)',
              }}
            >
              {form.isFromSavings ? 'This comes from your savings balance' : 'Regular spending'}
            </p>
          </div>
          <span
            style={{
              position: 'relative',
              display: 'inline-flex',
              height: '26px',
              width: '46px',
              borderRadius: '999px',
              border: '1px solid',
              borderColor: form.isFromSavings ? '#A67A53' : 'rgba(242,242,242,0.15)',
              background: form.isFromSavings
                ? 'linear-gradient(180deg,#D0AE8C 0%,#A67A53 58%,#401F14 100%)'
                : 'rgba(255,255,255,0.08)',
              transition: 'all 0.25s',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: '3px',
                left: form.isFromSavings ? '22px' : '3px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: '#F2F2F2',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                transition: 'left 0.25s cubic-bezier(0.22,1,0.36,1)',
              }}
            />
          </span>
        </button>
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
            border: '1px solid #A67A53',
            background: 'linear-gradient(180deg,#0C2A46 0%,#062239 46%,#011826 100%)',
            padding: '12px 20px',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: '#F2F2F2',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            opacity: isSubmitting ? 0.7 : 1,
            transition: 'transform 0.2s, opacity 0.2s',
            letterSpacing: '0.04em',
          }}
        >
          {isSubmitting ? 'Creating...' : 'Create transaction'}
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
            transition: 'background 0.2s',
            letterSpacing: '0.04em',
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
