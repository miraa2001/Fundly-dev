import { useAuthSession } from '../../lib/auth-context';
import { homeHighlights, homeStats, recentTransactions } from '../../lib/mock-app-data';
import AppPageHeader from '../../components/app/AppPageHeader';
import AppSurface from '../../components/app/AppSurface';

function getDisplayName(email) {
  if (!email) {
    return 'there';
  }

  return email.split('@')[0];
}

export default function HomePage() {
  const { user } = useAuthSession();

  return (
    <div className="space-y-5">
      <AppPageHeader
        eyebrow="Home"
        title={`Welcome back, ${getDisplayName(user?.email)}.`}
        description="This is the first real Fundly shell: quick context, mock account highlights, and structure ready for future data integrations."
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {homeStats.map((item) => (
          <AppSurface key={item.label} className="p-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A67A53]">{item.label}</p>
            <p className="mt-3 text-2xl font-bold tracking-[-0.03em] text-[#0C2A46]">{item.value}</p>
            <p className="mt-2 text-sm leading-6 text-[rgba(12,42,70,0.7)]">{item.detail}</p>
          </AppSurface>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <AppSurface
          eyebrow="Recent Activity"
          title="Latest transactions"
          description="Mock feed only for now. This will eventually connect to your real transaction data."
        >
          <div className="space-y-3">
            {recentTransactions.map((item) => (
              <div
                key={`${item.name}-${item.date}`}
                className="flex items-center justify-between gap-4 rounded-[1.3rem] border border-[#0C2A46]/12 bg-white/70 px-4 py-3"
              >
                <div>
                  <p className="font-bold text-[#0C2A46]">{item.name}</p>
                  <p className="mt-1 text-sm text-[rgba(12,42,70,0.7)]">
                    {item.category} . {item.date}
                  </p>
                </div>
                <p className="text-sm font-bold text-[#0C2A46]">{item.amount}</p>
              </div>
            ))}
          </div>
        </AppSurface>

        <AppSurface
          eyebrow="Focus"
          title="What stands out"
          description="Simple prompts for the next actions the real dashboard can eventually support."
        >
          <div className="space-y-3">
            {homeHighlights.map((item) => (
              <div key={item.title} className="rounded-[1.3rem] border border-[#0C2A46]/12 bg-white/70 px-4 py-4">
                <p className="font-bold text-[#0C2A46]">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-[rgba(12,42,70,0.7)]">{item.detail}</p>
              </div>
            ))}
          </div>
        </AppSurface>
      </div>
    </div>
  );
}
