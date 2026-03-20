import { useEffect, useRef, useState } from 'react';
import AppPageHeader from '../../components/app/AppPageHeader';
import AppSurface from '../../components/app/AppSurface';
import CategoryCard from '../../components/app/categories/CategoryCard';
import CategoryFormPanel from '../../components/app/categories/CategoryFormPanel';
import StatusMessage from '../../components/auth/StatusMessage';
import { useAuthSession } from '../../lib/auth-context';
import {
  archiveCategory,
  createCategory,
  defaultCategoryColor,
  listCategories,
  updateCategory,
} from '../../lib/categories';

const initialFormState = {
  name: '',
  kind: 'expense',
  color: defaultCategoryColor,
  icon: '',
};

function getCategoryErrorMessage(error, fallbackMessage) {
  const message = error?.message?.toLowerCase?.() ?? '';

  if (message.includes('duplicate')) {
    return 'A category with that name already exists.';
  }

  if (message.includes('invalid input value for enum')) {
    return 'The category kind is not accepted by the database. Try expense or income.';
  }

  return error?.message || fallbackMessage;
}

function validateCategoryForm(form) {
  const errors = {};
  const colorValue = form.color.trim();

  if (!form.name.trim()) {
    errors.name = 'Enter a category name.';
  }

  if (!form.kind.trim()) {
    errors.kind = 'Enter a category kind.';
  }

  if (colorValue && !/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(colorValue)) {
    errors.color = 'Use a hex color like #15AECA.';
  }

  return errors;
}

function LoadingState() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <AppSurface key={index} className="animate-pulse p-5">
          <div className="h-6 w-32 rounded-full bg-[#dff4f2]" />
          <div className="mt-4 h-4 w-20 rounded-full bg-[#e8f7f5]" />
          <div className="mt-6 h-24 rounded-[1.2rem] bg-[#eef9f8]" />
        </AppSurface>
      ))}
    </div>
  );
}

export default function CategoriesPage() {
  const { user } = useAuthSession();
  const formPanelRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [fetchError, setFetchError] = useState('');
  const [status, setStatus] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isArchivingId, setIsArchivingId] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState('');
  const [form, setForm] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  async function loadCategories(includeArchived = showArchived) {
    setFetchError('');
    setIsLoading(true);

    try {
      const nextCategories = await listCategories({ includeArchived });
      setCategories(nextCategories);
    } catch (error) {
      setFetchError(getCategoryErrorMessage(error, 'We could not load your categories right now.'));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    void loadCategories(showArchived);
  }, [showArchived, user?.id]);

  function resetForm() {
    setEditingCategoryId('');
    setForm(initialFormState);
    setErrors({});
  }

  function scrollFormIntoView() {
    formPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleChange(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
    setStatus(null);
  }

  function handleEdit(category) {
    setEditingCategoryId(category.id);
    setForm({
      name: category.name ?? '',
      kind: category.kind ?? '',
      color: category.color ?? defaultCategoryColor,
      icon: category.icon ?? '',
    });
    setErrors({});
    setStatus(null);
    scrollFormIntoView();
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validateCategoryForm(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    if (!user?.id) {
      setStatus({
        tone: 'error',
        message: 'You must be signed in to manage categories.',
      });
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      if (editingCategoryId) {
        await updateCategory({
          id: editingCategoryId,
          values: form,
        });

        setStatus({
          tone: 'success',
          message: 'Category updated successfully.',
        });
      } else {
        await createCategory({
          userId: user.id,
          values: form,
        });

        setStatus({
          tone: 'success',
          message: 'Category created successfully.',
        });
      }

      resetForm();
      await loadCategories(showArchived);
    } catch (error) {
      setStatus({
        tone: 'error',
        message: getCategoryErrorMessage(error, 'We could not save that category. Please try again.'),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleArchive(category) {
    setIsArchivingId(category.id);
    setStatus(null);

    try {
      await archiveCategory({ id: category.id });
      setStatus({
        tone: 'success',
        message: `${category.name} was archived.`,
      });

      if (editingCategoryId === category.id) {
        resetForm();
      }

      await loadCategories(showArchived);
    } catch (error) {
      setStatus({
        tone: 'error',
        message: getCategoryErrorMessage(error, 'We could not archive that category. Please try again.'),
      });
    } finally {
      setIsArchivingId('');
    }
  }

  const activeCategories = categories.filter((category) => !category.is_archived);
  const archivedCategories = categories.filter((category) => category.is_archived);
  const hasNoVisibleCategories = !isLoading && activeCategories.length === 0 && (!showArchived || archivedCategories.length === 0);

  return (
    <div className="space-y-5">
      <AppPageHeader
        eyebrow="Categories"
        title="Your categories, connected"
        description="Manage the categories tied to your authenticated Fundly account. This page now reads and updates the real categories table through Supabase."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                resetForm();
                scrollFormIntoView();
              }}
              className="inline-flex items-center justify-center rounded-full border border-[#d3efed] bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#16323b] transition hover:border-[#35d9ef]/40 hover:text-[#087f98]"
            >
              New category
            </button>
            <button
              type="button"
              onClick={() => setShowArchived((current) => !current)}
              className="inline-flex items-center justify-center rounded-full border border-[#ffd45a]/45 bg-[#fff2c8] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#8b5202] transition hover:border-[#f6c53d]"
            >
              {showArchived ? 'Hide archived' : 'Show archived'}
            </button>
          </div>
        }
      />

      <StatusMessage tone={status?.tone} message={status?.message} />

      <div className="grid gap-4 xl:grid-cols-[380px_minmax(0,1fr)] xl:items-start">
        <div ref={formPanelRef} className="xl:sticky xl:top-8">
          <CategoryFormPanel
            form={form}
            errors={errors}
            mode={editingCategoryId ? 'edit' : 'create'}
            isSubmitting={isSubmitting}
            onCancelEdit={resetForm}
            onChange={handleChange}
            onSubmit={handleSubmit}
          />
        </div>

        <div className="space-y-4">
          {fetchError ? (
            <AppSurface
              eyebrow="Error"
              title="We could not load categories"
              description={fetchError}
              action={
                <button
                  type="button"
                  onClick={() => void loadCategories(showArchived)}
                  className="inline-flex items-center justify-center rounded-full border border-[#efc7b8] bg-[#fff2ec] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#934d33] transition hover:border-[#e3a28a]"
                >
                  Retry
                </button>
              }
            />
          ) : null}

          {isLoading ? <LoadingState /> : null}

          {hasNoVisibleCategories ? (
            <AppSurface
              eyebrow="Empty State"
              title="No categories yet"
              description="Create your first category to start organizing transactions, budgets, and planned spending."
            />
          ) : null}

          {!isLoading && activeCategories.length > 0 ? (
            <AppSurface
              eyebrow="Active Categories"
              title={`${activeCategories.length} ready to use`}
              description="These are the categories currently active for your account."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                {activeCategories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    isArchiving={isArchivingId === category.id}
                    onEdit={handleEdit}
                    onArchive={handleArchive}
                  />
                ))}
              </div>
            </AppSurface>
          ) : null}

          {!isLoading && showArchived && archivedCategories.length > 0 ? (
            <AppSurface
              eyebrow="Archived Categories"
              title={`${archivedCategories.length} archived`}
              description="Archived categories stay out of the default view but remain available for reference."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                {archivedCategories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    onEdit={handleEdit}
                    onArchive={handleArchive}
                  />
                ))}
              </div>
            </AppSurface>
          ) : null}
        </div>
      </div>
    </div>
  );
}
