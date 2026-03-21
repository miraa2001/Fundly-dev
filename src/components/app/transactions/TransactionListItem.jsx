import { defaultCategoryColor } from '../../../lib/categories';
import { formatTransactionAmount, formatTransactionDate } from '../../../lib/transactions';

export default function TransactionListItem({ transaction }) {
  const title = transaction.title || transaction.merchant_or_source || 'Untitled transaction';
  const categoryColor = transaction.categoryColor || defaultCategoryColor;
  const topGradient = `linear-gradient(135deg, ${categoryColor}cc 0%, #083747f5 55%, #44e8f422 100%)`;

  return (
    <div
      style={{
        borderRadius: '20px',
        background: '#0e1c22',
        padding: '5px',
        overflow: 'hidden',
        boxShadow: '0 7px 28px rgba(0,0,0,0.35)',
        position: 'relative',
        isolation: 'isolate',
      }}
    >
      {/* ── TOP GRADIENT HEADER ── */}
      <div
        style={{
          height: '90px',
          borderRadius: '15px',
          background: topGradient,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Tab notch */}
        <div
          style={{
            borderBottomRightRadius: '10px',
            height: '28px',
            width: '120px',
            background: '#0e1c22',
            position: 'absolute',
            top: 0,
            left: 0,
            transform: 'skew(-38deg)',
            boxShadow: '-10px -10px 0 0 #0e1c22',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '28px',
            left: 0,
            height: '14px',
            width: '14px',
            borderTopLeftRadius: '14px',
            boxShadow: '-5px -5px 0 2px #0e1c22',
            background: 'transparent',
          }}
        />

        {/* Category color dot */}
        <div
          style={{
            position: 'absolute',
            top: '5px',
            left: '16px',
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: categoryColor,
            boxShadow: `0 0 10px ${categoryColor}99`,
            border: '2px solid rgba(255,255,255,0.35)',
          }}
          aria-hidden="true"
        />

        {/* Savings badge */}
        {transaction.is_from_savings && (
          <div
            style={{
              position: 'absolute',
              top: '5px',
              right: '12px',
              background: 'rgba(255,212,90,0.18)',
              border: '1px solid rgba(255,212,90,0.4)',
              borderRadius: '999px',
              padding: '2px 9px',
              fontSize: '0.6rem',
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#ffd45a',
            }}
          >
            Savings
          </div>
        )}

        {/* Title + category row */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '1.05rem',
              fontWeight: 800,
              color: '#fff',
              letterSpacing: '-0.02em',
              textShadow: '0 2px 12px rgba(0,0,0,0.4)',
              lineHeight: 1.1,
            }}
          >
            {title}
          </p>
          <span
            style={{
              fontSize: '0.6rem',
              fontWeight: 700,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.65)',
              border: '1px solid rgba(255,255,255,0.22)',
              borderRadius: '999px',
              padding: '3px 9px',
              whiteSpace: 'nowrap',
              backdropFilter: 'blur(6px)',
              background: 'rgba(255,255,255,0.07)',
            }}
          >
            {transaction.categoryName}
          </span>
        </div>
      </div>

      {/* ── BOTTOM STATS ── */}
      <div style={{ padding: '10px 10px 8px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '6px',
          }}
        >
          {/* Amount */}
          <div
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '8px',
              textAlign: 'center',
            }}
          >
            <p style={{ margin: 0, fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(170,222,243,0.7)' }}>
              Amount
            </p>
            <p style={{ margin: '3px 0 0', fontSize: '0.9rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>
              {formatTransactionAmount(transaction.amount_original, transaction.currency_code)}
            </p>
          </div>

          {/* Date */}
          <div
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '8px',
              textAlign: 'center',
            }}
          >
            <p style={{ margin: 0, fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(170,222,243,0.7)' }}>
              Date
            </p>
            <p style={{ margin: '3px 0 0', fontSize: '0.75rem', fontWeight: 800, color: '#fff' }}>
              {formatTransactionDate(transaction.transaction_date)}
            </p>
          </div>

          {/* Origin */}
          <div
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '8px',
              textAlign: 'center',
            }}
          >
            <p style={{ margin: 0, fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(170,222,243,0.7)' }}>
              Type
            </p>
            <p style={{ margin: '3px 0 0', fontSize: '0.7rem', fontWeight: 800, color: `${categoryColor}dd`, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Manual
            </p>
          </div>
        </div>

        {/* Note */}
        {transaction.note ? (
          <p style={{ margin: '8px 4px 0', fontSize: '0.75rem', color: 'rgba(170,222,243,0.6)', lineHeight: 1.5 }}>
            {transaction.note}
          </p>
        ) : null}
      </div>
    </div>
  );
}
