import type { PortfolioSummary } from "@/lib/portfolio/summary";
import type { PortfolioHealth } from "@/lib/portfolio/rules";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatSignedPercent(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

const HEALTH_LABEL: Record<PortfolioHealth["status"], string> = {
  ALIGNED: "Aligned",
  OVERWEIGHT: "Overweight",
  UNDERWEIGHT: "Underweight",
};

export function InvestmentProgress({
  summary,
  healthStatus,
}: {
  summary: PortfolioSummary;
  healthStatus: PortfolioHealth["status"];
}) {
  return (
    <div>
      <h2 className="text-ink-500 text-label tracking-[0.06em] uppercase">Investment Progress</h2>

      <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:gap-12">
        <div>
          <div className="text-ink-500 text-eyebrow tracking-[0.06em] uppercase">
            Portfolio Value
          </div>
          <div className="text-ink-900 text-stat mt-1 font-mono font-semibold">
            {formatCurrency(summary.totalValue)}
          </div>
        </div>
        <div>
          <div className="text-ink-500 text-eyebrow tracking-[0.06em] uppercase">
            Since Starting with MarketIQ
          </div>
          <div className="text-ink-900 text-stat mt-1 font-mono font-semibold">
            {formatSignedPercent(summary.totalReturnPercent)}
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-8">
        <div>
          <span className="text-ink-500 text-[12px]">Today </span>
          <span className="text-ink-700 font-mono text-[13px]">
            {formatSignedPercent(summary.todaysChangePercent)}
          </span>
        </div>
        <div>
          <span className="text-ink-500 text-[12px]">Portfolio Health </span>
          <span className="text-ink-700 text-[13px]">{HEALTH_LABEL[healthStatus]}</span>
        </div>
      </div>
    </div>
  );
}
