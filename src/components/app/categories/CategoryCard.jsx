import archiveIcon from '../../../assets/icons/category-archive.png';
import editIcon from '../../../assets/icons/category-edit.png';
import unarchiveIcon from '../../../assets/icons/category-unarchive.png';
import { formatCategoryKind, formatMonthKey, getCategoryAccentColor } from '../../../lib/categories';

function formatBudgetAmount(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return value;
  }

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

function QuietIconButton({ alt, disabled = false, icon, onClick, tone = 'default', title }) {
  const tones = {
    default: {
      border: 'rgba(var(--fundly-primary-rgb),0.10)',
      background: 'var(--fundly-surface)',
    },
    accent: {
      border: 'rgba(var(--fundly-accent-rgb),0.14)',
      background: 'rgba(var(--fundly-accent-rgb),0.06)',
    },
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '36px',
        height: '36px',
        borderRadius: '12px',
        border: `1px solid ${tones[tone].border}`,
        background: tones[tone].background,
        opacity: disabled ? 0.55 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <img src={icon} alt={alt} style={{ width: '15px', height: '15px', objectFit: 'contain' }} />
    </button>
  );
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

  return (
    <div
      style={{
        borderRadius: '20px',
        background: 'var(--fundly-surface)',
        border: '1px solid rgba(var(--fundly-primary-rgb),0.08)',
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={() => onToggle(category.id)}
        aria-expanded={isExpanded}
        style={{
          display: 'block',
          width: '100%',
          border: 'none',
          padding: '18px 18px 16px',
          background: 'transparent',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '999px',
                  backgroundColor: accentColor,
                  flexShrink: 0,
                }}
                aria-hidden="true"
              />
              <p
                style={{
                  margin: 0,
                  fontSize: '1rem',
                  fontWeight: 500,
                  color: 'var(--fundly-deep)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {category.name}
              </p>
            </div>
            <p
              style={{
                margin: '8px 0 0',
                fontSize: '0.82rem',
                color: 'rgba(var(--fundly-primary-rgb),0.68)',
              }}
            >
              {formatCategoryKind(category.kind)}
            </p>
          </div>

          <span
            style={{
              flexShrink: 0,
              fontSize: '0.72rem',
              fontWeight: 500,
              color: 'rgba(var(--fundly-primary-rgb),0.48)',
            }}
          >
            {isExpanded ? 'Hide' : 'Open'}
          </span>
        </div>

        {category.is_archived ? (
          <div
            style={{
              marginTop: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              borderRadius: '999px',
              padding: '6px 10px',
              fontSize: '0.72rem',
              fontWeight: 500,
              background: 'rgba(var(--fundly-warm-rgb),0.06)',
              color: 'var(--fundly-warm)',
            }}
          >
            Archived
          </div>
        ) : null}
      </button>

      {isExpanded ? (
        <div
          style={{
            borderTop: '1px solid rgba(var(--fundly-primary-rgb),0.08)',
            padding: '16px 18px 18px',
            display: 'grid',
            gap: '14px',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '0.72rem',
              fontWeight: 500,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'rgba(var(--fundly-primary-rgb),0.48)',
            }}
          >
            {monthLabel}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              {
                label: 'Budget',
                value: hasMonthlyBudget ? formattedBudget : 'Not set',
              },
              {
                label: 'Remaining',
                value: hasMonthlyBudget ? demoRemainingAmount : 'Not set',
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  borderRadius: '14px',
                  background: 'var(--fundly-canvas)',
                  padding: '12px',
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.72rem',
                    fontWeight: 500,
                    color: 'rgba(var(--fundly-primary-rgb),0.52)',
                  }}
                >
                  {label}
                </p>
                <p
                  style={{
                    margin: '6px 0 0',
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: 'var(--fundly-deep)',
                  }}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.78rem', color: 'rgba(var(--fundly-primary-rgb),0.6)' }}>Spent</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--fundly-deep)' }}>{demoSpentPct}%</span>
            </div>
            <div
              style={{
                height: '8px',
                borderRadius: '999px',
                background: 'rgba(var(--fundly-primary-rgb),0.08)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${demoSpentPct}%`,
                  borderRadius: '999px',
                  background: demoSpentPct >= 85 ? 'var(--fundly-warm)' : 'var(--fundly-accent)',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <QuietIconButton
              alt="Edit"
              icon={editIcon}
              onClick={() => onEdit(category)}
              title="Edit category"
            />
            {!category.is_archived ? (
              <QuietIconButton
                alt="Archive"
                disabled={isArchiving}
                icon={archiveIcon}
                onClick={() => onArchive(category)}
                title={isArchiving ? 'Archiving...' : 'Archive category'}
                tone="accent"
              />
            ) : (
              <QuietIconButton
                alt="Unarchive"
                disabled={isUnarchiving}
                icon={unarchiveIcon}
                onClick={() => onUnarchive(category)}
                title={isUnarchiving ? 'Unarchiving...' : 'Unarchive category'}
                tone="accent"
              />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
