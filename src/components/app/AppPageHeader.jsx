export default function AppPageHeader({ eyebrow, title, description, action }) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="max-w-2xl">
        <p className="text-[0.72rem] font-medium uppercase tracking-[0.18em] text-[rgba(var(--fundly-primary-rgb),0.56)]">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-[2rem] font-semibold leading-[1] tracking-[-0.04em] text-[var(--fundly-deep)] sm:text-[2.5rem]">
          {title}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-7 text-[rgba(var(--fundly-primary-rgb),0.72)] sm:text-base">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
