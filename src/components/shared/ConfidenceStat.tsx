import { confidenceLabel } from "@/lib/confidence";

export function ConfidenceStat({ score }: { score: number }) {
  return (
    <div className="shrink-0 pt-1.5 text-left sm:text-right">
      <div className="text-ink-900 text-stat font-mono font-semibold">{score}%</div>
      <div className="text-ink-500 text-eyebrow mt-1.5 tracking-[0.08em] whitespace-nowrap uppercase">
        Confidence — {confidenceLabel(score)}
      </div>
    </div>
  );
}
