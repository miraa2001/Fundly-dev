import { useEffect } from 'react';
import StatusMessage from '../../auth/StatusMessage';

export default function BillDeleteDialog({
  bill,
  status,
  isDeleting,
  isOpen,
  onCancel,
  onConfirm,
}) {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onCancel();
      }
    }

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onCancel]);

  if (!isOpen || !bill) {
    return null;
  }

  const isBlocked = (bill.paymentCount ?? 0) > 0;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 40,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        background: 'rgba(var(--fundly-deep-rgb),0.78)',
        backdropFilter: 'blur(6px)',
      }}
      className="sm:items-center sm:p-6"
    >
      <button
        type="button"
        aria-label="Close delete bill dialog"
        style={{ position: 'absolute', inset: 0, cursor: 'default' }}
        onClick={onCancel}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '460px',
          borderRadius: '28px 28px 0 0',
          background: 'var(--fundly-deep)',
          border: '1px solid rgba(var(--fundly-accent-rgb),0.18)',
          boxShadow: '0 -20px 60px rgba(0,0,0,0.5)',
          overflow: 'hidden',
        }}
        className="sm:rounded-[28px]"
      >
        <div
          style={{
            padding: '20px 20px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            display: 'flex',
            alignItems: 'flex-start',
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
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: 'var(--fundly-accent)',
              }}
            >
              Bills
            </p>
            <h2
              style={{
                margin: '6px 0 0',
                fontSize: '1.45rem',
                fontWeight: 800,
                color: 'var(--fundly-surface)',
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
              }}
            >
              Delete bill
            </h2>
          </div>

          <button
            type="button"
            onClick={onCancel}
            aria-label="Close delete bill dialog"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: '1px solid rgba(var(--fundly-surface-rgb),0.12)',
              background: 'rgba(var(--fundly-surface-rgb),0.06)',
              color: 'rgba(var(--fundly-surface-rgb),0.58)',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            X
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div className="rounded-[1.2rem] border border-[rgba(var(--fundly-primary-rgb),0.12)] bg-white/6 px-4 py-4">
            <p className="text-sm font-bold text-[var(--fundly-surface)]">{bill.name}</p>
            <p className="mt-2 text-sm leading-6 text-[rgba(var(--fundly-surface-rgb),0.72)]">
              {isBlocked
                ? 'This bill already has linked payments. Fundly keeps it to preserve your history and references.'
                : 'This removes the reusable bill template. Past transactions are unaffected because none are linked yet.'}
            </p>
          </div>

          <StatusMessage tone={status?.tone} message={status?.message} />

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting || isBlocked}
              style={{
                flex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '999px',
                border: '1px solid rgba(var(--fundly-warm-rgb),0.35)',
                background: 'rgba(var(--fundly-warm-rgb),0.14)',
                padding: '12px 20px',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: 'var(--fundly-surface)',
                cursor: isDeleting || isBlocked ? 'not-allowed' : 'pointer',
                opacity: isDeleting || isBlocked ? 0.6 : 1,
                letterSpacing: '0.04em',
              }}
            >
              {isBlocked ? 'Delete unavailable' : isDeleting ? 'Deleting...' : 'Delete bill'}
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
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
