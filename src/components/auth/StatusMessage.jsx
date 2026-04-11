const tones = {
  error: 'border-[rgba(var(--fundly-warm-rgb),0.14)] bg-[rgba(var(--fundly-warm-rgb),0.06)] text-[var(--fundly-warm)]',
  success: 'border-[rgba(var(--fundly-accent-rgb),0.18)] bg-[rgba(var(--fundly-accent-rgb),0.08)] text-[var(--fundly-deep)]',
  info: 'border-[rgba(var(--fundly-primary-rgb),0.10)] bg-[rgba(var(--fundly-primary-rgb),0.04)] text-[var(--fundly-primary)]',
};

export default function StatusMessage({ tone = 'info', message }) {
  if (!message) {
    return null;
  }

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      aria-live="polite"
      className={[
        'rounded-[1rem] border px-4 py-3 text-sm leading-6',
        tones[tone] ?? tones.info,
      ].join(' ')}
    >
      {message}
    </div>
  );
}
