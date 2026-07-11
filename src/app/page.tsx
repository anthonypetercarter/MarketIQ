import { NavBar } from "@/components/shared/NavBar";
import { QuietLink } from "@/components/shared/QuietLink";
import { TodaysDecision } from "@/components/shared/TodaysDecision";
import { InvestmentProgress } from "@/components/dashboard/InvestmentProgress";
import { SinceYesterday } from "@/components/dashboard/SinceYesterday";
import { computeCurrentAllocation, computeAllocationGaps } from "@/lib/portfolio/allocation";
import { computePortfolioHealth } from "@/lib/portfolio/rules";
import { computePortfolioSummary } from "@/lib/portfolio/summary";
import { computeSinceYesterday } from "@/lib/dashboard/sinceYesterday";
import { ACTION_TYPE_LABEL } from "@/lib/labels";
import { getDashboardData } from "@/lib/data/dashboard";

export default async function DashboardPage() {
  const data = await getDashboardData();

  if (!data) {
    return (
      <>
        <NavBar />
        <main className="mx-auto w-full max-w-[var(--content-width)] flex-1 px-8 py-16">
          <h1 className="text-hero text-ink-900 font-serif font-semibold">No Brief yet.</h1>
          <p className="text-ink-700 mt-4 max-w-[480px] text-[15px] leading-[1.6]">
            The Investment Council hasn&rsquo;t produced a Brief yet, or no Portfolio has been
            seeded. Run{" "}
            <code className="bg-ink-100 rounded-sm px-1.5 py-0.5 text-[13px]">npm run db:seed</code>{" "}
            to load one.
          </p>
        </main>
      </>
    );
  }

  const { today, yesterday, portfolio } = data;
  const firstName = today.user.name.split(" ")[0];
  const cashBalance = Number(portfolio.cashBalance);

  const holdingsForCalc = portfolio.holdings.map((h) => ({
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

  const currentAllocation = computeCurrentAllocation(holdingsForCalc, cashBalance);
  const summary = computePortfolioSummary(holdingsForCalc, cashBalance);

  const todayTargets = today.allocationTargets.map((t) => ({
    category: t.category,
    targetPercent: Number(t.targetPercent),
  }));
  const todayGaps = computeAllocationGaps(currentAllocation, todayTargets);
  const todayHealth = computePortfolioHealth(todayGaps, [], today.date);

  const firstAction = today.recommendedActions[0];
  const immediateAction = firstAction
    ? `${ACTION_TYPE_LABEL[firstAction.actionType]} — ${firstAction.description}`
    : undefined;

  let sinceYesterdayItems: ReturnType<typeof computeSinceYesterday> = [];
  if (yesterday) {
    const yesterdayTargets = yesterday.allocationTargets.map((t) => ({
      category: t.category,
      targetPercent: Number(t.targetPercent),
    }));
    const yesterdayGaps = computeAllocationGaps(currentAllocation, yesterdayTargets);
    const yesterdayHealth = computePortfolioHealth(yesterdayGaps, [], yesterday.date);

    sinceYesterdayItems = computeSinceYesterday(
      {
        councilRecommendation: yesterday.councilRecommendation,
        councilConfidence: yesterday.councilConfidence,
        risks: yesterday.risks,
        recommendedActions: yesterday.recommendedActions,
      },
      {
        councilRecommendation: today.councilRecommendation,
        councilConfidence: today.councilConfidence,
        risks: today.risks,
        recommendedActions: today.recommendedActions,
      },
      yesterdayHealth.status,
      todayHealth.status,
    );
  }

  return (
    <>
      <NavBar />
      <main className="mx-auto w-full max-w-[var(--content-width)] flex-1 px-8 py-10 sm:py-16">
        <p className="text-ink-700 text-[15px]">Good morning, {firstName}.</p>

        <div className="mt-7">
          <TodaysDecision
            recommendation={today.councilRecommendation}
            confidence={today.councilConfidence}
            rationale={today.decisionRationale}
            updatedAt={today.updatedAt}
            immediateAction={immediateAction}
          />
        </div>

        <div className="mt-[var(--section-gap)]">
          <InvestmentProgress summary={summary} healthStatus={todayHealth.status} />
        </div>

        <div className="mt-[var(--section-gap)]">
          {yesterday ? (
            <SinceYesterday items={sinceYesterdayItems} />
          ) : (
            <div>
              <h2 className="text-ink-500 text-label tracking-[0.06em] uppercase">
                Since Yesterday
              </h2>
              <p className="text-ink-700 mt-3 text-[14px]">
                This is your first Brief — check back tomorrow to see what&rsquo;s changed.
              </p>
            </div>
          )}
        </div>

        <div className="border-ink-200 mt-16 border-t pt-8">
          <h2 className="text-ink-500 text-label mb-4 tracking-[0.06em] uppercase">
            Continue Reading
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-8">
            <QuietLink href="/brief">Read Today&rsquo;s Brief</QuietLink>
            <QuietLink href="/portfolio">Open Portfolio</QuietLink>
          </div>
        </div>
      </main>
    </>
  );
}
