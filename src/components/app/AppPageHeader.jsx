export default function AppPageHeader({ eyebrow, title, description, action }) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="max-w-2xl">
        <p className="inline-flex rounded-full border border-[#A67A53]/35 bg-[#A67A53]/12 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.24em] text-[#A67A53] shadow-[inset_0_1px_0_rgba(242,242,242,0.5)]">
          {eyebrow}
        </p>
        <h1 className="mt-4 text-[2.2rem] font-bold leading-[0.94] tracking-[-0.04em] text-[#0C2A46] sm:text-[2.8rem]">
          {title}
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-[rgba(12,42,70,0.72)] sm:text-base">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
