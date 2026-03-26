import { useEffect, useState } from 'react';
import AppPageHeader from '../../components/app/AppPageHeader';
import AppSurface from '../../components/app/AppSurface';
import RecurringDialog from '../../components/app/recurring/RecurringDialog';
import RecurringListItem from '../../components/app/recurring/RecurringListItem';
import AuthButton from '../../components/auth/AuthButton';
import StatusMessage from '../../components/auth/StatusMessage';
import { useAuthSession } from '../../lib/auth-context';
import { listCategories } from '../../lib/categories';
import {
  RECURRING_FREQUENCY,
  createRecurringExpenseWithSplit,
  formatRecurringDate,
  generateDuePlannedTransactions,
  getInitialRecurringFormState,
  listRecurringExpenses,
  toggleRecurringExpenseActive,
  updateRecurringExpenseWithSplit,
} from '../../lib/recurring';

function getRecurringErrorMessage(error, fallbackMessage) {
  const message = error?.message?.toLowerCase?.() ?? '';

  if (message.includes('invalid input value for enum')) {
    return 'One of the recurring expense values is not accepted by the database.';
  }

  if (message.includes('foreign key')) {
    return 'The selected category is no longer available. Refresh and try again.';
  }

  return error?.message || fallbackMessage;
}

function validateRecurringForm(form, categories) {
  const errors = {};
  const activeCategoryIds = new Set(categories.map((category) => category.id));
  const amountValue = form.amount.trim();
  const intervalValue = form.intervalCount.trim();

  if (!form.title.trim()) {
    errors.title = 'Enter a recurring title.';
  }

  if (!amountValue) {
    errors.amount = 'Enter a recurring amount.';
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

  if (!form.frequency.trim()) {
    errors.frequency = 'Select a frequency.';
  }

  if (!intervalValue) {
    errors.intervalCount = 'Enter an interval count.';
  } else {
    const numericInterval = Number(intervalValue);

    if (!Number.isInteger(numericInterval) || numericInterval < 1) {
      errors.intervalCount = 'Interval must be 1 or more.';
    }
  }

  if (!form.startDate) {
    errors.startDate = 'Choose a start date.';
  }

  if (form.endDate && form.startDate && form.endDate < form.startDate) {
    errors.endDate = 'End date must be on or after the start date.';
  }

  if (form.frequency === RECURRING_FREQUENCY.WEEKLY) {
    const dueWeekday = Number(form.dueWeekday);

    if (!Number.isInteger(dueWeekday) || dueWeekday < 0 || dueWeekday > 6) {
      errors.dueWeekday = 'Choose a valid due weekday.';
    }
  }

  if (form.frequency === RECURRING_FREQUENCY.MONTHLY || form.frequency === RECURRING_FREQUENCY.YEARLY) {
    const dueDay = Number(form.dueDay);

    if (!Number.isInteger(dueDay) || dueDay < 1 || dueDay > 31) {
      errors.dueDay = 'Choose a due day between 1 and 31.';
    }
  }

  if (!form.categoryId) {
    errors.categoryId = 'Select a category.';
  } else if (!activeCategoryIds.has(form.categoryId)) {
    errors.categoryId = 'Select an active category.';
  }

  return errors;
}

function createFormStateFromRecurringExpense(recurringExpense) {
  return {
    title: recurringExpense.title ?? '',
    amount: recurringExpense.default_amount_original ? String(recurringExpense.default_amount_original) : '',
    currency: recurringExpense.currency_code ?? 'NIS',
    frequency: recurringExpense.frequency ?? RECURRING_FREQUENCY.MONTHLY,
    intervalCount: recurringExpense.interval_count ? String(recurringExpense.interval_count) : '1',
    dueDay: recurringExpense.due_day ? String(recurringExpense.due_day) : '',
    dueWeekday:
      recurringExpense.due_weekday === null || recurringExpense.due_weekday === undefined
        ? ''
        : String(recurringExpense.due_weekday),
    startDate: recurringExpense.start_date ?? '',
    endDate: recurringExpense.end_date ?? '',
    categoryId: recurringExpense.categoryId ?? '',
    merchantOrSource: recurringExpense.merchant_or_source ?? '',
    note: recurringExpense.note ?? '',
    isActive: Boolean(recurringExpense.is_active),
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
          <div className="mt-4 h-10 rounded-[1rem] bg-[rgba(var(--fundly-primary-rgb),0.06)]" />
        </div>
      ))}
    </div>
  );
}

