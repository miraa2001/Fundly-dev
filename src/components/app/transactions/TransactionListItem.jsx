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
  const topGradient = `linear-gradient(135deg, ${categoryColor}cc 0%, rgba(var(--fundly-primary-rgb),0.95) 58%, rgba(var(--fundly-accent-rgb),0.18) 100%)`;
  const formattedAmount = formatTransactionAmount(transaction.amount_original, transaction.currency_code);
  const formattedDate = formatTransactionDate(transaction.transaction_date);

  return (
    <div className="txn-flip-scene">
      <div
        className={`txn-flip-inner${flipped ? ' flipped' : ''}`}
        onClick={() => setFlipped((f) => !f)}
      >
        <div className="txn-flip-front">
          <div
            style={{
              borderRadius: '20px',
              background: 'var(--fundly-deep)',
              padding: '5px',
              overflow: 'hidden',
              boxShadow: '0 14px 40px rgba(var(--fundly-deep-rgb),0.26)',
            }}
          >
            <div
              style={{
                height: '110px',
                borderRadius: '15px',
                background: topGradient,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  borderBottomRightRadius: '10px',
                  height: '28px',
                  width: '120px',
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
                  top: '28px',
                  left: 0,
                  height: '14px',
                  width: '14px',
                  borderTopLeftRadius: '14px',
                  boxShadow: '-5px -5px 0 2px var(--fundly-deep)',
                  background: 'transparent',
                }}
              />

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
                  border: '2px solid rgba(var(--fundly-surface-rgb),0.35)',
                }}
                aria-hidden="true"
              />

              {transaction.is_from_savings && (
                <div
                  style={{
                    position: 'absolute',
                    top: '5px',
                    right: '12px',
                    background: 'rgba(var(--fundly-accent-rgb),0.18)',
                    border: '1px solid rgba(var(--fundly-accent-rgb),0.38)',
                    borderRadius: '999px',
                    padding: '2px 9px',
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'var(--fundly-surface)',
                  }}
                >
                  Savings
                </div>
              )}

              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '1.1rem',
                      fontWeight: 800,
                      color: 'var(--fundly-surface)',
                      letterSpacing: '-0.02em',
                      textShadow: '0 2px 12px rgba(var(--fundly-deep-rgb),0.4)',
                      lineHeight: 1.1,
                    }}
                  >
                    {title}
                  </p>
                  <p
                    style={{
                      margin: '4px 0 0',
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: 'rgba(var(--fundly-surface-rgb),0.74)',
                    }}
                  >
                    {transaction.categoryName}
                  </p>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    color: 'var(--fundly-surface)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {formattedAmount}
                </p>
              </div>
            </div>

            <div
              style={{
                padding: '8px 12px 6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: '0.58rem',
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'rgba(var(--fundly-surface-rgb),0.46)',
                }}
              >
                {formattedDate}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.58rem',
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'rgba(var(--fundly-accent-rgb),0.72)',
                }}
              >
                Tap for details -&gt;
              </p>
            </div>
          </div>
        </div>

        <div className="txn-flip-back">
          <div
            style={{
              borderRadius: '20px',
              background: 'var(--fundly-surface)',
              border: '1px solid rgba(var(--fundly-primary-rgb),0.14)',
              overflow: 'hidden',
              boxShadow: '0 14px 34px rgba(var(--fundly-primary-rgb),0.16)',
            }}
          >
            <div style={{ height: '6px', background: `linear-gradient(90deg, ${categoryColor}, var(--fundly-accent))` }} />

            <div style={{ padding: '14px 16px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: categoryColor,
                      flexShrink: 0,
                    }}
                  />
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      color: 'var(--fundly-primary)',
                    }}
                  >
                    {transaction.categoryName}
                  </p>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: 'var(--fundly-accent)',
                  }}
                >
                  Manual
                </p>
              </div>

              <p
                style={{
                  margin: '0 0 10px',
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: 'var(--fundly-deep)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                }}
              >
                {title}
              </p>

              <div style={{ borderTop: '1.5px dashed rgba(var(--fundly-primary-rgb),0.16)', margin: '10px 0' }} />

              {[
                { label: 'Amount', value: formattedAmount },
                { label: 'Date', value: formattedDate },
                ...(transaction.merchant_or_source ? [{ label: 'Merchant', value: transaction.merchant_or_source }] : []),
                ...(transaction.note ? [{ label: 'Note', value: transaction.note }] : []),
                ...(transaction.is_from_savings ? [{ label: 'Source', value: 'From savings' }] : []),
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    gap: '12px',
                    padding: '4px 0',
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: 'rgba(var(--fundly-primary-rgb),0.58)',
                      flexShrink: 0,
                    }}
                  >
                    {label}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: 'var(--fundly-deep)',
                      textAlign: 'right',
                    }}
                  >
                    {value}
                  </p>
                </div>
              ))}

              <div style={{ borderTop: '1.5px dashed rgba(var(--fundly-primary-rgb),0.16)', margin: '10px 0' }} />

              <p
                style={{
                  margin: 0,
                  fontSize: '0.58rem',
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'rgba(var(--fundly-primary-rgb),0.46)',
                  textAlign: 'center',
                }}
              >
                &lt;- Tap to flip back
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
