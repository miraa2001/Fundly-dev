const tones = {
  error: 'border-[#efc7b8] bg-[#fff2ec] text-[#934d33]',
  success: 'border-[#9cefe5] bg-[#eafffb] text-[#0c6375]',
  info: 'border-[#b8f2f2] bg-[#eefcff] text-[#0d5b70]',
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
        'rounded-[1.15rem] border px-4 py-3 text-sm leading-6 shadow-[0_12px_30px_rgba(3,41,53,0.08)]',
        tones[tone] ?? tones.info,
      ].join(' ')}
    >
      {message}
    </div>
  );
}
