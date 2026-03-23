import { fundlyPalette } from './palette';
import { ensureSupabase } from './supabase';

const categoryColumns = 'id, user_id, name, kind, color, is_archived, created_at, updated_at';
const categoryBudgetColumns = 'id, user_id, category_id, month_key, budget_limit, created_at, updated_at';

export const defaultCategoryColor = fundlyPalette.primary;
export const suggestedCategoryKinds = ['expense', 'income'];
export const categoryColorPresets = [
  fundlyPalette.primary,
  '#173754',
  fundlyPalette.deep,
  fundlyPalette.accent,
  '#8F6847',
  fundlyPalette.warm,
  '#6A3627',
  fundlyPalette.surface,
];

export function normalizeHexColor(value) {
  const trimmedValue = value?.trim() ?? '';

  if (/^#[0-9a-f]{6}$/i.test(trimmedValue)) {
    return trimmedValue.toUpperCase();
  }

  if (/^#[0-9a-f]{3}$/i.test(trimmedValue)) {
    const [hash, r, g, b] = trimmedValue;
    return `${hash}${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }

  return '';
}

export function getCategoryAccentColor(value) {
  return normalizeHexColor(value) || defaultCategoryColor;
}

function normalizeCategoryPayload(values) {
  return {
    name: values.name.trim(),
    kind: values.kind.trim().toLowerCase(),
    color: values.color.trim() || null,
  };
}

export function formatCategoryKind(kind) {
  return (kind ?? '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function getCurrentMonthKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}-01`;
}

export function formatMonthKey(monthKey) {
  const [year, month] = (monthKey ?? '').split('-').map(Number);

  if (!year || !month) {
    return 'Current month';
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, 1));
}

function normalizeBudgetLimit(value) {
  const trimmedValue = String(value ?? '').trim();
  return trimmedValue ? trimmedValue : null;
}

export async function listCategories({ includeArchived = false } = {}) {
  const client = ensureSupabase();
  const monthKey = getCurrentMonthKey();
  let query = client
    .from('categories')
    .select(categoryColumns)
    .order('is_archived', { ascending: true })
    .order('kind', { ascending: true })
    .order('name', { ascending: true });

  if (!includeArchived) {
    query = query.eq('is_archived', false);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  const categories = data ?? [];

  if (categories.length === 0) {
    return [];
  }

  const categoryIds = categories.map((category) => category.id);
  const { data: budgets, error: budgetError } = await client
    .from('category_budgets')
    .select(categoryBudgetColumns)
    .eq('month_key', monthKey)
    .in('category_id', categoryIds);

  if (budgetError) {
    throw budgetError;
  }

  const budgetByCategoryId = new Map((budgets ?? []).map((budget) => [budget.category_id, budget]));

  return categories.map((category) => {
    const currentMonthBudget = budgetByCategoryId.get(category.id);

    return {
      ...category,
      currentMonthBudgetId: currentMonthBudget?.id ?? '',
      currentMonthBudget: currentMonthBudget?.budget_limit ?? null,
      currentMonthKey: monthKey,
    };
  });
}

export async function createCategory({ userId, values }) {
  const client = ensureSupabase();
  const { data, error } = await client
    .from('categories')
    .insert({
      user_id: userId,
      ...normalizeCategoryPayload(values),
      is_archived: false,
      updated_at: new Date().toISOString(),
    })
    .select(categoryColumns)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateCategory({ id, values }) {
  const client = ensureSupabase();
  const { data, error } = await client
    .from('categories')
    .update({
      ...normalizeCategoryPayload(values),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select(categoryColumns)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function archiveCategory({ id }) {
  const client = ensureSupabase();
  const { data, error } = await client
    .from('categories')
    .update({
      is_archived: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select(categoryColumns)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function unarchiveCategory({ id }) {
  const client = ensureSupabase();
  const { data, error } = await client
    .from('categories')
    .update({
      is_archived: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select(categoryColumns)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function saveCategoryBudget({ userId, categoryId, budgetLimit, monthKey = getCurrentMonthKey() }) {
  const client = ensureSupabase();
  const normalizedBudgetLimit = normalizeBudgetLimit(budgetLimit);

  const { data: existingBudget, error: existingBudgetError } = await client
    .from('category_budgets')
    .select(categoryBudgetColumns)
    .eq('category_id', categoryId)
    .eq('month_key', monthKey)
    .limit(1)
    .maybeSingle();

  if (existingBudgetError) {
    throw existingBudgetError;
  }

  if (!normalizedBudgetLimit) {
    if (!existingBudget) {
      return null;
    }

    const { error: deleteError } = await client
      .from('category_budgets')
      .delete()
      .eq('id', existingBudget.id);

    if (deleteError) {
      throw deleteError;
    }

    return null;
  }

  if (existingBudget) {
    const { data, error } = await client
      .from('category_budgets')
      .update({
        budget_limit: normalizedBudgetLimit,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingBudget.id)
      .select(categoryBudgetColumns)
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  const { data, error } = await client
    .from('category_budgets')
    .insert({
      user_id: userId,
      category_id: categoryId,
      month_key: monthKey,
      budget_limit: normalizedBudgetLimit,
    })
    .select(categoryBudgetColumns)
    .single();

  if (error) {
    throw error;
  }

  return data;
}
