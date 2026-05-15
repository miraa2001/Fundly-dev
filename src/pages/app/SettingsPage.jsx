import { useEffect, useState } from 'react';
import StatusMessage from '../../components/auth/StatusMessage.jsx';
import { useAuth } from '../../lib/auth-context.jsx';

export default function SettingsPage() {
  const { profile, saveProfile, user } = useAuth();
  const [form, setForm] = useState({
    display_name: '',
    base_currency: 'NIS',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) {
      return;
    }

    setForm({
      display_name: profile.display_name ?? '',
      base_currency: profile.base_currency ?? 'NIS',
    });
  }, [profile]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await saveProfile({
        display_name: form.display_name.trim() || null,
        base_currency: form.base_currency.trim().toUpperCase(),
      });
      setSuccess('Your profile has been updated.');
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
      <section className="page-panel">
        <p className="section-kicker">Profile</p>
        <h2 className="mt-3 text-2xl text-ink">Keep the basics small.</h2>
        <p className="mt-3 max-w-xl text-base leading-7 text-ocean/70">
          Choose the name Fundly shows and the currency used in your expense totals.
        </p>

        <div className="mt-8 space-y-5">
          <StatusMessage>{error}</StatusMessage>
          <StatusMessage tone="success">{success}</StatusMessage>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="field-stack">
              <span className="field-label">Display name</span>
              <input
                type="text"
                name="display_name"
                value={form.display_name}
                onChange={updateField}
                className="field-input"
                placeholder="How should the app greet you?"
              />
            </label>

            <label className="field-stack">
              <span className="field-label">Base currency</span>
              <input
                required
                maxLength="3"
                minLength="3"
                type="text"
                name="base_currency"
                value={form.base_currency}
                onChange={updateField}
                className="field-input uppercase"
                placeholder="NIS"
              />
            </label>

            <button type="submit" disabled={saving} className="button-primary">
              {saving ? 'Saving...' : 'Save settings'}
            </button>
          </form>
        </div>
      </section>

      <section className="page-panel">
        <p className="section-kicker">Account</p>
        <h2 className="mt-3 text-2xl text-ink">A little context, nothing more.</h2>
        <div className="mt-8 space-y-4 text-base leading-7 text-ocean/70">
          <p>
            Signed in as <span className="text-ink">{user?.email}</span>.
          </p>
          <p>
            Theme stays intentionally restrained for now so the app can remain emotionally steady
            while the core logging flow settles in.
          </p>
        </div>
      </section>
    </div>
  );
}
