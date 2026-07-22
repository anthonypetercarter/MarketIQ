import { NavBar } from "@/components/shared/NavBar";
import { AllocationBar } from "@/components/shared/AllocationBar";
import { PortfolioReviewPanel } from "@/components/portfolio/PortfolioReviewPanel";
import { AllocationComparisonBar } from "@/components/portfolio/AllocationComparisonBar";
import { InvestmentProgress } from "@/components/portfolio/InvestmentProgress";
import { HoldingsTable } from "@/components/portfolio/HoldingsTable";
import {
  computeCurrentAllocation,
  computeAllocationGaps,
  computeSectorExposure,
  computeTotalPortfolioValue,
} from "@/lib/portfolio/allocation";
import { computePortfolioHealth } from "@/lib/portfolio/rules";
import { computePortfolioSummary } from "@/lib/portfolio/summary";
import { getPortfolioWithBriefContext } from "@/lib/data/portfolio";
import type { StoredPortfolioReviewVerdicts } from "@/lib/council/portfolioReviewTypes";

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

  const { portfolio, brief, portfolioReview } = data;
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
      assetType: h.company.assetType,
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
  const health = computePortfolioHealth(gaps, [], brief.date);

  const verdicts = portfolioReview
    ? (portfolioReview.verdicts as unknown as StoredPortfolioReviewVerdicts)
    : null;

  return (
    <>
      <NavBar />
      <main className="mx-auto w-full max-w-[var(--content-width)] flex-1 px-8 py-10 sm:py-16">
        {portfolioReview && verdicts ? (
          <PortfolioReviewPanel
            narrative={portfolioReview.narrative}
            existingHoldings={verdicts.existingHoldings}
            todaysActions={verdicts.todaysActions}
            generatedAt={portfolioReview.generatedAt}
          />
        ) : (
          <div className="border-ink-900 border-t pt-6">
            <div className="text-ink-500 text-eyebrow tracking-[0.08em] uppercase">
              Portfolio Review
            </div>
            <h1 className="text-hero text-ink-900 mt-3 font-serif font-semibold text-balance">
              No Review Yet Today
            </h1>
            <p className="text-dek text-ink-700 mt-5 max-w-[560px] font-serif italic">
              The Council hasn&rsquo;t reviewed this portfolio against today&rsquo;s Brief yet.
            </p>
            <p className="text-ink-500 mt-4 text-[13px]">
              Run{" "}
              <code className="bg-ink-100 rounded-sm px-1.5 py-0.5 text-[12px]">
                npm run council:generate-review
              </code>{" "}
              to generate one.
            </p>
          </div>
        )}

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

        <div className="mt-12">
          <InvestmentProgress summary={summary} healthStatus={health.status} />
        </div>
      </main>
    </>
  );
}
