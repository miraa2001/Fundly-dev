import { useState } from 'react';
import { EyeIcon, EyeOffIcon } from './icons';

export default function AuthField({
  id,
  label,
  icon: Icon,
  error,
  hint,
  type = 'text',
  action,
  allowPasswordToggle = false,
  ...inputProps
}) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  const inputType = allowPasswordToggle ? (passwordVisible ? 'text' : 'password') : type;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm font-bold tracking-[0.01em] text-[#0C2A46]">
          {label}
        </label>
        {action}
      </div>

      <div
        className={[
          'flex items-center overflow-hidden rounded-[1.35rem] border bg-[linear-gradient(180deg,rgba(242,242,242,0.96),rgba(242,242,242,0.9))] transition duration-200 backdrop-blur-sm',
          error
            ? 'border-[#401F14]/35 shadow-[0_0_0_4px_rgba(64,31,20,0.12),0_14px_34px_rgba(64,31,20,0.08)]'
            : 'border-[#0C2A46]/14 shadow-[0_14px_34px_rgba(1,24,38,0.08)] focus-within:border-[#A67A53]/60 focus-within:bg-[#F2F2F2] focus-within:shadow-[0_0_0_4px_rgba(166,122,83,0.14),0_18px_42px_rgba(12,42,70,0.14)]',
          inputProps.disabled ? 'opacity-70' : '',
        ].join(' ')}
      >
        <span className="flex min-h-[3rem] w-[2.7rem] shrink-0 items-center justify-center self-stretch rounded-l-[1.35rem] bg-[linear-gradient(180deg,#C9A27D_0%,#A67A53_100%)] text-[#401F14] shadow-[inset_0_1px_0_rgba(242,242,242,0.5),inset_-1px_0_0_rgba(242,242,242,0.18)]">
          <Icon />
        </span>

        <input
          id={id}
          type={inputType}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className="w-full bg-transparent px-4 py-2 text-[15px] text-[#0C2A46] outline-none placeholder:text-[rgba(12,42,70,0.48)]"
          {...inputProps}
        />

        {allowPasswordToggle ? (
          <button
            type="button"
            onClick={() => setPasswordVisible((current) => !current)}
            className="mr-2 flex h-11 items-center justify-center rounded-full px-3 text-[rgba(12,42,70,0.55)] transition hover:bg-[#0C2A46]/6 hover:text-[#A67A53]"
            aria-label={passwordVisible ? 'Hide password' : 'Show password'}
            disabled={inputProps.disabled}
          >
            {passwordVisible ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        ) : null}
      </div>

      {error ? (
        <p id={`${id}-error`} className="text-sm text-[#401F14]">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-sm text-[rgba(12,42,70,0.62)]">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
