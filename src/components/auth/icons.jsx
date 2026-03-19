export function BrandMark({ inverse = false }) {
  return (
    <div
      className={[
        'flex h-11 w-11 items-center justify-center rounded-2xl border text-base font-semibold tracking-[0.24em]',
        inverse
          ? 'border-white/25 bg-white/10 text-white'
          : 'border-white/80 bg-white/90 text-clay shadow-[0_14px_32px_rgba(116,98,88,0.12)]',
      ].join(' ')}
      aria-hidden="true"
    >
      F
    </div>
  );
}

const mailIconUrl = 'https://img.icons8.com/deco-glyph/48/8d4d03/new-post.png';
const passwordIconUrl = 'https://img.icons8.com/ios-filled/50/8d4d03/password.png';

function IconBase({ children }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      {children}
    </svg>
  );
}

export function MailIcon() {
  return <img src={mailIconUrl} alt="" aria-hidden="true" className="h-5 w-5 object-contain" />;
}

export function LockIcon() {
  return <img src={passwordIconUrl} alt="" aria-hidden="true" className="h-5 w-5 object-contain" />;
}

export function EyeIcon() {
  return (
    <IconBase>
      <path d="M2.8 12s3.4-5.8 9.2-5.8S21.2 12 21.2 12s-3.4 5.8-9.2 5.8S2.8 12 2.8 12Z" />
      <circle cx="12" cy="12" r="2.7" />
    </IconBase>
  );
}

export function EyeOffIcon() {
  return (
    <IconBase>
      <path d="m4 4 16 16" />
      <path d="M9.8 6.65A10.5 10.5 0 0 1 12 6.2c5.8 0 9.2 5.8 9.2 5.8a17.2 17.2 0 0 1-3.05 3.6" />
      <path d="M14.18 14.2A2.7 2.7 0 0 1 9.8 9.82" />
      <path d="M6.3 9.3A17.54 17.54 0 0 0 2.8 12s3.4 5.8 9.2 5.8a10.6 10.6 0 0 0 4.06-.8" />
    </IconBase>
  );
}

export function ArrowLeftIcon() {
  return (
    <IconBase>
      <path d="M15.5 5.5 9 12l6.5 6.5" />
    </IconBase>
  );
}

export function SparkIcon() {
  return (
    <IconBase>
      <path d="m12 3 1.6 4.6L18 9.2l-4.4 1.6L12 15.4l-1.6-4.6L6 9.2l4.4-1.6L12 3Z" />
      <path d="m18.5 15 1 2.8 2.8 1-2.8 1-1 2.8-1-2.8-2.8-1 2.8-1 1-2.8Z" />
    </IconBase>
  );
}
