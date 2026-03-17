export const primaryButtonClassName =
  'inline-flex w-full items-center justify-center gap-2 rounded-[1.2rem] bg-[linear-gradient(135deg,#4c8a91_0%,#759971_100%)] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_18px_34px_rgba(76,138,145,0.28)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_40px_rgba(76,138,145,0.3)] focus:outline-none focus-visible:ring-4 focus-visible:ring-teal/20 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 disabled:shadow-none';

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

