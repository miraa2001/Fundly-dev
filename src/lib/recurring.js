import { PLANNED_STATUS } from './planned';
import { ensureSupabase } from './supabase';
import {
  defaultBaseCurrency,
  defaultTransactionCurrency,
  formatTransactionAmount,
  formatTransactionDate,
  getTodayDateInputValue,
  supportedTransactionCurrencies,
} from './transactions';

const recurringExpenseColumns =
  'id, user_id, title, default_amount_original, currency_code, frequency, interval_count, due_day, due_weekday, start_date, end_date, is_active, note, merchant_or_source, last_generated_for_date, created_at, updated_at';
const recurringExpenseSplitColumns = 'id, recurring_expense_id, category_id, amount_original, note, created_at, updated_at';
const recurringExpenseListColumns =
  `${recurringExpenseColumns}, recurring_expense_splits(${recurringExpenseSplitColumns}, category:categories(id, name, color, is_archived))`;
const plannedTransactionColumns =
  'id, user_id, recurring_expense_id, title, amount_original, currency_code, conversion_rate, amount_base, base_currency_code, planned_date, status, note, merchant_or_source, created_transaction_id, created_at, updated_at';
const plannedTransactionSplitColumns = 'id, planned_transaction_id, category_id, amount_original, amount_base, note, created_at, updated_at';
const existingGeneratedColumns = 'id, recurring_expense_id, planned_date';

export const RECURRING_FREQUENCY = Object.freeze({
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
});

export const recurringFrequencyOptions = [
  RECURRING_FREQUENCY.DAILY,
  RECURRING_FREQUENCY.WEEKLY,
  RECURRING_FREQUENCY.MONTHLY,
  RECURRING_FREQUENCY.YEARLY,
];

export const recurringWeekdayOptions = [
  { value: '0', label: 'Sunday' },
  { value: '1', label: 'Monday' },
  { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' },
  { value: '4', label: 'Thursday' },
  { value: '5', label: 'Friday' },
  { value: '6', label: 'Saturday' },
];

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
    throw new Error('Enter a valid recurring amount.');
  }

  return numericValue.toFixed(2);
}

function normalizeIntervalCount(value) {
  const numericValue = Number(value);

  if (!Number.isInteger(numericValue) || numericValue < 1) {
    throw new Error('Recurring interval count must be 1 or more.');
  }

  return numericValue;
}

function normalizeRecurringFrequency(value) {
  const normalizedFrequency = String(value ?? '').trim().toLowerCase();
  return recurringFrequencyOptions.includes(normalizedFrequency) ? normalizedFrequency : RECURRING_FREQUENCY.MONTHLY;
}

function normalizeDueDay(value) {
  const trimmedValue = String(value ?? '').trim();

  if (!trimmedValue) {
    return null;
  }

  const numericValue = Number(trimmedValue);

  if (!Number.isInteger(numericValue) || numericValue < 1 || numericValue > 31) {
    throw new Error('Recurring due day must be between 1 and 31.');
  }

  return numericValue;
}

function normalizeDueWeekday(value) {
  const trimmedValue = String(value ?? '').trim();

  if (!trimmedValue) {
    return null;
  }

  const numericValue = Number(trimmedValue);

  if (!Number.isInteger(numericValue) || numericValue < 0 || numericValue > 6) {
    throw new Error('Recurring due weekday must be between 0 and 6.');
  }

  return numericValue;
}

function parseDateOnly(value) {
  if (!value) {
    return null;
  }

  const [year, month, day] = String(value).split('-').map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(Date.UTC(year, month - 1, day));
}

function formatDateOnly(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addUtcDays(date, dayCount) {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + dayCount);
  return nextDate;
}

function addUtcMonths(date, monthCount) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + monthCount, 1));
}

