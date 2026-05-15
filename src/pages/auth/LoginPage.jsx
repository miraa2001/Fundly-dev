import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import AuthLayout from '../../components/auth/AuthLayout.jsx';
import StatusMessage from '../../components/auth/StatusMessage.jsx';
import { useAuth } from '../../lib/auth-context.jsx';

export default function LoginPage() {
  const navigate = useNavigate();
  const { authError, signIn } = useAuth();
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await signIn(form);
      navigate('/app');
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Login"
      title="Come back gently."
      subtitle="Sign in to continue logging expenses without noise or pressure."
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <StatusMessage>{error || authError}</StatusMessage>

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
            type="password"
            name="password"
            value={form.password}
            onChange={updateField}
            className="field-input"
            placeholder="Your password"
          />
        </label>

        <button type="submit" disabled={submitting} className="button-primary w-full">
          {submitting ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div className="mt-6 flex flex-col gap-3 text-sm text-ocean/75 sm:flex-row sm:justify-between">
        <Link to="/forgot-password">Forgot password?</Link>
        <Link to="/signup">Need an account?</Link>
      </div>
    </AuthLayout>
  );
}
