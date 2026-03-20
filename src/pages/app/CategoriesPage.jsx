import AppPageHeader from '../../components/app/AppPageHeader';
import AppSurface from '../../components/app/AppSurface';
import { categorySnapshots } from '../../lib/mock-app-data';

export default function CategoriesPage() {
  return (
    <div className="space-y-5">
      <AppPageHeader
        eyebrow="Categories"
        title="Budgets by category"
        description="Mock category cards for the first authenticated shell, with room for future limits, transactions, and alerts."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {categorySnapshots.map((category) => (
          <AppSurface key={category.name} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-bold tracking-[-0.02em] text-[#16323b]">{category.name}</p>
                <p className="mt-2 text-sm text-[#5a727b]">
                  {category.spent} of {category.limit}
                </p>
              </div>
              <span className="rounded-full bg-[#fff2c8] px-3 py-1 text-xs font-bold text-[#8b5202]">
                {category.progress}%
              </span>
            </div>
            <div className="mt-4 h-3 rounded-full bg-[#dff4f2]">
              <div
                className="h-3 rounded-full bg-[linear-gradient(90deg,#44e8f4_0%,#15aeca_55%,#0a6a83_100%)]"
                style={{ width: `${Math.min(category.progress, 100)}%` }}
              />
            </div>
          </AppSurface>
        ))}
      </div>
    </div>
  );
}
