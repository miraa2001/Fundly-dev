import { ensureSupabase } from './supabase';

const categoryColumns = 'id, user_id, name, kind, color, icon, is_archived, created_at, updated_at';

export const defaultCategoryColor = '#15AECA';
export const suggestedCategoryKinds = ['expense', 'income'];
export const categoryColorPresets = [
  '#15AECA',
  '#44E8F4',
  '#0A6A83',
  '#FFD45A',
  '#F6C53D',
  '#E3A28A',
  '#9CEFE5',
  '#0E728D',
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
    icon: values.icon.trim() || null,
  };
}

export function formatCategoryKind(kind) {
  return (kind ?? '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export async function listCategories({ includeArchived = false } = {}) {
  const client = ensureSupabase();
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

  return data ?? [];
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
