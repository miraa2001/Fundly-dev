export default function AppSurface({ eyebrow, title, description, action, className = '', children }) {
  return (
    <section
      className={[
        'rounded-[1.75rem] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(239,251,248,0.9))] p-4 shadow-[0_18px_40px_rgba(4,27,34,0.08)] ring-1 ring-[#7cefe3]/16 sm:p-5',
        className,
      ].join(' ')}
    >
      {eyebrow || title || description || action ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {eyebrow ? (
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-[#087f98]">{eyebrow}</p>
            ) : null}
            {title ? <h2 className="mt-2 text-xl font-bold tracking-[-0.02em] text-[#16323b]">{title}</h2> : null}
            {description ? <p className="mt-2 max-w-xl text-sm leading-6 text-[#5a727b]">{description}</p> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
      <div className={eyebrow || title || description || action ? 'mt-4' : ''}>{children}</div>
    </section>
  );
}
