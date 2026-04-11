import { NavLink } from 'react-router-dom';
import { BillsIcon, CategoriesIcon, HomeIcon, IncomeIcon, SettingsIcon, TransactionsIcon } from './app-icons';

const navItems = [
  { label: 'Home', to: '/app', Icon: HomeIcon, end: true },
  { label: 'Income', to: '/app/income', Icon: IncomeIcon },
  { label: 'Bills', to: '/app/bills', Icon: BillsIcon },
  { label: 'Transactions', to: '/app/transactions', Icon: TransactionsIcon },
  { label: 'Categories', to: '/app/categories', Icon: CategoriesIcon },
  { label: 'Settings', to: '/app/settings', Icon: SettingsIcon },
];

export default function AppNavigation({ variant = 'mobile' }) {
  if (variant === 'desktop') {
    return (
      <nav className="space-y-2">
        {navItems.map(({ label, to, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 rounded-[1.2rem] border px-4 py-3 text-sm font-medium transition',
                isActive
                  ? 'border-[rgba(var(--fundly-primary-rgb),0.08)] bg-[var(--fundly-canvas)] text-[var(--fundly-deep)]'
                  : 'border-transparent bg-transparent text-[rgba(var(--fundly-primary-rgb),0.64)] hover:border-[rgba(var(--fundly-primary-rgb),0.06)] hover:bg-[var(--fundly-canvas)] hover:text-[var(--fundly-primary)]',
              ].join(' ')
            }
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-[0.95rem] bg-[rgba(var(--fundly-primary-rgb),0.05)] text-current">
              <Icon />
            </span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    );
  }

  return (
    <nav className="rounded-[1.6rem] border border-[rgba(var(--fundly-primary-rgb),0.08)] bg-[var(--fundly-surface)] px-2 py-2 shadow-[0_1px_2px_rgba(var(--fundly-deep-rgb),0.08)]">
      <div className="grid grid-cols-6 gap-1">
        {navItems.map(({ label, to, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                'flex min-h-[4.1rem] flex-col items-center justify-center gap-1 rounded-[1rem] px-1 py-2 text-center text-[0.68rem] font-medium transition',
                isActive
                  ? 'bg-[rgba(var(--fundly-primary-rgb),0.08)] text-[var(--fundly-deep)]'
                  : 'text-[rgba(var(--fundly-primary-rgb),0.62)] hover:bg-[rgba(var(--fundly-primary-rgb),0.04)] hover:text-[var(--fundly-primary)]',
              ].join(' ')
            }
          >
            <Icon />
            <span className="leading-tight">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
