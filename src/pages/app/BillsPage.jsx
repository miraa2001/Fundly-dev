import { useEffect, useState } from 'react';
import AppPageHeader from '../../components/app/AppPageHeader';
import AppSurface from '../../components/app/AppSurface';
import BillDialog from '../../components/app/bills/BillDialog';
import BillHistoryDialog from '../../components/app/bills/BillHistoryDialog';
import BillListItem from '../../components/app/bills/BillListItem';
import BillPayDialog from '../../components/app/bills/BillPayDialog';
import AuthButton from '../../components/auth/AuthButton';
import StatusMessage from '../../components/auth/StatusMessage';
import {
  createBill,
  createInitialBillFormState,
  createInitialBillPaymentFormState,
  listBillHistory,
  listBills,
  processBillPayment,
  updateBill,
} from '../../lib/bills';
import { listCategories } from '../../lib/categories';
import { useAuthSession } from '../../lib/auth-context';

function getBillErrorMessage(error, fallbackMessage) {
  const message = error?.message?.toLowerCase?.() ?? '';

  if (message.includes('foreign key')) {
    return 'The selected category is no longer available. Refresh and try again.';
  }

  if (message.includes('invalid input value for enum')) {
    return 'One of the bill values is not accepted by the database.';
  }

  return error?.message || fallbackMessage;
}

function validateBillForm(form, categories) {
  const errors = {};
  const activeCategoryIds = new Set(categories.map((category) => category.id));
  const amountValue = form.defaultAmount.trim();

  if (!form.name.trim()) {
    errors.name = 'Enter a bill name.';
  }

  if (!amountValue) {
    errors.defaultAmount = 'Enter a default amount.';
  } else {
    const numericAmount = Number(amountValue);

    if (!Number.isFinite(numericAmount)) {
      errors.defaultAmount = 'Enter a valid amount.';
    } else if (numericAmount <= 0) {
      errors.defaultAmount = 'Amount must be greater than 0.';
    }
  }

  if (!form.categoryId) {
    errors.categoryId = 'Select a category.';
  } else if (!activeCategoryIds.has(form.categoryId)) {
    errors.categoryId = 'Select an active spending category.';
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

function LoadingState() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-[1.3rem] border border-[rgba(var(--fundly-primary-rgb),0.10)] bg-white/75 px-4 py-4"
        >
          <div className="h-5 w-40 rounded-full bg-[rgba(var(--fundly-primary-rgb),0.10)]" />
          <div className="mt-3 h-4 w-52 rounded-full bg-[rgba(var(--fundly-primary-rgb),0.08)]" />
          <div className="mt-4 h-10 w-56 rounded-full bg-[rgba(var(--fundly-primary-rgb),0.06)]" />
        </div>
      ))}
    </div>
  );
}