function clampDayForMonth(year, monthIndex, day) {
  const lastDayOfMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  return Math.min(day, lastDayOfMonth);
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

function getPrimarySplit(recurringExpense) {
  const [primarySplit] = recurringExpense.recurring_expense_splits ?? [];
  return primarySplit ?? null;
}

function getWeekdayLabel(value) {
  const matchedOption = recurringWeekdayOptions.find((option) => option.value === String(value ?? ''));
  return matchedOption?.label ?? 'Unknown day';
}

function getDueDay(recurringExpense) {
  return recurringExpense.due_day ?? parseDateOnly(recurringExpense.start_date)?.getUTCDate() ?? null;
}

function getDueWeekday(recurringExpense) {
  return recurringExpense.due_weekday ?? parseDateOnly(recurringExpense.start_date)?.getUTCDay() ?? null;
}

function sortRecurringExpenses(left, right) {
  if (left.is_active !== right.is_active) {
    return left.is_active ? -1 : 1;
  }

  const leftUpdatedAt = left.updated_at ?? left.created_at ?? '';
  const rightUpdatedAt = right.updated_at ?? right.created_at ?? '';

  if (leftUpdatedAt !== rightUpdatedAt) {
    return rightUpdatedAt.localeCompare(leftUpdatedAt);
  }

  return (left.title ?? '').localeCompare(right.title ?? '');
}

function mapRecurringExpense(recurringExpense) {
  const primarySplit = getPrimarySplit(recurringExpense);
  const category = primarySplit?.category ?? null;

  return {
    ...recurringExpense,
    primarySplit,
    categoryId: primarySplit?.category_id ?? '',
    categoryName: category?.name ?? 'Uncategorized',
    categoryColor: category?.color ?? null,
  };
}

function getScheduleStartDate(recurringExpense) {
  return parseDateOnly(recurringExpense.start_date);
}

function getScheduleEndDate(recurringExpense, upToDate) {
  const upTo = parseDateOnly(upToDate);
  const endDate = parseDateOnly(recurringExpense.end_date);

  if (!upTo) {
    return endDate;
  }

  if (!endDate || endDate > upTo) {
    return upTo;
  }

  return endDate;
}

function getDailyDueDates(recurringExpense, rangeEndDate, lastGeneratedForDate) {
  const startDate = getScheduleStartDate(recurringExpense);
  const dueDates = [];
  const intervalCount = Math.max(1, Number(recurringExpense.interval_count) || 1);

  for (let currentDate = startDate; currentDate && currentDate <= rangeEndDate; currentDate = addUtcDays(currentDate, intervalCount)) {
    const currentDateString = formatDateOnly(currentDate);

    if (!lastGeneratedForDate || currentDateString > lastGeneratedForDate) {
      dueDates.push(currentDateString);
    }
  }

  return dueDates;
}

function getWeeklyDueDates(recurringExpense, rangeEndDate, lastGeneratedForDate) {
  const startDate = getScheduleStartDate(recurringExpense);
  const intervalCount = Math.max(1, Number(recurringExpense.interval_count) || 1);
  const dueWeekday = getDueWeekday(recurringExpense);
  const dueDates = [];

  if (!startDate || dueWeekday === null) {
    return dueDates;
  }

  let currentDate = new Date(startDate);

  while (currentDate.getUTCDay() !== dueWeekday) {
    currentDate = addUtcDays(currentDate, 1);
  }

  while (currentDate <= rangeEndDate) {
    const currentDateString = formatDateOnly(currentDate);

    if (!lastGeneratedForDate || currentDateString > lastGeneratedForDate) {
      dueDates.push(currentDateString);
    }

    currentDate = addUtcDays(currentDate, intervalCount * 7);
  }

  return dueDates;
}

function getMonthlyDueDates(recurringExpense, rangeEndDate, lastGeneratedForDate) {
  const startDate = getScheduleStartDate(recurringExpense);
  const intervalCount = Math.max(1, Number(recurringExpense.interval_count) || 1);
  const dueDay = getDueDay(recurringExpense);
  const dueDates = [];

  if (!startDate || !dueDay) {
    return dueDates;
  }

  for (let monthAnchor = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), 1)); monthAnchor <= rangeEndDate; monthAnchor = addUtcMonths(monthAnchor, intervalCount)) {
    const dueDate = new Date(
      Date.UTC(
        monthAnchor.getUTCFullYear(),
        monthAnchor.getUTCMonth(),
        clampDayForMonth(monthAnchor.getUTCFullYear(), monthAnchor.getUTCMonth(), dueDay),
      ),
    );

    if (dueDate < startDate || dueDate > rangeEndDate) {
      continue;
    }

    const dueDateString = formatDateOnly(dueDate);

    if (!lastGeneratedForDate || dueDateString > lastGeneratedForDate) {
      dueDates.push(dueDateString);
    }
  }

  return dueDates;
}

function getYearlyDueDates(recurringExpense, rangeEndDate, lastGeneratedForDate) {
  const startDate = getScheduleStartDate(recurringExpense);
  const intervalCount = Math.max(1, Number(recurringExpense.interval_count) || 1);
  const dueDay = getDueDay(recurringExpense);
  const dueDates = [];

  if (!startDate || !dueDay) {
    return dueDates;
  }

  for (let currentYear = startDate.getUTCFullYear(); ; currentYear += intervalCount) {
    const dueDate = new Date(
      Date.UTC(
        currentYear,
        startDate.getUTCMonth(),
        clampDayForMonth(currentYear, startDate.getUTCMonth(), dueDay),
      ),
    );

    if (dueDate > rangeEndDate) {
      break;
    }

    if (dueDate < startDate) {
      continue;
    }

    const dueDateString = formatDateOnly(dueDate);

    if (!lastGeneratedForDate || dueDateString > lastGeneratedForDate) {
      dueDates.push(dueDateString);
    }
  }

  return dueDates;
}

