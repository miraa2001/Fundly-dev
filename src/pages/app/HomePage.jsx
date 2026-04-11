import { useEffect, useState } from 'react';
import AppPageHeader from '../../components/app/AppPageHeader';
import AppSurface from '../../components/app/AppSurface';
import StatusMessage from '../../components/auth/StatusMessage';
import { useAuthSession } from '../../lib/auth-context';
import { subscribeMoneyDataUpdated } from '../../lib/app-events';
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
          className="animate-pulse rounded-[1.1rem] bg-[var(--fundly-canvas)] px-4 py-4"
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

  useEffect(() => {
    if (!user?.id) {
      return undefined;
    }

    return subscribeMoneyDataUpdated(() => {
      void loadDashboard();
    });
  }, [user?.id]);

  const summaryCards = dashboard
    ? [
        {
          label: 'Income this month',
          value: formatTransactionAmount(
            dashboard.summary.totalIncome,
            dashboard.summary.incomeBaseCurrencyCode || defaultBaseCurrency,
          ),
          detail: `Income recorded in ${dashboard.monthLabel}.`,
        },
        {
          label: 'Expenses this month',
          value: formatTransactionAmount(
            dashboard.summary.totalExpenses,
            dashboard.summary.expenseBaseCurrencyCode || defaultBaseCurrency,
          ),
          detail: 'Spending recorded this month.',
        },
        {
          label: 'Savings balance',
          value: formatTransactionAmount(
            dashboard.summary.savingsBalance,
            dashboard.summary.savingsBalanceCurrencyCode || defaultBaseCurrency,
          ),
          detail: 'Current profile balance.',
        },
      ]
    : [];

  const budgetHighlights = dashboard?.budgetHighlights;
  const recentTransactions = dashboard?.recentTransactions ?? [];
  const expenseBaseCurrencyCode = dashboard?.summary?.expenseBaseCurrencyCode || defaultBaseCurrency;

  return (
    <div className="space-y-6">
      <AppPageHeader
        eyebrow="Home"
        title={`Welcome back, ${getDisplayName(user?.email)}.`}
        description="This month at a glance."
      />

      <StatusMessage tone={error ? 'error' : undefined} message={error} />

      {isLoading ? (
        <SummarySkeleton />
      ) : summaryCards.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
          {summaryCards.map((item) => (
            <AppSurface key={item.label} className="p-4">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-[rgba(var(--fundly-primary-rgb),0.56)]">{item.label}</p>
              <p className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[var(--fundly-deep)]">{item.value}</p>
              <p className="mt-2 text-sm leading-6 text-[rgba(var(--fundly-primary-rgb),0.68)]">{item.detail}</p>
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
              className="fundly-button-primary"
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
          description="Newest first."
        >
          {isLoading ? (
            <SurfaceSkeleton rows={5} />
          ) : recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {recentTransactions.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 rounded-[1.1rem] bg-[var(--fundly-canvas)] px-4 py-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: item.categoryColor || defaultCategoryColor }}
                        aria-hidden="true"
                      />
                      <p className="truncate font-medium text-[var(--fundly-deep)]">{item.title}</p>
                    </div>
                    <p className="mt-1 text-sm text-[rgba(var(--fundly-primary-rgb),0.7)]">
                      {item.categoryName} - {formatTransactionDate(item.transactionDate)}
                      {item.isFromSavings ? ' - From savings' : ''}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-medium text-[var(--fundly-deep)]">{formatSignedAmount(item)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[1.1rem] bg-[var(--fundly-canvas)] px-4 py-5">
              <p className="font-medium text-[var(--fundly-deep)]">No transactions yet</p>
              <p className="mt-2 text-sm leading-6 text-[rgba(var(--fundly-primary-rgb),0.7)]">
                Recent activity will appear here.
              </p>
            </div>
          )}
        </AppSurface>

        <AppSurface
          eyebrow="Budget Focus"
          title="Budget highlights"
          description="Closest to this month's limits."
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
                    className="rounded-[1.1rem] bg-[var(--fundly-canvas)] px-4 py-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-3 w-3 shrink-0 rounded-full"
                            style={{ backgroundColor: item.color || defaultCategoryColor }}
                            aria-hidden="true"
                          />
                          <p className="truncate font-medium text-[var(--fundly-deep)]">{item.name}</p>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-[rgba(var(--fundly-primary-rgb),0.72)]">
                          {formatTransactionAmount(item.spent, expenseBaseCurrencyCode)} spent of{' '}
                          {formatTransactionAmount(item.budgetLimit, expenseBaseCurrencyCode)}.
                        </p>
                      </div>
                      <span
                        className="shrink-0 rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.14em]"
                        style={{
                          backgroundColor: isOverBudget ? 'rgba(var(--fundly-warm-rgb),0.08)' : 'rgba(var(--fundly-accent-rgb),0.08)',
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
                          background: isOverBudget ? 'var(--fundly-warm)' : 'var(--fundly-accent)',
                        }}
                      />
                    </div>
                    <p className="mt-3 text-sm text-[rgba(var(--fundly-primary-rgb),0.72)]">
                      {isOverBudget
                        ? `Over budget by ${formatTransactionAmount(Math.abs(item.remaining), expenseBaseCurrencyCode)}.`
                        : `${formatTransactionAmount(item.remaining, expenseBaseCurrencyCode)} remaining.`}
                    </p>
                  </div>
                );
              })}

              {budgetHighlights.categoriesWithoutBudget.length > 0 ? (
                <div className="rounded-[1.1rem] bg-[var(--fundly-canvas)] px-4 py-4">
                  <p className="font-medium text-[var(--fundly-deep)]">No monthly budget set</p>
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
            <div className="rounded-[1.1rem] bg-[var(--fundly-canvas)] px-4 py-5">
              <p className="font-medium text-[var(--fundly-deep)]">No budget highlights yet</p>
              <p className="mt-2 text-sm leading-6 text-[rgba(var(--fundly-primary-rgb),0.7)]">
                Add monthly budgets to compare spending against limits.
              </p>
            </div>
          )}
        </AppSurface>
      </div>
    </div>
  );
}
