import { getProfileBaseCurrencyCode, loadUserProfile } from './profiles';
import { ensureSupabase } from './supabase';

const fallbackSavingsCurrencyCode = 'NIS';

export const savingsErrorCodes = {
  profileMissing: 'SAVINGS_PROFILE_MISSING',
  insufficientBalance: 'INSUFFICIENT_SAVINGS_BALANCE',
  currencyMismatch: 'SAVINGS_CURRENCY_MISMATCH',
  syncFailed: 'SAVINGS_BALANCE_SYNC_FAILED',
  syncUncertain: 'SAVINGS_BALANCE_SYNC_UNCERTAIN',
};

function normalizeCurrencyCode(value, fallback = fallbackSavingsCurrencyCode) {
  const normalizedValue = value?.trim().toUpperCase() ?? '';
  return normalizedValue || fallback;
}

function getCurrencyComparisonCode(value) {
  const normalizedValue = normalizeCurrencyCode(value);
  return normalizedValue === 'NIS' ? 'ILS' : normalizedValue;
}

function toMoneyNumber(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function formatMoneyValue(value) {
  return toMoneyNumber(value).toFixed(2);
}

function createSavingsError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function mapSavingsProfile(profile, { userId } = {}) {
  return {
    id: profile?.id ?? userId ?? '',
    savingsBalance: toMoneyNumber(profile?.savings_balance),
    baseCurrencyCode: getProfileBaseCurrencyCode(profile, fallbackSavingsCurrencyCode),
    exists: Boolean(profile?.id),
  };
}

export async function loadSavingsProfile({ userId }) {
  const data = await loadUserProfile({ userId });

  return mapSavingsProfile(data, { userId });
}

export async function planSavingsDeduction({ userId, amountBase, transactionBaseCurrencyCode }) {
  const profile = await loadSavingsProfile({ userId });
  const normalizedTransactionBaseCurrencyCode = normalizeCurrencyCode(transactionBaseCurrencyCode);
  const amountToDeduct = toMoneyNumber(amountBase);

  if (!profile.exists) {
    throw createSavingsError(
      savingsErrorCodes.profileMissing,
      'Your profile savings balance is not available yet. Save your settings first, then try again.',
    );
  }

  if (amountToDeduct <= 0) {
    return {
      ...profile,
      amountToDeduct: 0,
      nextSavingsBalance: profile.savingsBalance,
    };
  }

  if (getCurrencyComparisonCode(normalizedTransactionBaseCurrencyCode) !== getCurrencyComparisonCode(profile.baseCurrencyCode)) {
    throw createSavingsError(
      savingsErrorCodes.currencyMismatch,
      `Savings spending is only available when the transaction base currency matches your profile base currency (${profile.baseCurrencyCode}).`,
    );
  }

  if (amountToDeduct > profile.savingsBalance) {
    throw createSavingsError(
      savingsErrorCodes.insufficientBalance,
      `This payment is larger than your current savings balance of ${formatMoneyValue(profile.savingsBalance)} ${profile.baseCurrencyCode}.`,
    );
  }

  return {
    ...profile,
    amountToDeduct,
    nextSavingsBalance: toMoneyNumber(profile.savingsBalance - amountToDeduct),
  };
}

export async function saveSavingsBalance({ userId, nextSavingsBalance }) {
  const client = ensureSupabase();
  const { data, error } = await client
    .from('profiles')
    .update({
      savings_balance: formatMoneyValue(nextSavingsBalance),
    })
    .eq('id', userId)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return mapSavingsProfile(data, { userId });
}
