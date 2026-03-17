const tones = {
  error: 'border-[#e8c0c5] bg-[#fff4f5] text-[#934751]',
  success: 'border-moss/25 bg-moss/10 text-[#53704f]',
  info: 'border-white/80 bg-white/85 text-clay',
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
        'rounded-[1.15rem] border px-4 py-3 text-sm leading-6 shadow-[0_12px_30px_rgba(116,98,88,0.06)]',
        tones[tone] ?? tones.info,
      ].join(' ')}
    >
      {message}
    </div>
  );
}
