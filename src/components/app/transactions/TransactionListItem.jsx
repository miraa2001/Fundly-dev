import { useState } from 'react';
import { defaultCategoryColor } from '../../../lib/categories';
import { formatTransactionAmount, formatTransactionDate } from '../../../lib/transactions';

const envStyleId = 'txn-envelope-figma-style';
if (typeof document !== 'undefined' && !document.getElementById(envStyleId)) {
  const style = document.createElement('style');
  style.id = envStyleId;
  style.textContent = `
    .env-card-wrap {
      position: relative;
      width: 100%;
      cursor: pointer;
      user-select: none;
    }

    /* animated height */
    .env-card-body {
      position: relative;
      overflow: hidden;
      border-radius: 12px;
      background-color: #F5F0E8;
      box-shadow: 0 8px 30px rgba(0,0,0,0.12);
      transition: height 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* flap */
    .env-flap {
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 64px;
      background-color: #EDE6D6;
      transform-origin: top center;
      transform: rotateX(0deg);
      transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1),
                  translateY 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 10;
      overflow: visible;
      perspective: 1000px;
      transform-style: preserve-3d;
    }
    .env-card-wrap.open .env-flap {
      transform: rotateX(180deg) translateY(-8px);
    }

    /* wax seal */
    .env-seal {
      position: absolute;
      left: 50%;
      bottom: -20px;
      transform: translateX(-50%) scale(1);
      transition: transform 0.3s ease, opacity 0.3s ease;
      opacity: 1;
      z-index: 20;
    }
    .env-card-wrap.open .env-seal {
      transform: translateX(-50%) scale(0);
      opacity: 0;
    }

    /* expandable details */
    .env-details {
      overflow: hidden;
      max-height: 0;
      opacity: 0;
      transition: max-height 0.4s cubic-bezier(0.4,0,0.2,1) 0.1s,
                  opacity 0.4s ease 0.1s;
    }
    .env-card-wrap.open .env-details {
      max-height: 400px;
      opacity: 1;
    }

    /* tap hint swap */
    .env-hint-open  { display: block; }
    .env-hint-close { display: none; }
    .env-card-wrap.open .env-hint-open  { display: none; }
    .env-card-wrap.open .env-hint-close { display: block; }
  `;
  document.head.appendChild(style);
}

function DetailRow({ label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#A67A53' }}>
        {label}
      </span>
      <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#0C2A46' }}>
        {value}
      </span>
    </div>
  );
}

function DashedDivider() {
  return (
    <div style={{ position: 'relative', height: '1px', margin: '2px 0' }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.25,
        backgroundImage: 'repeating-linear-gradient(to right, #A67A53 0, #A67A53 4px, transparent 4px, transparent 8px)',
      }} />
    </div>
  );
}

export default function TransactionListItem({ transaction }) {
  const [isOpen, setIsOpen] = useState(false);

  const title = transaction.title || transaction.merchant_or_source || 'Untitled transaction';
  const categoryColor = transaction.categoryColor || defaultCategoryColor;
  const formattedAmount = formatTransactionAmount(transaction.amount_original, transaction.currency_code);
  const formattedDate = formatTransactionDate(transaction.transaction_date);

  const detailRows = [
    ...(transaction.merchant_or_source ? [{ label: 'Merchant', value: transaction.merchant_or_source }] : []),
    { label: 'Date', value: formattedDate },
    { label: 'Category', value: transaction.categoryName },
    { label: 'Type', value: 'Manual expense' },
    ...(transaction.note ? [{ label: 'Note', value: transaction.note }] : []),
    ...(transaction.is_from_savings ? [{ label: 'Source', value: 'From savings' }] : []),
  ];

  return (
    <div
      className={`env-card-wrap${isOpen ? ' open' : ''}`}
      onClick={() => setIsOpen((v) => !v)}
      role="button"
      tabIndex={0}
      aria-expanded={isOpen}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsOpen((v) => !v); }}
    >
      <div className="env-card-body">

        {/* ── Corner fold decoration ── */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: 64, height: 64, opacity: 0.3, pointerEvents: 'none' }} viewBox="0 0 64 64">
          <line x1="0" y1="0" x2="20" y2="0" stroke="#D4C5B0" strokeWidth="1" />
          <line x1="0" y1="0" x2="0" y2="20" stroke="#D4C5B0" strokeWidth="1" />
          <line x1="0" y1="0" x2="15" y2="15" stroke="#D4C5B0" strokeWidth="0.5" />
        </svg>
        <svg style={{ position: 'absolute', top: 0, right: 0, width: 64, height: 64, opacity: 0.3, pointerEvents: 'none' }} viewBox="0 0 64 64">
          <line x1="44" y1="0" x2="64" y2="0" stroke="#D4C5B0" strokeWidth="1" />
          <line x1="64" y1="0" x2="64" y2="20" stroke="#D4C5B0" strokeWidth="1" />
          <line x1="49" y1="15" x2="64" y2="0" stroke="#D4C5B0" strokeWidth="0.5" />
        </svg>

        {/* ── Flap ── */}
        <div className="env-flap">
          <svg
            style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 32 }}
            viewBox="0 0 380 32"
            preserveAspectRatio="none"
          >
            <path d="M 0,0 L 190,32 L 380,0 L 380,32 L 0,32 Z" fill="#EDE6D6" />
          </svg>

          {/* Wax seal */}
          <div className="env-seal">
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                backgroundColor: categoryColor,
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  backgroundColor: '#F5F0E8',
                }}
              />
            </div>
          </div>
        </div>

        {/* ── Card content ── */}
        <div style={{ paddingTop: 80, paddingLeft: 24, paddingRight: 24, paddingBottom: 24 }}>

          {/* Title + Amount */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <h3 style={{ margin: 0, fontWeight: 500, fontSize: '1.1rem', color: '#0C2A46' }}>
              {title}
            </h3>
            <span style={{ fontWeight: 700, fontSize: '1.2rem', color: '#0C2A46' }}>
              {formattedAmount}
            </span>
          </div>

          {/* Category + Date */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: categoryColor }} />
              <span style={{ fontSize: '0.85rem', color: '#A67A53' }}>
                {transaction.categoryName}
              </span>
            </div>
            <span style={{ fontSize: '0.85rem', color: '#A67A53', opacity: 0.6 }}>
              {formattedDate}
            </span>
          </div>

          {/* ── Expandable details ── */}
          <div className="env-details">
            <div style={{ height: 1, backgroundColor: 'rgba(166,122,83,0.25)', marginBottom: 16 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {detailRows.map(({ label, value }, i) => (
                <div key={label}>
                  <DetailRow label={label} value={value} />
                  {i < detailRows.length - 1 && <DashedDivider />}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20, textAlign: 'center' }}>
              <span className="env-hint-close" style={{ fontSize: '0.72rem', letterSpacing: '0.08em', color: '#A67A53', opacity: 0.6 }}>
                Tap to seal ↑
              </span>
            </div>
          </div>

          {/* Tap to open hint */}
          <div style={{ textAlign: 'center' }}>
            <span className="env-hint-open" style={{ fontSize: '0.72rem', letterSpacing: '0.08em', color: '#A67A53', opacity: 0.6 }}>
              Tap to open ↓
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
