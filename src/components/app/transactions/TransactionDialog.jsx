import { useEffect } from 'react';
import TransactionFormPanel from './TransactionFormPanel';

export default function TransactionDialog({
  categories,
  form,
  errors,
  status,
  isOpen,
  isSubmitting,
  onCancel,
  onChange,
  onSubmit,
}) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;

    function handleKeyDown(e) {
      if (e.key === 'Escape') onCancel();
    }

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 40,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: '0 0 0 0',
        background: 'rgba(7,20,26,0.7)',
        backdropFilter: 'blur(6px)',
      }}
      className="sm:items-center sm:p-6"
    >
      {/* Backdrop close */}
      <button
        type="button"
        aria-label="Close transaction dialog"
        style={{ position: 'absolute', inset: 0, cursor: 'default' }}
        onClick={onCancel}
      />

      {/* Sheet */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '560px',
          borderRadius: '28px 28px 0 0',
          background: '#0b1a20',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 -20px 60px rgba(0,0,0,0.5)',
          maxHeight: 'calc(100dvh - 1rem)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        className="sm:rounded-[28px]"
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 20px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '12px',
            flexShrink: 0,
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
                color: '#44e8f4',
              }}
            >
              New Transaction
            </p>
            <h2
              style={{
                margin: '6px 0 0',
                fontSize: '1.6rem',
                fontWeight: 800,
                color: '#fff',
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
              }}
            >
              Add a transaction
            </h2>
            <p
              style={{
                margin: '6px 0 0',
                fontSize: '0.82rem',
                color: 'rgba(170,222,243,0.6)',
                lineHeight: 1.5,
              }}
            >
              Capture a manual expense and link it to a category.
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            aria-label="Close transaction dialog"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.5)',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'background 0.2s',
            }}
          >
            ✕
          </button>
        </div>

        {/* Scrollable content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            overscrollBehavior: 'contain',
            padding: '16px 16px 20px',
          }}
        >
          <TransactionFormPanel
            categories={categories}
            form={form}
            errors={errors}
            status={status}
            isSubmitting={isSubmitting}
            onCancel={onCancel}
            onChange={onChange}
            onSubmit={onSubmit}
          />
        </div>
      </div>
    </div>
  );
}
