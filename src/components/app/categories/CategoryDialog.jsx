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
    <div className="fixed inset-0 z-40 flex items-end bg-[#07141a]/55 px-4 pb-4 pt-16 backdrop-blur-sm sm:items-center sm:justify-center sm:p-6">
      <button
        type="button"
        aria-label="Close category dialog"
        className="absolute inset-0 cursor-default"
        onClick={onCancel}
      />

      <div className="relative z-10 w-full max-w-lg max-h-[calc(100dvh-5rem)] overflow-y-auto overscroll-contain sm:max-h-[calc(100dvh-3rem)]">
        <AppSurface
          eyebrow={mode === 'edit' ? 'Edit Category' : 'New Category'}
          title={mode === 'edit' ? 'Update this category' : 'Add a category'}
          description="Create and manage categories without leaving the authenticated app shell."
          action={
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d3efed] bg-white/80 text-[#5a727b] transition hover:border-[#35d9ef]/40 hover:text-[#087f98]"
              aria-label="Close category dialog"
            >
              <span aria-hidden="true" className="text-lg leading-none">
                x
              </span>
            </button>
          }
        >
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
        </AppSurface>
      </div>
    </div>
  );
}
