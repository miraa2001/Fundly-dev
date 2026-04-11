import { Suspense, lazy } from 'react';
import { Outlet } from 'react-router-dom';
import fundlyLogo from '../../../fundly-logo.png';
import { useAuthSession } from '../../lib/auth-context';
import AppNavigation from './AppNavigation';

const AppFloatingMoneyActions = lazy(() => import('./fab/AppFloatingMoneyActions'));

export default function AppShell() {
  const { user } = useAuthSession();

  return (
    <main className="min-h-screen bg-[var(--fundly-canvas)]">
      <div className="mx-auto max-w-7xl lg:px-6 lg:py-6">
        <div className="lg:grid lg:min-h-[calc(100vh-3rem)] lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-6">
          <aside className="hidden rounded-[2rem] border border-[rgba(var(--fundly-primary-rgb),0.08)] bg-[var(--fundly-surface)] p-6 shadow-[0_1px_2px_rgba(var(--fundly-deep-rgb),0.04)] lg:flex lg:flex-col">
            <div>
              <img
                src={fundlyLogo}
                alt="Fundly"
                className="h-auto w-[8.75rem]"
              />
            </div>

            <div className="mt-8 rounded-[1.35rem] border border-[rgba(var(--fundly-primary-rgb),0.08)] bg-[var(--fundly-canvas)] p-4">
              <p className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-[rgba(var(--fundly-primary-rgb),0.56)]">Signed in</p>
              <p className="mt-2 text-sm leading-6 text-[var(--fundly-deep)]">{user?.email ?? 'Unknown email'}</p>
            </div>

            <div className="mt-6">
              <AppNavigation variant="desktop" />
            </div>
          </aside>

          <section className="min-h-screen bg-[var(--fundly-canvas)] lg:min-h-[calc(100vh-3rem)] lg:rounded-[2rem] lg:border lg:border-[rgba(var(--fundly-primary-rgb),0.08)] lg:bg-[var(--fundly-surface)] lg:shadow-[0_1px_2px_rgba(var(--fundly-deep-rgb),0.04)]">
            <div className="flex min-h-screen flex-col pb-28 lg:min-h-[calc(100vh-3rem)] lg:pb-0">
              <header className="px-4 pb-3 pt-4 sm:px-6 sm:pt-6 lg:hidden">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <img
                      src={fundlyLogo}
                      alt="Fundly"
                      className="h-auto w-[7.5rem]"
                    />
                  </div>
                  <div className="max-w-[11rem] rounded-[1.2rem] border border-[rgba(var(--fundly-primary-rgb),0.08)] bg-[var(--fundly-surface)] px-3 py-2 text-right">
                    <p className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-[rgba(var(--fundly-primary-rgb),0.56)]">Signed in</p>
                    <p className="mt-1 truncate text-sm font-medium text-[var(--fundly-deep)]">{user?.email ?? 'Unknown email'}</p>
                  </div>
                </div>
              </header>

              <div className="flex-1 px-4 pb-6 pt-2 sm:px-6 lg:px-8 lg:pb-8 lg:pt-8">
                <Outlet />
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 px-4 pb-4 lg:hidden">
        <div className="pointer-events-auto mx-auto max-w-md">
          <AppNavigation variant="mobile" />
        </div>
      </div>

      <Suspense fallback={null}>
        <AppFloatingMoneyActions />
      </Suspense>
    </main>
  );
}
