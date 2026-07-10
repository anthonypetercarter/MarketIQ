import type { HoldingWithCompany } from "@/lib/portfolio/allocation";
import { marketValue } from "@/lib/portfolio/allocation";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function HoldingsTable({
  holdings,
  totalValue,
}: {
  holdings: HoldingWithCompany[];
  totalValue: number;
}) {
  const sorted = [...holdings].sort((a, b) => marketValue(b) - marketValue(a));

  return (
    <div>
      <h2 className="text-ink-500 text-label tracking-[0.06em] uppercase">Current Holdings</h2>
      <div className="border-ink-200 mt-3 divide-y divide-[var(--color-ink-200)] border-t">
        {sorted.map((holding) => {
          const value = marketValue(holding);
          const pct = totalValue > 0 ? (value / totalValue) * 100 : 0;
          return (
            <div key={holding.id} className="flex items-center justify-between py-4">
              <div>
                <span className="text-ink-900 font-mono text-[13px] font-medium">
                  {holding.company.ticker}
                </span>
                <span className="text-ink-500 ml-2 text-[13px]">{holding.company.name}</span>
              </div>
              <div className="flex items-baseline gap-4">
                <span className="text-ink-500 font-mono text-[13px]">{holding.quantity} sh</span>
                <span className="text-ink-900 font-mono text-[14px]">{formatCurrency(value)}</span>
                <span className="text-ink-500 w-12 text-right font-mono text-[13px]">
                  {pct.toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