export default function RecurringPage() {
  const { user } = useAuthSession();
  const [activeCategories, setActiveCategories] = useState([]);
  const [recurringExpenses, setRecurringExpenses] = useState([]);
  const [form, setForm] = useState(getInitialRecurringFormState());
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [dialogStatus, setDialogStatus] = useState(null);
  const [categoriesError, setCategoriesError] = useState('');
  const [recurringError, setRecurringError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [editingRecurringId, setEditingRecurringId] = useState('');
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [isRecurringLoading, setIsRecurringLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeActionId, setActiveActionId] = useState('');

  async function loadCategories() {
    setCategoriesError('');
    setIsCategoriesLoading(true);

    try {
      const nextCategories = await listCategories({ includeArchived: false });
      setActiveCategories(nextCategories);
    } catch (error) {
      setCategoriesError(getRecurringErrorMessage(error, 'We could not load active categories right now.'));
    } finally {
      setIsCategoriesLoading(false);
    }
  }

  async function loadRecurringItems() {
    setRecurringError('');
    setIsRecurringLoading(true);

    try {
      const nextRecurringExpenses = await listRecurringExpenses();
      setRecurringExpenses(nextRecurringExpenses);
    } catch (error) {
      setRecurringError(getRecurringErrorMessage(error, 'We could not load recurring expenses right now.'));
    } finally {
      setIsRecurringLoading(false);
    }
  }

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    void loadCategories();
    void loadRecurringItems();
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
    setForm(getInitialRecurringFormState(activeCategories[0]?.id ?? ''));
    setErrors({});
    setDialogStatus(null);
    setDialogMode('create');
    setEditingRecurringId('');
  }

  function openCreateDialog() {
    resetDialogState();
    setStatus(null);
    setIsDialogOpen(true);
  }

  function openEditDialog(recurringExpense) {
    setDialogMode('edit');
    setEditingRecurringId(recurringExpense.id);
    setForm(createFormStateFromRecurringExpense(recurringExpense));
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
    setForm((current) => {
      if (field === 'frequency') {
        return {
          ...current,
          frequency: value,
          dueDay: value === RECURRING_FREQUENCY.WEEKLY ? current.dueDay : current.dueDay || current.startDate.split('-')[2] || '1',
          dueWeekday:
            value === RECURRING_FREQUENCY.WEEKLY
              ? current.dueWeekday || String(new Date(`${current.startDate || getInitialRecurringFormState().startDate}T12:00:00`).getDay())
              : current.dueWeekday,
        };
      }

      if (field === 'startDate' && value) {
        const parsedDate = new Date(`${value}T12:00:00`);
        const derivedDueDay = String(parsedDate.getDate());
        const derivedDueWeekday = String(parsedDate.getDay());

        return {
          ...current,
          startDate: value,
          dueDay: current.dueDay || derivedDueDay,
          dueWeekday: current.dueWeekday || derivedDueWeekday,
        };
      }

      return { ...current, [field]: value };
    });

    setErrors((current) => ({ ...current, [field]: '' }));
    setDialogStatus(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validateRecurringForm(form, activeCategories);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    if (!user?.id) {
      setDialogStatus({
        tone: 'error',
        message: 'You must be signed in to manage recurring expenses.',
      });
      return;
    }

    setIsSubmitting(true);
    setDialogStatus(null);

    try {
      if (dialogMode === 'edit' && editingRecurringId) {
        await updateRecurringExpenseWithSplit({
          id: editingRecurringId,
          values: form,
        });

        setStatus({
          tone: 'success',
          message: 'Recurring expense updated successfully.',
        });
      } else {
        await createRecurringExpenseWithSplit({
          userId: user.id,
          values: form,
        });

        setStatus({
          tone: 'success',
          message: 'Recurring expense created successfully.',
        });
      }

      closeDialog();
      await loadRecurringItems();
    } catch (error) {
      setDialogStatus({
        tone: 'error',
        message: getRecurringErrorMessage(error, 'We could not save that recurring expense. Please try again.'),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleActive(recurringExpense) {
    setActiveActionId(recurringExpense.id);
    setStatus(null);

    try {
      await toggleRecurringExpenseActive({
        id: recurringExpense.id,
        isActive: !recurringExpense.is_active,
      });

      setStatus({
        tone: 'success',
        message: recurringExpense.is_active
          ? `${recurringExpense.title} is now inactive and will stop generating planned items.`
          : `${recurringExpense.title} is active again and can generate planned items.`,
      });
      await loadRecurringItems();
    } catch (error) {
      setStatus({
        tone: 'error',
        message: getRecurringErrorMessage(error, 'We could not update that recurring expense.'),
      });
    } finally {
      setActiveActionId('');
    }
  }

  async function handleGenerateDueItems() {
    if (!user?.id) {
      setStatus({
        tone: 'error',
        message: 'You must be signed in to generate due planned items.',
      });
      return;
    }

    setIsGenerating(true);
    setStatus(null);

    try {
      const result = await generateDuePlannedTransactions({ userId: user.id });

      if (result.generatedCount > 0) {
        setStatus({
          tone: 'success',
          message: `Generated ${result.generatedCount} pending planned item${result.generatedCount === 1 ? '' : 's'} from your recurring expenses.`,
        });
      } else {
        setStatus({
          tone: 'success',
          message: 'No due recurring items needed generation today.',
        });
      }

      await loadRecurringItems();
    } catch (error) {
      setStatus({
        tone: 'error',
        message: getRecurringErrorMessage(error, 'We could not generate due planned items.'),
      });
    } finally {
      setIsGenerating(false);
    }
  }

  const hasActiveCategories = activeCategories.length > 0;
  const hasRecurringExpenses = recurringExpenses.length > 0;
  const activeRecurringExpenses = recurringExpenses.filter((item) => item.is_active);
  const inactiveRecurringExpenses = recurringExpenses.filter((item) => !item.is_active);
  const latestGeneratedForDate = recurringExpenses
    .map((item) => item.last_generated_for_date)
    .filter(Boolean)
    .sort((left, right) => right.localeCompare(left))[0] ?? '';

  return (
    <div className="space-y-5">
      <AppPageHeader
        eyebrow="Recurring"
        title="Turn repeating bills into planned items"
        description="Create real recurring expenses, keep them active or inactive, and generate pending planned items up to today without creating duplicate future entries."
        action={
          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => void handleGenerateDueItems()}
              disabled={isRecurringLoading || isGenerating || activeRecurringExpenses.length === 0}
              className="inline-flex items-center justify-center rounded-full border border-[rgba(var(--fundly-primary-rgb),0.12)] bg-white/80 px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-[var(--fundly-primary)] transition hover:border-[rgba(var(--fundly-accent-rgb),0.40)] hover:text-[var(--fundly-accent)] disabled:cursor-not-allowed disabled:opacity-55"
            >
              {isGenerating ? 'Generating...' : 'Generate due items'}
            </button>
            <AuthButton
              type="button"
              onClick={openCreateDialog}
              disabled={isCategoriesLoading || !hasActiveCategories}
              className="w-auto rounded-full px-5 py-3 text-sm"
            >
              New recurring
            </AuthButton>
          </div>
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
          description="Recurring expenses need one active category because each recurring item currently creates a single split row."
        />
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <AppSurface
          eyebrow="Rules"
          title="Recurring expenses"
          description="Active recurring items stay here as templates. They generate pending planned items first, and those planned items still need confirmation before they become real transactions."
        >
          {recurringError ? (
            <div className="space-y-3">
              <StatusMessage tone="error" message={recurringError} />
              <button
                type="button"
                onClick={() => void loadRecurringItems()}
                className="inline-flex items-center justify-center rounded-full border border-[rgba(var(--fundly-warm-rgb),0.25)] bg-[rgba(var(--fundly-warm-rgb),0.10)] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--fundly-warm)] transition hover:border-[rgba(var(--fundly-warm-rgb),0.40)]"
              >
                Retry
              </button>
            </div>
          ) : isRecurringLoading ? (
            <LoadingList />
          ) : hasRecurringExpenses ? (
            <div className="space-y-3">
              {recurringExpenses.map((item) => (
                <RecurringListItem
                  key={item.id}
                  recurringExpense={item}
                  isBusy={activeActionId === item.id}
                  onEdit={() => openEditDialog(item)}
                  onToggleActive={() => void handleToggleActive(item)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[1.3rem] border border-[rgba(var(--fundly-primary-rgb),0.12)] bg-white/70 px-4 py-5">
              <p className="font-bold text-[var(--fundly-primary)]">No recurring expenses yet</p>
              <p className="mt-2 text-sm leading-6 text-[rgba(var(--fundly-primary-rgb),0.7)]">
                Add recurring bills or subscriptions here, then generate the due ones into pending planned items whenever you are ready.
              </p>
              {hasActiveCategories ? (
                <button
                  type="button"
                  onClick={openCreateDialog}
                  className="mt-4 inline-flex items-center justify-center rounded-full border border-[var(--fundly-accent)] bg-[linear-gradient(180deg,var(--fundly-primary)_0%,var(--fundly-primary-soft)_46%,var(--fundly-deep)_100%)] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--fundly-surface)] transition hover:-translate-y-0.5"
                >
                  Add first recurring item
                </button>
              ) : null}
            </div>
          )}
        </AppSurface>

        <AppSurface
          eyebrow="Overview"
          title="Generation status"
          description="A quick read on how many recurring templates are active and the last date generation was processed."
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:grid-cols-1">
              {[
                { label: 'Active', value: activeRecurringExpenses.length, detail: 'Eligible to generate pending planned items.' },
                { label: 'Inactive', value: inactiveRecurringExpenses.length, detail: 'Kept for reference without generating anything.' },
                {
                  label: 'Generated through',
                  value: latestGeneratedForDate ? formatRecurringDate(latestGeneratedForDate) : 'None',
                  detail: 'Latest due date processed by the generation flow.',
                },
              ].map((item) => (
                <div key={item.label} className="rounded-[1.3rem] border border-[rgba(var(--fundly-primary-rgb),0.12)] bg-white/70 px-4 py-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--fundly-accent)]">{item.label}</p>
                  <p className="mt-3 text-2xl font-bold tracking-[-0.03em] text-[var(--fundly-primary)]">{item.value}</p>
                  <p className="mt-2 text-sm leading-6 text-[rgba(var(--fundly-primary-rgb),0.7)]">{item.detail}</p>
                </div>
              ))}
            </div>

            <div className="rounded-[1.3rem] border border-[rgba(var(--fundly-primary-rgb),0.12)] bg-white/70 px-4 py-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--fundly-accent)]">How generation works</p>
              <p className="mt-3 text-sm leading-6 text-[rgba(var(--fundly-primary-rgb),0.72)]">
                The button above generates missing pending planned items for active recurring expenses up to today only. It never creates real
                transactions directly, and it will not generate duplicate planned items for the same recurring rule and due date.
              </p>
            </div>
          </div>
        </AppSurface>
      </div>

      <RecurringDialog
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
