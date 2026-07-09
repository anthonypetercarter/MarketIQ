import type { MarketOutlook } from "@prisma/client";

const OUTLOOK_ORDER: MarketOutlook[] = [
  "DEFENSIVE",
  "CAUTIOUS",
  "NEUTRAL",
  "MODERATELY_BULLISH",
  "STRONGLY_BULLISH",
];

const OUTLOOK_LABEL: Record<MarketOutlook, string> = {
  STRONGLY_BULLISH: "Strongly Bullish",
  MODERATELY_BULLISH: "Moderately Bullish",
  NEUTRAL: "Neutral",
  CAUTIOUS: "Cautious",
  DEFENSIVE: "Defensive",
};

export function MarketOutlookGauge({ outlook }: { outlook: MarketOutlook }) {
  const currentIndex = OUTLOOK_ORDER.indexOf(outlook);

  return (
    <div>
      <div className="text-ink-500 text-label font-medium tracking-[0.09em] uppercase">
        {OUTLOOK_LABEL[outlook]}
      </div>
      <div className="mt-2.5 flex gap-1">
        {OUTLOOK_ORDER.map((step, i) => (
          <div
            key={step}
            className={`h-2 flex-1 rounded-sm ${
              i === currentIndex ? "bg-brass" : i < currentIndex ? "bg-ink-900" : "bg-ink-100"
            }`}
          />
        ))}
      </div>
      <div className="text-ink-500 text-eyebrow mt-1.5 flex justify-between">
        <span>Defensive</span>
        <span>Strongly Bullish</span>
      </div>
    </div>
  );
}
