export const primaryButtonClassName =
  'inline-flex w-full items-center justify-center gap-2 rounded-[1.35rem] border border-white/15 bg-[linear-gradient(135deg,#4c8a91_0%,#759971_52%,#746258_100%)] px-4 py-3.5 text-sm font-semibold tracking-[0.01em] text-white shadow-[0_18px_36px_rgba(76,138,145,0.24),0_10px_24px_rgba(116,98,88,0.22),inset_0_1px_0_rgba(255,255,255,0.16)] transition duration-300 ease-out hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-[0_26px_48px_rgba(76,138,145,0.26),0_14px_34px_rgba(116,98,88,0.26),inset_0_1px_0_rgba(255,255,255,0.18)] active:scale-[0.99] focus:outline-none focus-visible:ring-4 focus-visible:ring-teal/20 disabled:translate-y-0 disabled:scale-100 disabled:cursor-not-allowed disabled:opacity-70 disabled:shadow-none';

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
