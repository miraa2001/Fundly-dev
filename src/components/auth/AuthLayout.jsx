import { Link } from 'react-router-dom';
import { BrandMark, SparkIcon } from './icons';

export default function AuthLayout({ eyebrow, title, description, children }) {
  return (
    <main className="relative isolate min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,rgba(215,207,230,0.5),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(147,172,186,0.24),transparent_24%),linear-gradient(160deg,#faf7f5_0%,#f5f7f4_48%,#eef4f5_100%)]" />
      <div className="absolute left-[-6rem] top-[-5rem] -z-10 h-52 w-52 rounded-full bg-lilac/40 blur-3xl" />
      <div className="absolute bottom-[-6rem] right-[-4rem] -z-10 h-64 w-64 rounded-full bg-mist/35 blur-3xl" />

      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-white/60 bg-white/55 shadow-soft backdrop-blur-xl lg:min-h-[720px] lg:grid-cols-[1.05fr_0.95fr]">
          <section className="relative hidden overflow-hidden bg-[linear-gradient(155deg,rgba(116,98,88,0.98)_0%,rgba(76,138,145,0.94)_56%,rgba(117,153,113,0.88)_100%)] px-10 py-12 text-white lg:flex lg:flex-col">
            <div className="absolute -left-16 top-24 h-40 w-40 rounded-full border border-white/15 bg-white/5" />
            <div className="absolute bottom-10 right-8 h-52 w-52 rounded-full border border-white/10 bg-white/5" />

            <Link to="/login" className="relative z-10 flex items-center gap-4">
              <BrandMark inverse />
              <div>
                <p className="text-xs uppercase tracking-[0.42em] text-white/70">Fundly</p>
                <p className="mt-1 text-sm text-white/85">Secure access, softened for a fintech feel.</p>
              </div>
            </Link>

            <div className="relative z-10 mt-auto max-w-md">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/80">
                <SparkIcon />
                Elegant authentication flow
              </div>
              <h2 className="mt-8 font-serif text-5xl leading-[1.02]">
                Premium account access without the clutter.
              </h2>
              <p className="mt-6 max-w-sm text-base leading-7 text-white/80">
                The layout stays calm and focused on the essentials: sign in, request a reset link, and set a new password.
              </p>
            </div>

            <div className="relative z-10 mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.4rem] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-sm text-white/70">Design</p>
                <p className="mt-2 text-2xl font-semibold">Rounded, soft card</p>
                <p className="mt-3 text-sm leading-6 text-white/70">Inspired by your template, rebuilt fully with Tailwind.</p>
              </div>
              <div className="rounded-[1.4rem] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-sm text-white/70">Flow</p>
                <p className="mt-2 text-2xl font-semibold">Supabase auth</p>
                <p className="mt-3 text-sm leading-6 text-white/70">Email/password login and password recovery only.</p>
              </div>
            </div>
          </section>

          <section className="relative flex flex-col justify-center px-6 py-8 sm:px-8 lg:px-10">
            <Link to="/login" className="flex items-center gap-4 lg:hidden">
              <BrandMark />
              <div>
                <p className="text-xs uppercase tracking-[0.42em] text-clay/70">Fundly</p>
                <p className="mt-1 text-sm text-clay/70">Clean access with a premium, calm finish.</p>
              </div>
            </Link>

            <div className="mt-10 lg:mt-0">
              <p className="text-xs font-semibold uppercase tracking-[0.38em] text-teal/70">{eyebrow}</p>
              <h1 className="mt-4 max-w-md font-serif text-4xl leading-tight text-clay sm:text-[2.9rem]">
                {title}
              </h1>
              <p className="mt-4 max-w-md text-sm leading-7 text-slate-600 sm:text-base">
                {description}
              </p>
            </div>

            <div className="mt-8 w-full max-w-md rounded-[1.8rem] border border-white/80 bg-white/82 p-5 shadow-[0_22px_60px_rgba(116,98,88,0.1)] backdrop-blur md:p-6">
              {children}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