function getDueDatesForRecurringExpense(recurringExpense, upToDate) {
  const startDate = getScheduleStartDate(recurringExpense);
  const rangeEndDate = getScheduleEndDate(recurringExpense, upToDate);
  const lastGeneratedForDate = recurringExpense.last_generated_for_date ?? '';
  const normalizedFrequency = normalizeRecurringFrequency(recurringExpense.frequency);

  if (!startDate || !rangeEndDate || startDate > rangeEndDate) {
    return [];
  }

  switch (normalizedFrequency) {
    case RECURRING_FREQUENCY.DAILY:
      return getDailyDueDates(recurringExpense, rangeEndDate, lastGeneratedForDate);
    case RECURRING_FREQUENCY.WEEKLY:
      return getWeeklyDueDates(recurringExpense, rangeEndDate, lastGeneratedForDate);
    case RECURRING_FREQUENCY.YEARLY:
      return getYearlyDueDates(recurringExpense, rangeEndDate, lastGeneratedForDate);
    case RECURRING_FREQUENCY.MONTHLY:
    default:
      return getMonthlyDueDates(recurringExpense, rangeEndDate, lastGeneratedForDate);
  }
}

function buildRecurringPayload(values) {
  const normalizedFrequency = normalizeRecurringFrequency(values.frequency);
  const nextPayload = {
    title: values.title.trim(),
    default_amount_original: normalizeStoredAmount(values.amount),
    currency_code: normalizeCurrencyCode(values.currency),
    frequency: normalizedFrequency,
    interval_count: normalizeIntervalCount(values.intervalCount),
    due_day: null,
    due_weekday: null,
    start_date: values.startDate,
    end_date: values.endDate || null,
    is_active: Boolean(values.isActive),
    note: normalizeOptionalText(values.note),
    merchant_or_source: normalizeOptionalText(values.merchantOrSource),
  };

  if (normalizedFrequency === RECURRING_FREQUENCY.WEEKLY) {
    nextPayload.due_weekday = normalizeDueWeekday(values.dueWeekday);
  }

  if (normalizedFrequency === RECURRING_FREQUENCY.MONTHLY || normalizedFrequency === RECURRING_FREQUENCY.YEARLY) {
    nextPayload.due_day = normalizeDueDay(values.dueDay);
  }

  return nextPayload;
}

async function bestEffortDeleteRecurringExpense(id) {
  const client = ensureSupabase();

  await client
    .from('recurring_expenses')
    .delete()
    .eq('id', id);
}

async function bestEffortDeletePlannedTransaction(id) {
  const client = ensureSupabase();

  await client
    .from('planned_transactions')
    .delete()
    .eq('id', id);
}

