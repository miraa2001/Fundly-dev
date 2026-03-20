export const homeStats = [
  { label: 'Spent this week', value: 'ILS 1,240', detail: '12% lower than last week' },
  { label: 'Left to budget', value: 'ILS 860', detail: 'Across your active categories' },
  { label: 'Planned this month', value: '4 items', detail: 'Bills and goals in motion' },
  { label: 'Saved so far', value: 'ILS 3,420', detail: 'Across your current goals' },
];

export const homeHighlights = [
  { title: 'Groceries are on track', detail: 'You still have ILS 190 left in your groceries limit this week.' },
  { title: 'Next planned payment', detail: 'Internet renewal is coming up on March 22.' },
  { title: 'Savings goal progress', detail: 'Your laptop fund is already 64% complete.' },
];

export const recentTransactions = [
  { name: 'Fresh Market', category: 'Groceries', amount: '-ILS 128', date: 'Today, 14:20' },
  { name: 'Salary Transfer', category: 'Income', amount: '+ILS 7,800', date: 'Yesterday, 09:15' },
  { name: 'City Ride', category: 'Transport', amount: '-ILS 24', date: 'Yesterday, 07:48' },
];

export const transactionGroups = [
  {
    label: 'Today',
    items: [
      { name: 'Fresh Market', category: 'Groceries', amount: '-ILS 128', tone: 'expense' },
      { name: 'Bean House', category: 'Dining', amount: '-ILS 34', tone: 'expense' },
    ],
  },
  {
    label: 'This week',
    items: [
      { name: 'Salary Transfer', category: 'Income', amount: '+ILS 7,800', tone: 'income' },
      { name: 'City Ride', category: 'Transport', amount: '-ILS 24', tone: 'expense' },
      { name: 'Cloud Storage', category: 'Subscriptions', amount: '-ILS 19', tone: 'expense' },
    ],
  },
];

export const transactionSummary = [
  { label: 'Income', value: 'ILS 7,800' },
  { label: 'Spent', value: 'ILS 1,024' },
  { label: 'Transfers', value: '2 pending' },
];

export const categorySnapshots = [
  { name: 'Groceries', spent: 'ILS 610', limit: 'ILS 800', progress: 76 },
  { name: 'Transport', spent: 'ILS 165', limit: 'ILS 250', progress: 66 },
  { name: 'Dining', spent: 'ILS 280', limit: 'ILS 320', progress: 88 },
  { name: 'Subscriptions', spent: 'ILS 92', limit: 'ILS 140', progress: 65 },
  { name: 'Shopping', spent: 'ILS 340', limit: 'ILS 500', progress: 68 },
  { name: 'Health', spent: 'ILS 115', limit: 'ILS 220', progress: 52 },
];

export const plannedItems = [
  { title: 'Internet renewal', amount: 'ILS 89', due: 'Due Mar 22', status: 'Upcoming' },
  { title: 'Gym membership', amount: 'ILS 210', due: 'Due Mar 26', status: 'Scheduled' },
  { title: 'Quarterly insurance', amount: 'ILS 460', due: 'Due Apr 03', status: 'Drafted' },
];

export const savingsGoals = [
  { title: 'Laptop fund', saved: 'ILS 3,200', target: 'ILS 5,000', progress: 64 },
  { title: 'Travel weekend', saved: 'ILS 1,120', target: 'ILS 2,000', progress: 56 },
];

export const settingsPreferences = [
  { label: 'Weekly summary', value: 'Every Monday morning' },
  { label: 'Budget alerts', value: 'Warn when a category reaches 80%' },
  { label: 'Planned payment reminders', value: '24 hours before each due date' },
];
