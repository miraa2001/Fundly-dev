import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthButton from '../components/auth/AuthButton';
import AuthField from '../components/auth/AuthField';
import AuthLayout from '../components/auth/AuthLayout';
import StatusMessage from '../components/auth/StatusMessage';
import { LockIcon, MailIcon } from '../components/auth/icons';
import { ensureSupabase } from '../lib/supabase';
import { normalizeEmail, validateLoginForm } from '../lib/validation';

const initialForm = {
  email: '',
  password: '',
};

function getLoginErrorMessage(error) {
  const message = error?.message?.toLowerCase?.() ?? '';

  if (message.includes('invalid login credentials')) {
    return 'The email or password does not match our records.';
  }

  return error?.message || 'Something went wrong while signing you in. Please try again.';
}

export default function LoginPage() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
    setStatus(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validateLoginForm(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsLoading(true);
    setStatus(null);

    try {
      const supabase = ensureSupabase();
      const { error } = await supabase.auth.signInWithPassword({
        email: normalizeEmail(form.email),
        password: form.password,
      });

      if (error) {
        throw error;
      }

      setStatus({
        tone: 'success',
        message: 'Welcome back! Taking you to your dashboard...',
      });
    } catch (error) {
      setStatus({
        tone: 'error',
        message: getLoginErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Your Money, Simplified"
      title="Welcome back to Fundly"
      description="Track spending, set budgets, and reach your savings goals — all in one place."
    >
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <StatusMessage tone={status?.tone} message={status?.message} />

        <AuthField
          id="email"
          label="Email"
          type="email"
          icon={MailIcon}
          placeholder="Enter your email"
          autoComplete="email"
          inputMode="email"
          value={form.email}
          error={errors.email}
          onChange={(event) => updateField('email', event.target.value)}
        />

        <AuthField
          id="password"
          label="Password"
          icon={LockIcon}
          placeholder="Enter your password"
          autoComplete="current-password"
          value={form.password}
          error={errors.password}
          onChange={(event) => updateField('password', event.target.value)}
          allowPasswordToggle
          action={
            <Link
              to="/forgot-password"
              className="text-xs font-bold text-[#087f98] transition hover:text-[#d8881f] sm:text-sm"
            >
              Forgot password?
            </Link>
          }
        />

        <AuthButton type="submit" isLoading={isLoading} loadingLabel="Signing you in...">
          Sign in
        </AuthButton>
      </form>
    </AuthLayout>
  );
}
