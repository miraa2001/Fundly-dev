const tones = {
  error: 'border-[rgba(var(--fundly-warm-rgb),0.25)] bg-[rgba(var(--fundly-warm-rgb),0.10)] text-[var(--fundly-warm)]',
  success: 'border-[rgba(var(--fundly-accent-rgb),0.30)] bg-[rgba(var(--fundly-accent-rgb),0.12)] text-[var(--fundly-primary)]',
  info: 'border-[rgba(var(--fundly-primary-rgb),0.16)] bg-[rgba(var(--fundly-primary-rgb),0.06)] text-[var(--fundly-primary)]',
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
        'rounded-[1.15rem] border px-4 py-3 text-sm leading-6 shadow-[0_12px_30px_rgba(var(--fundly-deep-rgb),0.08)]',
        tones[tone] ?? tones.info,
      ].join(' ')}
    >
      {message}
    </div>
  );
}
