import { Link } from 'react-router-dom';
import { useState } from 'react';
import AuthLayout from '../../components/auth/AuthLayout.jsx';
import StatusMessage from '../../components/auth/StatusMessage.jsx';
import { useAuth } from '../../lib/auth-context.jsx';

export default function ForgotPasswordPage() {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await sendPasswordReset(email);
      setSuccess('A reset link is on its way to your inbox.');
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Reset"
      title="Reset your password quietly."
      subtitle="Enter your email and Fundly will send a link to create a new password."
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <StatusMessage>{error}</StatusMessage>
        <StatusMessage tone="success">{success}</StatusMessage>

        <label className="field-stack">
          <span className="field-label">Email</span>
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="field-input"
            placeholder="you@example.com"
          />
        </label>

        <button type="submit" disabled={submitting} className="button-primary w-full">
          {submitting ? 'Sending link...' : 'Send reset link'}
        </button>
      </form>

      <div className="mt-6 text-sm text-ocean/75">
        <Link to="/login">Back to login</Link>
      </div>
    </AuthLayout>
  );
}
