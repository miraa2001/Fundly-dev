import { NavLink } from 'react-router-dom';
import { CategoriesIcon, HomeIcon, SettingsIcon, TransactionsIcon } from './app-icons';

const navItems = [
  { label: 'Home', to: '/app', Icon: HomeIcon, end: true },
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
                'flex items-center gap-3 rounded-[1.4rem] border px-4 py-3 text-sm font-bold transition',
                isActive
                  ? 'border-white/18 bg-white/14 text-white'
                  : 'border-transparent bg-white/0 text-white/74 hover:border-white/10 hover:bg-white/10 hover:text-white',
              ].join(' ')
            }
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-[1rem] bg-white/10">
              <Icon />
            </span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    );
  }

  return (
    <nav className="rounded-[1.9rem] border border-[rgba(var(--fundly-primary-rgb),0.12)] bg-[linear-gradient(180deg,rgba(var(--fundly-surface-rgb),0.97),rgba(var(--fundly-surface-rgb),0.92))] px-2 py-2 shadow-[0_20px_40px_rgba(var(--fundly-deep-rgb),0.18)] backdrop-blur-2xl ring-1 ring-[rgba(var(--fundly-accent-rgb),0.12)]">
      <div className="grid grid-cols-4 gap-1">
        {navItems.map(({ label, to, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                'flex min-h-[4.25rem] flex-col items-center justify-center gap-1 rounded-[1.2rem] px-1 py-2 text-center text-[0.68rem] font-bold transition',
                isActive
                  ? 'bg-[linear-gradient(180deg,var(--fundly-primary)_0%,var(--fundly-primary-soft)_46%,var(--fundly-deep)_100%)] text-[var(--fundly-surface)]'
                  : 'text-[rgba(var(--fundly-primary-rgb),0.68)] hover:bg-white/70 hover:text-[var(--fundly-accent)]',
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
