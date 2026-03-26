import { useEffect, useState } from 'react';
import AppPageHeader from '../../components/app/AppPageHeader';
import AppSurface from '../../components/app/AppSurface';
import StatusMessage from '../../components/auth/StatusMessage';
import { useAuthSession } from '../../lib/auth-context';
import { defaultCategoryColor } from '../../lib/categories';
import { loadHomeDashboard } from '../../lib/home';
import { defaultBaseCurrency, formatTransactionAmount, formatTransactionDate } from '../../lib/transactions';

function getDisplayName(email) {
  if (!email) {
    return 'there';
  }

  return email.split('@')[0];
}

function formatSignedAmount(transaction) {
  const formattedAmount = formatTransactionAmount(transaction.amountOriginal, transaction.currencyCode || defaultBaseCurrency);

  if (transaction.transactionKind === 'income') {
    return `+${formattedAmount}`;
  }

  if (transaction.transactionKind === 'expense') {
    return `-${formattedAmount}`;
  }

  return formattedAmount;
}

function SummarySkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <AppSurface key={index} className="animate-pulse p-4">
          <div className="h-3 w-28 rounded-full bg-[rgba(var(--fundly-primary-rgb),0.10)]" />
          <div className="mt-4 h-8 w-32 rounded-full bg-[rgba(var(--fundly-primary-rgb),0.12)]" />
          <div className="mt-3 h-4 w-40 rounded-full bg-[rgba(var(--fundly-primary-rgb),0.08)]" />
        </AppSurface>
      ))}
    </div>
  );
}

