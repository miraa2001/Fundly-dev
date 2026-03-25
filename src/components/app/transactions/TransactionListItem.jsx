import { useState } from 'react';
import { defaultCategoryColor } from '../../../lib/categories';
import { formatTransactionAmount, formatTransactionDate } from '../../../lib/transactions';

const envStyleId = 'txn-envelope-style';
if (typeof document !== 'undefined' && !document.getElementById(envStyleId)) {
  const style = document.createElement('style');
  style.id = envStyleId;
  style.textContent = `
    .env-wrap {
      position: relative;
      width: 100%;
      cursor: pointer;
      user-select: none;
    }

    /* ── ENVELOPE BODY ── */
    .env-body {
      position: relative;
      border-radius: 4px 4px 6px 6px;
      background: #F5F0E8;
      border: 1px solid rgba(64,31,20,0.15);
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(12,42,70,0.10), 0 1px 3px rgba(12,42,70,0.07);
      transition: box-shadow 0.3s ease;
      z-index: 1;
    }
    .env-wrap:hover .env-body {
      box-shadow: 0 6px 24px rgba(12,42,70,0.14), 0 2px 6px rgba(12,42,70,0.08);
    }

    /* diagonal corner lines on envelope body */
    .env-body::before {
      content: '';
      position: absolute;
      inset: 0;
      background:
        linear-gradient(135deg, rgba(64,31,20,0.07) 0%, transparent 40%),
        linear-gradient(225deg, rgba(64,31,20,0.07) 0%, transparent 40%);
      pointer-events: none;
    }

    /* ── FLAP ── */
    .env-flap-wrap {
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 80px;
      transform-origin: top center;
      transform: rotateX(0deg);
      transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
      z-index: 3;
      perspective: 600px;
    }
    .env-wrap.open .env-flap-wrap {
      transform: rotateX(-178deg);
    }
    .env-flap {
      width: 100%;
      height: 80px;
      position: relative;
      overflow: hidden;
    }
    /* Triangle flap shape */
    .env-flap-triangle {
      width: 0;
      height: 0;
      border-left: 50vw solid transparent;
      border-right: 50vw solid transparent;
      border-top: 80px solid #EDE6D6;
      position: absolute;
      top: 0; left: 50%;
      transform: translateX(-50%);
      filter: drop-shadow(0 2px 3px rgba(64,31,20,0.12));
    }
    .env-flap-triangle-inner {
      width: 0;
      height: 0;
      border-left: 50vw solid transparent;
      border-right: 50vw solid transparent;
      border-top: 80px solid #F5F0E8;
      position: absolute;
      top: -1px; left: 50%;
      transform: translateX(-50%);
    }

    /* ── CONTENTS (revealed when open) ── */
    .env-contents {
      padding: 14px 18px 16px;
      opacity: 0;
      transform: translateY(-6px);
      transition: opacity 0.3s ease 0.3s, transform 0.3s ease 0.3s;
      pointer-events: none;
    }
    .env-wrap.open .env-contents {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }

    /* ── SEALED FRONT ── */
    .env-sealed {
      padding: 28px 18px 18px;
      opacity: 1;
      transition: opacity 0.15s ease;
    }
    .env-wrap.open .env-sealed {
      opacity: 0;
      pointer-events: none;
      position: absolute;
      top: 0; left: 0; right: 0;
    }

    /* wax seal */
    .env-seal {
      position: absolute;
      bottom: -16px;
      left: 50%;
      transform: translateX(-50%);
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 4;
      box-shadow: 0 2px 8px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.3);
      transition: transform 0.3s ease, opacity 0.2s ease;
    }
    .env-wrap.open .env-seal {
      transform: translateX(-50%) scale(0);
      opacity: 0;
    }
    .env-seal-inner {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: rgba(255,255,255,0.35);
      border: 1.5px solid rgba(255,255,255,0.5);
    }

    /* bottom envelope V shape */
    .env-bottom-v {
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 60px;
      overflow: hidden;
      pointer-events: none;
    }
    .env-bottom-v::before {
      content: '';
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 60px;
      background: linear-gradient(135deg, #EDE6D6 50%, transparent 50%);
    }
    .env-bottom-v::after {
      content: '';
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 60px;
      background: linear-gradient(225deg, #EDE6D6 50%, transparent 50%);
    }
  `;
  document.head.appendChild(style);
}

