import { defaultBaseCurrency } from './transactions';
import { getProfileBaseCurrencyCode, loadUserProfile, saveUserProfile } from './profiles';

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
    baseCurrencyCode: getProfileBaseCurrencyCode(profile, defaultBaseCurrency),
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
  const data = await loadUserProfile({ userId });

  return mapProfileSettings(data, { userId });
}

export async function saveProfileSettings({ userId, values }) {
  const data = await saveUserProfile({
    userId,
    values: {
      baseCurrencyCode: normalizeCurrencyCode(values.baseCurrencyCode, defaultBaseCurrency),
      theme: normalizeOptionalText(values.theme, 'system'),
      budgetAlertMode: normalizeOptionalText(values.budgetAlertMode, 'warn_80'),
      pushNotificationsEnabled: Boolean(values.pushNotificationsEnabled),
      monthlySavingsGoal: normalizeMonthlySavingsGoal(values.monthlySavingsGoal),
    },
  });

  return mapProfileSettings(data, { userId });
}
