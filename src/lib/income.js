import { defaultCategoryColor } from './categories';
import { getCurrentMonthRange } from './home';
import { ensureSupabase } from './supabase';
import {
  defaultBaseCurrency,
  formatTransactionAmount,
  formatTransactionDate,
  getTodayDateInputValue,
} from './transactions';

const incomeSourceColumns = 'id, user_id, name, description, is_archived, created_at, updated_at';
const incomeEntryColumns =
  'id, user_id, income_source_id, amount_original, currency_code, conversion_rate, amount_base, base_currency_code, entry_date, note, merchant_or_source, category_id, created_at, updated_at, source:income_sources(id, name, is_archived), category:categories(id, name, color, kind, is_archived)';
const monthlyIncomeEntryColumns = 'id, amount_base, entry_date';
const profileCurrencyColumns = 'id, base_currency_code';

function normalizeOptionalText(value) {
  const trimmedValue = value?.trim() ?? '';
  return trimmedValue ? trimmedValue : null;
}

function normalizeCurrencyCode(value, fallback = defaultBaseCurrency) {
  const normalizedValue = value?.trim().toUpperCase() ?? '';
  return normalizedValue || fallback;
}

function normalizeStoredAmount(value, fieldName = 'amount') {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    throw new Error(`Enter a valid ${fieldName}.`);
  }

  return numericValue.toFixed(2);
}

function normalizeStoredConversionRate(value, { currencyCode, baseCurrencyCode }) {
  if (currencyCode === baseCurrencyCode) {
    return '1';
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    throw new Error('Enter a valid conversion rate.');
  }

  return String(numericValue);
}

function getBaseAmount(amountOriginal, conversionRate) {
  const amountValue = Number(amountOriginal);
  const conversionRateValue = Number(conversionRate);

  if (!Number.isFinite(amountValue) || !Number.isFinite(conversionRateValue)) {
    return '';
  }

  return (amountValue * conversionRateValue).toFixed(2);
}

function mapIncomeSource(source) {
  return {
    ...source,
    description: source.description ?? '',
    isArchived: Boolean(source.is_archived),
  };
}

function mapIncomeEntry(entry) {
  return {
    ...entry,
    sourceId: entry.income_source_id || '',
    sourceName: entry.source?.name || 'Unknown source',
    isSourceArchived: Boolean(entry.source?.is_archived),
    categoryId: entry.category_id || '',
    categoryName: entry.category?.name || 'No category',
    categoryColor: entry.category?.color || defaultCategoryColor,
    amountOriginalValue: Number(entry.amount_original) || 0,
    amountBaseValue: Number(entry.amount_base) || 0,
    conversionRateValue: Number(entry.conversion_rate) || 0,
    note: entry.note ?? '',
    merchantOrSource: entry.merchant_or_source ?? '',
  };
}

export function createInitialIncomeSourceFormState() {
  return {
    name: '',
    description: '',
  };
}

export function createInitialIncomeSourceFormStateFromSource(source) {
  return {
    name: source?.name ?? '',
    description: source?.description ?? '',
  };
}

export function createInitialIncomeEntryFormState({
  defaultSourceId = '',
  defaultCategoryId = '',
  baseCurrencyCode = defaultBaseCurrency,
} = {}) {
  return {
    incomeSourceId: defaultSourceId,
    amountOriginal: '',
    currencyCode: baseCurrencyCode,
    conversionRate: '1',
    amountBase: '',
    baseCurrencyCode,
    entryDate: getTodayDateInputValue(),
    note: '',
    merchantOrSource: '',
    categoryId: defaultCategoryId,
  };
}

