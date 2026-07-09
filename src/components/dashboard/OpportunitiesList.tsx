import type { Opportunity, Company } from "@prisma/client";

type OpportunityWithCompany = Opportunity & { company: Company | null };

export function OpportunitiesList({ opportunities }: { opportunities: OpportunityWithCompany[] }) {
  return (
    <div>
      <h2 className="text-ink-500 text-label tracking-[0.06em] uppercase">Top Opportunities</h2>
      <div className="border-ink-200 mt-3 divide-y divide-[var(--color-ink-200)] border-t">
        {opportunities.map((opportunity) => (
          <div key={opportunity.id} className="py-5">
            <div className="text-ink-900 text-[15px] font-semibold">
              {opportunity.company ? opportunity.company.name : opportunity.thematicTitle}
            </div>
            <p className="text-ink-700 mt-1 line-clamp-1 text-[13px]">{opportunity.thesis}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