function SurfaceSkeleton({ rows = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-[1.3rem] border border-[rgba(var(--fundly-primary-rgb),0.12)] bg-white/70 px-4 py-4"
        >
          <div className="h-5 w-32 rounded-full bg-[rgba(var(--fundly-primary-rgb),0.10)]" />
          <div className="mt-3 h-4 w-44 rounded-full bg-[rgba(var(--fundly-primary-rgb),0.08)]" />
          <div className="mt-4 h-3 rounded-full bg-[rgba(var(--fundly-primary-rgb),0.08)]" />
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  const { user } = useAuthSession();
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  async function loadDashboard() {
    if (!user?.id) {
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const nextDashboard = await loadHomeDashboard({ userId: user.id });
      setDashboard(nextDashboard);
    } catch (loadError) {
      setError(loadError?.message || 'We could not load your dashboard right now.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    void loadDashboard();
  }, [user?.id]);

  const summaryCards = dashboard
    ? [
        {
          label: 'Income this month',
          value: formatTransactionAmount(dashboard.summary.totalIncome, defaultBaseCurrency),
          detail: `Recorded income entries for ${dashboard.monthLabel}.`,
        },
        {
          label: 'Expenses this month',
          value: formatTransactionAmount(dashboard.summary.totalExpenses, defaultBaseCurrency),
          detail: 'Calculated from amount_base across this month\'s transactions.',
        },
        {
          label: 'Savings balance',
          value: formatTransactionAmount(dashboard.summary.savingsBalance, defaultBaseCurrency),
          detail: 'Pulled directly from your profile savings balance.',
        },
      ]
    : [];

  const budgetHighlights = dashboard?.budgetHighlights;
  const recentTransactions = dashboard?.recentTransactions ?? [];

  return (
    <div className="space-y-5">
      <AppPageHeader
        eyebrow="Home"
        title={`Welcome back, ${getDisplayName(user?.email)}.`}
        description="Current-month totals, recent activity, and budget pressure from your real Supabase data."
      />

      <StatusMessage tone={error ? 'error' : undefined} message={error} />

      {isLoading ? (
        <SummarySkeleton />
      ) : summaryCards.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
          {summaryCards.map((item) => (
            <AppSurface key={item.label} className="p-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--fundly-accent)]">{item.label}</p>
              <p className="mt-3 text-2xl font-bold tracking-[-0.03em] text-[var(--fundly-primary)]">{item.value}</p>
              <p className="mt-2 text-sm leading-6 text-[rgba(var(--fundly-primary-rgb),0.7)]">{item.detail}</p>
            </AppSurface>
          ))}
        </div>
      ) : null}

      {!isLoading && error && !dashboard ? (
        <AppSurface
          eyebrow="Dashboard"
          title="Home data is unavailable"
          description="Fundly could not load your current dashboard. Try again in a moment."
          action={
            <button
              type="button"
              onClick={() => void loadDashboard()}
              className="inline-flex items-center justify-center rounded-full border border-[var(--fundly-accent)] bg-[linear-gradient(180deg,var(--fundly-primary)_0%,var(--fundly-primary-soft)_46%,var(--fundly-deep)_100%)] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--fundly-surface)] transition hover:-translate-y-0.5"
            >
              Retry
            </button>
          }
        />
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <AppSurface
          eyebrow="Recent Activity"
          title="Latest transactions"
          description="Newest transactions first from your real transaction feed."
        >
          {isLoading ? (
            <SurfaceSkeleton rows={5} />
          ) : recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {recentTransactions.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 rounded-[1.3rem] border border-[rgba(var(--fundly-primary-rgb),0.12)] bg-white/70 px-4 py-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: item.categoryColor || defaultCategoryColor }}
                        aria-hidden="true"
                      />
                      <p className="truncate font-bold text-[var(--fundly-primary)]">{item.title}</p>
                    </div>
                    <p className="mt-1 text-sm text-[rgba(var(--fundly-primary-rgb),0.7)]">
                      {item.categoryName} . {formatTransactionDate(item.transactionDate)}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-bold text-[var(--fundly-primary)]">{formatSignedAmount(item)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[1.3rem] border border-[rgba(var(--fundly-primary-rgb),0.12)] bg-white/70 px-4 py-5">
              <p className="font-bold text-[var(--fundly-primary)]">No transactions yet</p>
              <p className="mt-2 text-sm leading-6 text-[rgba(var(--fundly-primary-rgb),0.7)]">
                Once you start recording transactions, your latest activity will appear here.
              </p>
            </div>
          )}
        </AppSurface>

        <AppSurface
          eyebrow="Budget Focus"
          title="What stands out this month"
          description="Categories nearest their budget limit, plus active spending categories that still have no monthly budget."
        >
          {isLoading ? (
            <SurfaceSkeleton rows={3} />
          ) : budgetHighlights?.topBudgetedCategories?.length || budgetHighlights?.categoriesWithoutBudget?.length ? (
            <div className="space-y-3">
              {budgetHighlights.topBudgetedCategories.map((item) => {
                const isOverBudget = item.remaining < 0;
                const progressWidth = `${Math.max(6, Math.min(item.percentUsed, 100))}%`;

                return (
                  <div
                    key={item.id}
                    className="rounded-[1.3rem] border border-[rgba(var(--fundly-primary-rgb),0.12)] bg-white/70 px-4 py-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-3 w-3 shrink-0 rounded-full"
                            style={{ backgroundColor: item.color || defaultCategoryColor }}
                            aria-hidden="true"
                          />
                          <p className="truncate font-bold text-[var(--fundly-primary)]">{item.name}</p>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-[rgba(var(--fundly-primary-rgb),0.72)]">
                          {formatTransactionAmount(item.spent, defaultBaseCurrency)} spent of{' '}
                          {formatTransactionAmount(item.budgetLimit, defaultBaseCurrency)}.
                        </p>
                      </div>
                      <span
                        className="shrink-0 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.16em]"
                        style={{
                          backgroundColor: isOverBudget ? 'rgba(var(--fundly-warm-rgb),0.12)' : 'rgba(var(--fundly-accent-rgb),0.12)',
                          color: isOverBudget ? 'var(--fundly-warm)' : 'var(--fundly-accent)',
                        }}
                      >
                        {Math.round(item.percentUsed)}%
                      </span>
                    </div>
                    <div className="mt-4 h-3 rounded-full bg-[rgba(var(--fundly-primary-rgb),0.10)]">
                      <div
                        className="h-3 rounded-full"
                        style={{
                          width: progressWidth,
                          background: isOverBudget
                            ? 'linear-gradient(90deg, var(--fundly-warm) 0%, var(--fundly-accent) 100%)'
                            : 'linear-gradient(90deg, var(--fundly-accent) 0%, var(--fundly-primary) 58%, var(--fundly-deep) 100%)',
                        }}
                      />
                    </div>
                    <p className="mt-3 text-sm font-medium text-[rgba(var(--fundly-primary-rgb),0.72)]">
                      {isOverBudget
                        ? `Over budget by ${formatTransactionAmount(Math.abs(item.remaining), defaultBaseCurrency)}.`
                        : `${formatTransactionAmount(item.remaining, defaultBaseCurrency)} remaining.`}
                    </p>
                  </div>
                );
              })}

              {budgetHighlights.categoriesWithoutBudget.length > 0 ? (
                <div className="rounded-[1.3rem] border border-[rgba(var(--fundly-primary-rgb),0.12)] bg-white/70 px-4 py-4">
                  <p className="font-bold text-[var(--fundly-primary)]">No monthly budget set</p>
                  <p className="mt-2 text-sm leading-6 text-[rgba(var(--fundly-primary-rgb),0.72)]">
                    {budgetHighlights.categoriesWithoutBudget
                      .map((item) => item.name)
                      .join(', ')}
                    {budgetHighlights.categoriesWithoutBudgetCount > budgetHighlights.categoriesWithoutBudget.length
                      ? ` and ${budgetHighlights.categoriesWithoutBudgetCount - budgetHighlights.categoriesWithoutBudget.length} more`
                      : ''}
                    .
                  </p>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="rounded-[1.3rem] border border-[rgba(var(--fundly-primary-rgb),0.12)] bg-white/70 px-4 py-5">
              <p className="font-bold text-[var(--fundly-primary)]">No budget highlights yet</p>
              <p className="mt-2 text-sm leading-6 text-[rgba(var(--fundly-primary-rgb),0.7)]">
                Add monthly budgets to your active categories to see which ones are closest to the limit.
              </p>
            </div>
          )}
        </AppSurface>
      </div>
    </div>
  );
}