export function createInitialIncomeEntryFormStateFromEntry(entry, { fallbackSourceId = '', baseCurrencyCode = defaultBaseCurrency } = {}) {
  const nextBaseCurrencyCode = normalizeCurrencyCode(entry?.base_currency_code, baseCurrencyCode);
  const nextCurrencyCode = normalizeCurrencyCode(entry?.currency_code, nextBaseCurrencyCode);
  const nextConversionRate =
    nextCurrencyCode === nextBaseCurrencyCode ? '1' : String(Number(entry?.conversion_rate) || '');
  const nextAmountOriginal = Number(entry?.amount_original);
  const nextAmountBase = Number(entry?.amount_base);

  return {
    incomeSourceId: entry?.income_source_id || fallbackSourceId,
    amountOriginal: Number.isFinite(nextAmountOriginal) ? String(nextAmountOriginal) : '',
    currencyCode: nextCurrencyCode,
    conversionRate: nextConversionRate || '1',
    amountBase: Number.isFinite(nextAmountBase) ? nextAmountBase.toFixed(2) : '',
    baseCurrencyCode: nextBaseCurrencyCode,
    entryDate: entry?.entry_date || getTodayDateInputValue(),
    note: entry?.note ?? '',
    merchantOrSource: entry?.merchant_or_source ?? '',
    categoryId: entry?.category_id || '',
  };
}

export function calculateIncomeAmounts({ amountOriginal, currencyCode, conversionRate, baseCurrencyCode }) {
  const normalizedBaseCurrencyCode = normalizeCurrencyCode(baseCurrencyCode, defaultBaseCurrency);
  const normalizedCurrencyCode = normalizeCurrencyCode(currencyCode, normalizedBaseCurrencyCode);
  const normalizedConversionRate =
    normalizedCurrencyCode === normalizedBaseCurrencyCode ? '1' : String(conversionRate ?? '').trim();
  const amountOriginalValue = Number(amountOriginal);
  const conversionRateValue = Number(normalizedConversionRate);
  const amountBaseValue =
    Number.isFinite(amountOriginalValue) && Number.isFinite(conversionRateValue)
      ? amountOriginalValue * conversionRateValue
      : Number.NaN;

  return {
    currencyCode: normalizedCurrencyCode,
    baseCurrencyCode: normalizedBaseCurrencyCode,
    conversionRate: normalizedConversionRate,
    amountBase:
      Number.isFinite(amountBaseValue) && amountBaseValue >= 0 ? amountBaseValue.toFixed(2) : '',
  };
}

export function formatIncomeAmount(value, currencyCode = defaultBaseCurrency) {
  return formatTransactionAmount(value, currencyCode);
}

export function formatIncomeDate(value) {
  return formatTransactionDate(value);
}

export async function getUserBaseCurrencyCode({ userId }) {
  const client = ensureSupabase();
  const { data, error } = await client
    .from('profiles')
    .select(profileCurrencyColumns)
    .eq('id', userId)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return normalizeCurrencyCode(data?.base_currency_code, defaultBaseCurrency);
}

export async function listIncomeSources({ includeArchived = true } = {}) {
  const client = ensureSupabase();
  let query = client
    .from('income_sources')
    .select(incomeSourceColumns)
    .order('is_archived', { ascending: true })
    .order('name', { ascending: true });

  if (!includeArchived) {
    query = query.eq('is_archived', false);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapIncomeSource);
}

export async function createIncomeSource({ userId, values }) {
  const client = ensureSupabase();
  const { data, error } = await client
    .from('income_sources')
    .insert({
      user_id: userId,
      name: values.name.trim(),
      description: normalizeOptionalText(values.description),
      is_archived: false,
      updated_at: new Date().toISOString(),
    })
    .select(incomeSourceColumns)
    .single();

  if (error) {
    throw error;
  }

  return mapIncomeSource(data);
}

