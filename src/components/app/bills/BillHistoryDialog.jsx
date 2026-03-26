import { useEffect } from 'react';
import StatusMessage from '../../auth/StatusMessage';
import { formatBillAmount, formatBillDate } from '../../../lib/bills';

function HistorySkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-[1.2rem] border border-[rgba(var(--fundly-primary-rgb),0.12)] bg-white/6 px-4 py-4"
        >
          <div className="h-5 w-32 rounded-full bg-[rgba(var(--fundly-surface-rgb),0.10)]" />
          <div className="mt-3 h-4 w-44 rounded-full bg-[rgba(var(--fundly-surface-rgb),0.08)]" />
        </div>
      ))}
    </div>
  );
}

export default function BillHistoryDialog({
  bill,
  historyItems,
  error,
  isLoading,
  isOpen,
  onClose,
}) {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !bill) {
    return null;
  }

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
        aria-label="Close bill history dialog"
        style={{ position: 'absolute', inset: 0, cursor: 'default' }}
        onClick={onClose}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '600px',
          borderRadius: '28px 28px 0 0',
          background: 'var(--fundly-deep)',
          border: '1px solid rgba(var(--fundly-accent-rgb),0.18)',
          boxShadow: '0 -20px 60px rgba(0,0,0,0.5)',
          maxHeight: 'calc(100dvh - 1rem)',
          display: 'flex',
          flexDirection: 'column',
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
                color: 'var(--fundly-accent)',
              }}
            >
              Bills
            </p>
            <h2
              style={{
                margin: '6px 0 0',
                fontSize: '1.6rem',
                fontWeight: 800,
                color: 'var(--fundly-surface)',
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
              }}
            >
              Payment history
            </h2>
            <p
              style={{
                margin: '6px 0 0',
                fontSize: '0.82rem',
                color: 'rgba(var(--fundly-surface-rgb),0.66)',
                lineHeight: 1.5,
              }}
            >
              Transactions already linked to <strong style={{ color: 'var(--fundly-surface)' }}>{bill.name}</strong>.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close bill history dialog"
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
              transition: 'background 0.2s',
            }}
          >
            X
          </button>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            overscrollBehavior: 'contain',
            padding: '16px 16px 20px',
          }}
        >
          <StatusMessage tone={error ? 'error' : undefined} message={error} />

          {isLoading ? <HistorySkeleton /> : null}

          {!isLoading && !error && historyItems.length === 0 ? (
            <div className="rounded-[1.2rem] border border-[rgba(var(--fundly-primary-rgb),0.12)] bg-white/6 px-4 py-5">
              <p className="font-bold text-[var(--fundly-surface)]">No bill payments yet</p>
              <p className="mt-2 text-sm leading-6 text-[rgba(var(--fundly-surface-rgb),0.68)]">
                Once you quick-pay this bill, those linked transactions will appear here.
              </p>
            </div>
          ) : null}

          {!isLoading && !error && historyItems.length > 0 ? (
            <div className="space-y-3">
              {historyItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-[1.2rem] border border-[rgba(var(--fundly-primary-rgb),0.12)] bg-white/6 px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 shrink-0 rounded-full"
                          style={{ backgroundColor: item.categoryColor }}
                          aria-hidden="true"
                        />
                        <p className="truncate font-bold text-[var(--fundly-surface)]">{item.title}</p>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[rgba(var(--fundly-surface-rgb),0.68)]">
                        <span>{item.categoryName}</span>
                        <span>{formatBillDate(item.transaction_date)}</span>
                        {item.merchant_or_source ? <span>{item.merchant_or_source}</span> : null}
                      </div>
                    </div>
                    <span className="shrink-0 text-sm font-bold text-[var(--fundly-accent)]">
                      {formatBillAmount(item.amountOriginal)}
                    </span>
                  </div>

                  {item.note ? (
                    <p className="mt-3 text-sm leading-6 text-[rgba(var(--fundly-surface-rgb),0.74)]">{item.note}</p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
