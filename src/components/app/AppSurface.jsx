export default function AppSurface({
  eyebrow,
  title,
  description,
  action,
  className = '',
  contentClassName = '',
  children,
}) {
  return (
    <section
      className={[
        'rounded-[1.75rem] border border-[rgba(var(--fundly-primary-rgb),0.12)] bg-[linear-gradient(180deg,rgba(var(--fundly-surface-rgb),0.97),rgba(var(--fundly-surface-rgb),0.91))] p-4 shadow-[0_18px_40px_rgba(var(--fundly-deep-rgb),0.08)] ring-1 ring-[rgba(var(--fundly-accent-rgb),0.12)] sm:p-5',
        className,
      ].join(' ')}
    >
      {eyebrow || title || description || action ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {eyebrow ? (
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-[var(--fundly-accent)]">{eyebrow}</p>
            ) : null}
            {title ? <h2 className="mt-2 text-xl font-bold tracking-[-0.02em] text-[var(--fundly-primary)]">{title}</h2> : null}
            {description ? <p className="mt-2 max-w-xl text-sm leading-6 text-[rgba(var(--fundly-primary-rgb),0.7)]">{description}</p> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
      <div className={[eyebrow || title || description || action ? 'mt-4' : '', contentClassName].join(' ').trim()}>
        {children}
      </div>
    </section>
  );
}
