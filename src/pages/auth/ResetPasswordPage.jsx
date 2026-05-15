import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import AuthLayout from '../../components/auth/AuthLayout.jsx';
import StatusMessage from '../../components/auth/StatusMessage.jsx';
import { useAuth } from '../../lib/auth-context.jsx';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();
  const [form, setForm] = useState({
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
      await updatePassword(form.password);
      setSuccess('Your password has been updated.');
      window.setTimeout(() => navigate('/app'), 900);
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="New Password"
      title="Choose a new password."
      subtitle="Open the reset link from your email first, then set a password that feels easy to keep."
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <StatusMessage>{error}</StatusMessage>
        <StatusMessage tone="success">{success}</StatusMessage>

        <label className="field-stack">
          <span className="field-label">New password</span>
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
          {submitting ? 'Saving password...' : 'Save new password'}
        </button>
      </form>

      <div className="mt-6 text-sm text-ocean/75">
        <Link to="/login">Back to login</Link>
      </div>
    </AuthLayout>
  );
}
