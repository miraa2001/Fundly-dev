import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context.jsx';

function appLinkClass({ isActive }) {
  return isActive
    ? 'border-b border-clay pb-1 font-ui text-sm text-ink'
    : 'border-b border-transparent pb-1 font-ui text-sm text-ocean/60 transition duration-200 hover:text-ink';
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
        <header className="space-y-12 pb-4">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-ui text-sm text-ink">Fundly</p>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              <nav className="flex flex-wrap gap-x-5 gap-y-2">
                <NavLink to="/app" end className={appLinkClass}>
                  Home
                </NavLink>
                <NavLink to="/app/categories" className={appLinkClass}>
                  Categories
                </NavLink>
                <NavLink to="/app/settings" className={appLinkClass}>
                  Settings
                </NavLink>
              </nav>
              <button type="button" className="button-ghost -mr-2" onClick={handleSignOut}>
                Sign out
              </button>
            </div>
          </div>

          <div>
            <p className="section-kicker">Welcome back</p>
            <h1 className="mt-2 text-4xl leading-tight text-ink sm:text-5xl">{displayName}.</h1>
          </div>
        </header>

        <main className="pt-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
