import { ensureSupabase } from './supabase';
import {
  createTransactionWithSplit,
  defaultBaseCurrency,
  defaultTransactionCurrency,
  formatTransactionAmount,
  formatTransactionDate,
  getTodayDateInputValue,
} from './transactions';

const plannedTransactionColumns =
  'id, user_id, title, amount_original, currency_code, conversion_rate, amount_base, base_currency_code, planned_date, status, note, merchant_or_source, created_transaction_id, created_at, updated_at';
const plannedTransactionSplitColumns = 'id, planned_transaction_id, category_id, amount_original, amount_base, note, created_at, updated_at';
const plannedTransactionListColumns =
  `${plannedTransactionColumns}, planned_transaction_splits(${plannedTransactionSplitColumns}, category:categories(id, name, color))`;

export const PLANNED_STATUS = Object.freeze({
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
});

const confirmedPlannedStatuses = new Set([PLANNED_STATUS.CONFIRMED]);
const cancelledPlannedStatuses = new Set([PLANNED_STATUS.CANCELLED]);
const expiredPlannedStatuses = new Set([PLANNED_STATUS.EXPIRED]);

export const defaultPlannedStatus = PLANNED_STATUS.PENDING;

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
    throw new Error('Enter a valid planned amount.');
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

function getPrimarySplit(plannedTransaction) {
  const [primarySplit] = plannedTransaction.planned_transaction_splits ?? [];
  return primarySplit ?? null;
}

export function normalizePlannedStatus(status) {
  return String(status ?? '').trim().toLowerCase();
}

export function isPlannedTransactionCancelled(status) {
  return cancelledPlannedStatuses.has(normalizePlannedStatus(status));
}

export function isPlannedTransactionConfirmed(plannedTransaction) {
  return Boolean(plannedTransaction?.created_transaction_id) || confirmedPlannedStatuses.has(normalizePlannedStatus(plannedTransaction?.status));
}

export function isPlannedTransactionExpired(status) {
  return expiredPlannedStatuses.has(normalizePlannedStatus(status));
}

export function isPlannedTransactionOpen(plannedTransaction) {
  const normalizedStatus = normalizePlannedStatus(plannedTransaction?.status);

  if (!normalizedStatus) {
    return true;
  }

  return normalizedStatus === PLANNED_STATUS.PENDING;
}

