import { Link } from 'react-router-dom';
import { useState } from 'react';
import AuthLayout from '../../components/auth/AuthLayout.jsx';
import StatusMessage from '../../components/auth/StatusMessage.jsx';
import { useAuth } from '../../lib/auth-context.jsx';

export default function SignupPage() {
  const { signUp } = useAuth();
  const [form, setForm] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords need to match.');
      return;
    }

    setSubmitting(true);

    try {
      const result = await signUp(form);
      const needsEmailConfirmation = !result.session;

      setSuccess(
        needsEmailConfirmation
          ? 'Check your email for the confirmation link before logging in.'
          : 'Your account is ready. You can head straight in.',
      );
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Signup"
      title="Make a small space for your spending notes."
      subtitle="Create your account and keep the experience light from the first day."
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <StatusMessage>{error}</StatusMessage>
        <StatusMessage tone="success">{success}</StatusMessage>

        <label className="field-stack">
          <span className="field-label">Display name</span>
          <input
            type="text"
            name="displayName"
            value={form.displayName}
            onChange={updateField}
            className="field-input"
            placeholder="What should Fundly call you?"
          />
        </label>

        <label className="field-stack">
          <span className="field-label">Email</span>
          <input
            required
            type="email"
            name="email"
            value={form.email}
            onChange={updateField}
            className="field-input"
            placeholder="you@example.com"
          />
        </label>

        <label className="field-stack">
          <span className="field-label">Password</span>
          <input
            required
            minLength="6"
            type="password"
            name="password"
            value={form.password}
            onChange={updateField}
            className="field-input"
            placeholder="At least 6 characters"
          />
        </label>

        <label className="field-stack">
          <span className="field-label">Confirm password</span>
          <input
            required
            minLength="6"
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={updateField}
            className="field-input"
            placeholder="Repeat your password"
          />
        </label>

        <button type="submit" disabled={submitting} className="button-primary w-full">
          {submitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <div className="mt-6 text-sm text-ocean/75">
        <Link to="/login">Already have an account?</Link>
      </div>
    </AuthLayout>
  );
}
