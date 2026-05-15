import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context.jsx';

const navItems = [
  { to: '/app', label: 'Home', end: true },
  { to: '/app/categories', label: 'Categories' },
  { to: '/app/settings', label: 'Settings' },
];

function appLinkClass({ isActive }) {
  return isActive
    ? 'font-ui text-sm text-ink'
    : 'font-ui text-sm text-ocean/60 transition duration-200 hover:text-ink';
}

function bottomLinkClass({ isActive }) {
  return isActive
    ? 'flex min-h-11 flex-1 items-center justify-center rounded-md bg-paper font-ui text-sm text-ink'
    : 'flex min-h-11 flex-1 items-center justify-center rounded-md font-ui text-sm text-ocean/60 transition duration-200 hover:text-ink';
}

export default function AppShell() {
  const { profile, signOut, user } = useAuth();

  const displayName =
    profile?.display_name?.trim() ||
    user?.email?.split('@')[0] ||
    'there';

  async function handleSignOut() {
    try {
      await signOut();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="min-h-screen bg-paper">
      <div className="journal-wrap">
        <header className="space-y-7 pb-2">
          <div className="flex items-center justify-between gap-4">
            <p className="font-ui text-sm text-ink">Fundly</p>

            <button type="button" className="button-ghost -mr-2" onClick={handleSignOut}>
              Sign out
            </button>
          </div>

          <div>
            <p className="section-kicker">Welcome back</p>
            <h1 className="mt-1.5 text-3xl leading-tight text-ink sm:text-4xl">{displayName}.</h1>
          </div>

          <nav className="hidden gap-x-5 sm:flex">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={appLinkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </header>

        <main className="pt-4">
          <Outlet />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-ink/10 bg-surface/95 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 sm:hidden">
        <div className="mx-auto flex max-w-xl gap-1">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={bottomLinkClass}>
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
