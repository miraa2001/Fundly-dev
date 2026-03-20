import archiveIcon from '../../../assets/icons/category-archive.png';
import editIcon from '../../../assets/icons/category-edit.png';
import unarchiveIcon from '../../../assets/icons/category-unarchive.png';
import { formatCategoryKind, formatMonthKey, getCategoryAccentColor } from '../../../lib/categories';

function formatBudgetAmount(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return value;
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(numericValue);
}

function getDemoSpentPercentage(category) {
  const seed = `${category.id}-${category.name}-${category.kind}`;
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 10007;
  }
  return 24 + (hash % 61);
}

// Glow animation injected once
const glowStyleId = 'category-card-glow-style';
if (typeof document !== 'undefined' && !document.getElementById(glowStyleId)) {
  const style = document.createElement('style');
  style.id = glowStyleId;
  style.textContent = `
    @keyframes cc-rotate {
      0%   { transform: translate(-50%, -50%) rotate(0deg); }
      100% { transform: translate(-50%, -50%) rotate(360deg); }
    }
    @keyframes cc-shimmer {
      0%   { opacity: 0.7; }
      50%  { opacity: 1; }
      100% { opacity: 0.7; }
    }
    .cc-glow-ring {
      position: absolute;
      top: 50%; left: 50%;
      width: 108%; height: 115%;
      overflow: hidden;
      border-radius: inherit;
      filter: blur(9px);
      pointer-events: none;
      z-index: 0;
      transition: filter 0.3s ease;
    }
    .cc-glow-gradient {
      position: absolute;
      top: 50%; left: 50%;
      width: 110%;
      aspect-ratio: 1;
      border-radius: 9999px;
      animation: cc-rotate 2.4s linear infinite;
    }
    .cc-card-collapsed:hover .cc-glow-ring { filter: blur(5px); }
  `;
  document.head.appendChild(style);
}

