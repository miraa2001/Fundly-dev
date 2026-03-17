export const primaryButtonClassName =
  'inline-flex w-full items-center justify-center gap-2 rounded-[1.45rem] border border-[#073746] bg-[linear-gradient(180deg,#44e8f4_0%,#15aeca_42%,#0a6a83_100%)] px-4 py-3.5 text-sm font-bold tracking-[0.01em] text-white shadow-[0_14px_0_rgba(5,50,64,0.3),0_24px_42px_rgba(5,63,79,0.34),inset_0_1px_0_rgba(255,255,255,0.32)] transition duration-300 ease-out hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_16px_0_rgba(5,50,64,0.24),0_32px_48px_rgba(5,63,79,0.4),0_0_30px_rgba(69,228,243,0.18),inset_0_1px_0_rgba(255,255,255,0.4)] active:translate-y-[2px] active:scale-[0.995] active:shadow-[0_10px_0_rgba(5,50,64,0.28),0_18px_30px_rgba(5,63,79,0.28)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#35d9ef]/25 disabled:translate-y-0 disabled:scale-100 disabled:cursor-not-allowed disabled:opacity-70 disabled:shadow-none';

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
