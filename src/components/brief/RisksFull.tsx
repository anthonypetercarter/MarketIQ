import { ROLE_LABEL } from "@/lib/labels";
import type { Risk, CouncilAssessment } from "@prisma/client";

type RiskWithSources = Risk & { sourceAssessments: CouncilAssessment[] };

export function RisksFull({ risks }: { risks: RiskWithSources[] }) {
  return (
    <div>
      <h2 className="text-ink-500 text-label tracking-[0.06em] uppercase">Primary Risks</h2>
      <div className="border-ink-200 mt-3 divide-y divide-[var(--color-ink-200)] border-t">
        {risks.map((risk) => (
          <div key={risk.id} className="py-6">
            <div className="text-ink-900 text-[16px] font-semibold">{risk.title}</div>
            <p className="text-ink-700 mt-1.5 max-w-[620px] text-[14px] leading-[1.6]">
              {risk.description}
            </p>
            <p className="text-ink-500 mt-2 text-[12px]">
              Synthesized from {risk.sourceAssessments.map((a) => ROLE_LABEL[a.role]).join(", ")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
