import AppPageHeader from '../../components/app/AppPageHeader';
import AppSurface from '../../components/app/AppSurface';
import { transactionGroups, transactionSummary } from '../../lib/mock-app-data';

export default function TransactionsPage() {
  return (
    <div className="space-y-5">
      <AppPageHeader
        eyebrow="Transactions"
        title="A cleaner transaction view"
        description="Mock activity grouped the way a real transaction feed could feel once Supabase data is wired in."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        {transactionSummary.map((item) => (
          <AppSurface key={item.label} className="p-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#087f98]">{item.label}</p>
            <p className="mt-3 text-2xl font-bold tracking-[-0.03em] text-[#16323b]">{item.value}</p>
          </AppSurface>
        ))}
      </div>

      <AppSurface
        eyebrow="Feed"
        title="All transactions"
        description="Placeholder grouping, spacing, and hierarchy for the future authenticated transaction list."
      >
        <div className="space-y-5">
          {transactionGroups.map((group) => (
            <div key={group.label}>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8b5202]">{group.label}</p>
              <div className="mt-3 space-y-3">
                {group.items.map((item) => (
                  <div
                    key={`${group.label}-${item.name}-${item.amount}`}
                    className="flex items-center justify-between gap-4 rounded-[1.3rem] border border-[#d3efed] bg-white/70 px-4 py-3"
                  >
                    <div>
                      <p className="font-bold text-[#16323b]">{item.name}</p>
                      <p className="mt-1 text-sm text-[#5a727b]">{item.category}</p>
                    </div>
                    <p className={item.tone === 'income' ? 'text-sm font-bold text-[#0c6375]' : 'text-sm font-bold text-[#0e2f39]'}>
                      {item.amount}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </AppSurface>
    </div>
  );
}