export function formatPlannedStatus(status) {
  return (status ?? '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function formatPlannedAmount(value, currencyCode = defaultTransactionCurrency) {
  return formatTransactionAmount(value, currencyCode);
}

export function formatPlannedDate(value) {
  return formatTransactionDate(value);
}

function sortPlannedTransactions(left, right) {
  const leftIsOpen = isPlannedTransactionOpen(left);
  const rightIsOpen = isPlannedTransactionOpen(right);

  if (leftIsOpen !== rightIsOpen) {
    return leftIsOpen ? -1 : 1;
  }

  if (leftIsOpen && rightIsOpen) {
    return (left.planned_date ?? '').localeCompare(right.planned_date ?? '');
  }

  const leftIsConfirmed = isPlannedTransactionConfirmed(left);
  const rightIsConfirmed = isPlannedTransactionConfirmed(right);

  if (leftIsConfirmed !== rightIsConfirmed) {
    return leftIsConfirmed ? -1 : 1;
  }

  const leftIsCancelled = isPlannedTransactionCancelled(left.status);
  const rightIsCancelled = isPlannedTransactionCancelled(right.status);

  if (leftIsCancelled !== rightIsCancelled) {
    return leftIsCancelled ? -1 : 1;
  }

  return (right.updated_at ?? right.planned_date ?? '').localeCompare(left.updated_at ?? left.planned_date ?? '');
}

function mapPlannedTransaction(plannedTransaction) {
  const primarySplit = getPrimarySplit(plannedTransaction);
  const category = primarySplit?.category ?? null;

  return {
    ...plannedTransaction,
    primarySplit,
    categoryId: primarySplit?.category_id ?? '',
    categoryName: category?.name ?? 'Uncategorized',
    categoryColor: category?.color ?? null,
    isOpen: isPlannedTransactionOpen(plannedTransaction),
    isCancelled: isPlannedTransactionCancelled(plannedTransaction.status),
    isConfirmed: isPlannedTransactionConfirmed(plannedTransaction),
    isExpired: isPlannedTransactionExpired(plannedTransaction.status),
  };
}

async function bestEffortDeletePlannedTransaction(id) {
  const client = ensureSupabase();

  await client
    .from('planned_transactions')
    .delete()
    .eq('id', id);
}

async function savePlannedTransactionSplit({ plannedTransactionId, categoryId, amountOriginal, amountBase, note }) {
  const client = ensureSupabase();
  const normalizedAmountOriginal = normalizeStoredAmount(amountOriginal);
  const normalizedAmountBase = normalizeStoredAmount(amountBase);

  const { data: existingSplit, error: existingSplitError } = await client
    .from('planned_transaction_splits')
    .select(plannedTransactionSplitColumns)
    .eq('planned_transaction_id', plannedTransactionId)
    .limit(1)
    .maybeSingle();

  if (existingSplitError) {
    throw existingSplitError;
  }

  if (existingSplit) {
    const { data, error } = await client
      .from('planned_transaction_splits')
      .update({
        category_id: categoryId,
        amount_original: normalizedAmountOriginal,
        amount_base: normalizedAmountBase,
        note: normalizeOptionalText(note),
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingSplit.id)
      .select(plannedTransactionSplitColumns)
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  const { data, error } = await client
    .from('planned_transaction_splits')
    .insert({
      planned_transaction_id: plannedTransactionId,
      category_id: categoryId,
      amount_original: normalizedAmountOriginal,
      amount_base: normalizedAmountBase,
      note: normalizeOptionalText(note),
    })
    .select(plannedTransactionSplitColumns)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export function getInitialPlannedFormState(defaultCategoryId = '') {
  return {
    title: '',
    amount: '',
    currency: defaultTransactionCurrency,
    plannedDate: getTodayDateInputValue(),
    categoryId: defaultCategoryId,
    merchantOrSource: '',
    note: '',
  };
}

export async function listPlannedTransactions() {
  const client = ensureSupabase();
  const { data, error } = await client
    .from('planned_transactions')
    .select(plannedTransactionListColumns)
    .order('planned_date', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? [])
    .map(mapPlannedTransaction)
    .sort(sortPlannedTransactions);
}

export async function createPlannedTransaction({ userId, values }) {
  const client = ensureSupabase();
  const currencyCode = normalizeCurrencyCode(values.currency);
  const amountOriginal = normalizeStoredAmount(values.amount);
  const conversionRate = getConversionRate(currencyCode);
  const amountBase = getBaseAmount(amountOriginal, conversionRate);

  const { data, error } = await client
    .from('planned_transactions')
    .insert({
      user_id: userId,
      title: values.title.trim(),
      amount_original: amountOriginal,
      currency_code: currencyCode,
      conversion_rate: conversionRate,
      amount_base: amountBase,
      base_currency_code: defaultBaseCurrency,
      planned_date: values.plannedDate,
      status: defaultPlannedStatus,
      note: normalizeOptionalText(values.note),
      merchant_or_source: normalizeOptionalText(values.merchantOrSource),
      updated_at: new Date().toISOString(),
    })
    .select(plannedTransactionColumns)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function createPlannedTransactionWithSplit({ userId, values }) {
  const plannedTransaction = await createPlannedTransaction({ userId, values });

  try {
    const split = await savePlannedTransactionSplit({
      plannedTransactionId: plannedTransaction.id,
      categoryId: values.categoryId,
      amountOriginal: plannedTransaction.amount_original,
      amountBase: plannedTransaction.amount_base,
      note: values.note,
    });

    return {
      plannedTransaction,
      split,
    };
  } catch (error) {
    try {
      await bestEffortDeletePlannedTransaction(plannedTransaction.id);
    } catch {
      // Ignore cleanup failures and surface the original split error.
    }

    throw error;
  }
}

export async function updatePlannedTransaction({ id, values }) {
  const client = ensureSupabase();
  const currencyCode = normalizeCurrencyCode(values.currency);
  const amountOriginal = normalizeStoredAmount(values.amount);
  const conversionRate = getConversionRate(currencyCode);
  const amountBase = getBaseAmount(amountOriginal, conversionRate);

  const { data, error } = await client
    .from('planned_transactions')
    .update({
      title: values.title.trim(),
      amount_original: amountOriginal,
      currency_code: currencyCode,
      conversion_rate: conversionRate,
      amount_base: amountBase,
      base_currency_code: defaultBaseCurrency,
      planned_date: values.plannedDate,
      note: normalizeOptionalText(values.note),
      merchant_or_source: normalizeOptionalText(values.merchantOrSource),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select(plannedTransactionColumns)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updatePlannedTransactionWithSplit({ id, values }) {
  const plannedTransaction = await updatePlannedTransaction({ id, values });
  const split = await savePlannedTransactionSplit({
    plannedTransactionId: plannedTransaction.id,
    categoryId: values.categoryId,
    amountOriginal: plannedTransaction.amount_original,
    amountBase: plannedTransaction.amount_base,
    note: values.note,
  });

  return {
    plannedTransaction,
    split,
  };
}

export async function cancelPlannedTransaction({ id }) {
  const client = ensureSupabase();
  const { data, error } = await client
    .from('planned_transactions')
    .update({
      status: PLANNED_STATUS.CANCELLED,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select(plannedTransactionColumns)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function confirmPlannedTransaction({ userId, plannedTransaction }) {
  if (!plannedTransaction?.id) {
    throw new Error('Planned transaction is missing its id.');
  }

  if (!plannedTransaction?.categoryId) {
    throw new Error('Select a category before confirming this planned item.');
  }

  if (!isPlannedTransactionOpen(plannedTransaction)) {
    throw new Error('Only pending planned transactions can be confirmed.');
  }

  if (isPlannedTransactionConfirmed(plannedTransaction)) {
    throw new Error('This planned transaction has already been confirmed.');
  }

  const { transaction } = await createTransactionWithSplit({
    userId,
    values: {
      title: plannedTransaction.title,
      amount: plannedTransaction.amount_original,
      currency: plannedTransaction.currency_code,
      transactionDate: plannedTransaction.planned_date,
      categoryId: plannedTransaction.categoryId,
      merchantOrSource: plannedTransaction.merchant_or_source ?? '',
      note: plannedTransaction.note ?? '',
      isFromSavings: false,
    },
  });

  const client = ensureSupabase();
  const { data, error } = await client
    .from('planned_transactions')
    .update({
      status: PLANNED_STATUS.CONFIRMED,
      created_transaction_id: transaction.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', plannedTransaction.id)
    .select(plannedTransactionColumns)
    .single();

  if (error) {
    throw error;
  }

  return data;
}
