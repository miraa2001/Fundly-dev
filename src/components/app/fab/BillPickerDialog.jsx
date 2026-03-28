import StatusMessage from '../../auth/StatusMessage';
import { defaultCategoryColor } from '../../../lib/categories';
import { formatBillAmount, formatBillDate } from '../../../lib/bills';

export default function BillPickerDialog({
  bills,
  isLoading,
  isOpen,
  status,
  onClose,
  onRetry,
  onSelectBill,
}) {
  if (!isOpen) {
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
        aria-label="Close bill picker"
        style={{ position: 'absolute', inset: 0, cursor: 'default' }}
        onClick={onClose}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '560px',
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
              Choose a bill to pay
            </h2>
            <p
              style={{
                margin: '6px 0 0',
                fontSize: '0.82rem',
                color: 'rgba(var(--fundly-surface-rgb),0.66)',
                lineHeight: 1.5,
              }}
            >
              Pick a saved bill and we&apos;ll open the existing quick pay dialog with its defaults filled in.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close bill picker"
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

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            overscrollBehavior: 'contain',
            padding: '16px 16px 20px',
          }}
        >
          <div className="space-y-4">
            <StatusMessage tone={status?.tone} message={status?.message} />

            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="animate-pulse rounded-[1.35rem] border border-[rgba(var(--fundly-surface-rgb),0.10)] bg-white/6 px-4 py-4"
                  >
                    <div className="h-4 w-32 rounded-full bg-[rgba(var(--fundly-surface-rgb),0.08)]" />
                    <div className="mt-3 h-3 w-44 rounded-full bg-[rgba(var(--fundly-surface-rgb),0.06)]" />
                    <div className="mt-3 h-3 w-28 rounded-full bg-[rgba(var(--fundly-surface-rgb),0.06)]" />
                  </div>
                ))}
              </div>
            ) : bills.length > 0 ? (
              <div className="space-y-3">
                {bills.map((bill) => (
                  <button
                    key={bill.id}
                    type="button"
                    onClick={() => onSelectBill(bill)}
                    className="w-full rounded-[1.35rem] border border-[rgba(var(--fundly-surface-rgb),0.10)] bg-white/6 px-4 py-4 text-left transition hover:border-[rgba(var(--fundly-accent-rgb),0.28)] hover:bg-white/10"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-3 w-3 shrink-0 rounded-full"
                            style={{ backgroundColor: bill.categoryColor || defaultCategoryColor }}
                            aria-hidden="true"
                          />
                          <p className="truncate text-sm font-bold text-[var(--fundly-surface)]">{bill.name}</p>
                        </div>
                        <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[rgba(var(--fundly-accent-rgb),0.82)]">
                          {bill.categoryName}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-[rgba(var(--fundly-surface-rgb),0.70)]">
                          {bill.note?.trim()
                            ? bill.note
                            : bill.lastPaidAt
                              ? `Last paid on ${formatBillDate(bill.lastPaidAt)}`
                              : 'Never paid yet'}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-sm font-bold text-[var(--fundly-accent)]">
                          {formatBillAmount(bill.defaultAmount)}
                        </p>
                        {bill.lastPaidAt ? (
                          <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[rgba(var(--fundly-surface-rgb),0.56)]">
                            {formatBillDate(bill.lastPaidAt)}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-[1.35rem] border border-[rgba(var(--fundly-surface-rgb),0.10)] bg-white/6 px-4 py-5">
                <p className="text-sm font-bold text-[var(--fundly-surface)]">No bills yet</p>
                <p className="mt-2 text-sm leading-6 text-[rgba(var(--fundly-surface-rgb),0.70)]">
                  Create a bill first on the Bills page, then you&apos;ll be able to quick pay it from anywhere in the app.
                </p>
                {onRetry ? (
                  <button
                    type="button"
                    onClick={onRetry}
                    className="mt-4 inline-flex items-center justify-center rounded-full border border-[rgba(var(--fundly-accent-rgb),0.28)] bg-[rgba(var(--fundly-accent-rgb),0.10)] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--fundly-accent)] transition hover:border-[rgba(var(--fundly-accent-rgb),0.44)]"
                  >
                    Refresh bills
                  </button>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
