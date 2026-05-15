import { requireSupabase } from './supabase.js';

export async function fetchCategories(userId, includeHidden = true) {
  const client = requireSupabase();
  let query = client
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('is_hidden', { ascending: true })
    .order('name', { ascending: true });

  if (!includeHidden) {
    query = query.eq('is_hidden', false);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function createCategory(category) {
  const client = requireSupabase();
  const { data, error } = await client
    .from('categories')
    .insert(category)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateCategory(categoryId, updates) {
  const client = requireSupabase();
  const { data, error } = await client
    .from('categories')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', categoryId)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}
