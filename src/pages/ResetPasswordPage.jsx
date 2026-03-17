import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthButton, { primaryButtonClassName } from '../components/auth/AuthButton';
import AuthField from '../components/auth/AuthField';
import AuthLayout from '../components/auth/AuthLayout';
import StatusMessage from '../components/auth/StatusMessage';
import { ArrowLeftIcon, LockIcon } from '../components/auth/icons';
import { ensureSupabase, supabase, supabaseConfigError } from '../lib/supabase';
import { validateResetPasswordForm } from '../lib/validation';

const initialForm = {
  password: '',
  confirmPassword: '',
};

function getResetErrorMessage(error) {
  const message = error?.message?.toLowerCase?.() ?? '';

  if (message.includes('same password')) {
    return 'Choose a different password than your current one.';
  }

  return error?.message || 'We could not update your password. Request a new reset link and try again.';
}

function cleanRecoveryUrl() {
  if (typeof window === 'undefined') {
    return;
  }

  window.history.replaceState({}, document.title, window.location.pathname);
}

export default function ResetPasswordPage() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({
    tone: 'info',
    message: 'Open this page from the password reset link in your email to continue.',
  });
  const [isCheckingRecovery, setIsCheckingRecovery] = useState(true);
  const [isRecoveryReady, setIsRecoveryReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setIsCheckingRecovery(false);
      setIsRecoveryReady(false);
      setStatus({ tone: 'error', message: supabaseConfigError });
      return undefined;
    }

    let active = true;
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const code = searchParams.get('code');
    const isRecoveryLink =
      searchParams.get('type') === 'recovery' ||
      hashParams.get('type') === 'recovery' ||
      Boolean(code) ||
      hashParams.has('access_token');

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) {
        return;
      }

      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session && isRecoveryLink)) {
        cleanRecoveryUrl();
        setIsRecoveryReady(true);
        setIsCheckingRecovery(false);
        setStatus({
          tone: 'info',
          message: 'Recovery session confirmed. Choose a new password below.',
        });
      }
    });

    async function prepareRecovery() {
      try {
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            throw error;
          }
        }

        const { data, error } = await supabase.auth.getSession();
        if (error) {
          throw error;
        }

        if (!active) {
          return;
        }

        if (data.session && isRecoveryLink) {
          cleanRecoveryUrl();
          setIsRecoveryReady(true);
          setStatus({
            tone: 'info',
            message: 'Recovery session confirmed. Choose a new password below.',
          });
        } else if (isRecoveryLink) {
          setIsRecoveryReady(false);
          setStatus({
            tone: 'error',
            message: 'This password reset link is invalid or has expired. Request a new email and try again.',
          });
        } else {
          setIsRecoveryReady(false);
          setStatus({
            tone: 'info',
            message: 'Open this page from the password reset link in your email to continue.',
          });
        }
      } catch (recoveryError) {
        if (!active) {
          return;
        }

        setIsRecoveryReady(false);
        setStatus({
          tone: 'error',
          message: getResetErrorMessage(recoveryError),
        });
      } finally {
        if (active) {
          setIsCheckingRecovery(false);
        }
      }
    }

    prepareRecovery();

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));

    if (status?.tone === 'error' && isRecoveryReady) {
      setStatus({
        tone: 'info',
        message: 'Recovery session confirmed. Choose a new password below.',
      });
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validateResetPasswordForm(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      const client = ensureSupabase();
      const { error } = await client.auth.updateUser({ password: form.password });

      if (error) {
        throw error;
      }

      await client.auth.signOut();
      setIsComplete(true);
      setStatus({
        tone: 'success',
        message: 'Your password has been updated. Sign in with your new password when you are ready.',
      });
      setForm(initialForm);
    } catch (submitError) {
      setStatus({
        tone: 'error',
        message: getResetErrorMessage(submitError),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Finish Reset"
      title="Create a new password"
      description="Choose a fresh password for Fundly. The form unlocks automatically when your reset link is valid."
    >
      <div className="space-y-5">
        <StatusMessage tone={status?.tone} message={status?.message} />

        {isComplete ? (
          <div className="space-y-4">
            <Link to="/login" className={primaryButtonClassName}>
              Return to login
            </Link>
            <Link
              to="/forgot-password"
              className="inline-flex items-center gap-2 text-sm font-medium text-clay/80 transition hover:text-clay"
            >
              <ArrowLeftIcon />
              Send another reset email
            </Link>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <AuthField
              id="new-password"
              label="New password"
              icon={LockIcon}
              placeholder="Create a new password"
              autoComplete="new-password"
              value={form.password}
              error={errors.password}
              onChange={(event) => updateField('password', event.target.value)}
              allowPasswordToggle
              disabled={!isRecoveryReady || isCheckingRecovery}
            />

            <AuthField
              id="confirm-password"
              label="Confirm password"
              icon={LockIcon}
              placeholder="Confirm your new password"
              autoComplete="new-password"
              value={form.confirmPassword}
              error={errors.confirmPassword}
              onChange={(event) => updateField('confirmPassword', event.target.value)}
              allowPasswordToggle
              disabled={!isRecoveryReady || isCheckingRecovery}
            />

            <AuthButton
              type="submit"
              isLoading={isSubmitting}
              loadingLabel="Updating password..."
              disabled={!isRecoveryReady || isCheckingRecovery}
            >
              {isCheckingRecovery ? 'Checking reset link...' : 'Update password'}
            </AuthButton>

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 font-medium text-clay/80 transition hover:text-clay"
              >
                <ArrowLeftIcon />
                Back to login
              </Link>
              <Link to="/forgot-password" className="font-medium text-teal transition hover:text-clay">
                Need a new reset email?
              </Link>
            </div>
          </form>
        )}
      </div>
    </AuthLayout>
  );
}
