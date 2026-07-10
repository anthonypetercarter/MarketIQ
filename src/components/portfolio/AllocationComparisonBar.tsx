import type { AllocationGap } from "@/lib/portfolio/allocation";

export function AllocationComparisonBar({ gap }: { gap: AllocationGap }) {
  const isTracked = gap.status !== "NOT_TRACKED" && gap.actualPercent !== null;

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-ink-900 text-[15px] font-medium">{gap.category}</span>
        <span className="text-ink-500 font-mono text-[13px]">
          {isTracked ? (
            <>
              {gap.actualPercent!.toFixed(1)}%{" "}
              <span className="text-ink-300">/ {gap.targetPercent}% target</span>
            </>
          ) : (
            <span className="text-ink-300">{gap.targetPercent}% target — not yet tracked</span>
          )}
        </span>
      </div>
      <div className="bg-ink-100 relative h-1.5 rounded-sm">
        {isTracked && (
          <div
            className="bg-ink-900 h-full rounded-sm"
            style={{ width: `${Math.min(gap.actualPercent!, 100)}%` }}
          />
        )}
        <div
          className="bg-ink-700 absolute top-0 h-full w-[2px]"
          style={{ left: `${Math.min(gap.targetPercent, 100)}%` }}
          aria-hidden
        />
      </div>
    </div>
  );
}
