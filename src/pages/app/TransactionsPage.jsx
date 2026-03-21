import { useEffect, useState } from 'react';
import AppPageHeader from '../../components/app/AppPageHeader';
import AppSurface from '../../components/app/AppSurface';
import TransactionDialog from '../../components/app/transactions/TransactionDialog';
import TransactionLoader from '../../components/app/transactions/TransactionLoader';
import TransactionListItem from '../../components/app/transactions/TransactionListItem';
import AuthButton from '../../components/auth/AuthButton';
import StatusMessage from '../../components/auth/StatusMessage';
import { listCategories } from '../../lib/categories';
import { useAuthSession } from '../../lib/auth-context';
import {
  createTransactionWithSplit,
  defaultTransactionCurrency,
  getTodayDateInputValue,
  listTransactions,
  transactionsPageSize,
} from '../../lib/transactions';

function createInitialFormState(defaultCategoryId = '') {
  return {
    title: '',
    amount: '',
    currency: defaultTransactionCurrency,
    transactionDate: getTodayDateInputValue(),
    categoryId: defaultCategoryId,
    merchantOrSource: '',
    note: '',
    isFromSavings: false,
  };
}

function getTransactionErrorMessage(error, fallbackMessage) {
  const message = error?.message?.toLowerCase?.() ?? '';

  if (message.includes('invalid input value for enum')) {
    return 'One of the transaction values is not accepted by the database.';
  }

  if (message.includes('foreign key')) {
    return 'The selected category is no longer available. Refresh and try again.';
  }

  return error?.message || fallbackMessage;
}

function validateTransactionForm(form, categories) {
  const errors = {};
  const amountValue = form.amount.trim();
  const activeCategoryIds = new Set(categories.map((category) => category.id));

  if (!form.title.trim()) {
    errors.title = 'Enter a transaction title.';
  }

  if (!amountValue) {
    errors.amount = 'Enter a transaction amount.';
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

  if (!form.transactionDate) {
    errors.transactionDate = 'Choose a transaction date.';
  }

  if (!form.categoryId) {
    errors.categoryId = 'Select a category.';
  } else if (!activeCategoryIds.has(form.categoryId)) {
    errors.categoryId = 'Select an active category.';
  }

  return errors;
}

function LoadingState() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="animate-pulse rounded-[1.35rem] border border-[#dff4f2] bg-white/75 px-4 py-4">
          <div className="h-5 w-36 rounded-full bg-[#dff4f2]" />
          <div className="mt-3 h-4 w-52 rounded-full bg-[#e9f8f7]" />
          <div className="mt-4 h-14 rounded-[1rem] bg-[#eef9f8]" />
        </div>
      ))}
    </div>
  );
}

