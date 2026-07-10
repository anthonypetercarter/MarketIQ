import type { PortfolioSummary } from "@/lib/portfolio/summary";

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

export function PortfolioSummaryStats({ summary }: { summary: PortfolioSummary }) {
  const stats = [
    { label: "Total Value", value: formatCurrency(summary.totalValue) },
    {
      label: "Today's Change",
      value: `${formatCurrency(summary.todaysChangeValue)} (${formatSignedPercent(summary.todaysChangePercent)})`,
    },
    {
      label: "Total Return",
      value: `${formatCurrency(summary.totalReturnValue)} (${formatSignedPercent(summary.totalReturnPercent)})`,
    },
  ];

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:gap-12">
      {stats.map((stat) => (
        <div key={stat.label}>
          <div className="text-ink-500 text-label tracking-[0.06em] uppercase">{stat.label}</div>
          <div className="text-ink-900 mt-1.5 font-mono text-[18px]">{stat.value}</div>
        </div>
      ))}
    </div>
  );
}
