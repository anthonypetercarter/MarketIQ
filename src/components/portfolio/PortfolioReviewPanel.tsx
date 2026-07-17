import type { HoldingVerdictResult } from "@/lib/council/validatePortfolioReview";
import type { StoredNewPositionVerdict } from "@/lib/council/portfolioReviewTypes";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

const VERDICT_LABEL: Record<string, string> = {
  BUY: "Buy",
  INCREASE: "Increase",
  HOLD: "Hold",
  REDUCE: "Reduce",
  EXIT: "Exit",
};

function EvidenceList({ evidence }: { evidence: string[] }) {
  return (
    <ul className="mt-1.5 flex flex-col gap-1">
      {evidence.map((item) => (
        <li key={item} className="text-ink-500 flex gap-2 text-[13px] leading-[1.5]">
          <span className="text-ink-300" aria-hidden>
            —
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

export function PortfolioReviewPanel({
  narrative,
  existingHoldings,
  newPositions,
  generatedAt,
}: {
  narrative: string;
  existingHoldings: HoldingVerdictResult[];
  newPositions: StoredNewPositionVerdict[];
  generatedAt: Date;
}) {
  return (
    <div className="border-ink-900 border-t pt-6">
      <div className="flex items-baseline justify-between">
        <div className="text-ink-500 text-eyebrow tracking-[0.08em] uppercase">
          Portfolio Review
        </div>
        <div className="text-ink-300 text-[11px]">
          Generated{" "}
          {generatedAt.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            timeZone: "UTC",
          })}{" "}
          UTC
        </div>
      </div>

      <p className="text-ink-900 text-dek mt-4 max-w-[620px] font-serif leading-[1.6]">
        {narrative}
      </p>

      <div className="mt-8">
        <h2 className="text-ink-500 text-label tracking-[0.06em] uppercase">New Positions</h2>
        {newPositions.length === 0 ? (
          <p className="text-ink-700 mt-3 text-[14px]">No new positions recommended today.</p>
        ) : (
          <div className="border-ink-200 mt-3 divide-y divide-[var(--color-ink-200)] border-t">
            {newPositions.map((position) => (
              <div key={position.ticker} className="py-5">
                <div className="flex items-baseline justify-between">
                  <div className="text-ink-900 text-[16px] font-semibold">
                    {position.ticker}{" "}
                    <span className="text-ink-500 font-normal">({position.companyName})</span>
                  </div>
                  <div className="text-ink-900 text-[13px]">{VERDICT_LABEL[position.verdict]}</div>
                </div>
                <EvidenceList evidence={position.evidence} />
                {position.trade ? (
                  <p className="text-ink-900 mt-2 font-mono text-[13px]">
                    → Buy {position.trade.shares} shares (~
                    {formatCurrency(position.trade.estimatedPricePerShare)}/share, ~
                    {formatCurrency(position.trade.estimatedCost)} total)
                  </p>
                ) : (
                  <p className="text-ink-500 mt-2 text-[13px]">
                    Approved by the Council, but no Excess Cash or concentration room was left to
                    size it today.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-ink-500 text-label tracking-[0.06em] uppercase">Existing Holdings</h2>
        <div className="border-ink-200 mt-3 divide-y divide-[var(--color-ink-200)] border-t">
          {existingHoldings.map((holding) => (
            <div key={holding.ticker} className="py-5">
              <div className="flex items-baseline justify-between">
                <div className="text-ink-900 text-[15px] font-medium">
                  {holding.ticker}{" "}
                  <span className="text-ink-500 font-normal">({holding.companyName})</span>
                </div>
                <div className="text-ink-900 text-[13px]">{VERDICT_LABEL[holding.verdict]}</div>
              </div>
              <EvidenceList evidence={holding.evidence} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
