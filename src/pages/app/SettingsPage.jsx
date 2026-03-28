import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppPageHeader from '../../components/app/AppPageHeader';
import AppSurface from '../../components/app/AppSurface';
import AuthButton from '../../components/auth/AuthButton';
import StatusMessage from '../../components/auth/StatusMessage';
import { useAuthSession } from '../../lib/auth-context';
import {
  budgetAlertModeSuggestions,
  createInitialProfileSettingsFormState,
  loadProfileSettings,
  saveProfileSettings,
  themeSuggestions,
} from '../../lib/profile-settings';
import { ensureSupabase } from '../../lib/supabase';

const inputClassName =
  'mt-2 w-full rounded-[1rem] border border-[rgba(var(--fundly-primary-rgb),0.12)] bg-white/85 px-4 py-3 text-sm text-[var(--fundly-primary)] outline-none transition placeholder:text-[rgba(var(--fundly-primary-rgb),0.4)] focus:border-[rgba(var(--fundly-accent-rgb),0.42)] focus:ring-4 focus:ring-[rgba(var(--fundly-accent-rgb),0.14)]';
const helperTextClassName = 'mt-2 text-xs leading-5 text-[rgba(var(--fundly-primary-rgb),0.62)]';
const fieldErrorClassName = 'mt-2 text-xs font-semibold text-[var(--fundly-warm)]';
const commonBaseCurrencies = ['USD', 'EUR', 'GBP', 'ILS', 'NIS', 'CAD', 'AUD', 'JPY'];

function getSignOutErrorMessage(error) {
  return error?.message || 'We could not sign you out right now. Please try again.';
}

function getProfileSettingsErrorMessage(error, fallbackMessage) {
  const message = error?.message?.toLowerCase?.() ?? '';

  if (message.includes('numeric')) {
    return 'Monthly savings goal must be a valid number.';
  }

  return error?.message || fallbackMessage;
}

function validateSettingsForm(form) {
  const errors = {};
  const normalizedBaseCurrencyCode = form.baseCurrencyCode.trim().toUpperCase();
  const normalizedTheme = form.theme.trim();
  const normalizedBudgetAlertMode = form.budgetAlertMode.trim();

  if (!normalizedBaseCurrencyCode) {
    errors.baseCurrencyCode = 'Enter a base currency code.';
  } else if (normalizedBaseCurrencyCode.length < 3 || normalizedBaseCurrencyCode.length > 8) {
    errors.baseCurrencyCode = 'Use a short currency code like USD, EUR, or ILS.';
  }

  if (!normalizedTheme) {
    errors.theme = 'Choose a theme preference.';
  }

  if (!normalizedBudgetAlertMode) {
    errors.budgetAlertMode = 'Choose how budget alerts should behave.';
  }

  if (form.monthlySavingsGoal !== '') {
    const numericGoal = Number(form.monthlySavingsGoal);

    if (!Number.isFinite(numericGoal)) {
      errors.monthlySavingsGoal = 'Enter a valid savings goal.';
    } else if (numericGoal < 0) {
      errors.monthlySavingsGoal = 'Savings goal cannot be negative.';
    }
  }

  return errors;
}

function buildSelectOptions(suggestions, currentValue) {
  const nextOptions = [...suggestions];

  if (currentValue && !nextOptions.includes(currentValue)) {
    nextOptions.unshift(currentValue);
  }

  return nextOptions;
}

function formatBudgetAlertModeLabel(value) {
  switch (value) {
    case 'off':
      return 'Off';
    case 'warn_80':
      return 'Warn at 80%';
    case 'warn_100':
      return 'Warn at 100%';
    default:
      return value;
  }
}

function formatThemeLabel(value) {
  switch (value) {
    case 'system':
      return 'Match system';
    case 'light':
      return 'Light';
    case 'dark':
      return 'Dark';
    default:
      return value;
  }
}

function SettingsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-[1.3rem] border border-[rgba(var(--fundly-primary-rgb),0.12)] bg-white/70 px-4 py-4"
        >
          <div className="h-4 w-32 rounded-full bg-[rgba(var(--fundly-primary-rgb),0.10)]" />
          <div className="mt-3 h-11 rounded-[1rem] bg-[rgba(var(--fundly-primary-rgb),0.08)]" />
        </div>
      ))}
    </div>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuthSession();
  const [sessionStatus, setSessionStatus] = useState(null);
  const [settingsStatus, setSettingsStatus] = useState(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsLoadError, setSettingsLoadError] = useState('');
  const [profileSettings, setProfileSettings] = useState(null);
  const [settingsForm, setSettingsForm] = useState(createInitialProfileSettingsFormState());
  const [settingsErrors, setSettingsErrors] = useState({});

  const themeOptions = buildSelectOptions(themeSuggestions, settingsForm.theme);
  const budgetAlertModeOptions = buildSelectOptions(budgetAlertModeSuggestions, settingsForm.budgetAlertMode);

  async function handleSignOut() {
    setIsSigningOut(true);
    setSessionStatus(null);

    try {
      const client = ensureSupabase();
      const { error } = await client.auth.signOut();

      if (error) {
        throw error;
      }

      navigate('/login', { replace: true });
    } catch (error) {
      setSessionStatus({
        tone: 'error',
        message: getSignOutErrorMessage(error),
      });
    } finally {
      setIsSigningOut(false);
    }
  }

  async function refreshSettings() {
    if (!user?.id) {
      return;
    }

    setIsLoadingSettings(true);
    setSettingsLoadError('');

    try {
      const nextProfileSettings = await loadProfileSettings({ userId: user.id });
      setProfileSettings(nextProfileSettings);
      setSettingsForm(createInitialProfileSettingsFormState(nextProfileSettings));
      setSettingsErrors({});
    } catch (error) {
      setSettingsLoadError(getProfileSettingsErrorMessage(error, 'We could not load your settings right now.'));
    } finally {
      setIsLoadingSettings(false);
    }
  }

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    void refreshSettings();
  }, [user?.id]);

  function handleSettingsChange(field, value) {
    setSettingsForm((current) => ({
      ...current,
      [field]: field === 'baseCurrencyCode' ? value.toUpperCase() : value,
    }));
    setSettingsErrors((current) => ({ ...current, [field]: '' }));
    setSettingsStatus(null);
  }

  async function handleSettingsSubmit(event) {
    event.preventDefault();

    const nextErrors = validateSettingsForm(settingsForm);

    if (Object.keys(nextErrors).length > 0) {
      setSettingsErrors(nextErrors);
      return;
    }

    if (!user?.id) {
      setSettingsStatus({
        tone: 'error',
        message: 'You need to be signed in to update your settings.',
      });
      return;
    }

    setIsSavingSettings(true);
    setSettingsStatus(null);

    try {
      const nextProfileSettings = await saveProfileSettings({
        userId: user.id,
        values: settingsForm,
      });

      setProfileSettings(nextProfileSettings);
      setSettingsForm(createInitialProfileSettingsFormState(nextProfileSettings));
      setSettingsErrors({});
      setSettingsStatus({
        tone: 'success',
        message: 'Your settings were saved successfully.',
      });
    } catch (error) {
      setSettingsStatus({
        tone: 'error',
        message: getProfileSettingsErrorMessage(error, 'We could not save your settings right now.'),
      });
    } finally {
      setIsSavingSettings(false);
    }
  }

  return (
    <div className="space-y-5">
      <AppPageHeader
        eyebrow="Settings"
        title="Account and app preferences"
        description="Update your profile preferences here so Fundly can stay aligned with your base currency, alerts, and savings goals."
      />

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <AppSurface
          eyebrow="Account"
          title="Signed-in session"
          description="Your authenticated identity and session controls live here."
        >
          <div className="space-y-4">
            <StatusMessage tone={sessionStatus?.tone} message={sessionStatus?.message} />

            <div className="rounded-[1.3rem] border border-[rgba(var(--fundly-primary-rgb),0.12)] bg-white/70 px-4 py-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--fundly-accent)]">Email</p>
              <p className="mt-2 text-lg font-bold text-[var(--fundly-primary)]">{user?.email ?? 'Unknown email'}</p>
            </div>

            <div className="rounded-[1.3rem] border border-[rgba(var(--fundly-primary-rgb),0.12)] bg-white/70 px-4 py-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--fundly-accent)]">Profile status</p>
              <p className="mt-2 text-sm leading-6 text-[rgba(var(--fundly-primary-rgb),0.7)]">
                {profileSettings?.exists
                  ? 'Your profile preferences are already stored and can be updated any time.'
                  : 'Your profile preferences will be created the first time you save them here.'}
              </p>
            </div>

            {profileSettings?.chartPreferences !== null && profileSettings?.chartPreferences !== undefined ? (
              <div className="rounded-[1.3rem] border border-[rgba(var(--fundly-primary-rgb),0.12)] bg-white/70 px-4 py-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--fundly-accent)]">Charts</p>
                <p className="mt-2 text-sm leading-6 text-[rgba(var(--fundly-primary-rgb),0.7)]">
                  Chart preferences are already stored on your profile and ready for future chart controls.
                </p>
              </div>
            ) : null}

            <AuthButton
              type="button"
              onClick={handleSignOut}
              isLoading={isSigningOut}
              loadingLabel="Signing you out..."
            >
              Sign out
            </AuthButton>
          </div>
        </AppSurface>

        <AppSurface
          eyebrow="Preferences"
          title="Profile settings"
          description="These settings are saved to your real profile and used across the authenticated app."
        >
          <StatusMessage tone={settingsStatus?.tone} message={settingsStatus?.message} />

          {settingsLoadError ? (
            <div className="rounded-[1.3rem] border border-[rgba(var(--fundly-warm-rgb),0.18)] bg-[rgba(var(--fundly-warm-rgb),0.08)] px-4 py-4">
              <p className="font-bold text-[var(--fundly-primary)]">We could not load your settings</p>
              <p className="mt-2 text-sm leading-6 text-[rgba(var(--fundly-primary-rgb),0.72)]">{settingsLoadError}</p>
              <button
                type="button"
                onClick={() => void refreshSettings()}
                className="mt-4 inline-flex items-center justify-center rounded-full border border-[rgba(var(--fundly-warm-rgb),0.25)] bg-[rgba(var(--fundly-warm-rgb),0.10)] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--fundly-warm)] transition hover:border-[rgba(var(--fundly-warm-rgb),0.40)]"
              >
                Retry
              </button>
            </div>
          ) : isLoadingSettings ? (
            <SettingsSkeleton />
          ) : (
            <form className="space-y-4" onSubmit={handleSettingsSubmit}>
              <div className="rounded-[1.3rem] border border-[rgba(var(--fundly-primary-rgb),0.12)] bg-white/70 px-4 py-4">
                <label className="block text-sm font-bold text-[var(--fundly-primary)]" htmlFor="settings-base-currency">
                  Base currency
                </label>
                <input
                  id="settings-base-currency"
                  name="baseCurrencyCode"
                  type="text"
                  list="settings-base-currency-options"
                  value={settingsForm.baseCurrencyCode}
                  onChange={(event) => handleSettingsChange('baseCurrencyCode', event.target.value)}
                  className={inputClassName}
                  placeholder="USD"
                  autoComplete="off"
                />
                <datalist id="settings-base-currency-options">
                  {commonBaseCurrencies.map((currencyCode) => (
                    <option key={currencyCode} value={currencyCode} />
                  ))}
                </datalist>
                <p className={helperTextClassName}>Fundly uses this as your profile currency reference when base amounts are needed.</p>
                {settingsErrors.baseCurrencyCode ? <p className={fieldErrorClassName}>{settingsErrors.baseCurrencyCode}</p> : null}
              </div>

              <div className="rounded-[1.3rem] border border-[rgba(var(--fundly-primary-rgb),0.12)] bg-white/70 px-4 py-4">
                <label className="block text-sm font-bold text-[var(--fundly-primary)]" htmlFor="settings-theme">
                  Theme
                </label>
                <select
                  id="settings-theme"
                  name="theme"
                  value={settingsForm.theme}
                  onChange={(event) => handleSettingsChange('theme', event.target.value)}
                  className={inputClassName}
                >
                  {themeOptions.map((themeValue) => (
                    <option key={themeValue} value={themeValue}>
                      {formatThemeLabel(themeValue)}
                    </option>
                  ))}
                </select>
                <p className={helperTextClassName}>This setting is persisted now, even if broader theme switching is still evolving.</p>
                {settingsErrors.theme ? <p className={fieldErrorClassName}>{settingsErrors.theme}</p> : null}
              </div>

              <div className="rounded-[1.3rem] border border-[rgba(var(--fundly-primary-rgb),0.12)] bg-white/70 px-4 py-4">
                <label className="block text-sm font-bold text-[var(--fundly-primary)]" htmlFor="settings-budget-alert-mode">
                  Budget alert mode
                </label>
                <select
                  id="settings-budget-alert-mode"
                  name="budgetAlertMode"
                  value={settingsForm.budgetAlertMode}
                  onChange={(event) => handleSettingsChange('budgetAlertMode', event.target.value)}
                  className={inputClassName}
                >
                  {budgetAlertModeOptions.map((modeValue) => (
                    <option key={modeValue} value={modeValue}>
                      {formatBudgetAlertModeLabel(modeValue)}
                    </option>
                  ))}
                </select>
                <p className={helperTextClassName}>Choose when Fundly should start warning you as category budgets fill up.</p>
                {settingsErrors.budgetAlertMode ? <p className={fieldErrorClassName}>{settingsErrors.budgetAlertMode}</p> : null}
              </div>

              <div className="rounded-[1.3rem] border border-[rgba(var(--fundly-primary-rgb),0.12)] bg-white/70 px-4 py-4">
                <label className="block text-sm font-bold text-[var(--fundly-primary)]" htmlFor="settings-monthly-savings-goal">
                  Monthly savings goal
                </label>
                <input
                  id="settings-monthly-savings-goal"
                  name="monthlySavingsGoal"
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={settingsForm.monthlySavingsGoal}
                  onChange={(event) => handleSettingsChange('monthlySavingsGoal', event.target.value)}
                  className={inputClassName}
                  placeholder="0.00"
                />
                <p className={helperTextClassName}>Set a monthly savings target to keep your profile goals visible as the app grows.</p>
                {settingsErrors.monthlySavingsGoal ? (
                  <p className={fieldErrorClassName}>{settingsErrors.monthlySavingsGoal}</p>
                ) : null}
              </div>

              <div className="rounded-[1.3rem] border border-[rgba(var(--fundly-primary-rgb),0.12)] bg-white/70 px-4 py-4">
                <label className="flex items-start justify-between gap-4" htmlFor="settings-push-notifications-enabled">
                  <span className="pr-4">
                    <span className="block text-sm font-bold text-[var(--fundly-primary)]">Push notifications</span>
                    <span className={helperTextClassName}>
                      Save whether budget and activity nudges should be enabled for your account when notification delivery is wired up.
                    </span>
                  </span>
                  <span
                    className={[
                      'relative mt-0.5 inline-flex h-7 w-12 shrink-0 rounded-full p-1 transition',
                      settingsForm.pushNotificationsEnabled
                        ? 'bg-[linear-gradient(90deg,var(--fundly-accent)_0%,var(--fundly-primary)_58%,var(--fundly-deep)_100%)]'
                        : 'bg-[rgba(var(--fundly-primary-rgb),0.14)]',
                    ].join(' ')}
                  >
                    <span
                      className={[
                        'h-5 w-5 rounded-full bg-white shadow-[0_4px_12px_rgba(var(--fundly-deep-rgb),0.18)] transition',
                        settingsForm.pushNotificationsEnabled ? 'translate-x-5' : 'translate-x-0',
                      ].join(' ')}
                    />
                  </span>
                </label>
                <input
                  id="settings-push-notifications-enabled"
                  name="pushNotificationsEnabled"
                  type="checkbox"
                  checked={settingsForm.pushNotificationsEnabled}
                  onChange={(event) => handleSettingsChange('pushNotificationsEnabled', event.target.checked)}
                  className="sr-only"
                />
              </div>

              <div className="pt-1">
                <AuthButton
                  type="submit"
                  isLoading={isSavingSettings}
                  loadingLabel="Saving settings..."
                >
                  Save settings
                </AuthButton>
              </div>
            </form>
          )}
        </AppSurface>
      </div>
    </div>
  );
}