export default function CategoryCard({
  category,
  isExpanded = false,
  isArchiving = false,
  isUnarchiving = false,
  onToggle,
  onEdit,
  onArchive,
  onUnarchive,
}) {
  const accentColor = getCategoryAccentColor(category.color);
  const monthLabel = formatMonthKey(category.currentMonthKey);
  const demoSpentPct = getDemoSpentPercentage(category);
  const numericBudget = Number(category.currentMonthBudget);
  const hasMonthlyBudget = Number.isFinite(numericBudget);
  const formattedBudget = hasMonthlyBudget ? formatBudgetAmount(numericBudget) : null;
  const demoRemainingAmount = hasMonthlyBudget
    ? formatBudgetAmount(Math.max(numericBudget - (numericBudget * demoSpentPct) / 100, 0))
    : null;

  // Derive a slightly darker shade for the gradient stop
  const topGradient = `linear-gradient(135deg, ${accentColor}cc 0%, #083747f5 55%, #44e8f422 100%)`;

  return (
    <div
      style={{
        borderRadius: '20px',
        background: '#0e1c22',
        padding: '5px',
        overflow: 'hidden',
        boxShadow: isExpanded
          ? `0 0 0 1.5px ${accentColor}55, 0 20px 60px rgba(0,0,0,0.5)`
          : '0 7px 28px rgba(0,0,0,0.35)',
        transition: 'box-shadow 0.4s ease, transform 0.3s cubic-bezier(0.175,0.885,0.32,1.275)',
        transform: isExpanded ? 'scale(1.02)' : 'scale(1)',
        position: 'relative',
        isolation: 'isolate',
      }}
      className={isExpanded ? '' : 'cc-card-collapsed'}
    >
      {/* Glow ring (only visible when collapsed/hovered) */}
      {!isExpanded && (
        <div className="cc-glow-ring" aria-hidden="true">
          <div
            className="cc-glow-gradient"
            style={{
              backgroundImage: `linear-gradient(90deg,
                ${accentColor},
                #44e8f4,
                #15aeca,
                ${accentColor}88,
                #ffd45a55,
                #44e8f4,
                ${accentColor})`,
            }}
          />
        </div>
      )}

      {/* ── TOP SECTION ─────────────────────────────────── */}
      <button
        type="button"
        onClick={() => onToggle(category.id)}
        aria-expanded={isExpanded}
        style={{
          display: 'block',
          width: '100%',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          background: 'transparent',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          style={{
            height: isExpanded ? '140px' : '120px',
            borderRadius: '15px',
            background: topGradient,
            position: 'relative',
            overflow: 'hidden',
            transition: 'height 0.4s ease',
          }}
        >
          {/* Tab notch (same trick as template) */}
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
              content: '""',
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

          {/* Color swatch dot — top-left inside the notch area */}
          <div
            style={{
              position: 'absolute',
              top: '4px',
              left: '16px',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: accentColor,
              boxShadow: `0 0 10px ${accentColor}99`,
              border: '2px solid rgba(255,255,255,0.35)',
            }}
            aria-hidden="true"
          />

          {/* Archived badge */}
          {category.is_archived && (
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
              Archived
            </div>
          )}

          {/* Main label */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '16px',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ textAlign: 'left' }}>
              <p
                style={{
                  margin: 0,
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  color: '#fff',
                  letterSpacing: '-0.02em',
                  textShadow: '0 2px 12px rgba(0,0,0,0.4)',
                  lineHeight: 1.1,
                }}
              >
                {category.name}
              </p>
              {isExpanded && (
                <p
                  style={{
                    margin: '4px 0 0',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: `${accentColor}dd`,
                  }}
                >
                  {formatCategoryKind(category.kind)}
                </p>
              )}
            </div>

            {/* Expand hint */}
            <span
              style={{
                fontSize: '0.6rem',
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.65)',
                border: '1px solid rgba(255,255,255,0.22)',
                borderRadius: '999px',
                padding: '4px 10px',
                whiteSpace: 'nowrap',
                backdropFilter: 'blur(6px)',
                background: 'rgba(255,255,255,0.07)',
              }}
            >
              {isExpanded ? 'Close' : 'Details'}
            </span>
          </div>
        </div>
      </button>

      {/* ── BOTTOM SECTION (expanded only) ───────────────── */}
      <div
        style={{
          maxHeight: isExpanded ? '340px' : '0px',
          overflow: 'hidden',
          transition: 'max-height 0.45s cubic-bezier(0.22,1,0.36,1)',
        }}
        aria-hidden={!isExpanded}
      >
        <div style={{ padding: '14px 10px 8px' }}>

          {/* Month label */}
          <p
            style={{
              margin: '0 0 10px',
              fontSize: '0.62rem',
              fontWeight: 700,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: `${accentColor}cc`,
              textAlign: 'center',
            }}
          >
            {monthLabel}
          </p>

          {/* Stats row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '6px',
              marginBottom: '10px',
            }}
          >
            {[
              {
                label: 'Budget',
                value: hasMonthlyBudget ? formattedBudget : '—',
              },
              {
                label: 'Remaining',
                value: hasMonthlyBudget ? demoRemainingAmount : '—',
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '10px 10px 8px',
                  textAlign: 'center',
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.58rem',
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'rgba(170,222,243,0.7)',
                  }}
                >
                  {label}
                </p>
                <p
                  style={{
                    margin: '4px 0 0',
                    fontSize: '1rem',
                    fontWeight: 800,
                    color: '#fff',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: '12px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '5px',
              }}
            >
              <span
                style={{
                  fontSize: '0.58rem',
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'rgba(170,222,243,0.7)',
                }}
              >
                Spent
              </span>
              <span
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  color: demoSpentPct >= 85 ? '#ffd45a' : '#44e8f4',
                }}
              >
                {demoSpentPct}%
              </span>
            </div>
            <div
              style={{
                height: '7px',
                borderRadius: '999px',
                background: 'rgba(255,255,255,0.1)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${demoSpentPct}%`,
                  borderRadius: '999px',
                  background:
                    demoSpentPct >= 85
                      ? 'linear-gradient(90deg,#ffd45a,#f6c53d)'
                      : `linear-gradient(90deg,${accentColor},#44e8f4,#15aeca)`,
                  transition: 'width 0.8s cubic-bezier(0.22,1,0.36,1)',
                  boxShadow:
                    demoSpentPct >= 85
                      ? '0 0 8px rgba(255,212,90,0.6)'
                      : `0 0 8px ${accentColor}88`,
                }}
              />
            </div>
          </div>

          {/* Icon action buttons */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '6px',
              paddingTop: '4px',
              borderTop: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            {/* Edit */}
            <button
              type="button"
              onClick={() => onEdit(category)}
              title="Edit category"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                border: '1px solid rgba(68,232,244,0.3)',
                background: 'rgba(68,232,244,0.1)',
                cursor: 'pointer',
                transition: 'background 0.2s, border-color 0.2s, transform 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(68,232,244,0.22)';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(68,232,244,0.1)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <img src={editIcon} alt="Edit" style={{ width: '16px', height: '16px', objectFit: 'contain', filter: 'invert(1) sepia(1) saturate(2) hue-rotate(155deg)' }} />
            </button>

            {/* Archive / Unarchive */}
            {!category.is_archived ? (
              <button
                type="button"
                onClick={() => onArchive(category)}
                disabled={isArchiving}
                title={isArchiving ? 'Archiving…' : 'Archive category'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,212,90,0.35)',
                  background: 'rgba(255,212,90,0.1)',
                  cursor: isArchiving ? 'not-allowed' : 'pointer',
                  opacity: isArchiving ? 0.6 : 1,
                  transition: 'background 0.2s, border-color 0.2s, transform 0.15s',
                }}
                onMouseEnter={e => {
                  if (!isArchiving) {
                    e.currentTarget.style.background = 'rgba(255,212,90,0.22)';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,212,90,0.1)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <img src={archiveIcon} alt="Archive" style={{ width: '16px', height: '16px', objectFit: 'contain', filter: 'invert(1) sepia(1) saturate(3) hue-rotate(5deg)' }} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onUnarchive(category)}
                disabled={isUnarchiving}
                title={isUnarchiving ? 'Unarchiving…' : 'Unarchive category'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  border: '1px solid rgba(156,239,229,0.35)',
                  background: 'rgba(156,239,229,0.1)',
                  cursor: isUnarchiving ? 'not-allowed' : 'pointer',
                  opacity: isUnarchiving ? 0.6 : 1,
                  transition: 'background 0.2s, border-color 0.2s, transform 0.15s',
                }}
                onMouseEnter={e => {
                  if (!isUnarchiving) {
                    e.currentTarget.style.background = 'rgba(156,239,229,0.22)';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(156,239,229,0.1)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <img src={unarchiveIcon} alt="Unarchive" style={{ width: '16px', height: '16px', objectFit: 'contain', filter: 'invert(1) sepia(1) saturate(2) hue-rotate(130deg)' }} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
