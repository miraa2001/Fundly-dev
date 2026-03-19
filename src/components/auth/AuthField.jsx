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
        <label htmlFor={id} className="text-sm font-bold tracking-[0.01em] text-[#16323b]">
          {label}
        </label>
        {action}
      </div>

      <div
        className={[
          'flex items-center overflow-hidden rounded-[1.35rem] border bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(233,249,246,0.92))] transition duration-200 backdrop-blur-sm',
          error
            ? 'border-[#e3a28a] shadow-[0_0_0_4px_rgba(227,162,138,0.14),0_14px_34px_rgba(161,77,87,0.08)]'
            : 'border-[#d3efed] shadow-[0_14px_34px_rgba(3,41,53,0.08)] focus-within:border-[#35d9ef]/60 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(53,217,239,0.14),0_18px_42px_rgba(10,111,135,0.14)]',
          inputProps.disabled ? 'opacity-70' : '',
        ].join(' ')}
      >
        <span className="flex min-h-[3rem] w-[2.7rem] shrink-0 items-center justify-center self-stretch rounded-l-[1.35rem] bg-[linear-gradient(180deg,#ffe37d_0%,#f7c236_100%)] text-[#8d4d03] shadow-[inset_0_1px_0_rgba(255,255,255,0.55),inset_-1px_0_0_rgba(255,255,255,0.22)]">
          <Icon />
        </span>

        <input
          id={id}
          type={inputType}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className="w-full bg-transparent px-4 py-2 text-[15px] text-[#19333b] outline-none placeholder:text-[#6d8791]"
          {...inputProps}
        />

        {allowPasswordToggle ? (
          <button
            type="button"
            onClick={() => setPasswordVisible((current) => !current)}
            className="mr-2 flex h-11 items-center justify-center rounded-full px-3 text-[#63808a] transition hover:bg-[#e9fbff] hover:text-[#087b95]"
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
