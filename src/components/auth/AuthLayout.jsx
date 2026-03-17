import { Link } from 'react-router-dom';
import { BrandMark, SparkIcon } from './icons';

export default function AuthLayout({ eyebrow, title, description, children }) {
  return (
    <main className="relative isolate min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-30 bg-[linear-gradient(160deg,#fdf9f6_0%,#f5f6f2_45%,#eef5f6_100%)]" />
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_12%_18%,rgba(215,207,230,0.6),transparent_30%),radial-gradient(circle_at_88%_20%,rgba(147,172,186,0.3),transparent_24%),radial-gradient(circle_at_74%_78%,rgba(117,153,113,0.22),transparent_20%),radial-gradient(circle_at_26%_82%,rgba(215,207,230,0.26),transparent_22%)]" />
      <div className="absolute left-[-8rem] top-[-6rem] -z-10 h-72 w-72 rounded-full bg-lilac/45 blur-[110px]" />
      <div className="absolute right-[-7rem] top-[18%] -z-10 h-80 w-80 rounded-full bg-mist/30 blur-[120px]" />
      <div className="absolute bottom-[-7rem] left-[12%] -z-10 h-72 w-72 rounded-full bg-moss/20 blur-[130px]" />
      <div className="absolute bottom-[-5rem] right-[-4rem] -z-10 h-64 w-64 rounded-full bg-lilac/30 blur-[120px]" />
      <div className="absolute inset-x-0 top-[8%] -z-10 mx-auto h-px max-w-5xl bg-white/40 blur-sm" />

      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2.5rem] border border-white/55 bg-white/[0.58] shadow-[0_42px_130px_rgba(76,138,145,0.12),0_28px_80px_rgba(116,98,88,0.18)] backdrop-blur-[28px] ring-1 ring-white/25 lg:min-h-[720px] lg:grid-cols-[1.05fr_0.95fr]">
          <section className="relative hidden overflow-hidden bg-[linear-gradient(150deg,rgba(116,98,88,0.98)_0%,rgba(76,138,145,0.96)_46%,rgba(117,153,113,0.9)_100%)] px-10 py-12 text-white lg:flex lg:flex-col">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(255,255,255,0.18),transparent_24%),radial-gradient(circle_at_80%_26%,rgba(215,207,230,0.18),transparent_28%),radial-gradient(circle_at_72%_82%,rgba(255,255,255,0.08),transparent_24%)]" />
            <div className="absolute -left-20 top-16 h-56 w-56 rounded-full border border-white/15 bg-white/8 blur-[2px]" />
            <div className="absolute right-[-3.5rem] top-[-1.5rem] h-56 w-56 rounded-full bg-lilac/18 blur-[70px]" />
            <div className="absolute bottom-14 right-10 h-56 w-56 rounded-full border border-white/10 bg-white/6" />
            <div className="absolute bottom-24 left-14 h-28 w-28 rounded-[2rem] border border-white/12 bg-[linear-gradient(145deg,rgba(255,255,255,0.14),rgba(255,255,255,0.02))] backdrop-blur-sm" />
            <div className="absolute right-20 top-28 h-40 w-px bg-white/20" />
            <div className="absolute right-20 top-36 h-20 w-20 rounded-full border border-white/18 bg-white/8 backdrop-blur-sm" />

            <Link to="/login" className="relative z-10 flex items-center gap-4">
              <BrandMark inverse />
              <div>
                <p className="text-[0.7rem] uppercase tracking-[0.46em] text-white/70">Fundly</p>
                <p className="mt-1 text-sm text-white/82">Secure access, softened for a more sculpted fintech feel.</p>
              </div>
            </Link>

            <div className="relative z-10 mt-auto max-w-md">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/82 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-md">
                <SparkIcon />
                Elegant authentication flow
              </div>
              <h2 className="mt-8 max-w-lg font-serif text-[3.5rem] leading-[0.95] tracking-[-0.03em] text-white drop-shadow-[0_18px_36px_rgba(0,0,0,0.16)]">
                Premium account access without the clutter.
              </h2>
              <p className="mt-6 max-w-sm text-[15px] leading-7 text-white/78">
                The layout stays calm and focused on the essentials: sign in, request a reset link, and set a new password.
              </p>
            </div>

            <div className="relative z-10 mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.7rem] border border-white/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.08))] p-5 shadow-[0_18px_50px_rgba(21,32,44,0.16)] backdrop-blur-md">
                <p className="text-sm text-white/68">Design</p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.02em]">Rounded, sculpted card</p>
                <p className="mt-3 text-sm leading-6 text-white/72">Inspired by your template, then layered with glass, shadow, and atmosphere.</p>
              </div>
              <div className="rounded-[1.7rem] border border-white/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.08))] p-5 shadow-[0_18px_50px_rgba(21,32,44,0.16)] backdrop-blur-md">
                <p className="text-sm text-white/68">Flow</p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.02em]">Supabase auth</p>
                <p className="mt-3 text-sm leading-6 text-white/72">Email/password login and password recovery with the same focused experience.</p>
              </div>
            </div>
          </section>

          <section className="relative flex flex-col justify-center px-6 py-8 sm:px-8 lg:px-10">
            <div className="absolute right-0 top-0 h-44 w-44 translate-x-10 -translate-y-10 rounded-full bg-lilac/30 blur-[85px]" />
            <div className="absolute bottom-12 left-0 h-40 w-40 -translate-x-10 rounded-full bg-mist/18 blur-[90px]" />
            <div className="absolute left-8 top-20 h-px w-24 bg-gradient-to-r from-white/70 to-transparent" />

            <Link to="/login" className="relative z-10 flex items-center gap-4 lg:hidden">
              <BrandMark />
              <div>
                <p className="text-[0.7rem] uppercase tracking-[0.46em] text-clay/68">Fundly</p>
                <p className="mt-1 text-sm text-clay/72">Clean access with a more premium, atmospheric finish.</p>
              </div>
            </Link>

            <div className="relative z-10 mt-10 lg:mt-0">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.42em] text-teal/72">{eyebrow}</p>
              <h1 className="mt-4 max-w-md font-serif text-[2.85rem] leading-[0.94] tracking-[-0.03em] text-clay sm:text-[3.35rem]">
                {title}
              </h1>
              <p className="mt-5 max-w-md text-[15px] leading-7 text-slate-600/95 sm:text-base">
                {description}
              </p>
            </div>

            <div className="relative z-10 mt-8 w-full max-w-md rounded-[2.1rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(255,255,255,0.78))] p-5 shadow-[0_30px_90px_rgba(116,98,88,0.18),0_14px_36px_rgba(76,138,145,0.08)] backdrop-blur-2xl ring-1 ring-white/45 md:p-6">
              <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent" />
              {children}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
