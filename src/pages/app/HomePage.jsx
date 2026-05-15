import { useEffect, useState } from 'react';
import StatusMessage from '../../components/auth/StatusMessage.jsx';
import { useAuth } from '../../lib/auth-context.jsx';
import { fetchCategories } from '../../lib/categories.js';
import {
  createExpense,
  deleteExpense,
  fetchDailyTotal,
  fetchRecentExpenses,
  updateExpense,
} from '../../lib/expenses.js';
import {
  formatCurrency,
  formatDisplayDate,
  groupExpensesByDate,
  toDateInputValue,
} from '../../lib/format.js';

const emptyExpenseForm = {
  amount: '',
  categoryId: '',
  note: '',
  expenseDate: toDateInputValue(),
};

function sortExpenses(expenses) {
  return [...expenses].sort((left, right) => {
    const dateCompare = right.expense_date.localeCompare(left.expense_date);

    if (dateCompare !== 0) {
      return dateCompare;
    }

    return new Date(right.created_at) - new Date(left.created_at);
  });
}

function ExpenseForm({
  categories,
  currency,
  form,
  onChange,
  onSubmit,
  submitting,
  submitLabel,
}) {
  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <label className="field-stack">
        <span className="field-label">Amount</span>
        <input
          required
          min="0"
          step="0.01"
          type="number"
          name="amount"
          value={form.amount}
          onChange={onChange}
          className="field-input"
          placeholder={`0.00 ${currency}`}
        />
      </label>

      <label className="field-stack">
        <span className="field-label">Date</span>
        <input
          required
          type="date"
          name="expenseDate"
          value={form.expenseDate}
          onChange={onChange}
          className="field-input"
        />
      </label>

      <label className="field-stack">
        <span className="field-label">Category</span>
        <select
          name="categoryId"
          value={form.categoryId}
          onChange={onChange}
          className="field-input"
        >
          <option value="">Uncategorized</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <label className="field-stack">
        <span className="field-label">Note</span>
        <textarea
          name="note"
          value={form.note}
          onChange={onChange}
          className="field-textarea"
          placeholder="Optional note"
        />
      </label>

      <button type="submit" className="button-primary min-h-11 w-full" disabled={submitting}>
        {submitting ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}

export default function HomePage() {
  const { profile, user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [dailyTotal, setDailyTotal] = useState(0);
  const [form, setForm] = useState(emptyExpenseForm);
  const [editingExpense, setEditingExpense] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currency = profile?.base_currency || 'NIS';
  const groupedExpenses = groupExpensesByDate(expenses);

  useEffect(() => {
    if (!user) {
      return;
    }

    async function loadPage() {
      setLoading(true);
      setError('');

      try {
        const today = toDateInputValue();
        const [visibleCategories, recentExpenses, todayTotal] = await Promise.all([
          fetchCategories(user.id, false),
          fetchRecentExpenses(user.id),
          fetchDailyTotal(user.id, today),
        ]);

        setCategories(visibleCategories);
        setExpenses(sortExpenses(recentExpenses));
        setDailyTotal(todayTotal);
      } catch (nextError) {
        setError(nextError.message);
      } finally {
        setLoading(false);
      }
    }

    void loadPage();
  }, [user]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function startEdit(expense) {
    setEditingExpense(expense);
    setForm({
      amount: String(expense.amount ?? ''),
      categoryId: expense.category_id ?? '',
      note: expense.note ?? '',
      expenseDate: expense.expense_date,
    });
  }

  function resetForm() {
    setEditingExpense(null);
    setForm({
      ...emptyExpenseForm,
      expenseDate: toDateInputValue(),
    });
  }

  async function refreshDailyTotal(nextDate = toDateInputValue()) {
    if (!user) {
      return;
    }

    const nextTotal = await fetchDailyTotal(user.id, nextDate);
    setDailyTotal(nextTotal);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!user) {
      return;
    }

    setSaving(true);
    setError('');

    const payload = {
      user_id: user.id,
      amount: Number(form.amount),
      note: form.note.trim() || null,
      expense_date: form.expenseDate,
      category_id: form.categoryId || null,
    };

    try {
      if (editingExpense) {
        const updatedExpense = await updateExpense(editingExpense.id, payload);
        setExpenses((current) =>
          sortExpenses(
            current.map((expense) => (expense.id === editingExpense.id ? updatedExpense : expense)),
          ),
        );
      } else {
        const createdExpense = await createExpense(payload);
        setExpenses((current) => sortExpenses([createdExpense, ...current]));
      }

      await refreshDailyTotal();
      resetForm();
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(expenseId) {
    if (!window.confirm('Delete this expense entry?')) {
      return;
    }

    setError('');

    try {
      await deleteExpense(expenseId);
      setExpenses((current) => current.filter((expense) => expense.id !== expenseId));
      await refreshDailyTotal();

      if (editingExpense?.id === expenseId) {
        resetForm();
      }
    } catch (nextError) {
      setError(nextError.message);
    }
  }

  return (
    <div>
      <section className="journal-section">
        <div className="space-y-4">
          <div>
            <p className="section-kicker">{editingExpense ? 'Editing' : 'Today'}</p>
            <h2 className="mt-1.5 text-2xl leading-tight text-ink sm:text-3xl">
              {editingExpense ? 'Edit expense' : 'Write an expense'}
            </h2>
          </div>

          <div>
            <p className="section-kicker">Spent today</p>
            <p className="mt-1 text-xl leading-tight text-ink">
              {formatCurrency(dailyTotal, currency)}
            </p>
          </div>
        </div>

        <div className="mt-7 space-y-5">
          <StatusMessage>{error}</StatusMessage>
          <ExpenseForm
            categories={categories}
            currency={currency}
            form={form}
            onChange={updateField}
            onSubmit={handleSubmit}
            submitting={saving}
            submitLabel={editingExpense ? 'Save changes' : 'Save expense'}
          />
          {editingExpense ? (
            <button type="button" className="button-secondary" onClick={resetForm}>
              Cancel editing
            </button>
          ) : null}
        </div>
      </section>

      <section className="journal-section">
        <div>
          <p className="section-kicker">Recent</p>
          <h2 className="mt-1.5 text-2xl leading-tight text-ink sm:text-3xl">Expenses</h2>
          {loading ? <p className="font-ui text-sm text-ocean/60">Loading entries...</p> : null}
        </div>

        {groupedExpenses.length === 0 && !loading ? (
          <p className="mt-8 text-base leading-7 text-ocean/70">No expenses yet.</p>
        ) : null}

        <div className="mt-7 space-y-9">
          {groupedExpenses.map((group) => (
            <section key={group.date} className="space-y-3">
              <div className="space-y-1">
                <h3 className="text-xl leading-tight text-ink">{formatDisplayDate(group.date)}</h3>
                <p className="font-ui text-sm text-ocean/60">
                  {formatCurrency(group.total, currency)}
                </p>
              </div>

              <div className="border-t border-ink/10">
                {group.items.map((expense) => (
                  <article
                    key={expense.id}
                    className="list-divider py-4"
                  >
                    <div className="space-y-1">
                      <p className="text-lg leading-tight text-ink">
                        {formatCurrency(expense.amount, currency)}
                      </p>
                      <span className="pill">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: expense.category?.color || '#A67a53' }}
                        />
                        {expense.category?.name || 'Uncategorized'}
                      </span>
                    </div>

                    {expense.note ? (
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-ocean/70">{expense.note}</p>
                    ) : null}

                    <div className="mt-3 flex gap-2">
                      <button type="button" className="button-ghost" onClick={() => startEdit(expense)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="button-ghost text-cedar hover:bg-cedar/5 hover:text-cedar"
                        onClick={() => handleDelete(expense.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </div>
  );
}
