import { Dateline } from "@/components/shared/Dateline";
import type { PortfolioHealth } from "@/lib/portfolio/rules";

const STATUS_HEADLINE: Record<PortfolioHealth["status"], string> = {
  ALIGNED: "Aligned with Today's Recommendation",
  OVERWEIGHT: "Overweight Relative to Today's Recommendation",
  UNDERWEIGHT: "Underweight Relative to Today's Recommendation",
};

export function PortfolioHealthSummary({ health }: { health: PortfolioHealth }) {
  return (
    <div className="border-ink-900 border-t pt-6">
      <Dateline label="Portfolio Health" updatedAt={health.briefDate} />

      <h1 className="text-hero text-ink-900 font-serif font-semibold text-balance">
        {STATUS_HEADLINE[health.status]}
      </h1>

      {health.primaryIssue ? (
        <p className="text-dek text-ink-700 mt-6 max-w-[600px] font-serif italic">
          Primary issue — {health.primaryIssue.headline}: {health.primaryIssue.detail}
        </p>
      ) : (
        <p className="text-dek text-ink-700 mt-6 max-w-[600px] font-serif italic">
          No immediate issues flagged against today&rsquo;s Brief.
        </p>
      )}
    </div>
  );
}
