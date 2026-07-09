import { NavBar } from "@/components/shared/NavBar";
import { TodaysDecision } from "@/components/shared/TodaysDecision";
import { OutlookAndAllocation } from "@/components/dashboard/OutlookAndAllocation";
import { RecommendedActionsList } from "@/components/brief/RecommendedActionsList";
import { OpportunitiesFull } from "@/components/brief/OpportunitiesFull";
import { RisksFull } from "@/components/brief/RisksFull";
import { CouncilSummary } from "@/components/brief/CouncilSummary";
import { ACTION_TYPE_LABEL } from "@/lib/labels";
import { getLatestBriefDetail } from "@/lib/data/brief";

export default async function BriefPage() {
  const brief = await getLatestBriefDetail();

  if (!brief) {
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

  const firstAction = brief.recommendedActions[0];
  const immediateAction = firstAction
    ? `${ACTION_TYPE_LABEL[firstAction.actionType]} — ${firstAction.description}`
    : undefined;

  const cio = brief.councilAssessments.find((a) => a.role === "CHIEF_INVESTMENT_OFFICER");

  return (
    <>
      <NavBar />
      <main className="mx-auto w-full max-w-[var(--content-width)] flex-1 px-8 py-10 sm:py-16">
        <TodaysDecision
          recommendation={brief.councilRecommendation}
          confidence={brief.councilConfidence}
          rationale={brief.decisionRationale}
          updatedAt={brief.updatedAt}
          immediateAction={immediateAction}
        />

        <div className="mt-[var(--section-gap)]">
          <h2 className="text-ink-500 text-label tracking-[0.06em] uppercase">Executive Summary</h2>
          <p className="text-dek text-ink-900 mt-4 max-w-[640px] font-serif leading-[1.7]">
            {brief.executiveSummary}
          </p>
        </div>

        <div className="mt-[var(--section-gap)]">
          <OutlookAndAllocation
            outlook={brief.marketOutlook}
            allocationTargets={brief.allocationTargets}
          />
        </div>

        <div className="mt-[var(--section-gap)]">
          <RecommendedActionsList actions={brief.recommendedActions} />
        </div>

        <div className="mt-[var(--section-gap)]">
          <OpportunitiesFull opportunities={brief.opportunities} />
        </div>

        <div className="mt-14">
          <RisksFull risks={brief.risks} />
        </div>

        <div className="mt-[var(--section-gap)]">
          <CouncilSummary assessments={brief.councilAssessments} />
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
            {brief.historicalSimilarityNarrative}
          </p>
        </div>

        <div className="border-ink-200 mt-32 border-t pt-8 text-center">
          <p className="text-ink-500 font-serif text-[13px] italic">
            Prepared by {brief.preparedBy}. Approved by {brief.approvedBy}.
          </p>
        </div>
      </main>
    </>
  );
}
