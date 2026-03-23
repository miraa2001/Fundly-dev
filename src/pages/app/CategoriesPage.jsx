import { useEffect, useState } from 'react';
import AppPageHeader from '../../components/app/AppPageHeader';
import AppSurface from '../../components/app/AppSurface';
import CategoryCard from '../../components/app/categories/CategoryCard';
import CategoryDialog from '../../components/app/categories/CategoryDialog';
import StatusMessage from '../../components/auth/StatusMessage';
import { useAuthSession } from '../../lib/auth-context';
import {
  archiveCategory,
  createCategory,
  defaultCategoryColor,
  getCurrentMonthKey,
  listCategories,
  saveCategoryBudget,
  unarchiveCategory,
  updateCategory,
} from '../../lib/categories';

const initialFormState = {
  name: '',
  kind: 'expense',
  color: defaultCategoryColor,
  budgetLimit: '',
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
  const budgetValue = form.budgetLimit.trim();

  if (!form.name.trim()) {
    errors.name = 'Enter a category name.';
  }

  if (!form.kind.trim()) {
    errors.kind = 'Enter a category kind.';
  }

  if (colorValue && !/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(colorValue)) {
    errors.color = 'Use a hex color like #0C2A46.';
  }

  if (budgetValue) {
    const numericBudgetValue = Number(budgetValue);

    if (!Number.isFinite(numericBudgetValue)) {
      errors.budgetLimit = 'Enter a valid budget amount.';
    } else if (numericBudgetValue < 0) {
      errors.budgetLimit = 'Monthly budget must be 0 or higher.';
    }
  }

  return errors;
}

function LoadingState() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <AppSurface key={index} className="animate-pulse p-5">
          <div className="h-6 w-32 rounded-full bg-[rgba(var(--fundly-primary-rgb),0.10)]" />
          <div className="mt-4 h-4 w-20 rounded-full bg-[rgba(var(--fundly-primary-rgb),0.08)]" />
          <div className="mt-6 h-24 rounded-[1.2rem] bg-[rgba(var(--fundly-primary-rgb),0.06)]" />
        </AppSurface>
      ))}
    </div>
  );
}