async function saveRecurringExpenseSplit({ recurringExpenseId, categoryId, amountOriginal, note }) {
  const client = ensureSupabase();
  const normalizedAmountOriginal = normalizeStoredAmount(amountOriginal);

  const { data: existingSplit, error: existingSplitError } = await client
    .from('recurring_expense_splits')
    .select(recurringExpenseSplitColumns)
    .eq('recurring_expense_id', recurringExpenseId)
    .limit(1)
    .maybeSingle();

  if (existingSplitError) {
    throw existingSplitError;
  }

  if (existingSplit) {
    const { data, error } = await client
      .from('recurring_expense_splits')
      .update({
        category_id: categoryId,
        amount_original: normalizedAmountOriginal,
        note: normalizeOptionalText(note),
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingSplit.id)
      .select(recurringExpenseSplitColumns)
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  const { data, error } = await client
    .from('recurring_expense_splits')
    .insert({
      recurring_expense_id: recurringExpenseId,
      category_id: categoryId,
      amount_original: normalizedAmountOriginal,
      note: normalizeOptionalText(note),
    })
    .select(recurringExpenseSplitColumns)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function createGeneratedPlannedTransaction({ userId, recurringExpense, plannedDate }) {
  const client = ensureSupabase();
  const currencyCode = normalizeCurrencyCode(recurringExpense.currency_code);
  const amountOriginal = normalizeStoredAmount(recurringExpense.default_amount_original);
  const conversionRate = getConversionRate(currencyCode);
  const amountBase = getBaseAmount(amountOriginal, conversionRate);

  const { data, error } = await client
    .from('planned_transactions')
    .insert({
      user_id: userId,
      recurring_expense_id: recurringExpense.id,
      title: recurringExpense.title,
      amount_original: amountOriginal,
      currency_code: currencyCode,
      conversion_rate: conversionRate,
      amount_base,
      base_currency_code: defaultBaseCurrency,
      planned_date: plannedDate,
      status: PLANNED_STATUS.PENDING,
      note: normalizeOptionalText(recurringExpense.note),
      merchant_or_source: normalizeOptionalText(recurringExpense.merchant_or_source),
      updated_at: new Date().toISOString(),
    })
    .select(plannedTransactionColumns)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function createGeneratedPlannedTransactionSplit({ plannedTransactionId, categoryId, amountOriginal, amountBase, note }) {
  const client = ensureSupabase();
  const { data, error } = await client
    .from('planned_transaction_splits')
    .insert({
      planned_transaction_id: plannedTransactionId,
      category_id: categoryId,
      amount_original: normalizeStoredAmount(amountOriginal),
      amount_base: normalizeStoredAmount(amountBase),
      note: normalizeOptionalText(note),
    })
    .select(plannedTransactionSplitColumns)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export function getInitialRecurringFormState(defaultCategoryId = '', date = new Date()) {
  const startDate = getTodayDateInputValue(date);
  const parsedStartDate = parseDateOnly(startDate);
  const dueDay = String(parsedStartDate?.getUTCDate() ?? 1);
  const dueWeekday = String(parsedStartDate?.getUTCDay() ?? 0);

  return {
    title: '',
    amount: '',
    currency: defaultTransactionCurrency,
    frequency: RECURRING_FREQUENCY.MONTHLY,
    intervalCount: '1',
    dueDay,
    dueWeekday,
    startDate,
    endDate: '',
    categoryId: defaultCategoryId,
    merchantOrSource: '',
    note: '',
    isActive: true,
  };
}

export function formatRecurringAmount(value, currencyCode = defaultTransactionCurrency) {
  return formatTransactionAmount(value, currencyCode);
}

export function formatRecurringDate(value) {
  return formatTransactionDate(value);
}

export function formatRecurringFrequency(frequency, intervalCount = 1) {
  const safeIntervalCount = Math.max(1, Number(intervalCount) || 1);
  const normalizedFrequency = normalizeRecurringFrequency(frequency);
  const intervalLabel = safeIntervalCount === 1 ? 'Every' : `Every ${safeIntervalCount}`;

  switch (normalizedFrequency) {
    case RECURRING_FREQUENCY.DAILY:
      return safeIntervalCount === 1 ? 'Daily' : `${intervalLabel} days`;
    case RECURRING_FREQUENCY.WEEKLY:
      return safeIntervalCount === 1 ? 'Weekly' : `${intervalLabel} weeks`;
    case RECURRING_FREQUENCY.YEARLY:
      return safeIntervalCount === 1 ? 'Yearly' : `${intervalLabel} years`;
    case RECURRING_FREQUENCY.MONTHLY:
    default:
      return safeIntervalCount === 1 ? 'Monthly' : `${intervalLabel} months`;
  }
}

export function formatRecurringDueRule(recurringExpense) {
  const normalizedFrequency = normalizeRecurringFrequency(recurringExpense.frequency);
  const dueDay = getDueDay(recurringExpense);
  const dueWeekday = getDueWeekday(recurringExpense);

  switch (normalizedFrequency) {
    case RECURRING_FREQUENCY.WEEKLY:
      return dueWeekday === null ? 'Due weekday unavailable' : `On ${getWeekdayLabel(dueWeekday)}`;
    case RECURRING_FREQUENCY.YEARLY: {
      const startDate = parseDateOnly(recurringExpense.start_date);

      if (!startDate || !dueDay) {
        return 'Annual date unavailable';
      }

      return new Intl.DateTimeFormat(undefined, {
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
      }).format(new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), dueDay)));
    }
    case RECURRING_FREQUENCY.MONTHLY:
      return dueDay ? `Day ${dueDay}` : 'Due day unavailable';
    case RECURRING_FREQUENCY.DAILY:
    default:
      return 'Runs from start date';
  }
}

export async function listRecurringExpenses() {
  const client = ensureSupabase();
  const { data, error } = await client
    .from('recurring_expenses')
    .select(recurringExpenseListColumns)
    .order('is_active', { ascending: false })
    .order('updated_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? [])
    .map(mapRecurringExpense)
    .sort(sortRecurringExpenses);
}

export async function createRecurringExpense({ userId, values }) {
  const client = ensureSupabase();
  const payload = buildRecurringPayload(values);

  const { data, error } = await client
    .from('recurring_expenses')
    .insert({
      user_id: userId,
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .select(recurringExpenseColumns)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function createRecurringExpenseWithSplit({ userId, values }) {
  const recurringExpense = await createRecurringExpense({ userId, values });

  try {
    const split = await saveRecurringExpenseSplit({
      recurringExpenseId: recurringExpense.id,
      categoryId: values.categoryId,
      amountOriginal: recurringExpense.default_amount_original,
      note: values.note,
    });

    return {
      recurringExpense,
      split,
    };
  } catch (error) {
    try {
      await bestEffortDeleteRecurringExpense(recurringExpense.id);
    } catch {
      // Ignore cleanup failures and surface the original split error.
    }

    throw error;
  }
}

export async function updateRecurringExpense({ id, values }) {
  const client = ensureSupabase();
  const payload = buildRecurringPayload(values);

  const { data, error } = await client
    .from('recurring_expenses')
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select(recurringExpenseColumns)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateRecurringExpenseWithSplit({ id, values }) {
  const recurringExpense = await updateRecurringExpense({ id, values });
  const split = await saveRecurringExpenseSplit({
    recurringExpenseId: recurringExpense.id,
    categoryId: values.categoryId,
    amountOriginal: recurringExpense.default_amount_original,
    note: values.note,
  });

  return {
    recurringExpense,
    split,
  };
}

export async function toggleRecurringExpenseActive({ id, isActive }) {
  const client = ensureSupabase();
  const { data, error } = await client
    .from('recurring_expenses')
    .update({
      is_active: Boolean(isActive),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select(recurringExpenseColumns)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function generateDuePlannedTransactions({ userId, upToDate = getTodayDateInputValue() } = {}) {
  const client = ensureSupabase();
  const recurringExpenses = await listRecurringExpenses();
  const activeRecurringExpenses = recurringExpenses.filter((item) => item.is_active);

  if (activeRecurringExpenses.length === 0) {
    return {
      generatedCount: 0,
      processedRecurringCount: 0,
    };
  }

  const recurringExpenseIds = activeRecurringExpenses.map((item) => item.id);
  const { data: existingGeneratedPlannedTransactions, error: existingGeneratedError } = await client
    .from('planned_transactions')
    .select(existingGeneratedColumns)
    .in('recurring_expense_id', recurringExpenseIds)
    .lte('planned_date', upToDate);

  if (existingGeneratedError) {
    throw existingGeneratedError;
  }

  const existingGenerationKeys = new Set(
    (existingGeneratedPlannedTransactions ?? []).map((item) => `${item.recurring_expense_id}:${item.planned_date}`),
  );

  let generatedCount = 0;
  let processedRecurringCount = 0;

  for (const recurringExpense of activeRecurringExpenses) {
    const dueDates = getDueDatesForRecurringExpense(recurringExpense, upToDate);

    if (dueDates.length === 0) {
      continue;
    }

    processedRecurringCount += 1;

    for (const dueDate of dueDates) {
      const generationKey = `${recurringExpense.id}:${dueDate}`;

      if (existingGenerationKeys.has(generationKey) || !recurringExpense.categoryId) {
        continue;
      }

      const plannedTransaction = await createGeneratedPlannedTransaction({
        userId,
        recurringExpense,
        plannedDate: dueDate,
      });

      try {
        await createGeneratedPlannedTransactionSplit({
          plannedTransactionId: plannedTransaction.id,
          categoryId: recurringExpense.categoryId,
          amountOriginal: recurringExpense.default_amount_original,
          amountBase: recurringExpense.default_amount_original,
          note: recurringExpense.note,
        });
      } catch (error) {
        try {
          await bestEffortDeletePlannedTransaction(plannedTransaction.id);
        } catch {
          // Ignore cleanup failures and surface the original split error.
        }

        throw error;
      }

      existingGenerationKeys.add(generationKey);
      generatedCount += 1;
    }

    const latestProcessedDueDate = dueDates[dueDates.length - 1];

    if (latestProcessedDueDate && latestProcessedDueDate !== recurringExpense.last_generated_for_date) {
      const { error: updateGenerationError } = await client
        .from('recurring_expenses')
        .update({
          last_generated_for_date: latestProcessedDueDate,
          updated_at: new Date().toISOString(),
        })
        .eq('id', recurringExpense.id);

      if (updateGenerationError) {
        throw updateGenerationError;
      }
    }
  }

  return {
    generatedCount,
    processedRecurringCount,
  };
}

export { supportedTransactionCurrencies };
