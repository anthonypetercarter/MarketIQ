import { Dateline } from "@/components/shared/Dateline";
import { ConfidenceStat } from "@/components/shared/ConfidenceStat";
import { RECOMMENDATION_LABEL } from "@/lib/labels";
import type { CouncilRecommendation } from "@prisma/client";

export function TodaysDecision({
  recommendation,
  confidence,
  rationale,
  updatedAt,
  immediateAction,
}: {
  recommendation: CouncilRecommendation;
  confidence: number;
  rationale: string;
  updatedAt: Date;
  /** Brief-only: the single next action, shown beneath the rationale. Omitted on the Dashboard. */
  immediateAction?: string;
}) {
  return (
    <div className="border-ink-900 border-t pt-6">
      <Dateline label="Today's Decision" updatedAt={updatedAt} />

      <div className="flex flex-col items-start gap-4 sm:flex-row sm:justify-between sm:gap-7">
        <h1 className="text-hero text-ink-900 min-w-0 flex-1 font-serif font-semibold text-balance">
          {RECOMMENDATION_LABEL[recommendation]}
        </h1>
        <ConfidenceStat score={confidence} />
      </div>

      <p className="text-dek text-ink-700 mt-6 max-w-[560px] font-serif italic">{rationale}</p>

      {immediateAction && (
        <p className="text-ink-900 mt-5 text-[14px]">
          <span className="text-ink-500 font-medium tracking-[0.04em] uppercase">
            Immediate action —{" "}
          </span>
          {immediateAction}
        </p>
      )}
    </div>
  );
}
