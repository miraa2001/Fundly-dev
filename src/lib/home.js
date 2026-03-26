import { listCategories } from './categories';
import { PLANNED_STATUS, normalizePlannedStatus } from './planned';
import { ensureSupabase } from './supabase';

const recentTransactionColumns =
  'id, title, merchant_or_source, transaction_kind, amount_original, currency_code, amount_base, transaction_date, created_at, transaction_splits(id, amount_base, category:categories(id, name, color, is_archived))';
const monthlyExpenseColumns =
  'id, amount_base, transaction_date, transaction_splits(id, amount_base, category:categories(id, name, color, is_archived))';
const incomeEntryColumns = 'id, amount_base, entry_date';
const plannedTransactionColumns = 'id, planned_date, status';
const profileColumns = 'id, savings_balance';

function formatDateOnly(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function toNumber(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function getPrimaryCategory(transaction) {
  const [primarySplit] = transaction.transaction_splits ?? [];
  return primarySplit?.category ?? null;
}

function getTransactionTitle(transaction) {
  const normalizedTitle = transaction.title?.trim();
  const normalizedMerchant = transaction.merchant_or_source?.trim();

  return normalizedTitle || normalizedMerchant || 'Untitled transaction';
}

function isOpenPlannedItem(status) {
  const normalizedStatus = normalizePlannedStatus(status);

  if (!normalizedStatus) {
    return true;
  }

  return normalizedStatus === PLANNED_STATUS.PENDING;
}

function buildCategorySpendMap(transactions) {
  const spendByCategoryId = new Map();

  for (const transaction of transactions) {
    for (const split of transaction.transaction_splits ?? []) {
      const categoryId = split.category?.id;

      if (!categoryId) {
        continue;
      }

      const previousSpend = spendByCategoryId.get(categoryId) ?? 0;
      const nextSpend = previousSpend + toNumber(split.amount_base);
      spendByCategoryId.set(categoryId, nextSpend);
    }
  }

  return spendByCategoryId;
}

function buildBudgetHighlights({ categories, monthlyExpenseTransactions }) {
  const spendingCategories = categories.filter((category) => String(category.kind ?? '').toLowerCase() !== 'income');
  const spendByCategoryId = buildCategorySpendMap(monthlyExpenseTransactions);

  const budgetedCategories = spendingCategories
    .filter((category) => category.currentMonthBudget !== null && category.currentMonthBudget !== undefined)
    .map((category) => {
      const spent = spendByCategoryId.get(category.id) ?? 0;
      const budgetLimit = toNumber(category.currentMonthBudget);
      const remaining = budgetLimit - spent;
      const percentUsed = budgetLimit > 0 ? (spent / budgetLimit) * 100 : 0;

      return {
        id: category.id,
        name: category.name,
        color: category.color,
        spent,
        budgetLimit,
        remaining,
        percentUsed,
      };
    })
    .sort((left, right) => {
      if (right.percentUsed !== left.percentUsed) {
        return right.percentUsed - left.percentUsed;
      }

      if (left.remaining !== right.remaining) {
        return left.remaining - right.remaining;
      }

      return right.spent - left.spent;
    });

  const categoriesWithoutBudget = spendingCategories
    .filter((category) => category.currentMonthBudget === null || category.currentMonthBudget === undefined)
    .map((category) => ({
      id: category.id,
      name: category.name,
      color: category.color,
      spent: spendByCategoryId.get(category.id) ?? 0,
    }))
    .sort((left, right) => {
      if (right.spent !== left.spent) {
        return right.spent - left.spent;
      }

      return left.name.localeCompare(right.name);
    });

  return {
    trackedCategoryCount: spendingCategories.length,
    topBudgetedCategories: budgetedCategories.slice(0, 3),
    categoriesWithoutBudgetCount: categoriesWithoutBudget.length,
    categoriesWithoutBudget: categoriesWithoutBudget.slice(0, 3),
  };
}

export function getCurrentMonthRange(date = new Date()) {
  const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
  const endDateExclusive = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  const monthLabel = new Intl.DateTimeFormat(undefined, {
    month: 'long',
    year: 'numeric',
  }).format(startDate);

  return {
    startDate: formatDateOnly(startDate),
    endDateExclusive: formatDateOnly(endDateExclusive),
    monthLabel,
  };
}

export async function loadHomeDashboard({ userId, recentLimit = 5, date = new Date() }) {
  const client = ensureSupabase();
  const { startDate, endDateExclusive, monthLabel } = getCurrentMonthRange(date);

  const [
    { data: monthlyExpenseTransactions, error: monthlyExpenseError },
    { data: incomeEntries, error: incomeError },
    { data: plannedTransactions, error: plannedError },
    { data: recentTransactions, error: recentError },
    { data: profile, error: profileError },
    categories,
  ] = await Promise.all([
    client
      .from('transactions')
      .select(monthlyExpenseColumns)
      .eq('transaction_kind', 'expense')
      .gte('transaction_date', startDate)
      .lt('transaction_date', endDateExclusive),
    client
      .from('income_entries')
      .select(incomeEntryColumns)
      .gte('entry_date', startDate)
      .lt('entry_date', endDateExclusive),
    client
      .from('planned_transactions')
      .select(plannedTransactionColumns)
      .gte('planned_date', startDate)
      .lt('planned_date', endDateExclusive),
    client
      .from('transactions')
      .select(recentTransactionColumns)
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(recentLimit),
    client
      .from('profiles')
      .select(profileColumns)
      .eq('id', userId)
      .limit(1)
      .maybeSingle(),
    listCategories({ includeArchived: false }),
  ]);

  if (monthlyExpenseError) {
    throw monthlyExpenseError;
  }

  if (incomeError) {
    throw incomeError;
  }

  if (plannedError) {
    throw plannedError;
  }

  if (recentError) {
    throw recentError;
  }

  if (profileError) {
    throw profileError;
  }

  const totalIncome = (incomeEntries ?? []).reduce((sum, item) => sum + toNumber(item.amount_base), 0);
  const totalExpenses = (monthlyExpenseTransactions ?? []).reduce((sum, item) => sum + toNumber(item.amount_base), 0);
  const plannedItemsCount = (plannedTransactions ?? []).filter((item) => isOpenPlannedItem(item.status)).length;
  const savingsBalance = toNumber(profile?.savings_balance);
  const budgetHighlights = buildBudgetHighlights({
    categories,
    monthlyExpenseTransactions: monthlyExpenseTransactions ?? [],
  });

  return {
    monthLabel,
    summary: {
      totalIncome,
      totalExpenses,
      plannedItemsCount,
      savingsBalance,
    },
    recentTransactions: (recentTransactions ?? []).map((transaction) => {
      const category = getPrimaryCategory(transaction);

      return {
        id: transaction.id,
        title: getTransactionTitle(transaction),
        transactionKind: transaction.transaction_kind,
        amountOriginal: toNumber(transaction.amount_original),
        amountBase: toNumber(transaction.amount_base),
        currencyCode: transaction.currency_code,
        transactionDate: transaction.transaction_date,
        categoryName: category?.name ?? 'Uncategorized',
        categoryColor: category?.color ?? null,
      };
    }),
    budgetHighlights,
  };
}
