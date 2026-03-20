import archiveIcon from '../../../../archive_icon.png';
import editIcon from '../../../../edit_icon.png';
import unarchiveIcon from '../../../../unarchive_icon.png';
import AppSurface from '../AppSurface';
import { formatCategoryKind, formatMonthKey, getCategoryAccentColor } from '../../../lib/categories';

const actionButtonClassName =
  'inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] transition disabled:cursor-not-allowed disabled:opacity-70';

const infoTileClassName = 'rounded-[1.15rem] border border-[#d3efed] bg-white/80 p-3';

function formatBudgetAmount(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return value;
  }

  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
  }).format(numericValue);
}

function getDemoSpentPercentage(category) {
  const seed = `${category.id}-${category.name}-${category.kind}`;
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 10007;
  }

  return 24 + (hash % 61);
}

function CategoryActionButton({ icon, label, className, ...props }) {
  return (
    <button type="button" className={className} {...props}>
      <img src={icon} alt="" aria-hidden="true" className="h-4 w-4 object-contain" />
      <span>{label}</span>
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
  const demoSpentPercentage = getDemoSpentPercentage(category);
  const numericBudget = Number(category.currentMonthBudget);
  const hasMonthlyBudget = Number.isFinite(numericBudget);
  const formattedBudget = hasMonthlyBudget ? formatBudgetAmount(numericBudget) : null;
  const demoSpentAmount = hasMonthlyBudget ? formatBudgetAmount((numericBudget * demoSpentPercentage) / 100) : null;
  const demoRemainingAmount = hasMonthlyBudget
    ? formatBudgetAmount(Math.max(numericBudget - (numericBudget * demoSpentPercentage) / 100, 0))
    : null;
  const detailsId = `category-details-${category.id}`;

  return (
    <AppSurface
      className={[
        'overflow-hidden p-0 transition-all duration-500',
        category.is_archived
          ? 'border-[#e7d2cf] bg-[linear-gradient(180deg,rgba(255,251,250,0.96),rgba(247,239,236,0.9))]'
          : '',
        isExpanded
          ? 'border-[#44e8f4]/45 shadow-[0_24px_52px_rgba(4,27,34,0.14)] ring-1 ring-[#44e8f4]/14'
          : 'hover:-translate-y-0.5 hover:shadow-[0_20px_42px_rgba(4,27,34,0.12)]',
      ].join(' ')}
    >
      <div className="relative">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-32"
          style={{
            background: `linear-gradient(135deg, ${accentColor} 0%, rgba(8,55,71,0.96) 58%, rgba(68,232,244,0.34) 100%)`,
          }}
        />
        <div className="pointer-events-none absolute -left-8 top-8 h-28 w-28 rounded-full bg-white/12 blur-2xl" />
        <div className="pointer-events-none absolute right-4 top-4 h-20 w-20 rounded-full border border-white/18 bg-white/10" />

        <button
          type="button"
          onClick={() => onToggle(category.id)}
          aria-expanded={isExpanded}
          aria-controls={detailsId}
          className="relative w-full text-left"
        >
          <div className="p-4">
            <div className="rounded-[1.45rem] border border-white/12 bg-[linear-gradient(180deg,rgba(7,42,51,0.66),rgba(7,42,51,0.36))] p-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm transition duration-500">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div
                    className={[
                      'mt-1 flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.4rem] border border-white/55 shadow-[0_12px_24px_rgba(7,42,51,0.22),inset_0_1px_0_rgba(255,255,255,0.35)] transition-all duration-500',
                      isExpanded ? 'scale-[1.05] rounded-[1.7rem]' : '',
                    ].join(' ')}
                    style={{
                      background: `linear-gradient(160deg, ${accentColor} 0%, rgba(255,255,255,0.34) 100%)`,
                    }}
                    aria-hidden="true"
                  >
                    <div className="h-6 w-6 rounded-[0.7rem] border border-white/35 bg-[#fff2c8]/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-lg font-bold tracking-[-0.03em] text-white">{category.name}</h3>
                      <span className="rounded-full bg-white/14 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[#eafcff]">
                        {formatCategoryKind(category.kind)}
                      </span>
                      {category.is_archived ? (
                        <span className="rounded-full bg-[#fff2ec]/18 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[#fff2ec]">
                          Archived
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-2 text-sm leading-6 text-[#e7f9fb]">
                      {hasMonthlyBudget ? `Monthly budget: ${formattedBudget}` : 'No monthly budget set'}
                    </p>
                  </div>
                </div>

                <span className="shrink-0 rounded-full border border-white/18 bg-white/10 px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[#e7f9fb]">
                  {isExpanded ? 'Hide details' : 'View details'}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 rounded-[1.2rem] border border-white/12 bg-white/10 px-3 py-3">
                <div>
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[#baf5ff]">{monthLabel}</p>
                  <p className="mt-1 text-sm font-semibold text-white">Budget spent preview</p>
                </div>

                <div className="min-w-[88px] text-right">
                  <p className="text-lg font-bold text-white">{demoSpentPercentage}%</p>
                  <p className="text-[0.7rem] text-[#e7f9fb]">Demo pace</p>
                </div>
              </div>
            </div>
          </div>
        </button>

        <div
          className={[
            'grid transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
            isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
          ].join(' ')}
        >
          <div id={detailsId} className="overflow-hidden">
            <div className="px-4 pb-4">
              <div className="rounded-[1.45rem] border border-[#d3efed] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(239,251,248,0.88))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className={infoTileClassName}>
                    <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[#087f98]">Status</p>
                    <p className="mt-2 text-sm font-bold text-[#16323b]">{category.is_archived ? 'Archived' : 'Active'}</p>
                    <p className="mt-1 text-xs leading-5 text-[#5a727b]">
                      {category.is_archived ? 'Hidden from the default list until restored.' : 'Ready for live budgeting and tracking.'}
                    </p>
                  </div>

                  <div className={infoTileClassName}>
                    <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[#087f98]">Budget</p>
                    <p className="mt-2 text-sm font-bold text-[#16323b]">{hasMonthlyBudget ? formattedBudget : 'Not set'}</p>
                    <p className="mt-1 text-xs leading-5 text-[#5a727b]">Current month target for {monthLabel}.</p>
                  </div>

                  <div className={infoTileClassName}>
                    <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[#087f98]">Kind</p>
                    <p className="mt-2 text-sm font-bold text-[#16323b]">{formatCategoryKind(category.kind)}</p>
                    <p className="mt-1 text-xs leading-5 text-[#5a727b]">Used to group budget rules and future transaction flows.</p>
                  </div>
                </div>

                <div className="mt-4 rounded-[1.25rem] border border-[#d3efed] bg-white/85 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[#087f98]">Budget spent</p>
                      <p className="mt-1 text-xl font-bold tracking-[-0.03em] text-[#16323b]">{demoSpentPercentage}%</p>
                    </div>

                    <p className="max-w-[16rem] text-right text-xs leading-5 text-[#5a727b]">
                      {hasMonthlyBudget
                        ? `Demo usage preview for ${monthLabel}.`
                        : 'Demo preview only until a monthly budget is set.'}
                    </p>
                  </div>

                  <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#dff4f2]">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#44e8f4_0%,#15aeca_58%,#0a6a83_100%)] transition-all duration-700"
                      style={{ width: `${demoSpentPercentage}%` }}
                    />
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className={infoTileClassName}>
                      <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[#087f98]">Demo spent</p>
                      <p className="mt-2 text-sm font-bold text-[#16323b]">
                        {hasMonthlyBudget ? demoSpentAmount : `${demoSpentPercentage}% pace`}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[#5a727b]">
                        {hasMonthlyBudget ? 'Estimated amount used from this month budget.' : 'Placeholder usage rate until real transactions are connected.'}
                      </p>
                    </div>

                    <div className={infoTileClassName}>
                      <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[#087f98]">Remaining</p>
                      <p className="mt-2 text-sm font-bold text-[#16323b]">
                        {hasMonthlyBudget ? demoRemainingAmount : 'Set budget'}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[#5a727b]">
                        {hasMonthlyBudget ? 'Preview of what would still be available this month.' : 'Add a monthly budget to unlock this calculation.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <CategoryActionButton
                    icon={editIcon}
                    label="Edit"
                    onClick={() => onEdit(category)}
                    className={`${actionButtonClassName} border-[#d3efed] bg-white text-[#16323b] hover:border-[#35d9ef]/40 hover:text-[#087f98]`}
                  />

                  {!category.is_archived ? (
                    <CategoryActionButton
                      icon={archiveIcon}
                      label={isArchiving ? 'Archiving...' : 'Archive'}
                      onClick={() => onArchive(category)}
                      disabled={isArchiving}
                      className={`${actionButtonClassName} border-[#efc7b8] bg-[#fff2ec] text-[#934d33] hover:border-[#e3a28a]`}
                    />
                  ) : (
                    <CategoryActionButton
                      icon={unarchiveIcon}
                      label={isUnarchiving ? 'Unarchiving...' : 'Unarchive'}
                      onClick={() => onUnarchive(category)}
                      disabled={isUnarchiving}
                      className={`${actionButtonClassName} border-[#efc7b8] bg-[#fff2ec] text-[#934d33] hover:border-[#e3a28a]`}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppSurface>
  );
}
