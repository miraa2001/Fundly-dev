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
                className="flex items-center justify-between gap-4 rounded-[1.3rem] border border-[#d3efed] bg-white/70 px-4 py-3"
              >
                <div>
                  <p className="font-bold text-[#16323b]">{item.title}</p>
                  <p className="mt-1 text-sm text-[#5a727b]">{item.due}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[#0e2f39]">{item.amount}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-[#087f98]">{item.status}</p>
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
              <div key={goal.title} className="rounded-[1.3rem] border border-[#d3efed] bg-white/70 px-4 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-bold text-[#16323b]">{goal.title}</p>
                    <p className="mt-1 text-sm text-[#5a727b]">
                      {goal.saved} saved of {goal.target}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#fff2c8] px-3 py-1 text-xs font-bold text-[#8b5202]">
                    {goal.progress}%
                  </span>
                </div>
                <div className="mt-4 h-3 rounded-full bg-[#dff4f2]">
                  <div
                    className="h-3 rounded-full bg-[linear-gradient(90deg,#44e8f4_0%,#15aeca_55%,#0a6a83_100%)]"
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
