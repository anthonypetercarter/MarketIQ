import type { PlaybookResult } from "@/lib/portfolio/playbook";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

const HEALTH_LABEL: Record<string, string> = {
  ALIGNED: "Aligned",
  OVERWEIGHT: "Overweight",
  UNDERWEIGHT: "Underweight",
};

export function TodaysPlaybook({ playbook }: { playbook: PlaybookResult }) {
  if (playbook.status === "WAIT") {
    return (
      <div className="border-ink-900 border-t pt-6">
        <div className="text-ink-500 text-eyebrow tracking-[0.08em] uppercase">
          Today&rsquo;s Playbook
        </div>
        <h1 className="text-hero text-ink-900 mt-3 font-serif font-semibold text-balance">
          No Trade Today
        </h1>
        <p className="text-dek text-ink-700 mt-5 max-w-[560px] font-serif italic">
          {playbook.reason}
        </p>
        <p className="text-ink-500 mt-4 text-[13px]">
          Excess Cash available today — {formatCurrency(playbook.excessCash)}
        </p>
      </div>
    );
  }

  const healthLabel = playbook.expectedPortfolio.isImproving
    ? `${HEALTH_LABEL[playbook.expectedPortfolio.expectedHealthStatus]} (Improving)`
    : HEALTH_LABEL[playbook.expectedPortfolio.expectedHealthStatus];

  return (
    <div className="border-ink-900 border-t pt-6">
      <div className="text-ink-500 text-eyebrow tracking-[0.08em] uppercase">
        Today&rsquo;s Playbook
      </div>
      <p className="text-ink-700 mt-3 max-w-[560px] text-[14px] leading-[1.5]">
        {playbook.objective}
      </p>

      <h1 className="text-hero text-ink-900 mt-5 font-serif font-semibold text-balance">
        Buy {playbook.trade.shares} shares of {playbook.trade.ticker}
      </h1>
      <p className="text-ink-500 mt-2 text-[13px]">
        {playbook.selectedOpportunity.companyName} · ~
        {formatCurrency(playbook.trade.estimatedPricePerShare)}/share · ~
        {formatCurrency(playbook.trade.estimatedCost)} total
      </p>

      <div className="mt-7 flex gap-10">
        <div>
          <div className="text-ink-500 text-eyebrow tracking-[0.06em] uppercase">
            {playbook.expectedPortfolio.targetCategory}
          </div>
          <div className="text-ink-900 mt-1 font-mono text-[18px]">
            ~{playbook.expectedPortfolio.expectedCategoryPercent.toFixed(1)}%
          </div>
        </div>
        <div>
          <div className="text-ink-500 text-eyebrow tracking-[0.06em] uppercase">
            Portfolio Health
          </div>
          <div className="text-ink-900 mt-1 text-[14px]">{healthLabel}</div>
        </div>
      </div>

      <div className="mt-7">
        <div className="text-ink-500 text-label tracking-[0.06em] uppercase">Why</div>
        <ul className="mt-2.5 flex flex-col gap-1.5">
          {[...playbook.evidence, playbook.sizingExplanation].map((item) => (
            <li key={item} className="text-ink-700 flex gap-2 text-[13px] leading-[1.5]">
              <span className="text-ink-300" aria-hidden>
                —
              </span>
              {item}
            </li>
          ))}
        </ul>
        <p className="text-ink-500 mt-3 text-[12px]">
          Excess Cash available today — {formatCurrency(playbook.excessCash)}
        </p>
      </div>
    </div>
  );
}
