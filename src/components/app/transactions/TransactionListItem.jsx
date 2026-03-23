import { useState } from 'react';
import { defaultCategoryColor } from '../../../lib/categories';
import { formatTransactionAmount, formatTransactionDate } from '../../../lib/transactions';

const styleId = 'txn-item-style';
if (typeof document !== 'undefined' && !document.getElementById(styleId)) {
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    @keyframes txn-slide-in {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes txn-amount-glow {
      0%, 100% { text-shadow: 0 0 0px transparent; }
      50%       { text-shadow: 0 0 14px rgba(166,122,83,0.45); }
    }
    @keyframes txn-shimmer {
      0%   { background-position: -200% center; }
      100% { background-position: 200% center; }
    }

    .txn-item {
      position: relative;
      border-radius: 18px;
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.22s cubic-bezier(0.22,1,0.36,1), box-shadow 0.22s ease;
      animation: txn-slide-in 0.35s ease both;
      will-change: transform;
    }
    .txn-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 16px 40px rgba(1,24,38,0.22), 0 4px 12px rgba(1,24,38,0.12) !important;
    }
    .txn-item:active {
      transform: translateY(0px) scale(0.995);
    }

    /* ── FRONT ── */
    .txn-front {
      display: grid;
      grid-template-columns: 4px 1fr;
      min-height: 80px;
      background: linear-gradient(135deg, rgba(242,242,242,0.98) 0%, rgba(255,255,255,0.97) 100%);
      border: 1px solid rgba(12,42,70,0.09);
    }

    .txn-side-bar {
      width: 4px;
      background: var(--txn-color, #0C2A46);
      border-radius: 0;
      flex-shrink: 0;
      transition: opacity 0.2s;
    }

    .txn-front-body {
      padding: 14px 16px 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .txn-top-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .txn-category-tag {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .txn-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--txn-color, #0C2A46);
      flex-shrink: 0;
    }

    .txn-category-label {
      font-size: 0.58rem;
      font-weight: 800;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--txn-color, #A67A53);
      opacity: 0.85;
    }

    .txn-kind-badge {
      font-size: 0.54rem;
      font-weight: 800;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: rgba(12,42,70,0.3);
      border: 1px solid rgba(12,42,70,0.10);
      border-radius: 999px;
      padding: 2px 8px;
    }

    .txn-main-row {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 12px;
    }

    .txn-title {
      font-size: 1rem;
      font-weight: 800;
      color: #0C2A46;
      letter-spacing: -0.025em;
      line-height: 1.15;
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .txn-amount {
      font-size: 1.05rem;
      font-weight: 900;
      color: #0C2A46;
      letter-spacing: -0.03em;
      flex-shrink: 0;
      font-variant-numeric: tabular-nums;
    }

    .txn-bottom-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .txn-date {
      font-size: 0.65rem;
      font-weight: 600;
      color: rgba(12,42,70,0.38);
      letter-spacing: 0.02em;
    }

    .txn-flip-hint {
      font-size: 0.54rem;
      font-weight: 800;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: rgba(166,122,83,0.45);
      display: flex;
      align-items: center;
      gap: 4px;
      transition: color 0.2s;
    }
    .txn-item:hover .txn-flip-hint {
      color: rgba(166,122,83,0.72);
    }

    .txn-savings-pill {
      font-size: 0.52rem;
      font-weight: 800;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      background: rgba(166,122,83,0.10);
      color: #A67A53;
      border: 1px solid rgba(166,122,83,0.24);
      border-radius: 999px;
      padding: 2px 8px;
    }

    /* ── BACK ── */
    .txn-back {
      display: none;
      flex-direction: column;
      background: #0C2A46;
      min-height: 80px;
    }
    .txn-item.is-open .txn-front { display: none; }
    .txn-item.is-open .txn-back  { display: flex; }

    .txn-back-header {
      padding: 14px 16px 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255,255,255,0.07);
    }

    .txn-back-title {
      font-size: 0.95rem;
      font-weight: 800;
      color: #F2F2F2;
      letter-spacing: -0.025em;
      line-height: 1.2;
    }

    .txn-back-amount {
      font-size: 1.1rem;
      font-weight: 900;
      letter-spacing: -0.03em;
      font-variant-numeric: tabular-nums;
      background: linear-gradient(90deg, #D0AE8C, #A67A53, #D5B595);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: txn-shimmer 2.5s linear infinite;
    }

    .txn-back-rows {
      padding: 10px 16px;
      display: flex;
      flex-direction: column;
      gap: 0;
      flex: 1;
    }

    .txn-back-row {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 12px;
      padding: 7px 0;
      border-bottom: 1px solid rgba(255,255,255,0.055);
    }
    .txn-back-row:last-child { border-bottom: none; }

    .txn-back-label {
      font-size: 0.6rem;
      font-weight: 700;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: rgba(166,122,83,0.6);
      flex-shrink: 0;
    }

    .txn-back-value {
      font-size: 0.8rem;
      font-weight: 700;
      color: rgba(242,242,242,0.88);
      text-align: right;
      letter-spacing: -0.01em;
    }

    .txn-back-footer {
      padding: 8px 16px 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      border-top: 1px solid rgba(255,255,255,0.06);
    }

    .txn-close-hint {
      font-size: 0.54rem;
      font-weight: 800;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: rgba(166,122,83,0.38);
      transition: color 0.2s;
    }
    .txn-item:hover .txn-close-hint {
      color: rgba(166,122,83,0.6);
    }

    /* Category color dot on back */
    .txn-back-cat {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .txn-back-cat-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--txn-color, #A67A53);
    }
    .txn-back-cat-name {
      font-size: 0.58rem;
      font-weight: 800;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: rgba(166,122,83,0.7);
    }

    /* Perforated edge on back top */
    .txn-perforation {
      height: 5px;
      background-image: radial-gradient(circle, rgba(242,242,242,0.14) 40%, transparent 40%);
      background-size: 14px 5px;
      background-repeat: repeat-x;
      flex-shrink: 0;
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

  const detailRows = [
    { label: 'Amount', value: formattedAmount },
    { label: 'Date', value: formattedDate },
    ...(transaction.merchant_or_source ? [{ label: 'Merchant', value: transaction.merchant_or_source }] : []),
    ...(transaction.note ? [{ label: 'Note', value: transaction.note }] : []),
    ...(transaction.is_from_savings ? [{ label: 'Source', value: 'From savings' }] : []),
    { label: 'Type', value: 'Manual expense' },
  ];

  return (
    <div
      className={`txn-item${open ? ' is-open' : ''}`}
      style={{
        '--txn-color': categoryColor,
        boxShadow: '0 2px 12px rgba(1,24,38,0.10), 0 1px 3px rgba(1,24,38,0.07)',
      }}
      onClick={() => setOpen((v) => !v)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setOpen((v) => !v); }}
      aria-expanded={open}
    >

      {/* ── FRONT ── */}
      <div className="txn-front">
        <div className="txn-side-bar" />
        <div className="txn-front-body">
          <div className="txn-top-row">
            <div className="txn-category-tag">
              <span className="txn-dot" />
              <span className="txn-category-label">{transaction.categoryName}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {transaction.is_from_savings && <span className="txn-savings-pill">Savings</span>}
              <span className="txn-kind-badge">Manual</span>
            </div>
          </div>

          <div className="txn-main-row">
            <span className="txn-title">{title}</span>
            <span className="txn-amount">{formattedAmount}</span>
          </div>

          <div className="txn-bottom-row">
            <span className="txn-date">{formattedDate}</span>
            <span className="txn-flip-hint">
              Details
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </div>

      {/* ── BACK ── */}
      <div className="txn-back">
        {/* Perforated top edge */}
        <div className="txn-perforation" />

        <div className="txn-back-header">
          <div>
            <div className="txn-back-cat">
              <span className="txn-back-cat-dot" />
              <span className="txn-back-cat-name">{transaction.categoryName}</span>
            </div>
            <p className="txn-back-title" style={{ marginTop: '4px' }}>{title}</p>
          </div>
          <span className="txn-back-amount">{formattedAmount}</span>
        </div>

        <div className="txn-back-rows">
          {detailRows.map(({ label, value }) => (
            <div key={label} className="txn-back-row">
              <span className="txn-back-label">{label}</span>
              <span className="txn-back-value">{value}</span>
            </div>
          ))}
        </div>

        <div className="txn-back-footer">
          <span className="txn-close-hint">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ opacity: 0.5 }}>
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Tap to collapse
          </span>
        </div>
      </div>

    </div>
  );
}
