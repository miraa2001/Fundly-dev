import { useEffect } from 'react';
import AppSurface from '../AppSurface';
import CategoryFormPanel from './CategoryFormPanel';

export default function CategoryDialog({
  form,
  errors,
  monthKey,
  mode,
  isOpen,
  isSubmitting,
  onCancel,
  onChange,
  onSubmit,
}) {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onCancel();
      }
    }

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end bg-[rgba(var(--fundly-deep-rgb),0.64)] px-4 pb-4 pt-4 backdrop-blur-sm sm:items-center sm:justify-center sm:p-6">
      <button
        type="button"
        aria-label="Close category dialog"
        className="absolute inset-0 cursor-default"
        onClick={onCancel}
      />

      <div className="relative z-10 w-full max-w-lg">
        <AppSurface
          className="flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden sm:max-h-[calc(100dvh-3rem)]"
          contentClassName="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex items-start justify-between gap-3 border-b border-[rgba(var(--fundly-primary-rgb),0.10)] pb-4">
            <div className="min-w-0">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-[var(--fundly-accent)]">
                {mode === 'edit' ? 'Edit Category' : 'New Category'}
              </p>
              <h2 className="mt-2 text-xl font-bold tracking-[-0.02em] text-[var(--fundly-primary)]">
                {mode === 'edit' ? 'Update this category' : 'Add a category'}
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-[rgba(var(--fundly-primary-rgb),0.7)]">
                Create and manage categories without leaving the authenticated app shell.
              </p>
            </div>

            <button
              type="button"
              onClick={onCancel}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[rgba(var(--fundly-primary-rgb),0.12)] bg-white/80 text-sm font-bold text-[rgba(var(--fundly-primary-rgb),0.7)] transition hover:border-[rgba(var(--fundly-accent-rgb),0.40)] hover:text-[var(--fundly-accent)]"
              aria-label="Close category dialog"
            >
              <span aria-hidden="true" className="leading-none">
                X
              </span>
            </button>
          </div>

          <div className="mt-4 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
            <CategoryFormPanel
              form={form}
              errors={errors}
              monthKey={monthKey}
              mode={mode}
              isSubmitting={isSubmitting}
              onCancel={onCancel}
              onChange={onChange}
              onSubmit={onSubmit}
            />
          </div>
        </AppSurface>
      </div>
    </div>
  );
}
