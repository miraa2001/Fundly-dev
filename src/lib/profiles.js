import { requireSupabase } from './supabase.js';

export async function getProfile(userId) {
  const client = requireSupabase();
  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function ensureProfile(user) {
  const existingProfile = await getProfile(user.id);

  if (existingProfile) {
    return existingProfile;
  }

  const client = requireSupabase();
  const fallbackName =
    user.user_metadata?.display_name ??
    user.email?.split('@')[0] ??
    null;

  const { data, error } = await client
    .from('profiles')
    .insert({
      id: user.id,
      display_name: fallbackName,
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateProfile(userId, updates) {
  const client = requireSupabase();
  const { data, error } = await client
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}
