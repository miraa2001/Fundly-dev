import { Link } from 'react-router-dom';
import fundlyLogo from '../../../fundly-logo.png';

export default function AuthLayout({ eyebrow, title, description, children }) {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#011826] px-4 py-6 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-40 bg-[linear-gradient(180deg,#011826_0%,#0C2A46_52%,#011826_100%)]" />
      <div className="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_18%_18%,rgba(166,122,83,0.18),transparent_20%),radial-gradient(circle_at_82%_20%,rgba(12,42,70,0.22),transparent_18%),radial-gradient(circle_at_52%_58%,rgba(12,42,70,0.3),transparent_26%),radial-gradient(circle_at_74%_78%,rgba(64,31,20,0.12),transparent_16%)]" />
      <div className="absolute left-[-7rem] top-[10%] -z-20 h-72 w-72 rounded-full bg-[#A67A53]/14 blur-[130px]" />
      <div className="absolute right-[-7rem] top-[-2rem] -z-20 h-80 w-80 rounded-full bg-[#0C2A46]/26 blur-[150px]" />
      <div className="absolute bottom-[-8rem] left-[12%] -z-20 h-96 w-96 rounded-full bg-[#0C2A46]/24 blur-[160px]" />
      <div className="absolute bottom-[-8rem] right-[8%] -z-20 h-72 w-72 rounded-full bg-[#401F14]/12 blur-[140px]" />

      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(1,24,38,0.86),rgba(12,42,70,0.74))] shadow-[0_38px_120px_rgba(0,0,0,0.52),0_0_0_1px_rgba(166,122,83,0.08)] backdrop-blur-[24px] ring-1 ring-white/5 lg:min-h-[720px] lg:grid-cols-[1.06fr_0.94fr]">
          <section className="relative hidden overflow-hidden bg-[linear-gradient(160deg,#011826_0%,#0C2A46_54%,#401F14_100%)] px-10 py-10 text-white lg:flex lg:flex-col">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(166,122,83,0.2),transparent_24%),radial-gradient(circle_at_78%_24%,rgba(242,242,242,0.08),transparent_20%),radial-gradient(circle_at_70%_82%,rgba(64,31,20,0.18),transparent_18%)]" />
            <div className="absolute left-[-5rem] top-20 h-48 w-48 rounded-full border border-white/10 bg-white/6 blur-[2px]" />
            <div className="absolute right-[-4rem] top-8 h-52 w-52 rounded-full bg-[#A67A53]/16 blur-[85px]" />
            <div className="absolute bottom-20 right-12 h-56 w-56 rounded-full border border-white/10 bg-[#011826]/24" />
            <div className="absolute bottom-24 left-16 h-24 w-24 rounded-full bg-[radial-gradient(circle_at_30%_30%,#D5B595_0%,#A67A53_68%,#401F14_100%)] shadow-[0_0_0_6px_rgba(0,0,0,0.08),0_18px_30px_rgba(0,0,0,0.2)]" />
            <div className="absolute bottom-10 left-14 h-px w-28 bg-gradient-to-r from-transparent via-white/50 to-transparent" />

            <Link to="/login" className="relative z-10 flex items-center">
              <img
                src={fundlyLogo}
                alt="Fundly"
                className="h-auto w-[10.5rem] drop-shadow-[0_14px_28px_rgba(0,0,0,0.32)]"
              />
            </Link>

            <div className="relative z-10 mt-auto max-w-md">
              <h2 className="mt-7 max-w-lg text-[3.35rem] font-bold leading-[0.92] tracking-[-0.04em] text-white drop-shadow-[0_18px_36px_rgba(0,0,0,0.18)]">
                Track spending. Build budgets. Hit your goals.
              </h2>
              <p className="mt-5 max-w-sm text-[15px] leading-7 text-white/78">
                Fundly gives you a clear view of every shekel without the spreadsheet headache.
              </p>
            </div>

            <div className="relative z-10 mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.7rem] border border-white/14 bg-[linear-gradient(180deg,rgba(4,40,52,0.44),rgba(255,255,255,0.08))] p-5 shadow-[0_18px_50px_rgba(8,22,31,0.22)] backdrop-blur-md">
                <p className="text-sm text-white/66">Budget</p>
                <p className="mt-2 text-2xl font-bold tracking-[-0.03em]">Built to budget</p>
                <p className="mt-3 text-sm leading-6 text-white/74">
                  See where your money goes, set limits per category, and get nudged when you're close to the edge.
                </p>
              </div>
              <div className="rounded-[1.7rem] border border-white/14 bg-[linear-gradient(180deg,rgba(4,40,52,0.44),rgba(255,255,255,0.08))] p-5 shadow-[0_18px_50px_rgba(8,22,31,0.22)] backdrop-blur-md">
                <p className="text-sm text-white/66">Goals</p>
                <p className="mt-2 text-2xl font-bold tracking-[-0.03em]">Goals you'll reach</p>
                <p className="mt-3 text-sm leading-6 text-white/74">
                  Set a savings target, track progress visually, and celebrate every milestone along the way.
                </p>
              </div>
            </div>
          </section>

          <section className="relative flex flex-col justify-center bg-[linear-gradient(180deg,rgba(242,242,242,0.97),rgba(242,242,242,0.9))] px-6 py-8 sm:px-8 lg:px-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(12,42,70,0.12),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(166,122,83,0.12),transparent_18%)]" />
            <div className="absolute right-0 top-0 h-48 w-48 translate-x-10 -translate-y-10 rounded-full bg-[#0C2A46]/14 blur-[95px]" />
            <div className="absolute bottom-8 left-0 h-44 w-44 -translate-x-12 rounded-full bg-[#A67A53]/14 blur-[95px]" />
            <div className="absolute right-12 top-14 h-10 w-10 rounded-full bg-[radial-gradient(circle_at_30%_30%,#D9C0A7_0%,#A67A53_62%,#401F14_100%)] shadow-[0_10px_22px_rgba(64,31,20,0.2)]" />
            <Link to="/login" className="relative z-10 flex items-center lg:hidden">
              <img
                src={fundlyLogo}
                alt="Fundly"
                className="h-auto w-[8.5rem] drop-shadow-[0_12px_22px_rgba(0,0,0,0.16)]"
              />
            </Link>

            <div className="relative z-10 mt-10 lg:mt-0">
              <p className="inline-flex rounded-full border border-[#A67A53]/35 bg-[#A67A53]/12 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.28em] text-[#A67A53] shadow-[inset_0_1px_0_rgba(242,242,242,0.5)]">
                {eyebrow}
              </p>
              <h1 className="mt-5 max-w-md text-[2.9rem] font-bold leading-[0.93] tracking-[-0.04em] text-[#0C2A46] sm:text-[3.35rem]">
                {title}
              </h1>
              <p className="mt-5 max-w-md text-[15px] leading-7 text-[rgba(12,42,70,0.72)] sm:text-base">
                {description}
              </p>
            </div>

            <div className="relative z-10 mt-8 w-full max-w-md rounded-[2.2rem] border border-[#0C2A46]/12 bg-[linear-gradient(180deg,rgba(242,242,242,0.97),rgba(242,242,242,0.92))] p-5 shadow-[0_30px_80px_rgba(1,24,38,0.18),0_12px_36px_rgba(166,122,83,0.12)] backdrop-blur-2xl ring-1 ring-[#A67A53]/14 md:p-6">
              <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
              <div className="absolute right-6 top-5 h-3 w-3 rounded-full bg-[#A67A53] shadow-[0_0_0_4px_rgba(166,122,83,0.18)]" />
              {children}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
