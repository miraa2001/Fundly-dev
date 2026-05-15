export function toDateInputValue(date = new Date()) {
  const localDate = new Date(date);
  localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
  return localDate.toISOString().slice(0, 10);
}

export function formatCurrency(amount, currency = 'NIS') {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(Number(amount ?? 0));
  } catch {
    return `${currency} ${Number(amount ?? 0).toFixed(2)}`;
  }
}

export function formatDisplayDate(dateValue) {
  const date = new Date(`${dateValue}T12:00:00`);
  const sameYear = date.getFullYear() === new Date().getFullYear();

  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  }).format(date);
}

export function groupExpensesByDate(expenses) {
  const grouped = expenses.reduce((collection, expense) => {
    const key = expense.expense_date;
    const currentGroup = collection.get(key) ?? {
      date: key,
      total: 0,
      items: [],
    };

    currentGroup.total += Number(expense.amount ?? 0);
    currentGroup.items.push(expense);
    collection.set(key, currentGroup);
    return collection;
  }, new Map());

  return [...grouped.values()];
}
