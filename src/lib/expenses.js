import { requireSupabase } from './supabase.js';

const expenseSelect = `
  id,
  user_id,
  category_id,
  amount,
  note,
  expense_date,
  created_at,
  updated_at,
  category:categories (
    id,
    name,
    color,
    is_hidden
  )
`;

export async function fetchRecentExpenses(userId, limit = 60) {
  const client = requireSupabase();
  const { data, error } = await client
    .from('expenses')
    .select(expenseSelect)
    .eq('user_id', userId)
    .order('expense_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function fetchDailyTotal(userId, expenseDate) {
  const client = requireSupabase();
  const { data, error } = await client
    .from('expenses')
    .select('amount')
    .eq('user_id', userId)
    .eq('expense_date', expenseDate);

  if (error) {
    throw error;
  }

  return (data ?? []).reduce((sum, item) => sum + Number(item.amount ?? 0), 0);
}

export async function createExpense(expense) {
  const client = requireSupabase();
  const { data, error } = await client
    .from('expenses')
    .insert(expense)
    .select(expenseSelect)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateExpense(expenseId, updates) {
  const client = requireSupabase();
  const { data, error } = await client
    .from('expenses')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', expenseId)
    .select(expenseSelect)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteExpense(expenseId) {
  const client = requireSupabase();
  const { error } = await client
    .from('expenses')
    .delete()
    .eq('id', expenseId);

  if (error) {
    throw error;
  }
}
