import AppPageHeader from '../../components/app/AppPageHeader';
import AppSurface from '../../components/app/AppSurface';
import { plannedItems, savingsGoals } from '../../lib/mock-app-data';

export default function PlannedPage() {
  return (
    <div className="space-y-5">
      <AppPageHeader
        eyebrow="Planned"
        title="Upcoming bills and goals"
        description="Placeholder structure for scheduled payments, savings targets, and anything you want to plan ahead in Fundly."
      />

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <AppSurface
          eyebrow="Upcoming"
          title="Planned payments"
          description="Bills and recurring items are mocked here for layout and hierarchy."
        >
          <div className="space-y-3">
            {plannedItems.map((item) => (
              <div
                key={item.title}
                className="flex items-center justify-between gap-4 rounded-[1.3rem] border border-[#0C2A46]/12 bg-white/70 px-4 py-3"
              >
                <div>
                  <p className="font-bold text-[#0C2A46]">{item.title}</p>
                  <p className="mt-1 text-sm text-[rgba(12,42,70,0.7)]">{item.due}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[#0C2A46]">{item.amount}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-[#A67A53]">{item.status}</p>
                </div>
              </div>
            ))}
          </div>
        </AppSurface>

        <AppSurface
          eyebrow="Goals"
          title="Savings in motion"
          description="A simple visual placeholder until the full goal-tracking experience is built."
        >
          <div className="space-y-4">
            {savingsGoals.map((goal) => (
              <div key={goal.title} className="rounded-[1.3rem] border border-[#0C2A46]/12 bg-white/70 px-4 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-bold text-[#0C2A46]">{goal.title}</p>
                    <p className="mt-1 text-sm text-[rgba(12,42,70,0.7)]">
                      {goal.saved} saved of {goal.target}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#A67A53]/12 px-3 py-1 text-xs font-bold text-[#A67A53]">
                    {goal.progress}%
                  </span>
                </div>
                <div className="mt-4 h-3 rounded-full bg-[#0C2A46]/10">
                  <div
                    className="h-3 rounded-full bg-[linear-gradient(90deg,#A67A53_0%,#0C2A46_58%,#011826_100%)]"
                    style={{ width: `${Math.min(goal.progress, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </AppSurface>
      </div>
    </div>
  );
}
