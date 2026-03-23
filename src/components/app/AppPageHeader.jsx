export default function AppPageHeader({ eyebrow, title, description, action }) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="max-w-2xl">
        <p className="inline-flex rounded-full border border-[rgba(var(--fundly-accent-rgb),0.35)] bg-[rgba(var(--fundly-accent-rgb),0.12)] px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[var(--fundly-accent)] shadow-[inset_0_1px_0_rgba(var(--fundly-surface-rgb),0.5)]">
          {eyebrow}
        </p>
        <h1 className="mt-4 text-[2.2rem] font-bold leading-[0.94] tracking-[-0.04em] text-[var(--fundly-primary)] sm:text-[2.8rem]">
          {title}
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-[rgba(var(--fundly-primary-rgb),0.72)] sm:text-base">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
