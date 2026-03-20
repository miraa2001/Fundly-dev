import {
  categoryColorPresets,
  defaultCategoryColor,
  formatMonthKey,
  getCategoryAccentColor,
  normalizeHexColor,
  suggestedCategoryKinds,
} from '../../../lib/categories';

const fieldClassName =
  'w-full rounded-[1.15rem] border border-[#d3efed] bg-white/80 px-4 py-3 text-sm text-[#16323b] outline-none transition focus:border-[#35d9ef]/60 focus:bg-white focus:ring-4 focus:ring-[#35d9ef]/12';
const errorFieldClassName =
  'w-full rounded-[1.15rem] border border-[#e3a28a] bg-[#fffaf8] px-4 py-3 text-sm text-[#16323b] outline-none ring-4 ring-[#efc7b8]/25';

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
    <form className="space-y-4" onSubmit={onSubmit} noValidate>
      <div className="rounded-[1.35rem] border border-[#d3efed] bg-white/70 p-4">
        <div className="flex items-center gap-3">
          <div
            className="h-12 w-12 shrink-0 rounded-[1.1rem] border border-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
            style={{ backgroundColor: previewColor }}
            aria-hidden="true"
          />
          <div>
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[#087f98]">Preview</p>
            <p className="mt-1 text-sm font-bold text-[#16323b]">{form.name || 'Category name'}</p>
            <p className="mt-1 text-xs text-[#5a727b]">{form.kind || 'Kind not set yet'}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="category-name" className="text-sm font-bold text-[#16323b]">
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
        {errors.name ? <p className="text-sm text-[#934d33]">{errors.name}</p> : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="category-kind" className="text-sm font-bold text-[#16323b]">
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
        {errors.kind ? <p className="text-sm text-[#934d33]">{errors.kind}</p> : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="category-color" className="text-sm font-bold text-[#16323b]">
          Color
        </label>
        <div className="flex items-center gap-3">
          <input
            id="category-color-picker"
            type="color"
            value={normalizeHexColor(form.color) || defaultCategoryColor}
            onChange={(event) => onChange('color', event.target.value)}
            className="h-12 w-14 shrink-0 cursor-pointer rounded-[1rem] border border-[#d3efed] bg-white/80 p-1"
          />
          <input
            id="category-color"
            type="text"
            value={form.color}
            onChange={(event) => onChange('color', event.target.value)}
            placeholder="#15AECA"
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
        {errors.color ? <p className="text-sm text-[#934d33]">{errors.color}</p> : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="category-budget" className="text-sm font-bold text-[#16323b]">
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
        <p className="text-xs leading-5 text-[#5a727b]">Applies to {formatMonthKey(monthKey)}.</p>
        {errors.budgetLimit ? <p className="text-sm text-[#934d33]">{errors.budgetLimit}</p> : null}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-[1.2rem] border border-[#073746] bg-[linear-gradient(180deg,#44e8f4_0%,#15aeca_42%,#0a6a83_100%)] px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (mode === 'edit' ? 'Saving...' : 'Creating...') : mode === 'edit' ? 'Save changes' : 'Add category'}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center justify-center rounded-[1.2rem] border border-[#d3efed] bg-white/80 px-4 py-3 text-sm font-bold text-[#16323b] transition hover:border-[#35d9ef]/40 hover:text-[#087f98]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
