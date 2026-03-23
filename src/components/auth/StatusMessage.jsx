const tones = {
  error: 'border-[#401F14]/25 bg-[#401F14]/10 text-[#401F14]',
  success: 'border-[#A67A53]/30 bg-[#A67A53]/12 text-[#0C2A46]',
  info: 'border-[#0C2A46]/16 bg-[#0C2A46]/6 text-[#0C2A46]',
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
        'rounded-[1.15rem] border px-4 py-3 text-sm leading-6 shadow-[0_12px_30px_rgba(1,24,38,0.08)]',
        tones[tone] ?? tones.info,
      ].join(' ')}
    >
      {message}
    </div>
  );
}
