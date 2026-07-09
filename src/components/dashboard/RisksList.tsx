import type { Risk } from "@prisma/client";

export function RisksList({ risks }: { risks: Risk[] }) {
  return (
    <div>
      <h2 className="text-ink-500 text-label tracking-[0.06em] uppercase">Primary Risks</h2>
      <div className="border-ink-200 mt-3 divide-y divide-[var(--color-ink-200)] border-t">
        {risks.map((risk) => (
          <div key={risk.id} className="py-5">
            <div className="text-ink-900 text-[15px] font-semibold">{risk.title}</div>
            <p className="text-ink-700 mt-1 line-clamp-1 text-[13px]">{risk.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
