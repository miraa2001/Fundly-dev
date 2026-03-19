export const primaryButtonClassName =
  'inline-flex w-full items-center justify-center gap-2 rounded-[1.45rem] border border-[#073746] bg-[linear-gradient(180deg,#44e8f4_0%,#15aeca_42%,#0a6a83_100%)] px-4 py-3.5 text-sm font-bold tracking-[0.01em] text-white transition duration-300 ease-out hover:-translate-y-1 hover:scale-[1.01] active:translate-y-[2px] active:scale-[0.995] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#35d9ef]/25 disabled:translate-y-0 disabled:scale-100 disabled:cursor-not-allowed disabled:opacity-70';

export default function AuthButton({
  children,
  isLoading = false,
  loadingLabel = 'Please wait...',
  className = '',
  ...buttonProps
}) {
  return (
    <button
      className={[primaryButtonClassName, className].join(' ')}
      disabled={isLoading || buttonProps.disabled}
      aria-busy={isLoading}
      {...buttonProps}
    >
      {isLoading ? (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
          aria-hidden="true"
        />
      ) : null}
      <span>{isLoading ? loadingLabel : children}</span>
    </button>
  );
}
