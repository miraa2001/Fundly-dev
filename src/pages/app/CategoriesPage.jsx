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

function CategoryRow({ category, onEdit, onToggleHidden }) {
  return (
    <article className="list-divider py-4">
      <div className="flex items-start gap-3">
        <span
          className="mt-1 h-3 w-3 shrink-0 rounded-full"
          style={{ backgroundColor: category.color || '#A67a53' }}
        />
        <div className="min-w-0 flex-1">
          <p className="text-lg leading-tight text-ink">{category.name}</p>
          <p className="mt-1 font-ui text-xs text-ocean/60">
            {category.is_hidden ? 'Hidden' : 'Visible'}
          </p>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <button type="button" className="button-ghost" onClick={() => onEdit(category)}>
          Edit
        </button>
        <button type="button" className="button-ghost" onClick={() => onToggleHidden(category)}>
          {category.is_hidden ? 'Unhide' : 'Hide'}
        </button>
      </div>
    </article>
  );
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
    <div>
      <section className="journal-section">
        <p className="section-kicker">{editingId ? 'Editing' : 'New category'}</p>
        <h2 className="mt-1.5 text-2xl leading-tight text-ink sm:text-3xl">
          {editingId ? 'Edit category' : 'Add category'}
        </h2>

        <div className="mt-7 space-y-5">
          <StatusMessage>{error}</StatusMessage>

          <form className="space-y-6" onSubmit={handleSubmit}>
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
                placeholder="Groceries, coffee, books"
              />
            </label>

            <fieldset className="field-stack">
              <legend className="field-label">Color</legend>
              <div className="flex flex-wrap gap-3 pt-1">
                {categoryColors.map((color) => (
                  <label
                    key={color}
                    className={`flex h-11 w-11 cursor-pointer items-center justify-center rounded-md transition ${
                      form.color === color ? 'bg-surface' : 'bg-transparent'
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
                      className={`h-7 w-7 rounded-full ${
                        form.color === color ? 'ring-2 ring-clay ring-offset-2 ring-offset-paper' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  </label>
                ))}
              </div>
            </fieldset>

            <button type="submit" disabled={saving} className="button-primary min-h-11 w-full">
              {saving ? 'Saving...' : editingId ? 'Save category' : 'Create category'}
            </button>

            {editingId ? (
              <button type="button" className="button-secondary min-h-11 w-full" onClick={resetForm}>
                Cancel
              </button>
            ) : null}
          </form>
        </div>
      </section>

      <section className="journal-section">
        <div>
          <p className="section-kicker">Visible</p>
          <h2 className="mt-1.5 text-2xl leading-tight text-ink sm:text-3xl">Categories</h2>
          {loading ? <p className="mt-2 font-ui text-sm text-ocean/60">Loading...</p> : null}
        </div>

        <div className="mt-5 border-t border-ink/10">
          {visibleCategories.length === 0 && !loading ? (
            <p className="py-4 text-sm leading-6 text-ocean/70">No visible categories yet.</p>
          ) : null}

          {visibleCategories.map((category) => (
            <CategoryRow
              key={category.id}
              category={category}
              onEdit={startEdit}
              onToggleHidden={toggleHidden}
            />
          ))}
        </div>
      </section>

      <section className="journal-section">
        <p className="section-kicker">Hidden</p>
        <h2 className="mt-1.5 text-2xl leading-tight text-ink sm:text-3xl">Out of view</h2>

        <div className="mt-5 border-t border-ink/10">
          {hiddenCategories.length === 0 ? (
            <p className="py-4 text-sm leading-6 text-ocean/70">No hidden categories.</p>
          ) : null}

          {hiddenCategories.map((category) => (
            <CategoryRow
              key={category.id}
              category={category}
              onEdit={startEdit}
              onToggleHidden={toggleHidden}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
