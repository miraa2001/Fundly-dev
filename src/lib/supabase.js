import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigError =
  'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.';

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
      })
    : null;

export function ensureSupabase() {
  if (!supabase) {
    throw new Error(supabaseConfigError);
  }

  return supabase;
}

export function getResetRedirectUrl() {
  if (typeof window === 'undefined') {
    return '';
  }

  return new URL('/reset-password', window.location.origin).toString();
}

