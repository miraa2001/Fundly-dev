import { useEffect, useState } from 'react';
import StatusMessage from '../../components/auth/StatusMessage.jsx';
import { useAuth } from '../../lib/auth-context.jsx';
import { createCategory, fetchCategories, updateCategory } from '../../lib/categories.js';

const categoryColors = ['#A67a53', '#401f14', '#0c2a46', '#d4c4b4', '#d8d8d8'];

const initialForm = {
  name: '',
  color: '#A67a53',
};

function sortCategories(items) {
  return [...items].sort((left, right) => {
    if (left.is_hidden !== right.is_hidden) {
      return Number(left.is_hidden) - Number(right.is_hidden);
    }

    return left.name.localeCompare(right.name);
  });
}

export default function CategoriesPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const visibleCategories = categories.filter((category) => !category.is_hidden);
  const hiddenCategories = categories.filter((category) => category.is_hidden);

  useEffect(() => {
    if (!user) {
      return;
    }

    async function loadCategories() {
      setLoading(true);
      setError('');

      try {
        const result = await fetchCategories(user.id);
        setCategories(sortCategories(result));
      } catch (nextError) {
        setError(nextError.message);
      } finally {
        setLoading(false);
      }
    }

    void loadCategories();
  }, [user]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function resetForm() {
    setForm(initialForm);
    setEditingId('');
  }

  function startEdit(category) {
    setEditingId(category.id);
    setForm({
      name: category.name,
      color: category.color || '#A67a53',
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!user) {
      return;
    }

    setSaving(true);
    setError('');

    try {
      if (editingId) {
        const updatedCategory = await updateCategory(editingId, {
          name: form.name.trim(),
          color: form.color,
        });
        setCategories((current) =>
          sortCategories(
            current.map((category) => (category.id === editingId ? updatedCategory : category)),
          ),
        );
      } else {
        const createdCategory = await createCategory({
          user_id: user.id,
          name: form.name.trim(),
          color: form.color,
        });
        setCategories((current) => sortCategories([...current, createdCategory]));
      }

      resetForm();
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleHidden(category) {
    try {
      const updatedCategory = await updateCategory(category.id, {
        is_hidden: !category.is_hidden,
      });
      setCategories((current) =>
        sortCategories(current.map((item) => (item.id === category.id ? updatedCategory : item))),
      );
    } catch (nextError) {
      setError(nextError.message);
    }
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="page-panel h-fit">
        <p className="section-kicker">{editingId ? 'Edit category' : 'New category'}</p>
        <h2 className="mt-3 text-2xl text-ink">
          {editingId ? 'Refine a category name.' : 'Keep categories simple.'}
        </h2>
        <p className="mt-3 text-base leading-7 text-ocean/70">
          A small list is enough. Hidden categories stay out of the expense form until you bring
          them back.
        </p>

        <div className="mt-8 space-y-5">
          <StatusMessage>{error}</StatusMessage>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="field-stack">
              <span className="field-label">Name</span>
              <input
                required
                minLength="2"
                maxLength="40"
                type="text"
                name="name"
                value={form.name}
                onChange={updateField}
                className="field-input"
                placeholder="Groceries, coffee, books..."
              />
            </label>

            <fieldset className="field-stack">
              <legend className="field-label">Color</legend>
              <div className="flex flex-wrap gap-3">
                {categoryColors.map((color) => (
                  <label
                    key={color}
                    className={`flex cursor-pointer items-center justify-center rounded-full border p-1.5 transition ${
                      form.color === color ? 'border-ink/30 bg-paper' : 'border-ink/10 bg-surface'
                    }`}
                  >
                    <input
                      type="radio"
                      name="color"
                      value={color}
                      checked={form.color === color}
                      onChange={updateField}
                      className="sr-only"
                    />
                    <span
                      className="h-8 w-8 rounded-full border border-white/80"
                      style={{ backgroundColor: color }}
                    />
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={saving} className="button-primary">
                {saving ? 'Saving...' : editingId ? 'Save category' : 'Create category'}
              </button>
              {editingId ? (
                <button type="button" className="button-secondary" onClick={resetForm}>
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </div>
      </section>

      <section className="space-y-6">
        <div className="page-panel">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="section-kicker">Active</p>
              <h2 className="mt-3 text-2xl text-ink">Visible categories.</h2>
            </div>
            {loading ? <p className="font-ui text-sm text-ocean/60">Loading...</p> : null}
          </div>

          <div className="mt-8 rounded-[1.75rem] border border-ink/10 bg-paper/70">
            {visibleCategories.length === 0 && !loading ? (
              <p className="px-5 py-5 text-sm leading-7 text-ocean/70">
                Add a few categories that feel useful and leave the rest out.
              </p>
            ) : null}

            {visibleCategories.map((category) => (
              <article
                key={category.id}
                className="list-divider flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <span
                    className="h-3.5 w-3.5 rounded-full"
                    style={{ backgroundColor: category.color || '#A67a53' }}
                  />
                  <div>
                    <p className="text-lg text-ink">{category.name}</p>
                    <p className="text-sm text-ocean/60">Shows up in the expense form.</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="button" className="button-ghost" onClick={() => startEdit(category)}>
                    Edit
                  </button>
                  <button type="button" className="button-ghost" onClick={() => toggleHidden(category)}>
                    Hide
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="page-panel">
          <p className="section-kicker">Hidden</p>
          <h2 className="mt-3 text-2xl text-ink">Tucked away for now.</h2>

          <div className="mt-8 rounded-[1.75rem] border border-ink/10 bg-paper/70">
            {hiddenCategories.length === 0 ? (
              <p className="px-5 py-5 text-sm leading-7 text-ocean/70">
                Hidden categories will wait here quietly when you need fewer choices.
              </p>
            ) : null}

            {hiddenCategories.map((category) => (
              <article
                key={category.id}
                className="list-divider flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <span
                    className="h-3.5 w-3.5 rounded-full"
                    style={{ backgroundColor: category.color || '#A67a53' }}
                  />
                  <div>
                    <p className="text-lg text-ink">{category.name}</p>
                    <p className="text-sm text-ocean/60">Hidden from expense selection.</p>
                  </div>
                </div>
                <button type="button" className="button-ghost" onClick={() => toggleHidden(category)}>
                  Unhide
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
