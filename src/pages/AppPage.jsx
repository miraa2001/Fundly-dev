import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import fundlyLogo from '../../fundly-logo.png';
import AuthButton from '../components/auth/AuthButton';
import StatusMessage from '../components/auth/StatusMessage';
import { useAuthSession } from '../lib/auth-context';
import { ensureSupabase } from '../lib/supabase';

function getSignOutErrorMessage(error) {
  return error?.message || 'We could not sign you out right now. Please try again.';
}

export default function AppPage() {
  const navigate = useNavigate();
  const { user } = useAuthSession();
  const [status, setStatus] = useState(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);
    setStatus(null);

    try {
      const client = ensureSupabase();
      const { error } = await client.auth.signOut();

      if (error) {
        throw error;
      }

      navigate('/login', { replace: true });
    } catch (error) {
      setStatus({
        tone: 'error',
        message: getSignOutErrorMessage(error),
      });
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#121618] px-4 py-6 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-30 bg-[linear-gradient(180deg,#141819_0%,#072a33_48%,#121718_100%)]" />
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_18%_18%,rgba(91,241,219,0.2),transparent_22%),radial-gradient(circle_at_82%_20%,rgba(53,217,239,0.14),transparent_18%),radial-gradient(circle_at_74%_78%,rgba(255,212,90,0.08),transparent_16%)]" />
      <div className="absolute left-[-7rem] top-[10%] -z-10 h-72 w-72 rounded-full bg-[#4df0da]/16 blur-[130px]" />
      <div className="absolute bottom-[-8rem] right-[8%] -z-10 h-72 w-72 rounded-full bg-[#ffd45a]/8 blur-[140px]" />

      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(7,21,27,0.82),rgba(8,24,31,0.7))] shadow-[0_38px_120px_rgba(0,0,0,0.52)] backdrop-blur-[24px] lg:grid-cols-[0.92fr_1.08fr]">
          <section className="relative hidden overflow-hidden bg-[linear-gradient(160deg,#083747_0%,#0a6177_45%,#0e728d_100%)] px-10 py-10 text-white lg:flex lg:flex-col">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(93,242,220,0.22),transparent_24%),radial-gradient(circle_at_70%_82%,rgba(255,210,88,0.12),transparent_18%)]" />
            <div className="absolute left-[-5rem] top-20 h-48 w-48 rounded-full border border-white/10 bg-white/6 blur-[2px]" />
            <div className="absolute bottom-20 right-12 h-56 w-56 rounded-full border border-white/10 bg-[#032633]/26" />

            <div className="relative z-10">
              <img
                src={fundlyLogo}
                alt="Fundly"
                className="h-auto w-[10.5rem] drop-shadow-[0_14px_28px_rgba(0,0,0,0.32)]"
              />
            </div>

            <div className="relative z-10 mt-auto max-w-md">
              <p className="inline-flex rounded-full border border-white/12 bg-white/10 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.28em] text-white/88">
                Authenticated Session
              </p>
              <h1 className="mt-6 max-w-lg text-[3.2rem] font-bold leading-[0.92] tracking-[-0.04em] text-white">
                You are signed in to Fundly.
              </h1>
              <p className="mt-5 max-w-sm text-[15px] leading-7 text-white/78">
                This is a temporary landing page while the full dashboard is still being built.
              </p>
            </div>
          </section>

          <section className="relative flex flex-col justify-center bg-[linear-gradient(180deg,rgba(246,253,251,0.96),rgba(227,245,241,0.9))] px-6 py-8 sm:px-8 lg:px-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(53,217,239,0.12),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(255,212,90,0.09),transparent_18%)]" />
            <div className="absolute right-0 top-0 h-48 w-48 translate-x-10 -translate-y-10 rounded-full bg-[#4cefd9]/18 blur-[95px]" />
            <div className="absolute bottom-8 left-0 h-44 w-44 -translate-x-12 rounded-full bg-[#35d9ef]/12 blur-[95px]" />

            <div className="relative z-10 lg:hidden">
              <img
                src={fundlyLogo}
                alt="Fundly"
                className="h-auto w-[8.5rem] drop-shadow-[0_12px_22px_rgba(0,0,0,0.16)]"
              />
            </div>

            <div className="relative z-10 mt-10 lg:mt-0">
              <p className="inline-flex rounded-full border border-[#ffd45a]/45 bg-[#fff2c8] px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.28em] text-[#8b5202] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
                Temporary App Page
              </p>
              <h2 className="mt-5 max-w-md text-[2.9rem] font-bold leading-[0.93] tracking-[-0.04em] text-[#0e2f39] sm:text-[3.35rem]">
                Signed in and ready.
              </h2>
              <p className="mt-5 max-w-md text-[15px] leading-7 text-[#39545d] sm:text-base">
                Your session is active. Use this placeholder screen until the full dashboard experience is ready.
              </p>
            </div>

            <div className="relative z-10 mt-8 w-full max-w-md rounded-[2.2rem] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(239,251,248,0.9))] p-5 shadow-[0_30px_80px_rgba(4,27,34,0.2),0_12px_36px_rgba(53,217,239,0.16)] backdrop-blur-2xl ring-1 ring-[#7cefe3]/20 md:p-6">
              <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
              <div className="absolute right-6 top-5 h-3 w-3 rounded-full bg-[#ffd45a] shadow-[0_0_0_4px_rgba(255,212,90,0.2)]" />

              <div className="space-y-5">
                <StatusMessage tone={status?.tone} message={status?.message} />

                <div className="rounded-[1.6rem] border border-[#d3efed] bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(233,249,246,0.92))] p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#087f98]">Session</p>
                  <h3 className="mt-3 text-2xl font-bold text-[#16323b]">You are logged in.</h3>
                  <p className="mt-3 text-sm leading-6 text-[#39545d]">
                    Signed in as <span className="font-bold text-[#0e2f39]">{user?.email ?? 'Unknown email'}</span>
                  </p>
                </div>

                <AuthButton
                  type="button"
                  onClick={handleSignOut}
                  isLoading={isSigningOut}
                  loadingLabel="Signing you out..."
                >
                  Sign out
                </AuthButton>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