export default function TransactionListItem({ transaction }) {
  const [open, setOpen] = useState(false);
  const title = transaction.title || transaction.merchant_or_source || 'Untitled transaction';
  const categoryColor = transaction.categoryColor || defaultCategoryColor;
  const formattedAmount = formatTransactionAmount(transaction.amount_original, transaction.currency_code);
  const formattedDate = formatTransactionDate(transaction.transaction_date);

  return (
    <div
      className={`env-wrap${open ? ' open' : ''}`}
      onClick={() => setOpen((v) => !v)}
      role="button"
      tabIndex={0}
      aria-expanded={open}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setOpen((v) => !v); }}
    >
      <div className="env-body" style={{ minHeight: open ? '220px' : '130px', transition: 'min-height 0.4s ease' }}>

        {/* ── FLAP ── */}
        <div className="env-flap-wrap">
          <div className="env-flap">
            <div className="env-flap-triangle" />
            <div className="env-flap-triangle-inner" />
          </div>
        </div>

        {/* ── WAX SEAL ── */}
        <div className="env-seal" style={{ background: categoryColor }}>
          <div className="env-seal-inner" />
        </div>

        {/* ── SEALED FRONT (visible when closed) ── */}
        <div className="env-sealed">
          {/* To: label */}
          <p style={{ margin: '0 0 6px', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(64,31,20,0.4)' }}>
            To: My Budget
          </p>

          {/* Title + amount */}
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px' }}>
            <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0C2A46', letterSpacing: '-0.02em', lineHeight: 1.2, flex: 1 }}>
              {title}
            </p>
            <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0C2A46', letterSpacing: '-0.02em', flexShrink: 0 }}>
              {formattedAmount}
            </p>
          </div>

          {/* Category + date row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: categoryColor, flexShrink: 0 }} />
              <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#A67A53' }}>
                {transaction.categoryName}
              </p>
            </div>
            <p style={{ margin: 0, fontSize: '0.65rem', color: 'rgba(12,42,70,0.4)', fontWeight: 600 }}>
              {formattedDate}
            </p>
          </div>

          {/* open hint */}
          <p style={{ margin: '10px 0 0', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(166,122,83,0.5)', textAlign: 'center' }}>
            Tap to open ↑
          </p>
        </div>

        {/* ── CONTENTS (visible when open) ── */}
        <div className="env-contents" style={{ paddingTop: '86px' }}>
          {/* Letter heading */}
          <div style={{ borderBottom: '1px solid rgba(64,31,20,0.12)', paddingBottom: '10px', marginBottom: '12px' }}>
            <p style={{ margin: '0 0 2px', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(64,31,20,0.4)' }}>
              Transaction receipt
            </p>
            <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0C2A46', letterSpacing: '-0.02em' }}>
              {title}
            </p>
          </div>

          {/* Detail rows */}
          {[
            { label: 'Amount', value: formattedAmount },
            { label: 'Date', value: formattedDate },
            { label: 'Category', value: transaction.categoryName },
            ...(transaction.merchant_or_source ? [{ label: 'Merchant', value: transaction.merchant_or_source }] : []),
            ...(transaction.note ? [{ label: 'Note', value: transaction.note }] : []),
            ...(transaction.is_from_savings ? [{ label: 'Source', value: 'From savings' }] : []),
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px', padding: '3px 0', borderBottom: '1px dashed rgba(166,122,83,0.15)' }}>
              <p style={{ margin: 0, fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(166,122,83,0.7)', flexShrink: 0 }}>
                {label}
              </p>
              <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: '#0C2A46', textAlign: 'right' }}>
                {value}
              </p>
            </div>
          ))}

          {/* close hint */}
          <p style={{ margin: '12px 0 0', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(166,122,83,0.45)', textAlign: 'center' }}>
            Tap to seal ↓
          </p>
        </div>

        {/* Bottom V fold lines */}
        <div className="env-bottom-v" />
      </div>
    </div>
  );
}
