import { defaultBaseCurrency } from './transactions';
import { ensureSupabase } from './supabase';

const profileColumns = '*';

function normalizeCurrencyCode(value, fallback = defaultBaseCurrency) {
  const normalizedValue = value?.trim().toUpperCase() ?? '';
  return normalizedValue || fallback;
}

function isMissingProfileColumnError(error, columnName) {
  const message = error?.message?.toLowerCase?.() ?? '';
  return message.includes(`profiles.${columnName}`) && message.includes('does not exist');
}

export function getProfileBaseCurrencyCode(profile, fallback = defaultBaseCurrency) {
  return normalizeCurrencyCode(profile?.base_currency_code ?? profile?.base_currency, fallback);
}

export async function loadUserProfile({ userId }) {
  const client = ensureSupabase();
  const { data, error } = await client
    .from('profiles')
    .select(profileColumns)
    .eq('id', userId)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ?? null;
}

export async function saveUserProfile({ userId, values }) {
  const client = ensureSupabase();
  const normalizedBaseCurrencyCode = normalizeCurrencyCode(values.baseCurrencyCode, defaultBaseCurrency);
  const commonPayload = {
    id: userId,
    theme: values.theme,
    budget_alert_mode: values.budgetAlertMode,
    push_notifications_enabled: Boolean(values.pushNotificationsEnabled),
    monthly_savings_goal: values.monthlySavingsGoal,
  };

  const primaryResult = await client
    .from('profiles')
    .upsert(
      {
        ...commonPayload,
        base_currency_code: normalizedBaseCurrencyCode,
      },
      { onConflict: 'id' },
    )
    .select(profileColumns)
    .single();

  if (!primaryResult.error) {
    return primaryResult.data;
  }

  if (!isMissingProfileColumnError(primaryResult.error, 'base_currency_code')) {
    throw primaryResult.error;
  }

  const fallbackResult = await client
    .from('profiles')
    .upsert(
      {
        ...commonPayload,
        base_currency: normalizedBaseCurrencyCode,
      },
      { onConflict: 'id' },
    )
    .select(profileColumns)
    .single();

  if (fallbackResult.error) {
    throw fallbackResult.error;
  }

  return fallbackResult.data;
}
