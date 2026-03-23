import { useState } from 'react';
import { defaultCategoryColor } from '../../../lib/categories';
import { formatTransactionAmount, formatTransactionDate } from '../../../lib/transactions';

const flipStyleId = 'txn-flip-style';
if (typeof document !== 'undefined' && !document.getElementById(flipStyleId)) {
  const style = document.createElement('style');
  style.id = flipStyleId;
  style.textContent = `
    .txn-flip-scene {
      perspective: 1000px;
      width: 100%;
    }
    .txn-flip-inner {
      position: relative;
      width: 100%;
      transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
      transform-style: preserve-3d;
      cursor: pointer;
    }
    .txn-flip-inner.flipped {
      transform: rotateY(180deg);
    }
    .txn-flip-front,
    .txn-flip-back {
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      width: 100%;
    }
    .txn-flip-back {
      position: absolute;
      top: 0;
      left: 0;
      transform: rotateY(180deg);
    }
  `;
  document.head.appendChild(style);
}

export default function TransactionListItem({ transaction }) {
  const [flipped, setFlipped] = useState(false);
  const title = transaction.title || transaction.merchant_or_source || 'Untitled transaction';
  const categoryColor = transaction.categoryColor || defaultCategoryColor;
  const formattedAmount = formatTransactionAmount(transaction.amount_original, transaction.currency_code);
  const formattedDate = formatTransactionDate(transaction.transaction_date);

  return (
    <div className="txn-flip-scene">
      <div
        className={`txn-flip-inner${flipped ? ' flipped' : ''}`}
        onClick={() => setFlipped((f) => !f)}
      >

        {/* ── FRONT ── warm cream, neutral card */}
        <div className="txn-flip-front">
          <div
            style={{
              borderRadius: '20px',
              background: '#F2F2F2',
              border: '1px solid rgba(12,42,70,0.10)',
              overflow: 'hidden',
              boxShadow: '0 4px 24px rgba(12,42,70,0.08), 0 1px 4px rgba(12,42,70,0.06)',
            }}
          >
            {/* Top accent bar in category color */}
            <div style={{ height: '4px', background: categoryColor, opacity: 0.85 }} />

            <div style={{ padding: '16px 18px 14px' }}>

              {/* Category pill + savings badge row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: categoryColor, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#A67A53' }}>
                    {transaction.categoryName}
                  </span>
                </div>
                {transaction.is_from_savings && (
                  <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', background: 'rgba(166,122,83,0.12)', color: '#A67A53', border: '1px solid rgba(166,122,83,0.28)', borderRadius: '999px', padding: '2px 9px' }}>
                    Savings
                  </span>
                )}
              </div>

              {/* Title + amount balanced row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0C2A46', letterSpacing: '-0.02em', lineHeight: 1.2, flex: 1 }}>
                  {title}
                </p>
                <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0C2A46', letterSpacing: '-0.02em', flexShrink: 0 }}>
                  {formattedAmount}
                </p>
              </div>

              {/* Date + flip hint */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
                <p style={{ margin: 0, fontSize: '0.68rem', color: 'rgba(12,42,70,0.45)', fontWeight: 600 }}>
                  {formattedDate}
                </p>
                <p style={{ margin: 0, fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(166,122,83,0.6)' }}>
                  Details →
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── BACK ── warm receipt */}
        <div className="txn-flip-back">
          <div
            style={{
              borderRadius: '20px',
              background: '#FDFAF7',
              border: '1px solid rgba(166,122,83,0.2)',
              overflow: 'hidden',
              boxShadow: '0 4px 24px rgba(12,42,70,0.08)',
            }}
          >
            {/* Top strip in category color */}
            <div style={{ height: '4px', background: categoryColor }} />

            <div style={{ padding: '14px 18px' }}>

              {/* Category + type row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: categoryColor, flexShrink: 0 }} />
                  <p style={{ margin: 0, fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#A67A53' }}>
                    {transaction.categoryName}
                  </p>
                </div>
                <p style={{ margin: 0, fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(12,42,70,0.35)' }}>
                  Manual
                </p>
              </div>

              {/* Title */}
              <p style={{ margin: '0 0 12px', fontSize: '1.1rem', fontWeight: 800, color: '#0C2A46', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                {title}
              </p>

              {/* Dashed divider */}
              <div style={{ borderTop: '1.5px dashed rgba(166,122,83,0.25)', margin: '10px 0' }} />

              {/* Detail rows */}
              {[
                { label: 'Amount', value: formattedAmount },
                { label: 'Date', value: formattedDate },
                ...(transaction.merchant_or_source ? [{ label: 'Merchant', value: transaction.merchant_or_source }] : []),
                ...(transaction.note ? [{ label: 'Note', value: transaction.note }] : []),
                ...(transaction.is_from_savings ? [{ label: 'Source', value: 'From savings' }] : []),
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px', padding: '4px 0' }}>
                  <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(166,122,83,0.7)', flexShrink: 0 }}>
                    {label}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: '#0C2A46', textAlign: 'right' }}>
                    {value}
                  </p>
                </div>
              ))}

              {/* Dashed divider */}
              <div style={{ borderTop: '1.5px dashed rgba(166,122,83,0.25)', margin: '10px 0' }} />

              {/* Flip back hint */}
              <p style={{ margin: 0, fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(166,122,83,0.45)', textAlign: 'center' }}>
                ← Tap to flip back
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
