import { defaultBaseCurrency } from './transactions';
import { ensureSupabase } from './supabase';

const profileSettingsColumns = '*';

export const themeSuggestions = ['system', 'light', 'dark'];
export const budgetAlertModeSuggestions = ['off', 'warn_80', 'warn_100'];

function normalizeOptionalText(value, fallback = '') {
  const trimmedValue = value?.trim() ?? '';
  return trimmedValue || fallback;
}

function normalizeCurrencyCode(value, fallback = defaultBaseCurrency) {
  const normalizedValue = value?.trim().toUpperCase() ?? '';
  return normalizedValue || fallback;
}

function normalizeBoolean(value, fallback = false) {
  return typeof value === 'boolean' ? value : fallback;
}

function normalizeMonthlySavingsGoal(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue < 0) {
    throw new Error('Enter a valid monthly savings goal.');
  }

  return numericValue.toFixed(2);
}

function mapProfileSettings(profile, { userId } = {}) {
  return {
    id: profile?.id ?? userId ?? '',
    baseCurrencyCode: normalizeCurrencyCode(profile?.base_currency_code ?? profile?.base_currency, defaultBaseCurrency),
    theme: normalizeOptionalText(profile?.theme, 'system'),
    budgetAlertMode: normalizeOptionalText(profile?.budget_alert_mode, 'warn_80'),
    pushNotificationsEnabled: normalizeBoolean(profile?.push_notifications_enabled, false),
    monthlySavingsGoal:
      profile?.monthly_savings_goal === null || profile?.monthly_savings_goal === undefined
        ? null
        : Number(profile.monthly_savings_goal),
    chartPreferences: profile?.chart_preferences ?? null,
    exists: Boolean(profile?.id),
  };
}

export function createInitialProfileSettingsFormState(profileSettings = {}) {
  return {
    baseCurrencyCode: profileSettings.baseCurrencyCode ?? defaultBaseCurrency,
    theme: profileSettings.theme ?? 'system',
    budgetAlertMode: profileSettings.budgetAlertMode ?? 'warn_80',
    pushNotificationsEnabled: Boolean(profileSettings.pushNotificationsEnabled),
    monthlySavingsGoal:
      profileSettings.monthlySavingsGoal === null || profileSettings.monthlySavingsGoal === undefined
        ? ''
        : String(profileSettings.monthlySavingsGoal),
  };
}

export async function loadProfileSettings({ userId }) {
  const client = ensureSupabase();
  const { data, error } = await client
    .from('profiles')
    .select(profileSettingsColumns)
    .eq('id', userId)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return mapProfileSettings(data, { userId });
}

export async function saveProfileSettings({ userId, values }) {
  const client = ensureSupabase();
  const payload = {
    id: userId,
    base_currency_code: normalizeCurrencyCode(values.baseCurrencyCode, defaultBaseCurrency),
    theme: normalizeOptionalText(values.theme, 'system'),
    budget_alert_mode: normalizeOptionalText(values.budgetAlertMode, 'warn_80'),
    push_notifications_enabled: Boolean(values.pushNotificationsEnabled),
    monthly_savings_goal: normalizeMonthlySavingsGoal(values.monthlySavingsGoal),
  };

  const { data, error } = await client
    .from('profiles')
    .upsert(payload, { onConflict: 'id' })
    .select(profileSettingsColumns)
    .single();

  if (error) {
    throw error;
  }

  return mapProfileSettings(data, { userId });
}
