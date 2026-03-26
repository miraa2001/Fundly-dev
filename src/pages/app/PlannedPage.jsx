import { useEffect, useState } from 'react';
import AppPageHeader from '../../components/app/AppPageHeader';
import AppSurface from '../../components/app/AppSurface';
import PlannedDialog from '../../components/app/planned/PlannedDialog';
import PlannedListItem from '../../components/app/planned/PlannedListItem';
import AuthButton from '../../components/auth/AuthButton';
import StatusMessage from '../../components/auth/StatusMessage';
import { listCategories } from '../../lib/categories';
import { useAuthSession } from '../../lib/auth-context';
import {
  cancelPlannedTransaction,
  confirmPlannedTransaction,
  createPlannedTransactionWithSplit,
  formatPlannedAmount,
  formatPlannedDate,
  getInitialPlannedFormState,
  listPlannedTransactions,
  updatePlannedTransactionWithSplit,
} from '../../lib/planned';

function getPlannedErrorMessage(error, fallbackMessage) {
  const message = error?.message?.toLowerCase?.() ?? '';

  if (message.includes('foreign key')) {
    return 'The selected category is no longer available. Refresh and try again.';
  }

  if (message.includes('invalid input value for enum')) {
    return 'One of the planned transaction values is not accepted by the database.';
  }

  return error?.message || fallbackMessage;
}

function validatePlannedForm(form, categories) {
  const errors = {};
  const amountValue = form.amount.trim();
  const activeCategoryIds = new Set(categories.map((category) => category.id));

  if (!form.title.trim()) {
    errors.title = 'Enter a planned title.';
  }

  if (!amountValue) {
    errors.amount = 'Enter a planned amount.';
  } else {
    const numericAmount = Number(amountValue);

    if (!Number.isFinite(numericAmount)) {
      errors.amount = 'Enter a valid amount.';
    } else if (numericAmount <= 0) {
      errors.amount = 'Amount must be greater than 0.';
    }
  }

  if (!form.currency.trim()) {
    errors.currency = 'Select a currency.';
  }

  if (!form.plannedDate) {
    errors.plannedDate = 'Choose a planned date.';
  }

  if (!form.categoryId) {
    errors.categoryId = 'Select a category.';
  } else if (!activeCategoryIds.has(form.categoryId)) {
    errors.categoryId = 'Select an active category.';
  }

  return errors;
}

function createFormStateFromPlannedTransaction(plannedTransaction) {
  return {
    title: plannedTransaction.title ?? '',
    amount: plannedTransaction.amount_original ? String(plannedTransaction.amount_original) : '',
    currency: plannedTransaction.currency_code ?? 'NIS',
    plannedDate: plannedTransaction.planned_date ?? '',
    categoryId: plannedTransaction.categoryId ?? '',
    merchantOrSource: plannedTransaction.merchant_or_source ?? '',
    note: plannedTransaction.note ?? '',
  };
}

function LoadingList() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-[1.3rem] border border-[rgba(var(--fundly-primary-rgb),0.12)] bg-white/70 px-4 py-4"
        >
          <div className="h-5 w-40 rounded-full bg-[rgba(var(--fundly-primary-rgb),0.10)]" />
          <div className="mt-3 h-4 w-52 rounded-full bg-[rgba(var(--fundly-primary-rgb),0.08)]" />
          <div className="mt-4 h-3 rounded-full bg-[rgba(var(--fundly-primary-rgb),0.08)]" />
        </div>
      ))}
    </div>
  );
}