export async function updateIncomeSource({ id, values }) {
  const client = ensureSupabase();
  const { data, error } = await client
    .from('income_sources')
    .update({
      name: values.name.trim(),
      description: normalizeOptionalText(values.description),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select(incomeSourceColumns)
    .single();

  if (error) {
    throw error;
  }

  return mapIncomeSource(data);
}

export async function setIncomeSourceArchived({ id, isArchived }) {
  const client = ensureSupabase();
  const { data, error } = await client
    .from('income_sources')
    .update({
      is_archived: Boolean(isArchived),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select(incomeSourceColumns)
    .single();

  if (error) {
    throw error;
  }

  return mapIncomeSource(data);
}

export async function listIncomeEntries() {
  const client = ensureSupabase();
  const { data, error } = await client
    .from('income_entries')
    .select(incomeEntryColumns)
    .order('entry_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapIncomeEntry);
}

export async function createIncomeEntry({ userId, values, baseCurrencyCode }) {
  const client = ensureSupabase();
  const normalizedBaseCurrencyCode = normalizeCurrencyCode(baseCurrencyCode, defaultBaseCurrency);
  const normalizedCurrencyCode = normalizeCurrencyCode(values.currencyCode, normalizedBaseCurrencyCode);
  const amountOriginal = normalizeStoredAmount(values.amountOriginal, 'income amount');
  const conversionRate = normalizeStoredConversionRate(values.conversionRate, {
    currencyCode: normalizedCurrencyCode,
    baseCurrencyCode: normalizedBaseCurrencyCode,
  });
  const amountBase = getBaseAmount(amountOriginal, conversionRate);

  const { data, error } = await client
    .from('income_entries')
    .insert({
      user_id: userId,
      income_source_id: values.incomeSourceId,
      amount_original: amountOriginal,
      currency_code: normalizedCurrencyCode,
      conversion_rate: conversionRate,
      amount_base: normalizeStoredAmount(amountBase, 'base amount'),
      base_currency_code: normalizedBaseCurrencyCode,
      entry_date: values.entryDate,
      note: normalizeOptionalText(values.note),
      merchant_or_source: normalizeOptionalText(values.merchantOrSource),
      category_id: values.categoryId || null,
      updated_at: new Date().toISOString(),
    })
    .select(incomeEntryColumns)
    .single();

  if (error) {
    throw error;
  }

  return mapIncomeEntry(data);
}

export async function updateIncomeEntry({ id, values, baseCurrencyCode }) {
  const client = ensureSupabase();
  const normalizedBaseCurrencyCode = normalizeCurrencyCode(baseCurrencyCode, defaultBaseCurrency);
  const normalizedCurrencyCode = normalizeCurrencyCode(values.currencyCode, normalizedBaseCurrencyCode);
  const amountOriginal = normalizeStoredAmount(values.amountOriginal, 'income amount');
  const conversionRate = normalizeStoredConversionRate(values.conversionRate, {
    currencyCode: normalizedCurrencyCode,
    baseCurrencyCode: normalizedBaseCurrencyCode,
  });
  const amountBase = getBaseAmount(amountOriginal, conversionRate);

  const { data, error } = await client
    .from('income_entries')
    .update({
      income_source_id: values.incomeSourceId,
      amount_original: amountOriginal,
      currency_code: normalizedCurrencyCode,
      conversion_rate: conversionRate,
      amount_base: normalizeStoredAmount(amountBase, 'base amount'),
      base_currency_code: normalizedBaseCurrencyCode,
      entry_date: values.entryDate,
      note: normalizeOptionalText(values.note),
      merchant_or_source: normalizeOptionalText(values.merchantOrSource),
      category_id: values.categoryId || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select(incomeEntryColumns)
    .single();

  if (error) {
    throw error;
  }

  return mapIncomeEntry(data);
}

export async function loadIncomeMonthSummary({ userId, date = new Date() }) {
  const client = ensureSupabase();
  const { startDate, endDateExclusive, monthLabel } = getCurrentMonthRange(date);
  const [baseCurrencyCode, { data, error }] = await Promise.all([
    getUserBaseCurrencyCode({ userId }),
    client
      .from('income_entries')
      .select(monthlyIncomeEntryColumns)
      .gte('entry_date', startDate)
      .lt('entry_date', endDateExclusive),
  ]);

  if (error) {
    throw error;
  }

  const entries = data ?? [];
  const totalIncome = entries.reduce((sum, item) => sum + (Number(item.amount_base) || 0), 0);

  return {
    monthLabel,
    baseCurrencyCode,
    totalIncome,
    entryCount: entries.length,
  };
}