export default function CategoriesPage() {
  const { user } = useAuthSession();
  const currentMonthKey = getCurrentMonthKey();
  const [categories, setCategories] = useState([]);
  const [fetchError, setFetchError] = useState('');
  const [status, setStatus] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isArchivingId, setIsArchivingId] = useState('');
  const [isUnarchivingId, setIsUnarchivingId] = useState('');
  const [expandedCategoryId, setExpandedCategoryId] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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

  useEffect(() => {
    if (expandedCategoryId && !categories.some((category) => category.id === expandedCategoryId)) {
      setExpandedCategoryId('');
    }
  }, [categories, expandedCategoryId]);

  function resetForm() {
    setEditingCategoryId('');
    setForm(initialFormState);
    setErrors({});
  }

  function closeDialog() {
    setIsDialogOpen(false);
    resetForm();
  }

  function openCreateDialog() {
    resetForm();
    setStatus(null);
    setExpandedCategoryId('');
    setIsDialogOpen(true);
  }

  function handleChange(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
    setStatus(null);
  }

  function handleEdit(category) {
    setExpandedCategoryId(category.id);
    setEditingCategoryId(category.id);
    setForm({
      name: category.name ?? '',
      kind: category.kind ?? '',
      color: category.color ?? defaultCategoryColor,
      budgetLimit:
        category.currentMonthBudget === null || category.currentMonthBudget === undefined
          ? ''
          : String(category.currentMonthBudget),
    });
    setErrors({});
    setStatus(null);
    setIsDialogOpen(true);
  }

  function handleToggleCategory(categoryId) {
    setExpandedCategoryId((current) => (current === categoryId ? '' : categoryId));
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
        const updatedCategory = await updateCategory({
          id: editingCategoryId,
          values: form,
        });
        await saveCategoryBudget({
          userId: user.id,
          categoryId: updatedCategory.id,
          budgetLimit: form.budgetLimit,
          monthKey: currentMonthKey,
        });

        setStatus({
          tone: 'success',
          message: 'Category updated successfully.',
        });
      } else {
        const createdCategory = await createCategory({
          userId: user.id,
          values: form,
        });
        await saveCategoryBudget({
          userId: user.id,
          categoryId: createdCategory.id,
          budgetLimit: form.budgetLimit,
          monthKey: currentMonthKey,
        });

        setStatus({
          tone: 'success',
          message: 'Category created successfully.',
        });
      }

      closeDialog();
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
        closeDialog();
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

  async function handleUnarchive(category) {
    setIsUnarchivingId(category.id);
    setStatus(null);

    try {
      await unarchiveCategory({ id: category.id });
      setStatus({
        tone: 'success',
        message: `${category.name} was moved back to active categories.`,
      });

      await loadCategories(showArchived);
    } catch (error) {
      setStatus({
        tone: 'error',
        message: getCategoryErrorMessage(error, 'We could not unarchive that category. Please try again.'),
      });
    } finally {
      setIsUnarchivingId('');
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
        description="Manage your categories in one place"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={openCreateDialog}
              className="category-create-button inline-flex items-center justify-center rounded-full transition"
            >
              <span className="category-create-button__label">New category</span>
              <span className="category-create-button__glow" aria-hidden="true">
                <span className="category-create-button__gradient" />
              </span>
            </button>
            <button
              type="button"
              onClick={() => setShowArchived((current) => !current)}
              className="inline-flex items-center justify-center rounded-full border border-[rgba(var(--fundly-accent-rgb),0.35)] bg-[rgba(var(--fundly-accent-rgb),0.12)] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--fundly-accent)] transition hover:border-[rgba(var(--fundly-accent-rgb),0.55)] hover:text-[var(--fundly-warm)]"
            >
              {showArchived ? 'Hide archived' : 'Show archived'}
            </button>
          </div>
        }
      />

      <StatusMessage tone={status?.tone} message={status?.message} />

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
                className="inline-flex items-center justify-center rounded-full border border-[rgba(var(--fundly-warm-rgb),0.25)] bg-[rgba(var(--fundly-warm-rgb),0.10)] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--fundly-warm)] transition hover:border-[rgba(var(--fundly-warm-rgb),0.40)]"
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
            action={
              <button
                type="button"
                onClick={openCreateDialog}
                className="category-create-button inline-flex items-center justify-center rounded-full transition"
              >
                <span className="category-create-button__label">Add category</span>
                <span className="category-create-button__glow" aria-hidden="true">
                  <span className="category-create-button__gradient" />
                </span>
              </button>
            }
          />
        ) : null}

        {!isLoading && activeCategories.length > 0 ? (
          <AppSurface
            eyebrow="Spending Categories"
            description="Tap a card to see where your budget stands."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {activeCategories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  isExpanded={expandedCategoryId === category.id}
                  isArchiving={isArchivingId === category.id}
                  onToggle={handleToggleCategory}
                  onEdit={handleEdit}
                  onArchive={handleArchive}
                  onUnarchive={handleUnarchive}
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
                  isExpanded={expandedCategoryId === category.id}
                  isUnarchiving={isUnarchivingId === category.id}
                  onToggle={handleToggleCategory}
                  onEdit={handleEdit}
                  onArchive={handleArchive}
                  onUnarchive={handleUnarchive}
                />
              ))}
            </div>
          </AppSurface>
        ) : null}
      </div>

      <CategoryDialog
        form={form}
        errors={errors}
        monthKey={currentMonthKey}
        mode={editingCategoryId ? 'edit' : 'create'}
        isOpen={isDialogOpen}
        isSubmitting={isSubmitting}
        onCancel={closeDialog}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