export default function BillsPage() {
  const { user } = useAuthSession();
  const [billCategories, setBillCategories] = useState([]);
  const [bills, setBills] = useState([]);
  const [historyItems, setHistoryItems] = useState([]);
  const [form, setForm] = useState(createInitialBillFormState());
  const [paymentForm, setPaymentForm] = useState(createInitialBillPaymentFormState(null));
  const [errors, setErrors] = useState({});
  const [paymentErrors, setPaymentErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [dialogStatus, setDialogStatus] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [categoriesError, setCategoriesError] = useState('');
  const [billsError, setBillsError] = useState('');
  const [historyError, setHistoryError] = useState('');
  const [isBillDialogOpen, setIsBillDialogOpen] = useState(false);
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [isBillsLoading, setIsBillsLoading] = useState(true);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isSubmittingBill, setIsSubmittingBill] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [editingBillId, setEditingBillId] = useState('');
  const [selectedBill, setSelectedBill] = useState(null);
  const [historyBill, setHistoryBill] = useState(null);

  const hasBillCategories = billCategories.length > 0;
  const hasBills = bills.length > 0;
  const historyBillId = historyBill?.id ?? '';
  const selectedBillId = selectedBill?.id ?? '';

  async function loadCategories() {
    setCategoriesError('');
    setIsCategoriesLoading(true);

    try {
      const nextCategories = await listCategories({ includeArchived: false });
      const nextBillCategories = nextCategories.filter((category) => String(category.kind ?? '').toLowerCase() !== 'income');
      setBillCategories(nextBillCategories);
    } catch (error) {
      setCategoriesError(getBillErrorMessage(error, 'We could not load spending categories right now.'));
    } finally {
      setIsCategoriesLoading(false);
    }
  }

  async function loadBillsData() {
    setBillsError('');
    setIsBillsLoading(true);

    try {
      const nextBills = await listBills();
      setBills(nextBills);
    } catch (error) {
      setBillsError(getBillErrorMessage(error, 'We could not load your bills right now.'));
    } finally {
      setIsBillsLoading(false);
    }
  }

  async function loadHistory(bill) {
    setHistoryBill(bill);
    setHistoryError('');
    setIsHistoryLoading(true);
    setHistoryItems([]);

    try {
      const nextHistoryItems = await listBillHistory({ billId: bill.id });
      setHistoryItems(nextHistoryItems);
    } catch (error) {
      setHistoryError(getBillErrorMessage(error, 'We could not load this bill history right now.'));
    } finally {
      setIsHistoryLoading(false);
    }
  }

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    void loadCategories();
    void loadBillsData();
  }, [user?.id]);

  useEffect(() => {
    if (billCategories.length === 0) {
      return;
    }

    setForm((current) => {
      if (current.categoryId && billCategories.some((category) => category.id === current.categoryId)) {
        return current;
      }

      return {
        ...current,
        categoryId: billCategories[0].id,
      };
    });
  }, [billCategories]);

  function resetBillForm() {
    setEditingBillId('');
    setForm(createInitialBillFormState(billCategories[0]?.id ?? ''));
    setErrors({});
    setDialogStatus(null);
  }

  function openCreateDialog() {
    resetBillForm();
    setStatus(null);
    setIsBillDialogOpen(true);
  }

  function openEditDialog(bill) {
    setEditingBillId(bill.id);
    setForm({
      name: bill.name ?? '',
      defaultAmount: bill.defaultAmount ? String(bill.defaultAmount) : '',
      categoryId: bill.categoryId ?? '',
      note: bill.note ?? '',
    });
    setErrors({});
    setDialogStatus(null);
    setStatus(null);
    setIsBillDialogOpen(true);
  }

  function closeBillDialog() {
    setIsBillDialogOpen(false);
    resetBillForm();
  }

  function handleBillChange(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
    setDialogStatus(null);
  }

  async function handleBillSubmit(event) {
    event.preventDefault();

    const nextErrors = validateBillForm(form, billCategories);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    if (!user?.id) {
      setDialogStatus({
        tone: 'error',
        message: 'You must be signed in to manage bills.',
      });
      return;
    }

    setIsSubmittingBill(true);
    setDialogStatus(null);

    try {
      if (editingBillId) {
        await updateBill({ id: editingBillId, values: form });
        setStatus({
          tone: 'success',
          message: 'Bill updated successfully.',
        });
      } else {
        await createBill({ userId: user.id, values: form });
        setStatus({
          tone: 'success',
          message: 'Bill created successfully.',
        });
      }

      closeBillDialog();
      await loadBillsData();
    } catch (error) {
      setDialogStatus({
        tone: 'error',
        message: getBillErrorMessage(error, 'We could not save that bill. Please try again.'),
      });
    } finally {
      setIsSubmittingBill(false);
    }
  }

  function openPayDialog(bill) {
    setSelectedBill(bill);
    setPaymentForm(createInitialBillPaymentFormState(bill));
    setPaymentErrors({});
    setPaymentStatus(null);
    setStatus(null);
    setIsPayDialogOpen(true);
  }

  function closePayDialog() {
    setIsPayDialogOpen(false);
    setSelectedBill(null);
    setPaymentForm(createInitialBillPaymentFormState(null));
    setPaymentErrors({});
    setPaymentStatus(null);
  }

  function handlePaymentChange(field, value) {
    setPaymentForm((current) => ({ ...current, [field]: value }));
    setPaymentErrors((current) => ({ ...current, [field]: '' }));
    setPaymentStatus(null);
  }

  async function handlePaymentSubmit(event) {
    event.preventDefault();

    const nextErrors = validateBillPaymentForm(paymentForm, billCategories);
    if (Object.keys(nextErrors).length > 0) {
      setPaymentErrors(nextErrors);
      return;
    }

    if (!user?.id || !selectedBill) {
      setPaymentStatus({
        tone: 'error',
        message: 'Choose a bill before confirming payment.',
      });
      return;
    }

    setIsProcessingPayment(true);
    setPaymentStatus(null);

    try {
      await processBillPayment({
        userId: user.id,
        bill: selectedBill,
        values: paymentForm,
      });

      closePayDialog();
      setStatus({
        tone: 'success',
        message: `${selectedBill.name} was recorded as a real transaction.`,
      });
    } catch (error) {
      setPaymentStatus({
        tone: 'error',
        message: getBillErrorMessage(error, 'We could not process this bill payment. Please try again.'),
      });
    } finally {
      setIsProcessingPayment(false);
    }
  }

  async function handleViewHistory(bill) {
    setIsHistoryOpen(true);
    await loadHistory(bill);
  }

  function closeHistoryDialog() {
    setIsHistoryOpen(false);
    setHistoryBill(null);
    setHistoryItems([]);
    setHistoryError('');
  }

  return (
    <div className="space-y-5">
      <AppPageHeader
        eyebrow="Bills"
        title="Quick pay your repeat expenses"
        description="Save reusable bill templates, process them into real transactions when they are due, and review each bill's payment history."
        action={
          <AuthButton
            type="button"
            onClick={openCreateDialog}
            disabled={isCategoriesLoading || !hasBillCategories}
            className="w-auto rounded-full px-5 py-3 text-sm"
          >
            New bill
          </AuthButton>
        }
      />

      <StatusMessage tone={status?.tone} message={status?.message} />

      <div className="space-y-4">
        {categoriesError ? (
          <AppSurface
            eyebrow="Categories"
            title="Spending categories are unavailable"
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

        {!isCategoriesLoading && !hasBillCategories && !categoriesError ? (
          <AppSurface
            eyebrow="Setup"
            title="Create a spending category first"
            description="Bills need one active expense category because each quick-pay action currently creates a single split row."
          />
        ) : null}

        {billsError ? (
          <AppSurface
            eyebrow="Bills"
            title="We could not load your bills"
            description={billsError}
            action={
              <button
                type="button"
                onClick={() => void loadBillsData()}
                className="inline-flex items-center justify-center rounded-full border border-[rgba(var(--fundly-warm-rgb),0.25)] bg-[rgba(var(--fundly-warm-rgb),0.10)] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--fundly-warm)] transition hover:border-[rgba(var(--fundly-warm-rgb),0.40)]"
              >
                Retry
              </button>
            }
          />
        ) : null}

        {isBillsLoading ? (
          <AppSurface
            eyebrow="Bills"
            title="Your payment templates"
            description="Loading reusable bills and quick-pay actions."
          >
            <LoadingState />
          </AppSurface>
        ) : null}

        {!isBillsLoading && !hasBills && !billsError ? (
          <AppSurface
            eyebrow="Bills"
            title="No bills yet"
            description="Add reusable bills here so common payments can be turned into real transactions in a few taps."
            action={
              hasBillCategories ? (
                <button
                  type="button"
                  onClick={openCreateDialog}
                  className="inline-flex items-center justify-center rounded-full border border-[var(--fundly-accent)] bg-[linear-gradient(180deg,var(--fundly-primary)_0%,var(--fundly-primary-soft)_46%,var(--fundly-deep)_100%)] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--fundly-surface)] transition hover:-translate-y-0.5"
                >
                  Add first bill
                </button>
              ) : null
            }
          />
        ) : null}

        {!isBillsLoading && hasBills ? (
          <AppSurface
            eyebrow="Bills"
            title={`${bills.length} saved`}
            description="Each bill is a reusable payment template. Quick pay opens a confirmation step, then records a real transaction immediately."
          >
            <div className="space-y-3">
              {bills.map((bill) => (
                <BillListItem
                  key={bill.id}
                  bill={bill}
                  onEdit={openEditDialog}
                  onPay={openPayDialog}
                  onViewHistory={(nextBill) => void handleViewHistory(nextBill)}
                  isPaying={isPayDialogOpen && selectedBillId === bill.id}
                  isViewingHistory={isHistoryOpen && historyBillId === bill.id && isHistoryLoading}
                />
              ))}
            </div>
          </AppSurface>
        ) : null}
      </div>

      <BillDialog
        categories={billCategories}
        form={form}
        errors={errors}
        status={dialogStatus}
        mode={editingBillId ? 'edit' : 'create'}
        isOpen={isBillDialogOpen}
        isSubmitting={isSubmittingBill}
        onCancel={closeBillDialog}
        onChange={handleBillChange}
        onSubmit={handleBillSubmit}
      />

      <BillPayDialog
        bill={selectedBill}
        categories={billCategories}
        form={paymentForm}
        errors={paymentErrors}
        status={paymentStatus}
        isOpen={isPayDialogOpen}
        isSubmitting={isProcessingPayment}
        onCancel={closePayDialog}
        onChange={handlePaymentChange}
        onSubmit={handlePaymentSubmit}
      />

      <BillHistoryDialog
        bill={historyBill}
        historyItems={historyItems}
        error={historyError}
        isLoading={isHistoryLoading}
        isOpen={isHistoryOpen}
        onClose={closeHistoryDialog}
      />
    </div>
  );
}
