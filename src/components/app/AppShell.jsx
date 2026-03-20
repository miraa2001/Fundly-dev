import { Outlet } from 'react-router-dom';
import fundlyLogo from '../../../fundly-logo.png';
import { useAuthSession } from '../../lib/auth-context';
import AppNavigation from './AppNavigation';

export default function AppShell() {
  const { user } = useAuthSession();

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#121618]">
      <div className="absolute inset-0 -z-40 bg-[linear-gradient(180deg,#141819_0%,#072a33_48%,#121718_100%)]" />
      <div className="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_18%_18%,rgba(91,241,219,0.2),transparent_22%),radial-gradient(circle_at_82%_20%,rgba(53,217,239,0.14),transparent_18%),radial-gradient(circle_at_74%_78%,rgba(255,212,90,0.08),transparent_16%)]" />
      <div className="absolute left-[-7rem] top-[10%] -z-20 h-72 w-72 rounded-full bg-[#4df0da]/16 blur-[130px]" />
      <div className="absolute bottom-[-8rem] right-[8%] -z-20 h-72 w-72 rounded-full bg-[#ffd45a]/8 blur-[140px]" />

      <div className="mx-auto max-w-7xl lg:px-6 lg:py-6">
        <div className="lg:grid lg:min-h-[calc(100vh-3rem)] lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-6">
          <aside className="relative hidden overflow-hidden rounded-[2.4rem] border border-white/10 bg-[linear-gradient(160deg,#083747_0%,#0a6177_45%,#0e728d_100%)] p-6 text-white shadow-[0_28px_80px_rgba(0,0,0,0.34)] lg:flex lg:flex-col">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(93,242,220,0.22),transparent_24%),radial-gradient(circle_at_70%_82%,rgba(255,210,88,0.12),transparent_18%)]" />
            <div className="absolute left-[-5rem] top-20 h-48 w-48 rounded-full border border-white/10 bg-white/6 blur-[2px]" />
            <div className="absolute bottom-20 right-10 h-56 w-56 rounded-full border border-white/10 bg-[#032633]/26" />

            <div className="relative z-10">
              <img
                src={fundlyLogo}
                alt="Fundly"
                className="h-auto w-[9.5rem] drop-shadow-[0_14px_28px_rgba(0,0,0,0.32)]"
              />
            </div>

            <div className="relative z-10 mt-8 rounded-[1.8rem] border border-white/12 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/70">Signed In</p>
              <p className="mt-3 text-sm leading-6 text-white/90">{user?.email ?? 'Unknown email'}</p>
            </div>

            <div className="relative z-10 mt-6">
              <AppNavigation variant="desktop" />
            </div>

            <div className="relative z-10 mt-auto rounded-[1.8rem] border border-white/12 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/70">Fundly App Shell</p>
              <p className="mt-3 text-sm leading-6 text-white/82">
                Mobile-first structure for the real app, with navigation and placeholder sections ready for future data work.
              </p>
            </div>
          </aside>

          <section className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,rgba(246,253,251,0.96),rgba(227,245,241,0.9))] lg:min-h-[calc(100vh-3rem)] lg:rounded-[2.4rem] lg:border lg:border-white/10 lg:shadow-[0_30px_90px_rgba(4,27,34,0.24)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(53,217,239,0.12),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(255,212,90,0.09),transparent_18%)]" />
            <div className="absolute right-0 top-0 h-48 w-48 translate-x-10 -translate-y-10 rounded-full bg-[#4cefd9]/18 blur-[95px]" />
            <div className="absolute bottom-8 left-0 h-44 w-44 -translate-x-12 rounded-full bg-[#35d9ef]/12 blur-[95px]" />

            <div className="relative z-10 flex min-h-screen flex-col pb-28 lg:min-h-[calc(100vh-3rem)] lg:pb-0">
              <header className="px-4 pb-3 pt-4 sm:px-6 sm:pt-6 lg:hidden">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <img
                      src={fundlyLogo}
                      alt="Fundly"
                      className="h-auto w-[8rem] drop-shadow-[0_12px_22px_rgba(0,0,0,0.16)]"
                    />
                    <p className="mt-3 text-xs font-bold uppercase tracking-[0.24em] text-[#087f98]">
                      Authenticated Area
                    </p>
                  </div>
                  <div className="max-w-[11rem] rounded-[1.4rem] border border-white/70 bg-white/70 px-3 py-2 text-right shadow-[0_12px_26px_rgba(4,27,34,0.08)] backdrop-blur-sm">
                    <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#8b5202]">Signed In</p>
                    <p className="mt-1 truncate text-sm font-bold text-[#16323b]">{user?.email ?? 'Unknown email'}</p>
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
    </main>
  );
}
