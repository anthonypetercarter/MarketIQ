import type { Opportunity, Company } from "@prisma/client";

type OpportunityWithCompany = Opportunity & { company: Company | null };

export function OpportunitiesFull({ opportunities }: { opportunities: OpportunityWithCompany[] }) {
  return (
    <div>
      <h2 className="text-ink-500 text-label tracking-[0.06em] uppercase">Top Opportunities</h2>
      <div className="border-ink-200 mt-3 divide-y divide-[var(--color-ink-200)] border-t">
        {opportunities.map((opportunity) => (
          <div key={opportunity.id} className="py-6">
            <div className="flex items-baseline justify-between gap-4">
              <div className="text-ink-900 text-[16px] font-semibold">
                {opportunity.company ? opportunity.company.name : opportunity.thematicTitle}
              </div>
              <div className="text-ink-500 shrink-0 font-mono text-[13px]">
                Conviction {opportunity.conviction}/100
              </div>
            </div>
            <p className="text-ink-700 mt-1.5 max-w-[620px] text-[14px] leading-[1.6]">
              {opportunity.thesis}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
