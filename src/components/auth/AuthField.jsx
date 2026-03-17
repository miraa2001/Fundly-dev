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
        <label htmlFor={id} className="text-sm font-medium text-clay">
          {label}
        </label>
        {action}
      </div>

      <div
        className={[
          'flex items-center rounded-[1.15rem] border bg-white/90 transition duration-200',
          error
            ? 'border-[#d59199]/80 shadow-[0_0_0_4px_rgba(213,145,153,0.12)]'
            : 'border-white/90 shadow-[0_12px_30px_rgba(116,98,88,0.08)] focus-within:border-teal/45 focus-within:shadow-[0_0_0_4px_rgba(76,138,145,0.12)]',
          inputProps.disabled ? 'opacity-70' : '',
        ].join(' ')}
      >
        <span className="pl-4 text-mist/95">
          <Icon />
        </span>

        <input
          id={id}
          type={inputType}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className="w-full rounded-[1.15rem] bg-transparent px-3 py-3.5 text-[15px] text-slate-700 outline-none placeholder:text-slate-400"
          {...inputProps}
        />

        {allowPasswordToggle ? (
          <button
            type="button"
            onClick={() => setPasswordVisible((current) => !current)}
            className="mr-2 flex h-11 items-center justify-center rounded-full px-3 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
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

