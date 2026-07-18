import { NavBar } from "@/components/shared/NavBar";
import { TodaysDecision } from "@/components/shared/TodaysDecision";
import { OutlookAndAllocation } from "@/components/brief/OutlookAndAllocation";
import { SinceYesterday } from "@/components/brief/SinceYesterday";
import { RecommendedActionsList } from "@/components/brief/RecommendedActionsList";
import { OpportunitiesFull } from "@/components/brief/OpportunitiesFull";
import { RisksFull } from "@/components/brief/RisksFull";
import { CouncilSummary } from "@/components/brief/CouncilSummary";
import { computeCurrentAllocation, computeAllocationGaps } from "@/lib/portfolio/allocation";
import { computePortfolioHealth } from "@/lib/portfolio/rules";
import { computeSinceYesterday } from "@/lib/brief/sinceYesterday";
import { ACTION_TYPE_LABEL } from "@/lib/labels";
import { getBriefWithSinceYesterday } from "@/lib/data/brief";

export default async function BriefPage() {
  const data = await getBriefWithSinceYesterday();

  if (!data) {
    return (
      <>
        <NavBar />
        <main className="mx-auto w-full max-w-[var(--content-width)] flex-1 px-8 py-16">
          <h1 className="text-hero text-ink-900 font-serif font-semibold">No Brief yet.</h1>
          <p className="text-ink-700 mt-4 max-w-[480px] text-[15px] leading-[1.6]">
            The Investment Council hasn&rsquo;t produced a Brief yet. Run{" "}
            <code className="bg-ink-100 rounded-sm px-1.5 py-0.5 text-[13px]">npm run db:seed</code>{" "}
            to load one.
          </p>
        </main>
      </>
    );
  }

  const { today, yesterday, portfolio } = data;

  const firstAction = today.recommendedActions[0];
  const immediateAction = firstAction
    ? `${ACTION_TYPE_LABEL[firstAction.actionType]} — ${firstAction.description}`
    : undefined;

  const cio = today.councilAssessments.find((a) => a.role === "CHIEF_INVESTMENT_OFFICER");

  let sinceYesterdayItems: ReturnType<typeof computeSinceYesterday> = [];
  if (yesterday && portfolio) {
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
    const cashBalance = Number(portfolio.cashBalance);
    const currentAllocation = computeCurrentAllocation(holdingsForCalc, cashBalance);

    const todayTargets = today.allocationTargets.map((t) => ({
      category: t.category,
      targetPercent: Number(t.targetPercent),
    }));
    const todayGaps = computeAllocationGaps(currentAllocation, todayTargets);
    const todayHealth = computePortfolioHealth(todayGaps, [], today.date);

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
        <TodaysDecision
          recommendation={today.councilRecommendation}
          confidence={today.councilConfidence}
          rationale={today.decisionRationale}
          updatedAt={today.updatedAt}
          immediateAction={immediateAction}
        />

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

        <div className="mt-[var(--section-gap)]">
          <h2 className="text-ink-500 text-label tracking-[0.06em] uppercase">Executive Summary</h2>
          <p className="text-dek text-ink-900 mt-4 max-w-[640px] font-serif leading-[1.7]">
            {today.executiveSummary}
          </p>
        </div>

        <div className="mt-[var(--section-gap)]">
          <OutlookAndAllocation
            outlook={today.marketOutlook}
            allocationTargets={today.allocationTargets}
          />
        </div>

        <div className="mt-[var(--section-gap)]">
          <RecommendedActionsList actions={today.recommendedActions} />
        </div>

        <div className="mt-[var(--section-gap)]">
          <OpportunitiesFull opportunities={today.opportunities} />
        </div>

        <div className="mt-14">
          <RisksFull risks={today.risks} />
        </div>

        <div className="mt-[var(--section-gap)]">
          <CouncilSummary assessments={today.councilAssessments} />
        </div>

        {cio && (
          <div className="mt-[var(--section-gap)]">
            <h2 className="text-ink-500 text-label tracking-[0.06em] uppercase">
              What Would Change Our Mind
            </h2>
            <p className="text-ink-700 mt-3 max-w-[620px] text-[15px] leading-[1.6]">
              {cio.changeTrigger}
            </p>
          </div>
        )}

        <div className="mt-12">
          <h2 className="text-ink-500 text-label tracking-[0.06em] uppercase">
            Historical Similarity
          </h2>
          <p className="text-ink-700 mt-3 max-w-[620px] text-[15px] leading-[1.6] italic">
            {today.historicalSimilarityNarrative}
          </p>
        </div>

        <div className="border-ink-200 mt-32 border-t pt-8 text-center">
          <p className="text-ink-500 font-serif text-[13px] italic">
            Prepared by {today.preparedBy}. Approved by {today.approvedBy}.
          </p>
        </div>
      </main>
    </>
  );
}
