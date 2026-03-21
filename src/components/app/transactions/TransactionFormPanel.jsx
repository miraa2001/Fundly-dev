import StatusMessage from '../../auth/StatusMessage';
import { defaultCategoryColor } from '../../../lib/categories';
import { defaultTransactionCurrency, formatTransactionAmount, supportedTransactionCurrencies } from '../../../lib/transactions';

const fieldClassName =
  'w-full rounded-[1.15rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-[#44e8f4]/50 focus:bg-white/10 focus:ring-2 focus:ring-[#44e8f4]/15 placeholder:text-white/30';
const errorFieldClassName =
  'w-full rounded-[1.15rem] border border-[#e3a28a]/60 bg-white/5 px-4 py-3 text-sm text-white outline-none ring-2 ring-[#efc7b8]/20 placeholder:text-white/30';
const labelClassName = 'text-xs font-bold uppercase tracking-[0.18em] text-[rgba(170,222,243,0.7)]';

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
  const topGradient = `linear-gradient(135deg, ${categoryColor}cc 0%, #083747f5 55%, #44e8f422 100%)`;

  return (
    <form className="space-y-4 pb-2" onSubmit={onSubmit} noValidate>

      {/* ── DARK PREVIEW CARD ── */}
      <div
        style={{
          borderRadius: '16px',
          background: '#0e1c22',
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
          {/* Tab notch */}
          <div style={{ borderBottomRightRadius: '10px', height: '24px', width: '110px', background: '#0e1c22', position: 'absolute', top: 0, left: 0, transform: 'skew(-38deg)', boxShadow: '-10px -10px 0 0 #0e1c22' }} />
          <div style={{ position: 'absolute', top: '24px', left: 0, height: '12px', width: '12px', borderTopLeftRadius: '12px', boxShadow: '-5px -5px 0 2px #0e1c22', background: 'transparent' }} />

          {/* Color dot */}
          <div style={{ position: 'absolute', top: '4px', left: '14px', width: '16px', height: '16px', borderRadius: '50%', background: categoryColor, boxShadow: `0 0 8px ${categoryColor}99`, border: '2px solid rgba(255,255,255,0.35)' }} aria-hidden="true" />

          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px 12px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(170,222,243,0.7)' }}>Preview</p>
              <p style={{ margin: '2px 0 0', fontSize: '1rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>{previewTitle}</p>
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#44e8f4' }}>{previewAmount}</span>
          </div>
        </div>

        {selectedCategory && (
          <p style={{ margin: '6px 8px 4px', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: `${categoryColor}cc` }}>
            {selectedCategory.name}
          </p>
        )}
      </div>

      <StatusMessage tone={status?.tone} message={status?.message} />

      {/* ── FIELDS on dark background ── */}
      <div
        style={{
          background: '#0e1c22',
          borderRadius: '16px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        {/* Title */}
        <div className="space-y-1.5">
          <label htmlFor="transaction-title" className={labelClassName}>Title</label>
          <input
            id="transaction-title"
            type="text"
            value={form.title}
            onChange={(e) => onChange('title', e.target.value)}
            placeholder="Weekly groceries"
            autoFocus
            className={errors.title ? errorFieldClassName : fieldClassName}
          />
          {errors.title && <p className="text-sm text-[#e3a28a]">{errors.title}</p>}
        </div>

        {/* Amount + Currency row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px' }}>
          <div className="space-y-1.5">
            <label htmlFor="transaction-amount" className={labelClassName}>Amount</label>
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
            {errors.amount && <p className="text-sm text-[#e3a28a]">{errors.amount}</p>}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="transaction-currency" className={labelClassName}>Currency</label>
            <select
              id="transaction-currency"
              value={form.currency}
              onChange={(e) => onChange('currency', e.target.value)}
              className={`${errors.currency ? errorFieldClassName : fieldClassName} min-w-[80px]`}
              style={{ background: '#1a2d35' }}
            >
              {supportedTransactionCurrencies.map((code) => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Date */}
        <div className="space-y-1.5">
          <label htmlFor="transaction-date" className={labelClassName}>Date</label>
          <input
            id="transaction-date"
            type="date"
            value={form.transactionDate}
            onChange={(e) => onChange('transactionDate', e.target.value)}
            className={errors.transactionDate ? errorFieldClassName : fieldClassName}
            style={{ colorScheme: 'dark' }}
          />
          {errors.transactionDate && <p className="text-sm text-[#e3a28a]">{errors.transactionDate}</p>}
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <label htmlFor="transaction-category" className={labelClassName}>Category</label>
          <select
            id="transaction-category"
            value={form.categoryId}
            onChange={(e) => onChange('categoryId', e.target.value)}
            className={errors.categoryId ? errorFieldClassName : fieldClassName}
            style={{ background: '#1a2d35' }}
            disabled={categories.length === 0}
          >
            {categories.length === 0 && <option value="">No active categories</option>}
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          {errors.categoryId && <p className="text-sm text-[#e3a28a]">{errors.categoryId}</p>}
        </div>

        {/* Merchant */}
        <div className="space-y-1.5">
          <label htmlFor="transaction-merchant" className={labelClassName}>Merchant / Source <span style={{ opacity: 0.5 }}>(optional)</span></label>
          <input
            id="transaction-merchant"
            type="text"
            value={form.merchantOrSource}
            onChange={(e) => onChange('merchantOrSource', e.target.value)}
            placeholder="e.g. Rami Levy"
            className={fieldClassName}
          />
        </div>

        {/* Note */}
        <div className="space-y-1.5">
          <label htmlFor="transaction-note" className={labelClassName}>Note <span style={{ opacity: 0.5 }}>(optional)</span></label>
          <textarea
            id="transaction-note"
            rows={3}
            value={form.note}
            onChange={(e) => onChange('note', e.target.value)}
            placeholder="Any extra context..."
            className={`${fieldClassName} resize-none`}
          />
        </div>

        {/* Savings toggle */}
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
            <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(170,222,243,0.7)' }}>
              Use savings
            </p>
            <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: form.isFromSavings ? '#44e8f4' : 'rgba(255,255,255,0.4)' }}>
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
              borderColor: form.isFromSavings ? '#0a6a83' : 'rgba(255,255,255,0.15)',
              background: form.isFromSavings
                ? 'linear-gradient(180deg,#44e8f4 0%,#15aeca 42%,#0a6a83 100%)'
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
                background: '#fff',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                transition: 'left 0.25s cubic-bezier(0.22,1,0.36,1)',
              }}
            />
          </span>
        </button>
      </div>

      {/* ── ACTION BUTTONS ── */}
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
            border: '1px solid #073746',
            background: 'linear-gradient(180deg,#44e8f4 0%,#15aeca 42%,#0a6a83 100%)',
            padding: '12px 20px',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: '#fff',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            opacity: isSubmitting ? 0.7 : 1,
            transition: 'transform 0.2s, opacity 0.2s',
            letterSpacing: '0.04em',
          }}
        >
          {isSubmitting ? 'Creating…' : 'Create transaction'}
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
