export default function AuthLayout({ eyebrow, title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-paper">
      <div className="page-wrap flex min-h-screen items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <section className="flex flex-col justify-between rounded-[2.5rem] border border-ink/10 bg-surface p-7 shadow-quiet sm:p-10">
            <div>
              <p className="section-kicker">Fundly</p>
              <h1 className="section-title max-w-lg">A softer way to notice spending.</h1>
              <p className="section-copy">
                The app is intentionally small: one place to sign in, note expenses, and keep
                the day feeling steady.
              </p>
            </div>
            <div className="mt-10 space-y-4 text-sm leading-7 text-ocean/70">
              <p>
                No dashboards. No pressure. Just enough structure to help you remember what was
                spent and move on.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="pill">quiet</span>
                <span className="pill">clear</span>
                <span className="pill">lightweight</span>
              </div>
            </div>
          </section>

          <section className="page-panel self-center">
            <p className="section-kicker">{eyebrow}</p>
            <h2 className="mt-3 text-2xl text-ink sm:text-[2rem]">{title}</h2>
            <p className="mt-3 max-w-md text-base leading-7 text-ocean/75">{subtitle}</p>
            <div className="mt-8">{children}</div>
          </section>
        </div>
      </div>
    </div>
  );
}
