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
const billPaymentSummaryColumns =
  'id, bill_id, amount_original, currency_code, amount_base, base_currency_code, transaction_date, created_at';

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
  const paymentCount = Number(bill.paymentCount) || 0;

  return {
    ...bill,
    defaultAmount: Number(bill.default_amount) || 0,
    categoryId: bill.category_id || '',
    categoryName: bill.category?.name || 'Unknown category',
    categoryColor: bill.category?.color || defaultCategoryColor,
    paymentCount,
    lastPaidAt: bill.lastPaidAt || '',
    lastPaidAmount: Number(bill.lastPaidAmount) || 0,
    lastPaidAmountBase: Number(bill.lastPaidAmountBase) || 0,
    lastPaidCurrencyCode: bill.lastPaidCurrencyCode || defaultTransactionCurrency,
    lastPaidBaseCurrencyCode: bill.lastPaidBaseCurrencyCode || defaultBaseCurrency,
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

function summarizeBillPayments(transactions) {
  const summaryByBillId = new Map();

  for (const transaction of transactions ?? []) {
    const billId = transaction.bill_id;

    if (!billId) {
      continue;
    }

    const existingSummary = summaryByBillId.get(billId);

    if (existingSummary) {
      existingSummary.paymentCount += 1;
      continue;
    }

    summaryByBillId.set(billId, {
      paymentCount: 1,
      lastPaidAt: transaction.transaction_date || '',
      lastPaidAmount: Number(transaction.amount_original) || 0,
      lastPaidAmountBase: Number(transaction.amount_base) || 0,
      lastPaidCurrencyCode: transaction.currency_code || defaultTransactionCurrency,
      lastPaidBaseCurrencyCode: transaction.base_currency_code || defaultBaseCurrency,
    });
  }

  return summaryByBillId;
}

function createEmptyBillHistorySummary() {
  return {
    totalPayments: 0,
    latestPaymentDate: '',
    latestPaymentAmount: 0,
    latestPaymentAmountBase: 0,
    latestPaymentCurrencyCode: defaultTransactionCurrency,
    latestPaymentBaseCurrencyCode: defaultBaseCurrency,
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

  const bills = data ?? [];

  if (bills.length === 0) {
    return [];
  }

  const billIds = bills.map((bill) => bill.id);
  const { data: paymentTransactions, error: paymentSummaryError } = await client
    .from('transactions')
    .select(billPaymentSummaryColumns)
    .in('bill_id', billIds)
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (paymentSummaryError) {
    throw paymentSummaryError;
  }

  const summaryByBillId = summarizeBillPayments(paymentTransactions);

  return bills.map((bill) => mapBill({ ...bill, ...(summaryByBillId.get(bill.id) ?? {}) }));
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
  const [{ count, error: countError }, { data, error }] = await Promise.all([
    client.from('transactions').select('id', { count: 'exact', head: true }).eq('bill_id', billId),
    client
      .from('transactions')
      .select(billHistoryColumns)
      .eq('bill_id', billId)
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit),
  ]);

  if (countError) {
    throw countError;
  }

  if (error) {
    throw error;
  }

  const items = (data ?? []).map(mapBillHistoryItem);
  const latestPayment = items[0] ?? null;

  return {
    items,
    summary: latestPayment
      ? {
          totalPayments: count ?? items.length,
          latestPaymentDate: latestPayment.transaction_date || '',
          latestPaymentAmount: latestPayment.amountOriginal,
          latestPaymentAmountBase: latestPayment.amountBase,
          latestPaymentCurrencyCode: latestPayment.currency_code || defaultTransactionCurrency,
          latestPaymentBaseCurrencyCode: latestPayment.base_currency_code || defaultBaseCurrency,
        }
      : createEmptyBillHistorySummary(),
  };
}

export async function deleteBill({ id }) {
  const client = ensureSupabase();
  const { count, error: countError } = await client
    .from('transactions')
    .select('id', { count: 'exact', head: true })
    .eq('bill_id', id);

  if (countError) {
    throw countError;
  }

  if ((count ?? 0) > 0) {
    const linkedPaymentsError = new Error(
      'This bill already has payment history, so it cannot be deleted. Keep it for history or edit it instead.',
    );
    linkedPaymentsError.code = 'BILL_HAS_LINKED_TRANSACTIONS';
    throw linkedPaymentsError;
  }

  const { error } = await client.from('bills').delete().eq('id', id);

  if (error) {
    throw error;
  }
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
