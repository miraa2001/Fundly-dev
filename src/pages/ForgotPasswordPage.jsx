import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthButton from '../components/auth/AuthButton';
import AuthField from '../components/auth/AuthField';
import AuthLayout from '../components/auth/AuthLayout';
import StatusMessage from '../components/auth/StatusMessage';
import { ArrowLeftIcon, MailIcon } from '../components/auth/icons';
import { ensureSupabase, getResetRedirectUrl } from '../lib/supabase';
import { normalizeEmail, validateForgotPasswordForm } from '../lib/validation';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validateForgotPasswordForm({ email });
    if (nextErrors.email) {
      setError(nextErrors.email);
      return;
    }

    setError('');
    setIsLoading(true);
    setStatus(null);

    try {
      const supabase = ensureSupabase();
      const { error: authError } = await supabase.auth.resetPasswordForEmail(normalizeEmail(email), {
        redirectTo: getResetRedirectUrl(),
      });

      if (authError) {
        throw authError;
      }

      setStatus({
        tone: 'success',
        message: 'Check your email for a password reset link. The link will bring you back to Fundly to finish the update.',
      });
    } catch (requestError) {
      setStatus({
        tone: 'error',
        message: requestError.message || 'We could not send the reset email. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Password Recovery"
      title="Reset your password"
      description="Enter the email you use for Fundly and we will send a secure reset link."
    >
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <StatusMessage tone={status?.tone} message={status?.message} />

        <AuthField
          id="forgot-email"
          label="Email"
          type="email"
          icon={MailIcon}
          placeholder="Enter your email"
          autoComplete="email"
          inputMode="email"
          value={email}
          error={error}
          onChange={(event) => {
            setEmail(event.target.value);
            setError('');
            setStatus(null);
          }}
        />

        <AuthButton type="submit" isLoading={isLoading} loadingLabel="Sending reset link...">
          Send reset link
        </AuthButton>

        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm font-medium text-clay/80 transition hover:text-clay"
        >
          <ArrowLeftIcon />
          Back to login
        </Link>
      </form>
    </AuthLayout>
  );
}

