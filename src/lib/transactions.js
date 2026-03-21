import { ensureSupabase } from './supabase';

const transactionColumns =
  'id, user_id, transaction_kind, origin, title, amount_original, currency_code, conversion_rate, amount_base, base_currency_code, transaction_date, note, merchant_or_source, is_from_savings, created_at, updated_at';
const transactionSplitColumns = 'id, transaction_id, category_id, amount_original, amount_base, note, created_at, updated_at';
const transactionListColumns = `${transactionColumns}, transaction_splits(${transactionSplitColumns}, category:categories(id, name, color))`;

export const defaultTransactionCurrency = 'NIS';
export const defaultBaseCurrency = 'NIS';
export const supportedTransactionCurrencies = [defaultTransactionCurrency];
export const transactionsPageSize = 8;

function normalizeOptionalText(value) {
  const trimmedValue = value?.trim() ?? '';
  return trimmedValue ? trimmedValue : null;
}

function normalizeCurrencyCode(value) {
  const nextCurrencyCode = value?.trim().toUpperCase() ?? '';
  return nextCurrencyCode || defaultTransactionCurrency;
}

function normalizeStoredAmount(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    throw new Error('Enter a valid transaction amount.');
  }

  return numericValue.toFixed(2);
}

function getConversionRate(currencyCode) {
  if (currencyCode === defaultBaseCurrency) {
    return 1;
  }

  return 1;
}

function getBaseAmount(amountOriginal, conversionRate) {
  return (Number(amountOriginal) * Number(conversionRate)).toFixed(2);
}

function getTransactionCategory(transaction) {
  const [primarySplit] = transaction.transaction_splits ?? [];
  return primarySplit?.category ?? null;
}

async function bestEffortDeleteTransaction(id) {
  const client = ensureSupabase();

  await client
    .from('transactions')
    .delete()
    .eq('id', id);
}

export function getTodayDateInputValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function formatTransactionDate(value) {
  if (!value) {
    return 'No date';
  }

  const parsedDate = new Date(`${value}T12:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsedDate);
}

export function formatTransactionAmount(value, currencyCode = defaultTransactionCurrency) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return value ? `${value} ${currencyCode}` : `0 ${currencyCode}`;
  }

  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode,
    }).format(numericValue);
  } catch {
    return `${numericValue.toFixed(2)} ${currencyCode}`;
  }
}

export async function listTransactions({ page = 1, pageSize = transactionsPageSize } = {}) {
  const client = ensureSupabase();
  const safePage = Math.max(1, Number(page) || 1);
  const safePageSize = Math.max(1, Number(pageSize) || transactionsPageSize);
  const rangeStart = (safePage - 1) * safePageSize;
  const rangeEnd = rangeStart + safePageSize - 1;

  const { data, error, count } = await client
    .from('transactions')
    .select(transactionListColumns, { count: 'exact' })
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false })
    .range(rangeStart, rangeEnd);

  if (error) {
    throw error;
  }

  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / safePageSize));
  const transactions = (data ?? []).map((transaction) => {
    const category = getTransactionCategory(transaction);
    const [primarySplit] = transaction.transaction_splits ?? [];

    return {
      ...transaction,
      primarySplit: primarySplit ?? null,
      categoryName: category?.name ?? 'Unknown category',
      categoryColor: category?.color ?? null,
    };
  });

  return {
    data: transactions,
    count: totalCount,
    page: safePage,
    pageSize: safePageSize,
    totalPages,
  };
}

export async function createTransaction({ userId, values }) {
  const client = ensureSupabase();
  const currencyCode = normalizeCurrencyCode(values.currency);
  const amountOriginal = normalizeStoredAmount(values.amount);
  const conversionRate = getConversionRate(currencyCode);
  const amountBase = getBaseAmount(amountOriginal, conversionRate);

  const { data, error } = await client
    .from('transactions')
    .insert({
      user_id: userId,
      title: normalizeOptionalText(values.title),
      amount_original: amountOriginal,
      currency_code: currencyCode,
      conversion_rate: conversionRate,
      amount_base: amountBase,
      base_currency_code: defaultBaseCurrency,
      transaction_date: values.transactionDate,
      note: normalizeOptionalText(values.note),
      merchant_or_source: normalizeOptionalText(values.merchantOrSource),
      is_from_savings: Boolean(values.isFromSavings),
      transaction_kind: 'expense',
      origin: 'manual',
      updated_at: new Date().toISOString(),
    })
    .select(transactionColumns)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function createTransactionSplit({ transactionId, categoryId, amountOriginal, amountBase, note }) {
  const client = ensureSupabase();
  const { data, error } = await client
    .from('transaction_splits')
    .insert({
      transaction_id: transactionId,
      category_id: categoryId,
      amount_original: normalizeStoredAmount(amountOriginal),
      amount_base: normalizeStoredAmount(amountBase),
      note: normalizeOptionalText(note),
      updated_at: new Date().toISOString(),
    })
    .select(transactionSplitColumns)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function createTransactionWithSplit({ userId, values }) {
  const transaction = await createTransaction({ userId, values });

  try {
    const split = await createTransactionSplit({
      transactionId: transaction.id,
      categoryId: values.categoryId,
      amountOriginal: transaction.amount_original,
      amountBase: transaction.amount_base,
      note: values.note,
    });

    return {
      transaction,
      split,
    };
  } catch (error) {
    try {
      await bestEffortDeleteTransaction(transaction.id);
    } catch {
      // Ignore cleanup failures and surface the original split error.
    }

    throw error;
  }
}
