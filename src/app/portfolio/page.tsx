import { NavBar } from "@/components/shared/NavBar";
import { AllocationBar } from "@/components/shared/AllocationBar";
import { PortfolioHealthSummary } from "@/components/portfolio/PortfolioHealthSummary";
import { AllocationComparisonBar } from "@/components/portfolio/AllocationComparisonBar";
import { RecommendedChangesList } from "@/components/portfolio/RecommendedChangesList";
import { PortfolioSummaryStats } from "@/components/portfolio/PortfolioSummaryStats";
import { HoldingsTable } from "@/components/portfolio/HoldingsTable";
import {
  computeCurrentAllocation,
  computeAllocationGaps,
  computeSectorExposure,
  computeTotalPortfolioValue,
} from "@/lib/portfolio/allocation";
import { computeRecommendedChanges, computePortfolioHealth } from "@/lib/portfolio/rules";
import { computePortfolioSummary } from "@/lib/portfolio/summary";
import { getPortfolioWithBriefContext } from "@/lib/data/portfolio";

export default async function PortfolioPage() {
  const data = await getPortfolioWithBriefContext();

  if (!data) {
    return (
      <>
        <NavBar />
        <main className="mx-auto w-full max-w-[var(--content-width)] flex-1 px-8 py-16">
          <h1 className="text-hero text-ink-900 font-serif font-semibold">No Portfolio yet.</h1>
          <p className="text-ink-700 mt-4 max-w-[480px] text-[15px] leading-[1.6]">
            A Portfolio or Brief hasn&rsquo;t been seeded yet. Run{" "}
            <code className="bg-ink-100 rounded-sm px-1.5 py-0.5 text-[13px]">npm run db:seed</code>{" "}
            to load one.
          </p>
        </main>
      </>
    );
  }

  const { portfolio, brief } = data;
  const holdings = portfolio.holdings;
  const cashBalance = Number(portfolio.cashBalance);

  const holdingsForCalc = holdings.map((h) => ({
    id: h.id,
    quantity: Number(h.quantity),
    costBasis: Number(h.costBasis),
    company: {
      id: h.company.id,
      ticker: h.company.ticker,
      name: h.company.name,
      sector: h.company.sector,
      currentPrice: Number(h.company.currentPrice),
      previousClosePrice: Number(h.company.previousClosePrice),
      region: h.company.region,
    },
  }));

  const allocationTargets = brief.allocationTargets.map((t) => ({
    category: t.category,
    targetPercent: Number(t.targetPercent),
  }));

  const totalValue = computeTotalPortfolioValue(holdingsForCalc, cashBalance);
  const currentAllocation = computeCurrentAllocation(holdingsForCalc, cashBalance);
  const gaps = computeAllocationGaps(currentAllocation, allocationTargets);
  const sectorExposure = computeSectorExposure(holdingsForCalc, cashBalance);
  const summary = computePortfolioSummary(holdingsForCalc, cashBalance);

  const changes = computeRecommendedChanges({
    holdings: holdingsForCalc,
    cashBalance,
    allocationTargets,
    opportunities: brief.opportunities,
    recommendedActions: brief.recommendedActions,
  });

  const health = computePortfolioHealth(gaps, changes, brief.date);

  return (
    <>
      <NavBar />
      <main className="mx-auto w-full max-w-[var(--content-width)] flex-1 px-8 py-10 sm:py-16">
        <PortfolioHealthSummary health={health} />

        <div className="mt-[var(--section-gap)]">
          <h2 className="text-ink-500 text-label tracking-[0.06em] uppercase">
            Allocation vs. Today&rsquo;s Recommendation
          </h2>
          <div className="mt-4 flex flex-col gap-5">
            {gaps.map((gap) => (
              <AllocationComparisonBar key={gap.category} gap={gap} />
            ))}
          </div>
        </div>

        <div className="mt-[var(--section-gap)]">
          <RecommendedChangesList changes={changes} />
        </div>

        <div className="mt-[var(--section-gap)]">
          <h2 className="text-ink-500 text-label mb-4 tracking-[0.06em] uppercase">
            Portfolio Summary
          </h2>
          <PortfolioSummaryStats summary={summary} />
        </div>

        <div className="mt-14">
          <HoldingsTable holdings={holdingsForCalc} totalValue={totalValue} />
        </div>

        <div className="mt-12">
          <h2 className="text-ink-500 text-label mb-3 tracking-[0.06em] uppercase">
            Sector Exposure
          </h2>
          <div className="flex flex-col gap-3">
            {sectorExposure.map((s) => (
              <AllocationBar
                key={s.sector}
                category={s.sector}
                percent={Math.round(s.percent * 10) / 10}
              />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
