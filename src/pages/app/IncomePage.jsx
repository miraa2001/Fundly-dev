import { useEffect, useState } from 'react';
import AppPageHeader from '../../components/app/AppPageHeader';
import AppSurface from '../../components/app/AppSurface';
import IncomeEntryDialog from '../../components/app/income/IncomeEntryDialog';
import IncomeEntryListItem from '../../components/app/income/IncomeEntryListItem';
import IncomeSourceDialog from '../../components/app/income/IncomeSourceDialog';
import IncomeSourceListItem from '../../components/app/income/IncomeSourceListItem';
import AuthButton from '../../components/auth/AuthButton';
import StatusMessage from '../../components/auth/StatusMessage';
import { useAuthSession } from '../../lib/auth-context';
import { listCategories } from '../../lib/categories';
import {
  calculateIncomeAmounts,
  createIncomeEntry,
  createIncomeSource,
  createInitialIncomeEntryFormState,
  createInitialIncomeEntryFormStateFromEntry,
  createInitialIncomeSourceFormState,
  createInitialIncomeSourceFormStateFromSource,
  formatIncomeAmount,
  listIncomeEntries,
  listIncomeSources,
  loadIncomeMonthSummary,
  setIncomeSourceArchived,
  updateIncomeEntry,
  updateIncomeSource,
} from '../../lib/income';
import { defaultBaseCurrency } from '../../lib/transactions';

function getIncomeErrorMessage(error, fallbackMessage) {
  const message = error?.message?.toLowerCase?.() ?? '';

  if (message.includes('foreign key')) {
    return 'The selected source or category is no longer available. Refresh and try again.';
  }

  return error?.message || fallbackMessage;
}

function validateIncomeSourceForm(form) {
  const errors = {};

  if (!form.name.trim()) {
    errors.name = 'Enter a source name.';
  }

  return errors;
}

function validateIncomeEntryForm(form, sources, categories, baseCurrencyCode) {
  const errors = {};
  const activeSourceIds = new Set(sources.map((source) => source.id));
  const activeCategoryIds = new Set(categories.map((category) => category.id));
  const amountValue = form.amountOriginal.trim();
  const normalizedCurrencyCode = form.currencyCode.trim().toUpperCase();
  const normalizedBaseCurrencyCode = (baseCurrencyCode || defaultBaseCurrency).trim().toUpperCase();

  if (!form.incomeSourceId) {
    errors.incomeSourceId = 'Select an income source.';
  } else if (!activeSourceIds.has(form.incomeSourceId)) {
    errors.incomeSourceId = 'Select an active income source.';
  }

  if (!amountValue) {
    errors.amountOriginal = 'Enter an income amount.';
  } else {
    const numericAmount = Number(amountValue);

    if (!Number.isFinite(numericAmount)) {
      errors.amountOriginal = 'Enter a valid amount.';
    } else if (numericAmount <= 0) {
      errors.amountOriginal = 'Amount must be greater than 0.';
    }
  }

  if (!normalizedCurrencyCode) {
    errors.currencyCode = 'Enter a currency code.';
  }

  if (!form.entryDate) {
    errors.entryDate = 'Choose an income date.';
  }

  if (form.categoryId && !activeCategoryIds.has(form.categoryId)) {
    errors.categoryId = 'Select an active income category or leave it blank.';
  }

  if (normalizedCurrencyCode && normalizedCurrencyCode !== normalizedBaseCurrencyCode) {
    const numericRate = Number(form.conversionRate);

    if (!form.conversionRate.trim()) {
      errors.conversionRate = 'Enter a conversion rate.';
    } else if (!Number.isFinite(numericRate) || numericRate <= 0) {
      errors.conversionRate = 'Enter a valid conversion rate.';
    }
  }

  return errors;
}

function SummarySkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <AppSurface key={index} className="animate-pulse p-4">
          <div className="h-3 w-28 rounded-full bg-[rgba(var(--fundly-primary-rgb),0.10)]" />
          <div className="mt-4 h-8 w-32 rounded-full bg-[rgba(var(--fundly-primary-rgb),0.12)]" />
          <div className="mt-3 h-4 w-40 rounded-full bg-[rgba(var(--fundly-primary-rgb),0.08)]" />
        </AppSurface>
      ))}
    </div>
  );
}