export default function PlannedPage() {
  const { user } = useAuthSession();
  const [activeCategories, setActiveCategories] = useState([]);
  const [plannedTransactions, setPlannedTransactions] = useState([]);
  const [form, setForm] = useState(getInitialPlannedFormState());
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [dialogStatus, setDialogStatus] = useState(null);
  const [categoriesError, setCategoriesError] = useState('');
  const [plannedError, setPlannedError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [editingPlannedId, setEditingPlannedId] = useState('');
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [isPlannedLoading, setIsPlannedLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeActionId, setActiveActionId] = useState('');

  async function loadCategories() {
    setCategoriesError('');
    setIsCategoriesLoading(true);

    try {
      const nextCategories = await listCategories({ includeArchived: false });
      setActiveCategories(nextCategories);
    } catch (error) {
      setCategoriesError(getPlannedErrorMessage(error, 'We could not load active categories right now.'));
    } finally {
      setIsCategoriesLoading(false);
    }
  }

  async function loadPlannedItems() {
    setPlannedError('');
    setIsPlannedLoading(true);

    try {
      const nextPlannedTransactions = await listPlannedTransactions();
      setPlannedTransactions(nextPlannedTransactions);
    } catch (error) {
      setPlannedError(getPlannedErrorMessage(error, 'We could not load your planned transactions right now.'));
    } finally {
      setIsPlannedLoading(false);
    }
  }

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    void loadCategories();
    void loadPlannedItems();
  }, [user?.id]);

  useEffect(() => {
    if (activeCategories.length === 0) {
      return;
    }

    setForm((current) => {
      if (current.categoryId && activeCategories.some((category) => category.id === current.categoryId)) {
        return current;
      }

      return {
        ...current,
        categoryId: activeCategories[0].id,
      };
    });
  }, [activeCategories]);

  function resetDialogState() {
    setForm(getInitialPlannedFormState(activeCategories[0]?.id ?? ''));
    setErrors({});
    setDialogStatus(null);
    setEditingPlannedId('');
    setDialogMode('create');
  }

  function openCreateDialog() {
    resetDialogState();
    setStatus(null);
    setIsDialogOpen(true);
  }

  function openEditDialog(plannedTransaction) {
    setDialogMode('edit');
    setEditingPlannedId(plannedTransaction.id);
    setForm(createFormStateFromPlannedTransaction(plannedTransaction));
    setErrors({});
    setDialogStatus(null);
    setStatus(null);
    setIsDialogOpen(true);
  }

  function closeDialog() {
    setIsDialogOpen(false);
    resetDialogState();
  }

  function handleChange(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
    setDialogStatus(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validatePlannedForm(form, activeCategories);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    if (!user?.id) {
      setDialogStatus({
        tone: 'error',
        message: 'You must be signed in to manage planned transactions.',
      });
      return;
    }

    setIsSubmitting(true);
    setDialogStatus(null);

    try {
      if (dialogMode === 'edit' && editingPlannedId) {
        await updatePlannedTransactionWithSplit({
          id: editingPlannedId,
          values: form,
        });

        setStatus({
          tone: 'success',
          message: 'Planned transaction updated successfully.',
        });
      } else {
        await createPlannedTransactionWithSplit({
          userId: user.id,
          values: form,
        });

        setStatus({
          tone: 'success',
          message: 'Planned transaction created successfully.',
        });
      }

      closeDialog();
      await loadPlannedItems();
    } catch (error) {
      setDialogStatus({
        tone: 'error',
        message: getPlannedErrorMessage(error, 'We could not save that planned transaction. Please try again.'),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleConfirm(plannedTransaction) {
    if (!user?.id) {
      setStatus({
        tone: 'error',
        message: 'You must be signed in to confirm a planned transaction.',
      });
      return;
    }

    setActiveActionId(plannedTransaction.id);
    setStatus(null);

    try {
      await confirmPlannedTransaction({
        userId: user.id,
        plannedTransaction,
      });

      setStatus({
        tone: 'success',
        message: 'Planned transaction confirmed and moved into your real transactions.',
      });
      await loadPlannedItems();
    } catch (error) {
      setStatus({
        tone: 'error',
        message: getPlannedErrorMessage(error, 'We could not confirm that planned transaction.'),
      });
    } finally {
      setActiveActionId('');
    }
  }

  async function handleCancel(plannedTransaction) {
    setActiveActionId(plannedTransaction.id);
    setStatus(null);

    try {
      await cancelPlannedTransaction({ id: plannedTransaction.id });
      setStatus({
        tone: 'success',
        message: 'Planned transaction cancelled successfully.',
      });
      await loadPlannedItems();
    } catch (error) {
      setStatus({
        tone: 'error',
        message: getPlannedErrorMessage(error, 'We could not cancel that planned transaction.'),
      });
    } finally {
      setActiveActionId('');
    }
  }

  const hasActiveCategories = activeCategories.length > 0;
  const openItems = plannedTransactions.filter((item) => item.isOpen);
  const confirmedItems = plannedTransactions.filter((item) => item.isConfirmed);
  const cancelledItems = plannedTransactions.filter((item) => item.isCancelled);
  const nextPlannedItem = openItems[0] ?? null;

  return (
    <div className="space-y-5">
      <AppPageHeader
        eyebrow="Planned"
        title="Upcoming bills and goals"
        description="Plan upcoming spending, confirm it into real transactions, and keep pending items organized from real Supabase data."
        action={
          <AuthButton
            type="button"
            onClick={openCreateDialog}
            disabled={isCategoriesLoading || !hasActiveCategories}
            className="w-auto rounded-full px-5 py-3 text-sm"
          >
            New planned item
          </AuthButton>
        }
      />

      <StatusMessage tone={status?.tone} message={status?.message} />

      {categoriesError ? (
        <AppSurface
          eyebrow="Categories"
          title="Active categories are unavailable"
          description={categoriesError}
          action={
            <button
              type="button"
              onClick={() => void loadCategories()}
              className="inline-flex items-center justify-center rounded-full border border-[rgba(var(--fundly-warm-rgb),0.25)] bg-[rgba(var(--fundly-warm-rgb),0.10)] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--fundly-warm)] transition hover:border-[rgba(var(--fundly-warm-rgb),0.40)]"
            >
              Retry
            </button>
          }
        />
      ) : null}

      {!isCategoriesLoading && !hasActiveCategories && !categoriesError ? (
        <AppSurface
          eyebrow="Setup"
          title="Create an active category first"
          description="Planned transactions need one active category because each new planned item currently creates a single split row."
        />
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <AppSurface
          eyebrow="Upcoming"
          title="Planned payments"
          description="Upcoming items first, with confirmed and cancelled items kept below the open queue."
        >
          {plannedError ? (
            <div className="space-y-3">
              <StatusMessage tone="error" message={plannedError} />
              <button
                type="button"
                onClick={() => void loadPlannedItems()}
                className="inline-flex items-center justify-center rounded-full border border-[rgba(var(--fundly-warm-rgb),0.25)] bg-[rgba(var(--fundly-warm-rgb),0.10)] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--fundly-warm)] transition hover:border-[rgba(var(--fundly-warm-rgb),0.40)]"
              >
                Retry
              </button>
            </div>
          ) : isPlannedLoading ? (
            <LoadingList />
          ) : plannedTransactions.length > 0 ? (
            <div className="space-y-3">
              {plannedTransactions.map((item) => (
                <PlannedListItem
                  key={item.id}
                  plannedTransaction={item}
                  isBusy={activeActionId === item.id}
                  onConfirm={() => void handleConfirm(item)}
                  onEdit={() => openEditDialog(item)}
                  onCancel={() => void handleCancel(item)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[1.3rem] border border-[rgba(var(--fundly-primary-rgb),0.12)] bg-white/70 px-4 py-5">
              <p className="font-bold text-[var(--fundly-primary)]">No planned transactions yet</p>
              <p className="mt-2 text-sm leading-6 text-[rgba(var(--fundly-primary-rgb),0.7)]">
                Add your first planned item to track upcoming spending before it becomes a real transaction.
              </p>
              {hasActiveCategories ? (
                <button
                  type="button"
                  onClick={openCreateDialog}
                  className="mt-4 inline-flex items-center justify-center rounded-full border border-[var(--fundly-accent)] bg-[linear-gradient(180deg,var(--fundly-primary)_0%,var(--fundly-primary-soft)_46%,var(--fundly-deep)_100%)] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--fundly-surface)] transition hover:-translate-y-0.5"
                >
                  Add first planned item
                </button>
              ) : null}
            </div>
          )}
        </AppSurface>

        <AppSurface
          eyebrow="Overview"
          title="Planning status"
          description="A quick read on what is still pending and what has already been confirmed or cancelled."
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:grid-cols-1">
              {[
                { label: 'Open items', value: openItems.length, detail: 'Still pending confirmation or cancellation.' },
                { label: 'Confirmed', value: confirmedItems.length, detail: 'Already turned into real transactions.' },
                { label: 'Cancelled', value: cancelledItems.length, detail: 'Kept for history without deleting them.' },
              ].map((item) => (
                <div key={item.label} className="rounded-[1.3rem] border border-[rgba(var(--fundly-primary-rgb),0.12)] bg-white/70 px-4 py-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--fundly-accent)]">{item.label}</p>
                  <p className="mt-3 text-2xl font-bold tracking-[-0.03em] text-[var(--fundly-primary)]">{item.value}</p>
                  <p className="mt-2 text-sm leading-6 text-[rgba(var(--fundly-primary-rgb),0.7)]">{item.detail}</p>
                </div>
              ))}
            </div>

            <div className="rounded-[1.3rem] border border-[rgba(var(--fundly-primary-rgb),0.12)] bg-white/70 px-4 py-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--fundly-accent)]">Next due</p>
              {nextPlannedItem ? (
                <>
                  <p className="mt-3 font-bold text-[var(--fundly-primary)]">{nextPlannedItem.title}</p>
                  <p className="mt-1 text-sm text-[rgba(var(--fundly-primary-rgb),0.72)]">
                    {formatPlannedAmount(nextPlannedItem.amount_original, nextPlannedItem.currency_code)} .{' '}
                    {formatPlannedDate(nextPlannedItem.planned_date)}
                  </p>
                  <p className="mt-2 text-sm text-[rgba(var(--fundly-primary-rgb),0.72)]">{nextPlannedItem.categoryName}</p>
                </>
              ) : (
                <p className="mt-3 text-sm leading-6 text-[rgba(var(--fundly-primary-rgb),0.7)]">
                  No open planned items right now.
                </p>
              )}
            </div>
          </div>
        </AppSurface>
      </div>

      <PlannedDialog
        mode={dialogMode}
        categories={activeCategories}
        form={form}
        errors={errors}
        status={dialogStatus}
        isOpen={isDialogOpen}
        isSubmitting={isSubmitting}
        onCancel={closeDialog}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
