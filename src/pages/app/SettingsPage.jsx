import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppPageHeader from '../../components/app/AppPageHeader';
import AppSurface from '../../components/app/AppSurface';
import AuthButton from '../../components/auth/AuthButton';
import StatusMessage from '../../components/auth/StatusMessage';
import { useAuthSession } from '../../lib/auth-context';
import { ensureSupabase } from '../../lib/supabase';
import { settingsPreferences } from '../../lib/mock-app-data';

function getSignOutErrorMessage(error) {
  return error?.message || 'We could not sign you out right now. Please try again.';
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuthSession();
  const [status, setStatus] = useState(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);
    setStatus(null);

    try {
      const client = ensureSupabase();
      const { error } = await client.auth.signOut();

      if (error) {
        throw error;
      }

      navigate('/login', { replace: true });
    } catch (error) {
      setStatus({
        tone: 'error',
        message: getSignOutErrorMessage(error),
      });
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <div className="space-y-5">
      <AppPageHeader
        eyebrow="Settings"
        title="Account and app preferences"
        description="A clean placeholder for profile details, preferences, and session actions while the rest of the authenticated product is still being built."
      />

      <StatusMessage tone={status?.tone} message={status?.message} />

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <AppSurface
          eyebrow="Account"
          title="Signed-in session"
          description="Your current authenticated identity and the main session action for now."
        >
          <div className="space-y-4">
            <div className="rounded-[1.3rem] border border-[rgba(var(--fundly-primary-rgb),0.12)] bg-white/70 px-4 py-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--fundly-accent)]">Email</p>
              <p className="mt-2 text-lg font-bold text-[var(--fundly-primary)]">{user?.email ?? 'Unknown email'}</p>
            </div>
            <div className="rounded-[1.3rem] border border-[rgba(var(--fundly-primary-rgb),0.12)] bg-white/70 px-4 py-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--fundly-accent)]">Session State</p>
              <p className="mt-2 text-sm leading-6 text-[rgba(var(--fundly-primary-rgb),0.7)]">
                You are currently signed in. Use the sign-out action below to return to the login screen.
              </p>
            </div>
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
          title="Future settings structure"
          description="Mock-only rows for the kind of controls that will live here later."
        >
          <div className="space-y-3">
            {settingsPreferences.map((item) => (
              <div
                key={item.label}
                className="flex items-start justify-between gap-4 rounded-[1.3rem] border border-[rgba(var(--fundly-primary-rgb),0.12)] bg-white/70 px-4 py-4"
              >
                <div>
                  <p className="font-bold text-[var(--fundly-primary)]">{item.label}</p>
                  <p className="mt-1 text-sm leading-6 text-[rgba(var(--fundly-primary-rgb),0.7)]">{item.value}</p>
                </div>
                <span className="mt-1 h-6 w-11 rounded-full bg-[linear-gradient(90deg,var(--fundly-accent)_0%,var(--fundly-primary)_58%,var(--fundly-deep)_100%)] p-1">
                  <span className="block h-4 w-4 rounded-full bg-white" />
                </span>
              </div>
            ))}
          </div>
        </AppSurface>
      </div>
    </div>
  );
}
