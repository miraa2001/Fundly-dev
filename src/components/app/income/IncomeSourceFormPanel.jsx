import StatusMessage from '../../auth/StatusMessage';

const fieldClassName =
  'w-full rounded-[1.15rem] border border-[rgba(var(--fundly-primary-rgb),0.18)] bg-white/6 px-4 py-3 text-sm text-[var(--fundly-surface)] outline-none transition focus:border-[rgba(var(--fundly-accent-rgb),0.50)] focus:bg-white/10 focus:ring-2 focus:ring-[rgba(var(--fundly-accent-rgb),0.14)] placeholder:text-white/30';
const errorFieldClassName =
  'w-full rounded-[1.15rem] border border-[rgba(var(--fundly-warm-rgb),0.45)] bg-white/5 px-4 py-3 text-sm text-[var(--fundly-surface)] outline-none ring-2 ring-[rgba(var(--fundly-warm-rgb),0.16)] placeholder:text-white/30';
const labelClassName = 'text-xs font-bold uppercase tracking-[0.18em] text-[rgba(var(--fundly-accent-rgb),0.88)]';

export default function IncomeSourceFormPanel({
  form,
  errors,
  status,
  isSubmitting,
  isEditing,
  onCancel,
  onChange,
  onSubmit,
}) {
  const previewName = form.name.trim() || 'Income source';

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
            background:
              'linear-gradient(135deg, rgba(var(--fundly-accent-rgb),0.95) 0%, rgba(var(--fundly-primary-rgb),0.94) 56%, rgba(var(--fundly-warm-rgb),0.22) 100%)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              borderBottomRightRadius: '10px',
              height: '24px',
              width: '118px',
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
              background: 'var(--fundly-accent)',
              boxShadow: '0 0 8px rgba(var(--fundly-accent-rgb),0.6)',
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
              Source
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
          <label htmlFor="income-source-name" className={labelClassName}>
            Name
          </label>
          <input
            id="income-source-name"
            type="text"
            value={form.name}
            onChange={(event) => onChange('name', event.target.value)}
            placeholder="Salary"
            autoFocus
            className={errors.name ? errorFieldClassName : fieldClassName}
          />
          {errors.name ? <p className="text-sm text-[var(--fundly-accent)]">{errors.name}</p> : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="income-source-description" className={labelClassName}>
            Description <span style={{ opacity: 0.5 }}>(optional)</span>
          </label>
          <textarea
            id="income-source-description"
            rows={3}
            value={form.description}
            onChange={(event) => onChange('description', event.target.value)}
            placeholder="Any context that helps identify this income source."
            className={`${fieldClassName} resize-none`}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={isSubmitting}
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
          {isSubmitting ? (isEditing ? 'Saving...' : 'Creating...') : isEditing ? 'Save source' : 'Create source'}
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
