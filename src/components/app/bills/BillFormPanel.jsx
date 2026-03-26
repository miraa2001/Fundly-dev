import StatusMessage from '../../auth/StatusMessage';
import { defaultCategoryColor } from '../../../lib/categories';
import { formatBillAmount } from '../../../lib/bills';

const fieldClassName =
  'w-full rounded-[1.15rem] border border-[rgba(var(--fundly-primary-rgb),0.18)] bg-white/6 px-4 py-3 text-sm text-[var(--fundly-surface)] outline-none transition focus:border-[rgba(var(--fundly-accent-rgb),0.50)] focus:bg-white/10 focus:ring-2 focus:ring-[rgba(var(--fundly-accent-rgb),0.14)] placeholder:text-white/30';
const errorFieldClassName =
  'w-full rounded-[1.15rem] border border-[rgba(var(--fundly-warm-rgb),0.45)] bg-white/5 px-4 py-3 text-sm text-[var(--fundly-surface)] outline-none ring-2 ring-[rgba(var(--fundly-warm-rgb),0.16)] placeholder:text-white/30';
const labelClassName = 'text-xs font-bold uppercase tracking-[0.18em] text-[rgba(var(--fundly-accent-rgb),0.88)]';

export default function BillFormPanel({
  categories,
  form,
  errors,
  status,
  isSubmitting,
  isEditing,
  onCancel,
  onChange,
  onSubmit,
}) {
  const selectedCategory = categories.find((category) => category.id === form.categoryId) ?? null;
  const categoryColor = selectedCategory?.color || defaultCategoryColor;
  const previewTitle = form.name.trim() || 'New bill';
  const previewAmount = formatBillAmount(form.defaultAmount || '0');
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
                Template
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
                {previewTitle}
              </p>
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--fundly-accent)' }}>{previewAmount}</span>
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
          <label htmlFor="bill-name" className={labelClassName}>
            Name
          </label>
          <input
            id="bill-name"
            type="text"
            value={form.name}
            onChange={(event) => onChange('name', event.target.value)}
            placeholder="Electricity bill"
            autoFocus
            className={errors.name ? errorFieldClassName : fieldClassName}
          />
          {errors.name ? <p className="text-sm text-[var(--fundly-accent)]">{errors.name}</p> : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="bill-amount" className={labelClassName}>
            Default Amount
          </label>
          <input
            id="bill-amount"
            type="number"
            min="0.01"
            step="0.01"
            inputMode="decimal"
            value={form.defaultAmount}
            onChange={(event) => onChange('defaultAmount', event.target.value)}
            placeholder="0.00"
            className={errors.defaultAmount ? errorFieldClassName : fieldClassName}
          />
          {errors.defaultAmount ? <p className="text-sm text-[var(--fundly-accent)]">{errors.defaultAmount}</p> : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="bill-category" className={labelClassName}>
            Category
          </label>
          <select
            id="bill-category"
            value={form.categoryId}
            onChange={(event) => onChange('categoryId', event.target.value)}
            className={errors.categoryId ? errorFieldClassName : fieldClassName}
            style={{ background: 'var(--fundly-primary)' }}
            disabled={categories.length === 0}
          >
            {categories.length === 0 ? <option value="">No spending categories</option> : null}
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId ? <p className="text-sm text-[var(--fundly-accent)]">{errors.categoryId}</p> : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="bill-note" className={labelClassName}>
            Note <span style={{ opacity: 0.5 }}>(optional)</span>
          </label>
          <textarea
            id="bill-note"
            rows={3}
            value={form.note}
            onChange={(event) => onChange('note', event.target.value)}
            placeholder="Any details you want prefilled at payment time."
            className={`${fieldClassName} resize-none`}
          />
        </div>
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
            transition: 'transform 0.2s, opacity 0.2s',
            letterSpacing: '0.04em',
          }}
        >
          {isSubmitting ? (isEditing ? 'Saving...' : 'Creating...') : isEditing ? 'Save bill' : 'Create bill'}
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