export default function TransactionsPage() {
  const { user } = useAuthSession();
  const [activeCategories, setActiveCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState(createInitialFormState());
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [dialogStatus, setDialogStatus] = useState(null);
  const [categoriesError, setCategoriesError] = useState('');
  const [transactionsError, setTransactionsError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoaderVisible, setIsLoaderVisible] = useState(false);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: transactionsPageSize,
    count: 0,
    totalPages: 1,
  });

  async function loadCategories() {
    setCategoriesError('');
    setIsCategoriesLoading(true);

    try {
      const nextCategories = await listCategories({ includeArchived: false });
      setActiveCategories(nextCategories);
    } catch (error) {
      setCategoriesError(getTransactionErrorMessage(error, 'We could not load active categories right now.'));
    } finally {
      setIsCategoriesLoading(false);
    }
  }

  async function loadTransactionsPage(page = currentPage) {
    setTransactionsError('');
    setIsTransactionsLoading(true);

    try {
      const nextTransactions = await listTransactions({
        page,
        pageSize: transactionsPageSize,
      });

      setTransactions(nextTransactions.data);
      setPagination({
        page: nextTransactions.page,
        pageSize: nextTransactions.pageSize,
        count: nextTransactions.count,
        totalPages: nextTransactions.totalPages,
      });
    } catch (error) {
      setTransactionsError(getTransactionErrorMessage(error, 'We could not load your transactions right now.'));
    } finally {
      setIsTransactionsLoading(false);
    }
  }

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    void loadCategories();
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    void loadTransactionsPage(currentPage);
  }, [currentPage, user?.id]);

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

  function resetForm() {
    setForm(createInitialFormState(activeCategories[0]?.id ?? ''));
    setErrors({});
    setDialogStatus(null);
  }

  function openDialog() {
    resetForm();
    setStatus(null);
    setIsDialogOpen(true);
  }

  function handleNewTransactionClick() {
    setIsLoaderVisible(true);
  }

  function handleLoaderComplete() {
    setIsLoaderVisible(false);
    openDialog();
  }

  function closeDialog() {
    setIsDialogOpen(false);
    resetForm();
  }

  function handleChange(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
    setDialogStatus(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validateTransactionForm(form, activeCategories);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    if (!user?.id) {
      setDialogStatus({
        tone: 'error',
        message: 'You must be signed in to add a transaction.',
      });
      return;
    }

    setIsSubmitting(true);
    setDialogStatus(null);

    try {
      await createTransactionWithSplit({
        userId: user.id,
        values: form,
      });

      closeDialog();
      setStatus({
        tone: 'success',
        message: 'Transaction created successfully.',
      });
      setCurrentPage(1);
      await loadTransactionsPage(1);
    } catch (error) {
      setDialogStatus({
        tone: 'error',
        message: getTransactionErrorMessage(error, 'We could not save that transaction. Please try again.'),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const hasTransactions = transactions.length > 0;
  const hasActiveCategories = activeCategories.length > 0;

  return (
    <div className="space-y-5">
      <AppPageHeader
        eyebrow="Transactions"
        title="Track every expense clearly"
        description="Create real manual transactions, link them to active categories, and review the feed directly from Supabase."
        action={
          <AuthButton
            type="button"
            onClick={handleNewTransactionClick}
            disabled={isCategoriesLoading || !hasActiveCategories}
            className="w-auto rounded-full px-5 py-3 text-sm"
          >
            New transaction
          </AuthButton>
        }
      />

      <StatusMessage tone={status?.tone} message={status?.message} />

      <div className="space-y-4">
        {categoriesError ? (
          <AppSurface
            eyebrow="Categories"
            title="Active categories are unavailable"
            description={categoriesError}
            action={
              <button
                type="button"
                onClick={() => void loadCategories()}
                className="inline-flex items-center justify-center rounded-full border border-[#efc7b8] bg-[#fff2ec] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#934d33] transition hover:border-[#e3a28a]"
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
            description="Transactions need one active category because each new entry currently creates a single split row."
          />
        ) : null}

        {transactionsError ? (
          <AppSurface
            eyebrow="Feed"
            title="We could not load transactions"
            description={transactionsError}
            action={
              <button
                type="button"
                onClick={() => void loadTransactionsPage(currentPage)}
                className="inline-flex items-center justify-center rounded-full border border-[#efc7b8] bg-[#fff2ec] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#934d33] transition hover:border-[#e3a28a]"
              >
                Retry
              </button>
            }
          />
        ) : null}

        {isTransactionsLoading ? (
          <AppSurface eyebrow="Feed" title="Recent transactions" description="Loading your latest activity.">
            <LoadingState />
          </AppSurface>
        ) : null}

        {!isTransactionsLoading && !hasTransactions && !transactionsError ? (
          <AppSurface
            eyebrow="Feed"
            title="No transactions yet"
            description="Your new manual transactions will appear here once you start recording expenses."
            action={
              hasActiveCategories ? (
                <button
                  type="button"
                  onClick={openDialog}
                  className="inline-flex items-center justify-center rounded-full border border-[#073746] bg-[linear-gradient(180deg,#44e8f4_0%,#15aeca_42%,#0a6a83_100%)] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:-translate-y-0.5"
                >
                  Add first transaction
                </button>
              ) : null
            }
          />
        ) : null}

        {!isTransactionsLoading && hasTransactions ? (
          <AppSurface
            eyebrow="Feed"
            title={`${pagination.count} recorded`}
            description="Newest transactions first, joined with their category split for a clean real-time feed."
            action={
              pagination.totalPages > 1 ? (
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#087f98]">
                  Page {pagination.page} of {pagination.totalPages}
                </p>
              ) : null
            }
          >
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <TransactionListItem key={transaction.id} transaction={transaction} />
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#d3efed]/75 pt-4">
              <p className="text-sm text-[#5a727b]">
                Showing page {pagination.page} of {pagination.totalPages}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((current) => Math.max(1, current - 1))}
                  disabled={pagination.page <= 1}
                  className="inline-flex items-center justify-center rounded-full border border-[#d3efed] bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#16323b] transition hover:border-[#35d9ef]/40 hover:text-[#087f98] disabled:cursor-not-allowed disabled:opacity-55"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage((current) => Math.min(pagination.totalPages, current + 1))}
                  disabled={pagination.page >= pagination.totalPages}
                  className="inline-flex items-center justify-center rounded-full border border-[#073746] bg-[linear-gradient(180deg,#44e8f4_0%,#15aeca_42%,#0a6a83_100%)] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55"
                >
                  Next
                </button>
              </div>
            </div>
          </AppSurface>
        ) : null}
      </div>

      <TransactionDialog
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
      <TransactionLoader
        isVisible={isLoaderVisible}
        onComplete={handleLoaderComplete}
      />
    </div>
  );
}