function SurfaceSkeleton({ rows = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-[1.3rem] border border-[rgba(var(--fundly-primary-rgb),0.12)] bg-white/70 px-4 py-4"
        >
          <div className="h-5 w-32 rounded-full bg-[rgba(var(--fundly-primary-rgb),0.10)]" />
          <div className="mt-3 h-4 w-44 rounded-full bg-[rgba(var(--fundly-primary-rgb),0.08)]" />
          <div className="mt-4 h-3 rounded-full bg-[rgba(var(--fundly-primary-rgb),0.08)]" />
        </div>
      ))}
    </div>
  );
}

export default function IncomePage() {
  const { user } = useAuthSession();
  const [baseCurrencyCode, setBaseCurrencyCode] = useState(defaultBaseCurrency);
  const [monthLabel, setMonthLabel] = useState('');
  const [allIncomeSources, setAllIncomeSources] = useState([]);
  const [incomeEntries, setIncomeEntries] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [sourceForm, setSourceForm] = useState(createInitialIncomeSourceFormState());
  const [entryForm, setEntryForm] = useState(createInitialIncomeEntryFormState());
  const [sourceErrors, setSourceErrors] = useState({});
  const [entryErrors, setEntryErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [sourceDialogStatus, setSourceDialogStatus] = useState(null);
  const [entryDialogStatus, setEntryDialogStatus] = useState(null);
  const [summaryError, setSummaryError] = useState('');
  const [sourcesError, setSourcesError] = useState('');
  const [entriesError, setEntriesError] = useState('');
  const [categoriesError, setCategoriesError] = useState('');
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);
  const [isSourcesLoading, setIsSourcesLoading] = useState(true);
  const [isEntriesLoading, setIsEntriesLoading] = useState(true);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [isSourceDialogOpen, setIsSourceDialogOpen] = useState(false);
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
  const [isSavingSource, setIsSavingSource] = useState(false);
  const [isSavingEntry, setIsSavingEntry] = useState(false);
  const [editingSourceId, setEditingSourceId] = useState('');
  const [editingEntryId, setEditingEntryId] = useState('');
  const [sourceIdBeingUpdated, setSourceIdBeingUpdated] = useState('');
  const [showArchivedSources, setShowArchivedSources] = useState(false);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    entryCount: 0,
  });

  const activeIncomeSources = allIncomeSources.filter((source) => !source.isArchived);
  const visibleIncomeSources = showArchivedSources ? allIncomeSources : activeIncomeSources;
  const hasArchivedSources = allIncomeSources.some((source) => source.isArchived);
  const hasIncomeSources = allIncomeSources.length > 0;
  const hasActiveSources = activeIncomeSources.length > 0;
  const hasIncomeEntries = incomeEntries.length > 0;
  const calculatedEntryValues = calculateIncomeAmounts({
    amountOriginal: entryForm.amountOriginal,
    currencyCode: entryForm.currencyCode,
    conversionRate: entryForm.conversionRate,
    baseCurrencyCode,
  });

  function resolveActiveSourceId(sourceId) {
    if (sourceId && activeIncomeSources.some((source) => source.id === sourceId)) {
      return sourceId;
    }

    return activeIncomeSources[0]?.id ?? '';
  }

  function resolveActiveIncomeCategoryId(categoryId) {
    if (categoryId && incomeCategories.some((category) => category.id === categoryId)) {
      return categoryId;
    }

    return '';
  }

  async function loadSummary() {
    if (!user?.id) {
      return;
    }

    setSummaryError('');
    setIsSummaryLoading(true);

    try {
      const nextSummary = await loadIncomeMonthSummary({ userId: user.id });
      setSummary({
        totalIncome: nextSummary.totalIncome,
        entryCount: nextSummary.entryCount,
      });
      setMonthLabel(nextSummary.monthLabel);
      setBaseCurrencyCode(nextSummary.baseCurrencyCode || defaultBaseCurrency);
    } catch (error) {
      setSummaryError(getIncomeErrorMessage(error, 'We could not load your income summary right now.'));
    } finally {
      setIsSummaryLoading(false);
    }
  }

  async function loadSources() {
    setSourcesError('');
    setIsSourcesLoading(true);

    try {
      const nextSources = await listIncomeSources({ includeArchived: true });
      setAllIncomeSources(nextSources);
    } catch (error) {
      setSourcesError(getIncomeErrorMessage(error, 'We could not load income sources right now.'));
    } finally {
      setIsSourcesLoading(false);
    }
  }

  async function loadEntries() {
    setEntriesError('');
    setIsEntriesLoading(true);

    try {
      const nextEntries = await listIncomeEntries();
      setIncomeEntries(nextEntries);
    } catch (error) {
      setEntriesError(getIncomeErrorMessage(error, 'We could not load income entries right now.'));
    } finally {
      setIsEntriesLoading(false);
    }
  }

  async function loadIncomeCategories() {
    setCategoriesError('');
    setIsCategoriesLoading(true);

    try {
      const categories = await listCategories({ includeArchived: false });
      const nextIncomeCategories = categories.filter((category) => String(category.kind ?? '').toLowerCase() === 'income');
      setIncomeCategories(nextIncomeCategories);
    } catch (error) {
      setCategoriesError(getIncomeErrorMessage(error, 'We could not load income categories right now.'));
    } finally {
      setIsCategoriesLoading(false);
    }
  }

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    void loadSummary();
    void loadSources();
    void loadEntries();
    void loadIncomeCategories();
  }, [user?.id]);

  useEffect(() => {
    setEntryForm((current) => {
      const nextSourceId = current.incomeSourceId || activeIncomeSources[0]?.id || '';
      const nextBaseCurrencyCode = baseCurrencyCode || defaultBaseCurrency;
      const nextCurrencyCode = current.currencyCode || nextBaseCurrencyCode;

      if (
        current.incomeSourceId === nextSourceId &&
        current.baseCurrencyCode === nextBaseCurrencyCode &&
        current.currencyCode === nextCurrencyCode
      ) {
        return current;
      }

      return {
        ...current,
        incomeSourceId: nextSourceId,
        baseCurrencyCode: nextBaseCurrencyCode,
        currencyCode: nextCurrencyCode,
        conversionRate: nextCurrencyCode === nextBaseCurrencyCode ? '1' : current.conversionRate,
      };
    });
  }, [activeIncomeSources, baseCurrencyCode]);

  function resetSourceForm() {
    setEditingSourceId('');
    setSourceForm(createInitialIncomeSourceFormState());
    setSourceErrors({});
    setSourceDialogStatus(null);
  }

  function resetEntryForm() {
    setEditingEntryId('');
    setEntryForm(
      createInitialIncomeEntryFormState({
        defaultSourceId: activeIncomeSources[0]?.id ?? '',
        baseCurrencyCode,
      }),
    );
    setEntryErrors({});
    setEntryDialogStatus(null);
  }

  function openCreateSourceDialog() {
    resetSourceForm();
    setStatus(null);
    setIsSourceDialogOpen(true);
  }

  function openEditSourceDialog(source) {
    setEditingSourceId(source.id);
    setSourceForm(createInitialIncomeSourceFormStateFromSource(source));
    setSourceErrors({});
    setSourceDialogStatus(null);
    setStatus(null);
    setIsSourceDialogOpen(true);
  }

  function closeSourceDialog() {
    setIsSourceDialogOpen(false);
    resetSourceForm();
  }

  function openCreateEntryDialog() {
    if (!hasActiveSources) {
      setStatus({
        tone: 'error',
        message: 'Create an active income source before adding income entries.',
      });
      return;
    }

    resetEntryForm();
    setStatus(null);
    setIsEntryDialogOpen(true);
  }

  function openEditEntryDialog(entry) {
    const nextSourceId = resolveActiveSourceId(entry.sourceId);

    if (!nextSourceId) {
      setStatus({
        tone: 'error',
        message: 'Create or restore an active income source before editing this entry.',
      });
      return;
    }

    const nextCategoryId = resolveActiveIncomeCategoryId(entry.categoryId);
    const nextForm = createInitialIncomeEntryFormStateFromEntry(entry, {
      fallbackSourceId: nextSourceId,
      baseCurrencyCode,
    });

    setEditingEntryId(entry.id);
    setEntryForm({
      ...nextForm,
      incomeSourceId: nextSourceId,
      categoryId: nextCategoryId,
    });
    setEntryErrors({});

    if (nextSourceId !== entry.sourceId) {
      setEntryDialogStatus({
        tone: 'error',
        message: 'This entry’s original source is archived. Choose an active source before saving.',
      });
    } else if (entry.categoryId && nextCategoryId !== entry.categoryId) {
      setEntryDialogStatus({
        tone: 'error',
        message: 'This entry’s saved category is no longer active. You can keep the entry uncategorized or choose a new income category.',
      });
    } else {
      setEntryDialogStatus(null);
    }

    setStatus(null);
    setIsEntryDialogOpen(true);
  }

  function closeEntryDialog() {
    setIsEntryDialogOpen(false);
    resetEntryForm();
  }

  function handleSourceChange(field, value) {
    setSourceForm((current) => ({ ...current, [field]: value }));
    setSourceErrors((current) => ({ ...current, [field]: '' }));
    setSourceDialogStatus(null);
  }

  function handleEntryChange(field, value) {
    setEntryForm((current) => {
      if (field === 'currencyCode') {
        const nextCurrencyCode = value.toUpperCase();
        return {
          ...current,
          currencyCode: nextCurrencyCode,
          conversionRate: nextCurrencyCode.trim().toUpperCase() === current.baseCurrencyCode.trim().toUpperCase() ? '1' : current.conversionRate,
        };
      }

      if (field === 'baseCurrencyCode') {
        const nextBaseCurrencyCode = value.toUpperCase();
        const shouldResetRate = current.currencyCode.trim().toUpperCase() === nextBaseCurrencyCode.trim().toUpperCase();

        return {
          ...current,
          baseCurrencyCode: nextBaseCurrencyCode,
          conversionRate: shouldResetRate ? '1' : current.conversionRate,
        };
      }

      return { ...current, [field]: value };
    });
    setEntryErrors((current) => ({ ...current, [field]: '' }));
    setEntryDialogStatus(null);
  }

  async function handleSourceSubmit(event) {
    event.preventDefault();

    const nextErrors = validateIncomeSourceForm(sourceForm);
    if (Object.keys(nextErrors).length > 0) {
      setSourceErrors(nextErrors);
      return;
    }

    if (!user?.id) {
      setSourceDialogStatus({
        tone: 'error',
        message: 'You must be signed in to manage income sources.',
      });
      return;
    }

    setIsSavingSource(true);
    setSourceDialogStatus(null);

    try {
      if (editingSourceId) {
        await updateIncomeSource({ id: editingSourceId, values: sourceForm });
        setStatus({
          tone: 'success',
          message: 'Income source updated successfully.',
        });
      } else {
        await createIncomeSource({ userId: user.id, values: sourceForm });
        setStatus({
          tone: 'success',
          message: 'Income source created successfully.',
        });
      }

      closeSourceDialog();
      await loadSources();
    } catch (error) {
      setSourceDialogStatus({
        tone: 'error',
        message: getIncomeErrorMessage(error, 'We could not save that income source. Please try again.'),
      });
    } finally {
      setIsSavingSource(false);
    }
  }

  async function handleToggleSourceArchive(source) {
    setSourceIdBeingUpdated(source.id);
    setStatus(null);

    try {
      await setIncomeSourceArchived({ id: source.id, isArchived: !source.isArchived });
      await loadSources();
      setStatus({
        tone: 'success',
        message: source.isArchived ? `${source.name} was restored.` : `${source.name} was archived.`,
      });
    } catch (error) {
      setStatus({
        tone: 'error',
        message: getIncomeErrorMessage(error, 'We could not update this income source right now.'),
      });
    } finally {
      setSourceIdBeingUpdated('');
    }
  }

  async function handleEntrySubmit(event) {
    event.preventDefault();

    const nextErrors = validateIncomeEntryForm(entryForm, activeIncomeSources, incomeCategories, baseCurrencyCode);
    if (Object.keys(nextErrors).length > 0) {
      setEntryErrors(nextErrors);
      return;
    }

    if (!user?.id) {
      setEntryDialogStatus({
        tone: 'error',
        message: 'You must be signed in to manage income entries.',
      });
      return;
    }

    setIsSavingEntry(true);
    setEntryDialogStatus(null);

    try {
      if (editingEntryId) {
        await updateIncomeEntry({
          id: editingEntryId,
          values: entryForm,
          baseCurrencyCode,
        });
        setStatus({
          tone: 'success',
          message: 'Income entry updated successfully.',
        });
      } else {
        await createIncomeEntry({
          userId: user.id,
          values: entryForm,
          baseCurrencyCode,
        });
        setStatus({
          tone: 'success',
          message: 'Income entry created successfully.',
        });
      }

      closeEntryDialog();
      await Promise.all([loadEntries(), loadSummary()]);
    } catch (error) {
      setEntryDialogStatus({
        tone: 'error',
        message: getIncomeErrorMessage(error, 'We could not save that income entry. Please try again.'),
      });
    } finally {
      setIsSavingEntry(false);
    }
  }

  const summaryCards = [
    {
      label: 'Income this month',
      value: formatIncomeAmount(summary.totalIncome, baseCurrencyCode),
      detail: monthLabel ? `Recorded income entries for ${monthLabel}.` : 'Recorded income entries this month.',
    },
    {
      label: 'Entries this month',
      value: String(summary.entryCount),
      detail: 'Real entries from income_entries for the current month.',
    },
    {
      label: 'Active sources',
      value: String(activeIncomeSources.length),
      detail: 'Available income sources you can use for new entries.',
    },
  ];

  return (
    <div className="space-y-5">
      <AppPageHeader
        eyebrow="Income"
        title="Record and review income clearly"
        description="Manage your income sources, add real income entries, and keep totals aligned with your profile base currency."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <AuthButton type="button" onClick={openCreateSourceDialog} className="w-auto rounded-full px-5 py-3 text-sm">
              New source
            </AuthButton>
            <button
              type="button"
              onClick={openCreateEntryDialog}
              disabled={!hasActiveSources || isSourcesLoading}
              className="inline-flex items-center justify-center rounded-full border border-[var(--fundly-accent)] bg-[linear-gradient(180deg,var(--fundly-primary)_0%,var(--fundly-primary-soft)_46%,var(--fundly-deep)_100%)] px-5 py-3 text-sm font-bold text-[var(--fundly-surface)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Add income
            </button>
          </div>
        }
      />

      <StatusMessage tone={status?.tone} message={status?.message} />

      {summaryError ? (
        <AppSurface
          eyebrow="Summary"
          title="Income summary is unavailable"
          description={summaryError}
          action={
            <button
              type="button"
              onClick={() => void loadSummary()}
              className="inline-flex items-center justify-center rounded-full border border-[rgba(var(--fundly-warm-rgb),0.25)] bg-[rgba(var(--fundly-warm-rgb),0.10)] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--fundly-warm)] transition hover:border-[rgba(var(--fundly-warm-rgb),0.40)]"
            >
              Retry
            </button>
          }
        />
      ) : null}

      {isSummaryLoading ? (
        <SummarySkeleton />
      ) : (
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
          {summaryCards.map((item) => (
            <AppSurface key={item.label} className="p-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--fundly-accent)]">{item.label}</p>
              <p className="mt-3 text-2xl font-bold tracking-[-0.03em] text-[var(--fundly-primary)]">{item.value}</p>
              <p className="mt-2 text-sm leading-6 text-[rgba(var(--fundly-primary-rgb),0.7)]">{item.detail}</p>
            </AppSurface>
          ))}
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <AppSurface
          eyebrow="Sources"
          title="Income sources"
          description="Create reusable sources first, then log entries against them. Archived sources stay hidden unless you choose to view them."
          action={
            hasArchivedSources ? (
              <button
                type="button"
                onClick={() => setShowArchivedSources((current) => !current)}
                className="inline-flex items-center justify-center rounded-full border border-[rgba(var(--fundly-primary-rgb),0.16)] bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--fundly-primary)] transition hover:border-[rgba(var(--fundly-accent-rgb),0.40)] hover:text-[var(--fundly-accent)]"
              >
                {showArchivedSources ? 'Hide archived' : 'Show archived'}
              </button>
            ) : null
          }
        >
          {sourcesError ? (
            <div className="rounded-[1.3rem] border border-[rgba(var(--fundly-warm-rgb),0.18)] bg-[rgba(var(--fundly-warm-rgb),0.08)] px-4 py-4">
              <p className="font-bold text-[var(--fundly-primary)]">We could not load income sources</p>
              <p className="mt-2 text-sm leading-6 text-[rgba(var(--fundly-primary-rgb),0.72)]">{sourcesError}</p>
              <button
                type="button"
                onClick={() => void loadSources()}
                className="mt-4 inline-flex items-center justify-center rounded-full border border-[rgba(var(--fundly-warm-rgb),0.25)] bg-[rgba(var(--fundly-warm-rgb),0.10)] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--fundly-warm)] transition hover:border-[rgba(var(--fundly-warm-rgb),0.40)]"
              >
                Retry
              </button>
            </div>
          ) : isSourcesLoading ? (
            <SurfaceSkeleton rows={3} />
          ) : !hasIncomeSources ? (
            <div className="rounded-[1.3rem] border border-[rgba(var(--fundly-primary-rgb),0.12)] bg-white/70 px-4 py-5">
              <p className="font-bold text-[var(--fundly-primary)]">No income sources yet</p>
              <p className="mt-2 text-sm leading-6 text-[rgba(var(--fundly-primary-rgb),0.7)]">
                Add your first income source so new entries can be recorded cleanly from the same page.
              </p>
              <button
                type="button"
                onClick={openCreateSourceDialog}
                className="mt-4 inline-flex items-center justify-center rounded-full border border-[var(--fundly-accent)] bg-[linear-gradient(180deg,var(--fundly-primary)_0%,var(--fundly-primary-soft)_46%,var(--fundly-deep)_100%)] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--fundly-surface)] transition hover:-translate-y-0.5"
              >
                Add first source
              </button>
            </div>
          ) : visibleIncomeSources.length === 0 ? (
            <div className="rounded-[1.3rem] border border-[rgba(var(--fundly-primary-rgb),0.12)] bg-white/70 px-4 py-5">
              <p className="font-bold text-[var(--fundly-primary)]">All sources are archived</p>
              <p className="mt-2 text-sm leading-6 text-[rgba(var(--fundly-primary-rgb),0.7)]">
                Restore a source or show archived sources to manage them again.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {visibleIncomeSources.map((source) => (
                <IncomeSourceListItem
                  key={source.id}
                  source={source}
                  onEdit={openEditSourceDialog}
                  onToggleArchive={(nextSource) => void handleToggleSourceArchive(nextSource)}
                  isToggling={sourceIdBeingUpdated === source.id}
                />
              ))}
            </div>
          )}
        </AppSurface>

        <AppSurface
          eyebrow="Entries"
          title="Income entries"
          description="Newest income entries first, with source, base-currency conversion, and optional income category context."
          action={
            hasActiveSources ? (
              <button
                type="button"
                onClick={openCreateEntryDialog}
                className="inline-flex items-center justify-center rounded-full border border-[var(--fundly-accent)] bg-[linear-gradient(180deg,var(--fundly-primary)_0%,var(--fundly-primary-soft)_46%,var(--fundly-deep)_100%)] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--fundly-surface)] transition hover:-translate-y-0.5"
              >
                Add income
              </button>
            ) : null
          }
        >
          {categoriesError ? (
            <div className="mb-4 rounded-[1.2rem] border border-[rgba(var(--fundly-warm-rgb),0.18)] bg-[rgba(var(--fundly-warm-rgb),0.08)] px-4 py-4">
              <p className="font-bold text-[var(--fundly-primary)]">Income categories are unavailable</p>
              <p className="mt-2 text-sm leading-6 text-[rgba(var(--fundly-primary-rgb),0.72)]">
                Entries can still be recorded without a category. {categoriesError}
              </p>
              <button
                type="button"
                onClick={() => void loadIncomeCategories()}
                className="mt-4 inline-flex items-center justify-center rounded-full border border-[rgba(var(--fundly-warm-rgb),0.25)] bg-[rgba(var(--fundly-warm-rgb),0.10)] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--fundly-warm)] transition hover:border-[rgba(var(--fundly-warm-rgb),0.40)]"
              >
                Retry
              </button>
            </div>
          ) : null}

          {entriesError ? (
            <div className="rounded-[1.3rem] border border-[rgba(var(--fundly-warm-rgb),0.18)] bg-[rgba(var(--fundly-warm-rgb),0.08)] px-4 py-4">
              <p className="font-bold text-[var(--fundly-primary)]">We could not load income entries</p>
              <p className="mt-2 text-sm leading-6 text-[rgba(var(--fundly-primary-rgb),0.72)]">{entriesError}</p>
              <button
                type="button"
                onClick={() => void loadEntries()}
                className="mt-4 inline-flex items-center justify-center rounded-full border border-[rgba(var(--fundly-warm-rgb),0.25)] bg-[rgba(var(--fundly-warm-rgb),0.10)] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--fundly-warm)] transition hover:border-[rgba(var(--fundly-warm-rgb),0.40)]"
              >
                Retry
              </button>
            </div>
          ) : isEntriesLoading ? (
            <SurfaceSkeleton rows={4} />
          ) : !hasActiveSources ? (
            <div className="rounded-[1.3rem] border border-[rgba(var(--fundly-primary-rgb),0.12)] bg-white/70 px-4 py-5">
              <p className="font-bold text-[var(--fundly-primary)]">Create an income source first</p>
              <p className="mt-2 text-sm leading-6 text-[rgba(var(--fundly-primary-rgb),0.7)]">
                New income entries need one active source. Add one from the Income sources panel, then come back here.
              </p>
            </div>
          ) : !hasIncomeEntries ? (
            <div className="rounded-[1.3rem] border border-[rgba(var(--fundly-primary-rgb),0.12)] bg-white/70 px-4 py-5">
              <p className="font-bold text-[var(--fundly-primary)]">No income entries yet</p>
              <p className="mt-2 text-sm leading-6 text-[rgba(var(--fundly-primary-rgb),0.7)]">
                Record your first real income entry to start tracking current-month totals here and on Home.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {incomeEntries.map((entry) => (
                <IncomeEntryListItem key={entry.id} entry={entry} onEdit={openEditEntryDialog} />
              ))}
            </div>
          )}
        </AppSurface>
      </div>

      <IncomeSourceDialog
        form={sourceForm}
        errors={sourceErrors}
        status={sourceDialogStatus}
        mode={editingSourceId ? 'edit' : 'create'}
        isOpen={isSourceDialogOpen}
        isSubmitting={isSavingSource}
        onCancel={closeSourceDialog}
        onChange={handleSourceChange}
        onSubmit={handleSourceSubmit}
      />

      <IncomeEntryDialog
        sources={activeIncomeSources}
        categories={incomeCategories}
        form={entryForm}
        calculatedValues={calculatedEntryValues}
        errors={entryErrors}
        status={entryDialogStatus}
        mode={editingEntryId ? 'edit' : 'create'}
        isOpen={isEntryDialogOpen}
        isSubmitting={isSavingEntry}
        onCancel={closeEntryDialog}
        onChange={handleEntryChange}
        onSubmit={handleEntrySubmit}
      />
    </div>
  );
}
