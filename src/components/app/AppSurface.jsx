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
        'rounded-[1.5rem] border border-[rgba(var(--fundly-primary-rgb),0.08)] bg-[var(--fundly-surface)] p-5 shadow-[0_1px_2px_rgba(var(--fundly-deep-rgb),0.04)] sm:p-6',
        className,
      ].join(' ')}
    >
      {eyebrow || title || description || action ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {eyebrow ? (
              <p className="text-[0.68rem] font-medium uppercase tracking-[0.18em] text-[rgba(var(--fundly-primary-rgb),0.56)]">{eyebrow}</p>
            ) : null}
            {title ? <h2 className="mt-2 text-[1.15rem] font-semibold tracking-[-0.02em] text-[var(--fundly-deep)]">{title}</h2> : null}
            {description ? <p className="mt-2 max-w-xl text-sm leading-6 text-[rgba(var(--fundly-primary-rgb),0.72)]">{description}</p> : null}
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
