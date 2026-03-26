import { defaultCategoryColor } from './categories';
import { ensureSupabase } from './supabase';
import {
  createTransactionWithSplit,
  defaultBaseCurrency,
  defaultTransactionCurrency,
  formatTransactionAmount,
  formatTransactionDate,
  getTodayDateInputValue,
} from './transactions';

const billColumns = 'id, user_id, name, default_amount, category_id, note, created_at, updated_at, category:categories(id, name, color, is_archived)';
const billHistoryColumns =
  'id, user_id, bill_id, title, amount_original, currency_code, amount_base, base_currency_code, transaction_date, note, merchant_or_source, created_at, transaction_splits(id, amount_base, category:categories(id, name, color, is_archived))';

function normalizeOptionalText(value) {
  const trimmedValue = value?.trim() ?? '';
  return trimmedValue ? trimmedValue : null;
}

function normalizeStoredBillAmount(value, fieldName = 'amount') {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    throw new Error(`Enter a valid ${fieldName}.`);
  }

  return numericValue.toFixed(2);
}

function getPrimaryHistoryCategory(transaction) {
  const [primarySplit] = transaction.transaction_splits ?? [];
  return primarySplit?.category ?? null;
}

function mapBill(bill) {
  return {
    ...bill,
    defaultAmount: Number(bill.default_amount) || 0,
    categoryId: bill.category_id || '',
    categoryName: bill.category?.name || 'Unknown category',
    categoryColor: bill.category?.color || defaultCategoryColor,
  };
}

function mapBillHistoryItem(transaction) {
  const category = getPrimaryHistoryCategory(transaction);
  const title = transaction.title?.trim() || transaction.merchant_or_source?.trim() || 'Bill payment';

  return {
    ...transaction,
    title,
    amountOriginal: Number(transaction.amount_original) || 0,
    amountBase: Number(transaction.amount_base) || 0,
    categoryName: category?.name || 'Unknown category',
    categoryColor: category?.color || defaultCategoryColor,
  };
}

export function createInitialBillFormState(defaultCategoryId = '') {
  return {
    name: '',
    defaultAmount: '',
    categoryId: defaultCategoryId,
    note: '',
  };
}

export function createInitialBillPaymentFormState(bill) {
  return {
    amount: bill?.defaultAmount ? String(bill.defaultAmount) : '',
    categoryId: bill?.categoryId || '',
    transactionDate: getTodayDateInputValue(),
    note: bill?.note || '',
  };
}

export function formatBillAmount(value, currencyCode = defaultBaseCurrency) {
  return formatTransactionAmount(value, currencyCode);
}

export function formatBillDate(value) {
  return formatTransactionDate(value);
}

export async function listBills() {
  const client = ensureSupabase();
  const { data, error } = await client
    .from('bills')
    .select(billColumns)
    .order('name', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapBill);
}

export async function createBill({ userId, values }) {
  const client = ensureSupabase();
  const { data, error } = await client
    .from('bills')
    .insert({
      user_id: userId,
      name: values.name.trim(),
      default_amount: normalizeStoredBillAmount(values.defaultAmount, 'default amount'),
      category_id: values.categoryId,
      note: normalizeOptionalText(values.note),
      updated_at: new Date().toISOString(),
    })
    .select(billColumns)
    .single();

  if (error) {
    throw error;
  }

  return mapBill(data);
}

export async function updateBill({ id, values }) {
  const client = ensureSupabase();
  const { data, error } = await client
    .from('bills')
    .update({
      name: values.name.trim(),
      default_amount: normalizeStoredBillAmount(values.defaultAmount, 'default amount'),
      category_id: values.categoryId,
      note: normalizeOptionalText(values.note),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select(billColumns)
    .single();

  if (error) {
    throw error;
  }

  return mapBill(data);
}

export async function listBillHistory({ billId, limit = 20 }) {
  const client = ensureSupabase();
  const { data, error } = await client
    .from('transactions')
    .select(billHistoryColumns)
    .eq('bill_id', billId)
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapBillHistoryItem);
}

export async function processBillPayment({ userId, bill, values }) {
  if (!bill?.id) {
    throw new Error('Choose a bill before processing payment.');
  }

  return createTransactionWithSplit({
    userId,
    values: {
      title: bill.name,
      amount: values.amount,
      currency: defaultTransactionCurrency,
      transactionDate: values.transactionDate,
      categoryId: values.categoryId,
      merchantOrSource: '',
      note: values.note,
      isFromSavings: false,
      billId: bill.id,
    },
  });
}
