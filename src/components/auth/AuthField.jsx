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
        <label htmlFor={id} className="text-sm font-medium tracking-[0.01em] text-clay">
          {label}
        </label>
        {action}
      </div>

      <div
        className={[
          'flex items-center rounded-[1.35rem] border bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,246,243,0.84))] transition duration-200 backdrop-blur-sm',
          error
            ? 'border-[#d59199]/80 shadow-[0_0_0_4px_rgba(213,145,153,0.12),0_14px_34px_rgba(161,77,87,0.08)]'
            : 'border-white/80 shadow-[0_14px_34px_rgba(116,98,88,0.09)] focus-within:border-teal/45 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(76,138,145,0.12),0_18px_42px_rgba(76,138,145,0.12)]',
          inputProps.disabled ? 'opacity-70' : '',
        ].join(' ')}
      >
        <span className="ml-3 flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,rgba(215,207,230,0.46),rgba(147,172,186,0.18))] text-teal shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
          <Icon />
        </span>

        <input
          id={id}
          type={inputType}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className="w-full rounded-[1.35rem] bg-transparent px-3 py-3.5 text-[15px] text-slate-700 outline-none placeholder:text-slate-400"
          {...inputProps}
        />

        {allowPasswordToggle ? (
          <button
            type="button"
            onClick={() => setPasswordVisible((current) => !current)}
            className="mr-2 flex h-11 items-center justify-center rounded-full px-3 text-slate-500 transition hover:bg-white/70 hover:text-teal"
            aria-label={passwordVisible ? 'Hide password' : 'Show password'}
            disabled={inputProps.disabled}
          >
            {passwordVisible ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        ) : null}
      </div>

      {error ? (
        <p id={`${id}-error`} className="text-sm text-[#a14d57]">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-sm text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
