import {
  categoryColorPresets,
  defaultCategoryColor,
  formatMonthKey,
  getCategoryAccentColor,
  normalizeHexColor,
  suggestedCategoryKinds,
} from '../../../lib/categories';

const fieldClassName =
  'w-full rounded-[1.15rem] border border-[#0C2A46]/14 bg-white/80 px-4 py-3 text-sm text-[#0C2A46] outline-none transition focus:border-[#A67A53]/60 focus:bg-white focus:ring-4 focus:ring-[#A67A53]/12';
const errorFieldClassName =
  'w-full rounded-[1.15rem] border border-[#401F14]/28 bg-[#401F14]/6 px-4 py-3 text-sm text-[#0C2A46] outline-none ring-4 ring-[#401F14]/10';

export default function CategoryFormPanel({
  form,
  errors,
  monthKey,
  mode,
  isSubmitting,
  onCancel,
  onChange,
  onSubmit,
}) {
  const previewColor = getCategoryAccentColor(form.color);

  return (
    <form className="space-y-4 pb-2" onSubmit={onSubmit} noValidate>
      <div className="rounded-[1.35rem] border border-[#0C2A46]/12 bg-white/70 p-4">
        <div className="flex items-center gap-3">
          <div
            className="h-12 w-12 shrink-0 rounded-[1.1rem] border border-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
            style={{ backgroundColor: previewColor }}
            aria-hidden="true"
          />
          <div>
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[#A67A53]">Preview</p>
            <p className="mt-1 text-sm font-bold text-[#0C2A46]">{form.name || 'Category name'}</p>
            <p className="mt-1 text-xs text-[rgba(12,42,70,0.7)]">{form.kind || 'Kind not set yet'}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="category-name" className="text-sm font-bold text-[#0C2A46]">
          Name
        </label>
        <input
          id="category-name"
          type="text"
          value={form.name}
          onChange={(event) => onChange('name', event.target.value)}
          placeholder="Groceries"
          autoFocus
          className={errors.name ? errorFieldClassName : fieldClassName}
        />
        {errors.name ? <p className="text-sm text-[#401F14]">{errors.name}</p> : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="category-kind" className="text-sm font-bold text-[#0C2A46]">
          Kind
        </label>
        <input
          id="category-kind"
          type="text"
          list="category-kind-options"
          value={form.kind}
          onChange={(event) => onChange('kind', event.target.value)}
          placeholder="expense"
          className={errors.kind ? errorFieldClassName : fieldClassName}
        />
        <datalist id="category-kind-options">
          {suggestedCategoryKinds.map((kind) => (
            <option key={kind} value={kind} />
          ))}
        </datalist>
        {errors.kind ? <p className="text-sm text-[#401F14]">{errors.kind}</p> : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="category-color" className="text-sm font-bold text-[#0C2A46]">
          Color
        </label>
        <div className="flex items-center gap-3">
          <input
            id="category-color-picker"
            type="color"
            value={normalizeHexColor(form.color) || defaultCategoryColor}
            onChange={(event) => onChange('color', event.target.value)}
            className="h-12 w-14 shrink-0 cursor-pointer rounded-[1rem] border border-[#0C2A46]/14 bg-white/80 p-1"
          />
          <input
            id="category-color"
            type="text"
            value={form.color}
            onChange={(event) => onChange('color', event.target.value)}
            placeholder="#0C2A46"
            className={errors.color ? errorFieldClassName : fieldClassName}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categoryColorPresets.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onChange('color', color)}
              className="h-8 w-8 rounded-full border border-white/80 shadow-[0_0_0_3px_rgba(255,255,255,0.55)]"
              style={{ backgroundColor: color }}
              aria-label={`Use ${color}`}
            />
          ))}
        </div>
        {errors.color ? <p className="text-sm text-[#401F14]">{errors.color}</p> : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="category-budget" className="text-sm font-bold text-[#0C2A46]">
          Monthly budget
        </label>
        <input
          id="category-budget"
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          value={form.budgetLimit}
          onChange={(event) => onChange('budgetLimit', event.target.value)}
          placeholder="Optional"
          className={errors.budgetLimit ? errorFieldClassName : fieldClassName}
        />
        <p className="text-xs leading-5 text-[rgba(12,42,70,0.7)]">Applies to {formatMonthKey(monthKey)}.</p>
        {errors.budgetLimit ? <p className="text-sm text-[#401F14]">{errors.budgetLimit}</p> : null}
      </div>

      <div className="sticky bottom-0 z-[1] -mx-1 flex flex-wrap items-center gap-3 border-t border-[#0C2A46]/10 bg-[linear-gradient(180deg,rgba(242,242,242,0.12)_0%,rgba(242,242,242,0.96)_22%,rgba(242,242,242,0.99)_100%)] px-1 pb-1 pt-4 sm:static sm:mx-0 sm:border-t-0 sm:bg-transparent sm:px-0 sm:pb-0 sm:pt-0">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-[1.2rem] border border-[#A67A53] bg-[linear-gradient(180deg,#0C2A46_0%,#062239_46%,#011826_100%)] px-4 py-3 text-sm font-bold text-[#F2F2F2] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
        >
          {isSubmitting ? (mode === 'edit' ? 'Saving...' : 'Creating...') : mode === 'edit' ? 'Save changes' : 'Add category'}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="inline-flex w-full items-center justify-center rounded-[1.2rem] border border-[#0C2A46]/12 bg-white/80 px-4 py-3 text-sm font-bold text-[#0C2A46] transition hover:border-[#A67A53]/40 hover:text-[#A67A53] sm:w-auto"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
