import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import StatusMessage from '../../auth/StatusMessage';
import { BillsIcon, IncomeIcon, TransactionsIcon } from '../app-icons';
import BillPayDialog from '../bills/BillPayDialog';
import IncomeEntryDialog from '../income/IncomeEntryDialog';
import TransactionDialog from '../transactions/TransactionDialog';
import BillPickerDialog from './BillPickerDialog';
import { listBills, createInitialBillPaymentFormState, processBillPayment } from '../../../lib/bills';
import { listCategories } from '../../../lib/categories';
import { useAuthSession } from '../../../lib/auth-context';
import { emitMoneyDataUpdated } from '../../../lib/app-events';
import {
  calculateIncomeAmounts,
  createIncomeEntry,
  createInitialIncomeEntryFormState,
  getUserBaseCurrencyCode,
  listIncomeSources,
} from '../../../lib/income';
import { createTransactionWithSplit, defaultBaseCurrency, defaultTransactionCurrency, getTodayDateInputValue } from '../../../lib/transactions';

function createInitialTransactionFormState(defaultCategoryId = '') {
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

function getIncomeErrorMessage(error, fallbackMessage) {
  const message = error?.message?.toLowerCase?.() ?? '';

  if (message.includes('foreign key')) {
    return 'The selected source or category is no longer available. Refresh and try again.';
  }

  return error?.message || fallbackMessage;
}

function getBillErrorMessage(error, fallbackMessage) {
  const message = error?.message?.toLowerCase?.() ?? '';

  if (message.includes('foreign key')) {
    return 'The selected bill category is no longer available. Refresh and try again.';
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

  if (!form.transactionDate) {
    errors.transactionDate = 'Choose a transaction date.';
  }

  if (!form.categoryId) {
    errors.categoryId = 'Select a category.';
  } else if (!activeCategoryIds.has(form.categoryId)) {
    errors.categoryId = 'Select an active spending category.';
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

  if (normalizedCurrencyCode !== normalizedBaseCurrencyCode) {
    const conversionRateValue = Number(form.conversionRate);

    if (!String(form.conversionRate ?? '').trim()) {
      errors.conversionRate = 'Enter a conversion rate.';
    } else if (!Number.isFinite(conversionRateValue) || conversionRateValue <= 0) {
      errors.conversionRate = 'Enter a valid conversion rate.';
    }
  }

  if (!form.entryDate) {
    errors.entryDate = 'Choose an entry date.';
  }

  if (form.categoryId && !activeCategoryIds.has(form.categoryId)) {
    errors.categoryId = 'Select an active income category or clear this field.';
  }

  return errors;
}

function validateBillPaymentForm(form, categories) {
  const errors = {};
  const activeCategoryIds = new Set(categories.map((category) => category.id));
  const amountValue = form.amount.trim();

  if (!amountValue) {
    errors.amount = 'Enter a payment amount.';
  } else {
    const numericAmount = Number(amountValue);

    if (!Number.isFinite(numericAmount)) {
      errors.amount = 'Enter a valid amount.';
    } else if (numericAmount <= 0) {
      errors.amount = 'Amount must be greater than 0.';
    }
  }

  if (!form.transactionDate) {
    errors.transactionDate = 'Choose a payment date.';
  }

  if (!form.categoryId) {
    errors.categoryId = 'Select a category.';
  } else if (!activeCategoryIds.has(form.categoryId)) {
    errors.categoryId = 'Select an active spending category.';
  }

  return errors;
}

function FabIcon({ isOpen }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6 transition-transform duration-200"
      style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
      aria-hidden="true"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function ActionMenuButton({ Icon, title, description, isLoading, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className="flex w-full items-start gap-3 rounded-[1.25rem] border border-[rgba(var(--fundly-surface-rgb),0.08)] bg-white/6 px-4 py-3 text-left transition hover:border-[rgba(var(--fundly-accent-rgb),0.24)] hover:bg-white/10 disabled:cursor-wait disabled:opacity-70"
    >
      <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] border border-[rgba(var(--fundly-accent-rgb),0.22)] bg-[rgba(var(--fundly-accent-rgb),0.10)] text-[var(--fundly-accent)]">
        <Icon />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-[var(--fundly-surface)]">{title}</span>
        <span className="mt-1 block text-sm leading-6 text-[rgba(var(--fundly-surface-rgb),0.68)]">
          {isLoading ? 'Loading...' : description}
        </span>
      </span>
    </button>
  );
}

export default function AppFloatingMoneyActions() {
  const { user } = useAuthSession();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBillPickerOpen, setIsBillPickerOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState('');
  const [menuStatus, setMenuStatus] = useState(null);
  const [toastStatus, setToastStatus] = useState(null);

  const [expenseCategories, setExpenseCategories] = useState([]);
  const [expenseForm, setExpenseForm] = useState(createInitialTransactionFormState());
  const [expenseErrors, setExpenseErrors] = useState({});
  const [expenseStatus, setExpenseStatus] = useState(null);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isExpenseSubmitting, setIsExpenseSubmitting] = useState(false);

  const [incomeSources, setIncomeSources] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [baseCurrencyCode, setBaseCurrencyCode] = useState(defaultBaseCurrency);
  const [incomeEntryForm, setIncomeEntryForm] = useState(
    createInitialIncomeEntryFormState({ baseCurrencyCode: defaultBaseCurrency }),
  );
  const [incomeEntryErrors, setIncomeEntryErrors] = useState({});
  const [incomeEntryStatus, setIncomeEntryStatus] = useState(null);
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false);
  const [isIncomeSubmitting, setIsIncomeSubmitting] = useState(false);

  const [bills, setBills] = useState([]);
  const [billCategories, setBillCategories] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [billPayForm, setBillPayForm] = useState(createInitialBillPaymentFormState(null));
  const [billPayErrors, setBillPayErrors] = useState({});
  const [billPayStatus, setBillPayStatus] = useState(null);
  const [isBillPayDialogOpen, setIsBillPayDialogOpen] = useState(false);
  const [isBillPaySubmitting, setIsBillPaySubmitting] = useState(false);

  const calculatedIncomeValues = useMemo(
    () =>
      calculateIncomeAmounts({
        amountOriginal: incomeEntryForm.amountOriginal,
        currencyCode: incomeEntryForm.currencyCode,
        conversionRate: incomeEntryForm.conversionRate,
        baseCurrencyCode,
      }),
    [baseCurrencyCode, incomeEntryForm.amountOriginal, incomeEntryForm.conversionRate, incomeEntryForm.currencyCode],
  );

  useEffect(() => {
    setIsMenuOpen(false);
    setIsBillPickerOpen(false);
    setMenuStatus(null);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMenuOpen && !isBillPickerOpen) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsBillPickerOpen(false);
        setIsMenuOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isBillPickerOpen, isMenuOpen]);

  useEffect(() => {
    if (!toastStatus?.message) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setToastStatus(null);
    }, 4200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [toastStatus]);

  function closeActionOverlays() {
    setIsMenuOpen(false);
    setIsBillPickerOpen(false);
    setMenuStatus(null);
  }

  function toggleMenu() {
    setMenuStatus(null);
    setIsBillPickerOpen(false);
    setIsMenuOpen((current) => !current);
  }

  async function loadExpenseCategories() {
    const categories = await listCategories({ includeArchived: false });
    const spendingCategories = categories.filter((category) => String(category.kind ?? '').toLowerCase() !== 'income');
    setExpenseCategories(spendingCategories);
    return spendingCategories;
  }

  async function loadIncomeActionData() {
    const [nextSources, nextBaseCurrency] = await Promise.all([
      listIncomeSources({ includeArchived: false }),
      user?.id
        ? getUserBaseCurrencyCode({ userId: user.id }).catch(() => defaultBaseCurrency)
        : Promise.resolve(defaultBaseCurrency),
    ]);

    let nextCategories = [];
    let categoriesInfoMessage = '';

    try {
      const fetchedCategories = await listCategories({ includeArchived: false });
      nextCategories = fetchedCategories.filter((category) => String(category.kind ?? '').toLowerCase() === 'income');
    } catch (error) {
      categoriesInfoMessage = getIncomeErrorMessage(error, 'Income categories are unavailable right now. You can still continue without one.');
    }

    setIncomeSources(nextSources);
    setIncomeCategories(nextCategories);
    setBaseCurrencyCode(nextBaseCurrency || defaultBaseCurrency);

    return {
      sources: nextSources,
      categories: nextCategories,
      baseCurrency: nextBaseCurrency || defaultBaseCurrency,
      categoriesInfoMessage,
    };
  }

  async function loadBillsActionData() {
    const [nextBills, nextCategories] = await Promise.all([
      listBills(),
      listCategories({ includeArchived: false }),
    ]);

    const nextBillCategories = nextCategories.filter((category) => String(category.kind ?? '').toLowerCase() !== 'income');

    setBills(nextBills);
    setBillCategories(nextBillCategories);

    return {
      bills: nextBills,
      categories: nextBillCategories,
    };
  }

  function resolveActiveBillCategoryId(categoryId, categories = billCategories) {
    if (categoryId && categories.some((category) => category.id === categoryId)) {
      return categoryId;
    }

    return categories[0]?.id ?? '';
  }

  async function handleOpenExpenseDialog() {
    setPendingAction('expense');
    setMenuStatus(null);

    try {
      const nextCategories = await loadExpenseCategories();

      if (nextCategories.length === 0) {
        setMenuStatus({
          tone: 'error',
          message: 'Add an active spending category before recording an expense.',
        });
        return;
      }

      setExpenseForm(createInitialTransactionFormState(nextCategories[0]?.id ?? ''));
      setExpenseErrors({});
      setExpenseStatus(null);
      setIsExpenseDialogOpen(true);
      setIsMenuOpen(false);
    } catch (error) {
      setMenuStatus({
        tone: 'error',
        message: getTransactionErrorMessage(error, 'We could not prepare the expense form right now.'),
      });
    } finally {
      setPendingAction('');
    }
  }

  async function handleOpenIncomeDialog() {
    setPendingAction('income');
    setMenuStatus(null);

    try {
      const { sources, categories, baseCurrency, categoriesInfoMessage } = await loadIncomeActionData();

      if (sources.length === 0) {
        setMenuStatus({
          tone: 'error',
          message: 'Create an active income source on the Income page before adding income.',
        });
        return;
      }

      setIncomeEntryForm(
        createInitialIncomeEntryFormState({
          defaultSourceId: sources[0]?.id ?? '',
          defaultCategoryId: categories[0]?.id ?? '',
          baseCurrencyCode: baseCurrency,
        }),
      );
      setIncomeEntryErrors({});
      setIncomeEntryStatus(
        categoriesInfoMessage
          ? {
              tone: 'info',
              message: categoriesInfoMessage,
            }
          : null,
      );
      setIsIncomeDialogOpen(true);
      setIsMenuOpen(false);
    } catch (error) {
      setMenuStatus({
        tone: 'error',
        message: getIncomeErrorMessage(error, 'We could not prepare the income form right now.'),
      });
    } finally {
      setPendingAction('');
    }
  }

  async function handleOpenBillPicker() {
    setPendingAction('bill');
    setMenuStatus(null);

    try {
      const { bills: nextBills, categories } = await loadBillsActionData();

      if (nextBills.length === 0) {
        setMenuStatus({
          tone: 'error',
          message: 'Create a bill on the Bills page before using quick pay from the global action button.',
        });
        return;
      }

      if (categories.length === 0) {
        setMenuStatus({
          tone: 'error',
          message: 'Add an active spending category before paying a bill.',
        });
        return;
      }

      setIsBillPickerOpen(true);
      setIsMenuOpen(false);
    } catch (error) {
      setMenuStatus({
        tone: 'error',
        message: getBillErrorMessage(error, 'We could not load your bills right now.'),
      });
    } finally {
      setPendingAction('');
    }
  }

  function handleExpenseChange(field, value) {
    setExpenseForm((current) => ({ ...current, [field]: value }));
    setExpenseErrors((current) => ({ ...current, [field]: '' }));
    setExpenseStatus(null);
  }

  function handleIncomeEntryChange(field, value) {
    setIncomeEntryForm((current) => {
      if (field === 'currencyCode') {
        const nextCurrencyCode = value.toUpperCase();
        return {
          ...current,
          currencyCode: nextCurrencyCode,
          conversionRate:
            nextCurrencyCode.trim().toUpperCase() === current.baseCurrencyCode.trim().toUpperCase()
              ? '1'
              : current.conversionRate,
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

    setIncomeEntryErrors((current) => ({ ...current, [field]: '' }));
    setIncomeEntryStatus(null);
  }

  function handleBillPayChange(field, value) {
    setBillPayForm((current) => ({ ...current, [field]: value }));
    setBillPayErrors((current) => ({ ...current, [field]: '' }));
    setBillPayStatus(null);
  }

  function closeExpenseDialog() {
    setIsExpenseDialogOpen(false);
    setExpenseForm(createInitialTransactionFormState(expenseCategories[0]?.id ?? ''));
    setExpenseErrors({});
    setExpenseStatus(null);
  }

  function closeIncomeDialog() {
    setIsIncomeDialogOpen(false);
    setIncomeEntryForm(
      createInitialIncomeEntryFormState({
        defaultSourceId: incomeSources[0]?.id ?? '',
        defaultCategoryId: incomeCategories[0]?.id ?? '',
        baseCurrencyCode,
      }),
    );
    setIncomeEntryErrors({});
    setIncomeEntryStatus(null);
  }

  function closeBillPayDialog() {
    setIsBillPayDialogOpen(false);
    setSelectedBill(null);
    setBillPayForm(createInitialBillPaymentFormState(null));
    setBillPayErrors({});
    setBillPayStatus(null);
  }

  function closeBillPicker() {
    setIsBillPickerOpen(false);
    setMenuStatus(null);
  }

  function handleSelectBill(bill) {
    const nextCategoryId = resolveActiveBillCategoryId(bill.categoryId);

    if (!nextCategoryId) {
      setMenuStatus({
        tone: 'error',
        message: 'Add an active spending category before paying this bill.',
      });
      return;
    }

    setSelectedBill(bill);
    setBillPayForm(createInitialBillPaymentFormState({ ...bill, categoryId: nextCategoryId }));
    setBillPayErrors({});
    setBillPayStatus(
      nextCategoryId !== bill.categoryId
        ? {
            tone: 'error',
            message: 'This bill’s saved category is no longer active. Pick a valid category before confirming payment.',
          }
        : null,
    );
    setMenuStatus(null);
    setIsBillPickerOpen(false);
    setIsBillPayDialogOpen(true);
  }

  async function handleExpenseSubmit(event) {
    event.preventDefault();

    const nextErrors = validateTransactionForm(expenseForm, expenseCategories);
    if (Object.keys(nextErrors).length > 0) {
      setExpenseErrors(nextErrors);
      return;
    }

    if (!user?.id) {
      setExpenseStatus({
        tone: 'error',
        message: 'You must be signed in to add a transaction.',
      });
      return;
    }

    setIsExpenseSubmitting(true);
    setExpenseStatus(null);

    try {
      await createTransactionWithSplit({
        userId: user.id,
        values: expenseForm,
      });

      closeExpenseDialog();
      setToastStatus({
        tone: 'success',
        message: 'Expense added successfully.',
      });
      emitMoneyDataUpdated({ source: 'expense' });
    } catch (error) {
      setExpenseStatus({
        tone: 'error',
        message: getTransactionErrorMessage(error, 'We could not save that transaction. Please try again.'),
      });
    } finally {
      setIsExpenseSubmitting(false);
    }
  }

  async function handleIncomeSubmit(event) {
    event.preventDefault();

    const nextErrors = validateIncomeEntryForm(incomeEntryForm, incomeSources, incomeCategories, baseCurrencyCode);
    if (Object.keys(nextErrors).length > 0) {
      setIncomeEntryErrors(nextErrors);
      return;
    }

    if (!user?.id) {
      setIncomeEntryStatus({
        tone: 'error',
        message: 'You must be signed in to add income.',
      });
      return;
    }

    setIsIncomeSubmitting(true);
    setIncomeEntryStatus(null);

    try {
      await createIncomeEntry({
        userId: user.id,
        values: incomeEntryForm,
        baseCurrencyCode,
      });

      closeIncomeDialog();
      setToastStatus({
        tone: 'success',
        message: 'Income entry added successfully.',
      });
      emitMoneyDataUpdated({ source: 'income' });
    } catch (error) {
      setIncomeEntryStatus({
        tone: 'error',
        message: getIncomeErrorMessage(error, 'We could not save that income entry right now.'),
      });
    } finally {
      setIsIncomeSubmitting(false);
    }
  }

  async function handleBillPaySubmit(event) {
    event.preventDefault();

    const nextErrors = validateBillPaymentForm(billPayForm, billCategories);
    if (Object.keys(nextErrors).length > 0) {
      setBillPayErrors(nextErrors);
      return;
    }

    if (!user?.id || !selectedBill) {
      setBillPayStatus({
        tone: 'error',
        message: 'Choose a bill before confirming payment.',
      });
      return;
    }

    setIsBillPaySubmitting(true);
    setBillPayStatus(null);

    try {
      const paidBill = selectedBill;

      await processBillPayment({
        userId: user.id,
        bill: paidBill,
        values: billPayForm,
      });

      closeBillPayDialog();
      await loadBillsActionData();
      setToastStatus({
        tone: 'success',
        message: `${paidBill.name} was paid and linked to your transaction history.`,
      });
      emitMoneyDataUpdated({ source: 'bill-payment', billId: paidBill.id });
    } catch (error) {
      setBillPayStatus({
        tone: 'error',
        message: getBillErrorMessage(error, 'We could not process that payment right now.'),
      });
    } finally {
      setIsBillPaySubmitting(false);
    }
  }

  if (!user) {
    return null;
  }

  return (
    <>
      {(isMenuOpen || isBillPickerOpen) && (
        <button
          type="button"
          aria-label="Close money action menu"
          onClick={closeActionOverlays}
          className="fixed inset-0 z-[32] bg-[rgba(var(--fundly-deep-rgb),0.12)] backdrop-blur-[1px]"
        />
      )}

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[34] px-4 pb-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl justify-end">
          <div className="pointer-events-auto relative flex flex-col items-end">
            <div
              className={[
                'mb-3 w-[min(100vw-2rem,22rem)] transition-all duration-200 ease-out sm:w-[20rem]',
                isMenuOpen ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-4 scale-95 opacity-0 pointer-events-none',
              ].join(' ')}
            >
              <div className="rounded-[1.75rem] border border-[rgba(var(--fundly-accent-rgb),0.18)] bg-[linear-gradient(180deg,rgba(var(--fundly-deep-rgb),0.98),rgba(var(--fundly-primary-rgb),0.92))] p-4 shadow-[0_28px_70px_rgba(0,0,0,0.34)] backdrop-blur-2xl sm:rounded-[1.5rem]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[0.62rem] font-bold uppercase tracking-[0.24em] text-[var(--fundly-accent)]">
                      Quick Actions
                    </p>
                    <h2 className="mt-2 text-lg font-bold tracking-[-0.03em] text-[var(--fundly-surface)]">
                      Record money in one tap
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-[rgba(var(--fundly-surface-rgb),0.70)]">
                      Launch the same real expense, income, and bill flows from anywhere in the app.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeActionOverlays}
                    aria-label="Close money action menu"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[rgba(var(--fundly-surface-rgb),0.10)] bg-white/8 text-[rgba(var(--fundly-surface-rgb),0.62)] transition hover:bg-white/12"
                  >
                    X
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  <ActionMenuButton
                    Icon={TransactionsIcon}
                    title="Add Expense"
                    description="Open the manual expense dialog with your current spending categories."
                    isLoading={pendingAction === 'expense'}
                    onClick={() => void handleOpenExpenseDialog()}
                  />
                  <ActionMenuButton
                    Icon={IncomeIcon}
                    title="Add Income"
                    description="Open the income entry dialog with your sources and base currency ready."
                    isLoading={pendingAction === 'income'}
                    onClick={() => void handleOpenIncomeDialog()}
                  />
                  <ActionMenuButton
                    Icon={BillsIcon}
                    title="Pay Bill"
                    description="Choose a saved bill and open the existing quick pay confirmation flow."
                    isLoading={pendingAction === 'bill'}
                    onClick={() => void handleOpenBillPicker()}
                  />
                </div>

                <div className="mt-4">
                  <StatusMessage tone={menuStatus?.tone} message={menuStatus?.message} />
                </div>
              </div>
            </div>

            <div
              className={[
                'mb-3 w-[min(100vw-2rem,22rem)] transition-all duration-200 ease-out sm:w-[20rem]',
                toastStatus?.message ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0 pointer-events-none',
              ].join(' ')}
            >
              <StatusMessage tone={toastStatus?.tone} message={toastStatus?.message} />
            </div>

            <button
              type="button"
              onClick={toggleMenu}
              aria-label="Open quick money actions"
              aria-expanded={isMenuOpen}
              className="mb-[5.6rem] flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(var(--fundly-accent-rgb),0.36)] bg-[radial-gradient(circle_at_30%_30%,rgba(var(--fundly-accent-rgb),0.55),transparent_34%),linear-gradient(180deg,var(--fundly-primary)_0%,var(--fundly-primary-soft)_46%,var(--fundly-deep)_100%)] text-[var(--fundly-surface)] shadow-[0_0_0_1px_rgba(var(--fundly-accent-rgb),0.12),0_20px_42px_rgba(var(--fundly-deep-rgb),0.34),0_0_28px_rgba(var(--fundly-accent-rgb),0.34)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_rgba(var(--fundly-accent-rgb),0.18),0_24px_52px_rgba(var(--fundly-deep-rgb),0.38),0_0_36px_rgba(var(--fundly-accent-rgb),0.42)] lg:mb-6"
            >
              <FabIcon isOpen={isMenuOpen} />
            </button>
          </div>
        </div>
      </div>

      <TransactionDialog
        categories={expenseCategories}
        form={expenseForm}
        errors={expenseErrors}
        status={expenseStatus}
        isOpen={isExpenseDialogOpen}
        isSubmitting={isExpenseSubmitting}
        onCancel={closeExpenseDialog}
        onChange={handleExpenseChange}
        onSubmit={handleExpenseSubmit}
      />

      <IncomeEntryDialog
        sources={incomeSources}
        categories={incomeCategories}
        form={incomeEntryForm}
        calculatedValues={calculatedIncomeValues}
        errors={incomeEntryErrors}
        status={incomeEntryStatus}
        mode="create"
        isOpen={isIncomeDialogOpen}
        isSubmitting={isIncomeSubmitting}
        onCancel={closeIncomeDialog}
        onChange={handleIncomeEntryChange}
        onSubmit={handleIncomeSubmit}
      />

      <BillPickerDialog
        bills={bills}
        isLoading={pendingAction === 'bill'}
        isOpen={isBillPickerOpen}
        status={menuStatus}
        onClose={closeBillPicker}
        onRetry={() => void handleOpenBillPicker()}
        onSelectBill={handleSelectBill}
      />

      <BillPayDialog
        bill={selectedBill}
        categories={billCategories}
        form={billPayForm}
        errors={billPayErrors}
        status={billPayStatus}
        isOpen={isBillPayDialogOpen}
        isSubmitting={isBillPaySubmitting}
        onCancel={closeBillPayDialog}
        onChange={handleBillPayChange}
        onSubmit={handleBillPaySubmit}
      />
    </>
  );
}
