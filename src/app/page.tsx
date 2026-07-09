import { NavBar } from "@/components/shared/NavBar";
import { QuietLink } from "@/components/shared/QuietLink";
import { TodaysDecision } from "@/components/shared/TodaysDecision";
import { OutlookAndAllocation } from "@/components/dashboard/OutlookAndAllocation";
import { OpportunitiesList } from "@/components/dashboard/OpportunitiesList";
import { RisksList } from "@/components/dashboard/RisksList";
import { getLatestBrief } from "@/lib/data/brief";

export default async function DashboardPage() {
  const brief = await getLatestBrief();

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

  const firstName = brief.user.name.split(" ")[0];

  return (
    <>
      <NavBar />
      <main className="mx-auto w-full max-w-[var(--content-width)] flex-1 px-8 py-10 sm:py-16">
        <p className="text-ink-700 text-[15px]">Good morning, {firstName}.</p>

        <div className="mt-7">
          <TodaysDecision
            recommendation={brief.councilRecommendation}
            confidence={brief.councilConfidence}
            rationale={brief.decisionRationale}
            updatedAt={brief.updatedAt}
          />
        </div>

        <div className="mt-16">
          <OutlookAndAllocation
            outlook={brief.marketOutlook}
            allocationTargets={brief.allocationTargets}
          />
        </div>

        <div className="mt-16">
          <OpportunitiesList opportunities={brief.opportunities} />
        </div>

        <div className="mt-12">
          <RisksList risks={brief.risks} />
        </div>

        <div className="border-ink-200 mt-16 border-t pt-8">
          <QuietLink href="/brief">Read Today&rsquo;s Brief</QuietLink>
        </div>
      </main>
    </>
  );
}
