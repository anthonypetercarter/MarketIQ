import { MarketOutlookGauge } from "@/components/shared/MarketOutlookGauge";
import { AllocationBar } from "@/components/shared/AllocationBar";
import type { MarketOutlook, AllocationTarget } from "@prisma/client";

export function OutlookAndAllocation({
  outlook,
  allocationTargets,
}: {
  outlook: MarketOutlook;
  allocationTargets: AllocationTarget[];
}) {
  return (
    <div className="flex flex-col gap-10 sm:flex-row sm:gap-7">
      <div className="sm:flex-1">
        <h2 className="text-ink-500 text-label mb-3 tracking-[0.06em] uppercase">Market Outlook</h2>
        <MarketOutlookGauge outlook={outlook} />
      </div>
      <div className="sm:flex-1">
        <h2 className="text-ink-500 text-label mb-3 tracking-[0.06em] uppercase">
          Recommended Allocation
        </h2>
        <div className="flex flex-col gap-3">
          {allocationTargets.map((target) => (
            <AllocationBar
              key={target.id}
              category={target.category}
              percent={Number(target.targetPercent)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
