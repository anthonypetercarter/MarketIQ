/**
 * Seeds one realistic day's MarketIQ Brief (Thursday, July 9, 2026).
 *
 * This stands in for the Investment Council's real output through Sprint 1.
 * That's a deliberate choice, not a shortcut waiting to be noticed — see
 * docs/decisions.md #1 for the reasoning and what triggers building the
 * real Council service layer.
 *
 * Idempotent: re-running this script clears and rebuilds that day's Brief
 * content rather than duplicating it, so it's safe to run repeatedly during
 * development.
 *
 * Run with: npm run db:seed
 */

import { PrismaClient, CouncilRole, CouncilVerdict } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Copy .env.example to .env and fill in real values.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const BRIEF_DATE = new Date("2026-07-09");

async function main() {
  // --- User -------------------------------------------------------------
  const user = await prisma.user.upsert({
    where: { id: "user-anthony" },
    update: { name: "Anthony" },
    create: { id: "user-anthony", name: "Anthony" },
  });

  // --- Companies referenced by Opportunities / Recommended Actions ------
  const nvda = await prisma.company.upsert({
    where: { ticker: "NVDA" },
    update: {},
    create: { ticker: "NVDA", name: "NVIDIA Corp", sector: "Technology" },
  });

  const cat = await prisma.company.upsert({
    where: { ticker: "CAT" },
    update: {},
    create: { ticker: "CAT", name: "Caterpillar Inc", sector: "Industrials" },
  });

  // --- Brief (scalar fields) --------------------------------------------
  const decisionRationale =
    "Broadening market participation and resilient earnings outweigh concentrated " +
    "risk in a handful of AI-linked names — provided that concentration is actively managed.";

  const executiveSummary =
    "The council enters today moderately constructive, though not unanimously so. The Chief " +
    "Market Officer sees a supportive macro backdrop — easing policy expectations, tight credit " +
    "spreads — and the Chief Sector Strategist and Chief Technical Strategist both confirm that " +
    "leadership in technology and industrials is broadening rather than narrowing, a healthier " +
    "signal than a market carried by a handful of names. That said, the Chief Risk Officer's " +
    "concern deserves real weight: concentration in mega-cap AI-linked names has grown large " +
    "enough that a single disappointing earnings print could move the broad index meaningfully. " +
    "We're weighing genuine opportunity against a genuine, well-evidenced risk — not dismissing " +
    "one for the other. On balance, the evidence supports modestly increasing equity allocation, " +
    "funded from cash rather than from reducing existing diversifiers, while actively managing " +
    "the concentration the Risk Officer has flagged.";

  const historicalSimilarityNarrative =
    "Today's setup echoes early 2019: a policy pause after a tightening cycle, tight credit " +
    "spreads, and leadership concentrated in a handful of large-cap growth names. That period " +
    "resolved with continued gains through the year, though narrower breadth than today's would " +
    "be a meaningful difference worth monitoring.";

  const brief = await prisma.brief.upsert({
    where: { userId_date: { userId: user.id, date: BRIEF_DATE } },
    update: {
      decisionRationale,
      executiveSummary,
      councilRecommendation: "INCREASE_EQUITY_ALLOCATION",
      councilConfidence: 74,
      marketOutlook: "MODERATELY_BULLISH",
      historicalSimilarityNarrative,
    },
    create: {
      id: "brief-2026-07-09",
      userId: user.id,
      date: BRIEF_DATE,
      decisionRationale,
      executiveSummary,
      councilRecommendation: "INCREASE_EQUITY_ALLOCATION",
      councilConfidence: 74,
      marketOutlook: "MODERATELY_BULLISH",
      historicalSimilarityNarrative,
    },
  });

  // Clear this Brief's dependent rows so re-running the seed rebuilds
  // cleanly instead of duplicating or drifting from the content below.
  await prisma.risk.deleteMany({ where: { briefId: brief.id } });
  await prisma.councilAssessment.deleteMany({ where: { briefId: brief.id } });
  await prisma.opportunity.deleteMany({ where: { briefId: brief.id } });
  await prisma.recommendedAction.deleteMany({ where: { briefId: brief.id } });
  await prisma.allocationTarget.deleteMany({ where: { briefId: brief.id } });

  // --- Council Assessments (the nine voices) -----------------------------
  const assessmentData: {
    role: CouncilRole;
    opinion: string;
    confidenceScore: number;
    rationale: string;
    risksNoted: string;
    changeTrigger: string;
    verdict: CouncilVerdict;
  }[] = [
    {
      role: "CHIEF_MARKET_OFFICER",
      opinion:
        "The macro backdrop remains supportive. Policy easing expectations have stabilized, " +
        "credit spreads sit near multi-year tights, and forward-looking liquidity indicators " +
        "have turned modestly positive over the past six weeks. I'd characterize the current " +
        'regime as "mid-cycle, not late-cycle."',
      confidenceScore: 78,
      rationale:
        "Rate policy expectations, the shape of the yield curve, and credit spread behavior " +
        "all point the same direction.",
      risksNoted: "A hawkish policy surprise would pressure the macro backdrop directly.",
      changeTrigger:
        "Credit spreads widen more than 40 basis points from current levels, signaling a " +
        "genuine liquidity tightening.",
      verdict: "SUPPORT",
    },
    {
      role: "CHIEF_SECTOR_STRATEGIST",
      opinion:
        "Technology and Industrials continue to outpace the broader index on a relative-" +
        "strength basis, and — importantly — participation is widening beyond the largest " +
        "five names. Utilities and Consumer Staples are lagging, consistent with a risk-on " +
        "rotation rather than a defensive one.",
      confidenceScore: 72,
      rationale: "Sector fund flows and earnings revisions both confirm the rotation.",
      risksNoted:
        "If leadership concentrates back into a handful of mega-caps, that broadening thesis " +
        "weakens and index-level dependency on a few names rises.",
      changeTrigger:
        "Breadth narrows again and leadership concentrates back into a handful of mega-caps.",
      verdict: "SUPPORT",
    },
    {
      role: "CHIEF_COMPANY_ANALYST",
      opinion:
        "Mega-cap technology earnings have come in ahead of consensus for three consecutive " +
        "quarters, with margin expansion — not just revenue growth — driving the beats. Mid-cap " +
        "results have been more mixed, with several names missing on guidance rather than " +
        "current-quarter results.",
      confidenceScore: 75,
      rationale:
        "Margin trends and guidance revisions are the most reliable forward indicator we track.",
      risksNoted:
        "Mid-cap guidance softness could foreshadow broader margin pressure if it persists.",
      changeTrigger:
        "Guidance from the next earnings cycle shows margin compression rather than expansion.",
      verdict: "SUPPORT",
    },
    {
      role: "CHIEF_TECHNICAL_STRATEGIST",
      opinion:
        "The broad index is holding above its 50-day moving average with improving breadth — " +
        "advance/decline lines are confirming price, not diverging from it. No signs of " +
        "distribution at current levels.",
      confidenceScore: 68,
      rationale:
        "Price and volume are the evidence; breadth confirmation is what separates a healthy advance from a fragile one.",
      risksNoted: "A break below the 50-day average on rising volume would flip this read.",
      changeTrigger: "Price breaks below the 50-day average on rising volume.",
      verdict: "SUPPORT",
    },
    {
      role: "CHIEF_RISK_OFFICER",
      opinion:
        "I want to be the dissenting voice here, briefly. Concentration in AI-linked mega-cap " +
        "names has reached a level where the top five index constituents now materially exceed " +
        "their historical share of index weight. That's not a reason to avoid the space — it's " +
        "a reason to size it deliberately rather than let it grow by drift.",
      confidenceScore: 60,
      rationale:
        "Index concentration and correlation across the largest constituents are both elevated relative to trailing five-year norms.",
      risksNoted:
        "Tech sector concentration is high enough that a single disappointing earnings print " +
        "from a top constituent could disproportionately move the broad index.",
      changeTrigger:
        "Concentration eases through broader market participation, or position sizing is actively managed down.",
      verdict: "SUPPORT_WITH_RESERVATIONS",
    },
    {
      role: "CHIEF_SCIENTIST",
      opinion:
        "Our momentum-based signal has performed within expected historical bounds this " +
        "quarter — predicted continuation calls were correct roughly 71% of the time, in line " +
        "with its long-run track record. I'm recommending we increase the weight of the breadth " +
        "confirmation signal in next quarter's model review, as it has meaningfully improved " +
        "false-positive rates in back-testing.",
      confidenceScore: 70,
      rationale:
        "Backtested performance and out-of-sample tracking are how we keep the council's confidence levels honest over time.",
      risksNoted:
        "Tech sector concentration compounds rotation risk if the momentum signal's recent " +
        "accuracy doesn't hold out-of-sample.",
      changeTrigger:
        "The breadth signal's out-of-sample performance fails to replicate its back-tested improvement.",
      verdict: "NEUTRAL",
    },
    {
      role: "CHIEF_CLIENT_OFFICER",
      opinion:
        'For someone reading this over coffee: the headline here is "modestly more optimistic, ' +
        "not aggressively so.\" If you've been anxious about sitting in cash, this is reasonable " +
        "evidence to put some of it to work — gradually, not all at once. The Risk Officer's " +
        "concentration concern is exactly the kind of thing that should make you glad this " +
        "council exists, since it's easy for an individual investor to miss it while feeling " +
        "good about strong recent tech returns.",
      confidenceScore: 73,
      rationale:
        "A recommendation only helps if a non-professional investor can understand it and act on it calmly.",
      risksNoted:
        "An overly complex recommendation could cause a well-meaning investor to act inconsistently or not at all.",
      changeTrigger:
        "The recommended action became too complex for a non-professional investor to execute with confidence.",
      verdict: "SUPPORT",
    },
    {
      role: "CHIEF_GOVERNANCE_OFFICER",
      opinion:
        "This recommendation is fully sourced and each claim above traces to disclosed " +
        "evidence. Capital Preservation First is honored — exposure is being increased " +
        "incrementally, funded from cash, not from reducing existing diversification. No " +
        "conflicts or process concerns to note.",
      confidenceScore: 80,
      rationale:
        "Every claim in this Brief was checked against its source and against the Constitution's core principles before publication.",
      risksNoted: "None beyond what is already disclosed elsewhere in this Brief.",
      changeTrigger:
        "Any recommendation could not be fully justified against the Constitution if challenged.",
      verdict: "SUPPORT",
    },
    {
      role: "CHIEF_INVESTMENT_OFFICER",
      opinion:
        "I'm comfortable with Increase Equity Allocation, funded specifically from cash rather " +
        "than from bonds or diversifiers, in direct response to the Risk Officer's concentration " +
        "concern.",
      confidenceScore: 74,
      rationale:
        "Weighing all eight opinions, the opportunity and the risk are currently offsetting each other rather than one dominating.",
      risksNoted:
        "See Primary Risks — synthesized from the Risk Officer's and Sector Strategist's notes.",
      changeTrigger:
        "Mega-cap tech concentration continues rising and breadth begins narrowing at the same " +
        "time — that combination would mean the opportunity and the risk are no longer " +
        "offsetting each other.",
      verdict: "SUPPORT",
    },
  ];

  const assessmentByRole = new Map<CouncilRole, { id: string }>();
  for (const data of assessmentData) {
    const created = await prisma.councilAssessment.create({
      data: { briefId: brief.id, ...data },
    });
    assessmentByRole.set(data.role, created);
  }

  // --- Primary Risks (CIO-synthesized, always traceable to assessments) --
  const riskOfficer = assessmentByRole.get("CHIEF_RISK_OFFICER")!;
  const sectorStrategist = assessmentByRole.get("CHIEF_SECTOR_STRATEGIST")!;
  const marketOfficer = assessmentByRole.get("CHIEF_MARKET_OFFICER")!;
  const technicalStrategist = assessmentByRole.get("CHIEF_TECHNICAL_STRATEGIST")!;

  await prisma.risk.create({
    data: {
      briefId: brief.id,
      title: "Mega-Cap AI Concentration",
      description:
        "The market's advance is increasingly dependent on a small number of AI-linked names. " +
        "A disappointing print from any of them could disproportionately affect the broad index.",
      sourceAssessments: { connect: [{ id: riskOfficer.id }, { id: sectorStrategist.id }] },
    },
  });

  await prisma.risk.create({
    data: {
      briefId: brief.id,
      title: "Rate Path Reversal",
      description:
        "Current pricing assumes a continued easing path. A hawkish surprise would likely " +
        "pressure both the macro backdrop and the technical picture simultaneously.",
      sourceAssessments: { connect: [{ id: marketOfficer.id }, { id: technicalStrategist.id }] },
    },
  });

  // --- Top Opportunities (company-specific and thematic) -----------------
  await prisma.opportunity.create({
    data: {
      briefId: brief.id,
      thesis:
        "AI infrastructure buildout continues to outpace even elevated expectations; data " +
        "center demand shows no clear near-term ceiling.",
      conviction: 78,
      companyId: nvda.id,
    },
  });

  await prisma.opportunity.create({
    data: {
      briefId: brief.id,
      thesis:
        "Reshoring and infrastructure capital spending is translating into durable order " +
        "backlogs, a less crowded way to play the same macro tailwind.",
      conviction: 64,
      companyId: cat.id,
    },
  });

  await prisma.opportunity.create({
    data: {
      briefId: brief.id,
      thesis:
        "AI compute growth is becoming an electricity demand story as much as a chip story. " +
        "Utilities and grid-equipment names tied to data center power buildout remain " +
        "underappreciated relative to the compute layer.",
      conviction: 69,
      thematicTitle: "Grid & Power Infrastructure",
    },
  });

  // --- Recommended Actions (order 1 doubles as "Today's Decision" action) -
  await prisma.recommendedAction.create({
    data: {
      briefId: brief.id,
      description:
        "Add to AI infrastructure exposure (e.g. NVDA) within the existing technology " +
        "allocation, sized incrementally rather than all at once.",
      actionType: "BUY",
      displayOrder: 1,
      companyId: nvda.id,
    },
  });

  await prisma.recommendedAction.create({
    data: {
      briefId: brief.id,
      description:
        "Trim any single mega-cap technology position that has grown to exceed 8% of total " +
        "equity exposure, to actively manage the concentration risk flagged above.",
      actionType: "REDUCE",
      displayOrder: 2,
    },
  });

  await prisma.recommendedAction.create({
    data: {
      briefId: brief.id,
      description:
        "Monitor credit spreads and rate-path signals for the reversal scenario described in Primary Risks.",
      actionType: "WATCH",
      displayOrder: 3,
    },
  });

  await prisma.recommendedAction.create({
    data: {
      briefId: brief.id,
      description:
        "Deploy 2-3% of current cash position into US Equities per the allocation targets below.",
      actionType: "REBALANCE",
      displayOrder: 4,
    },
  });

  // --- Recommended Allocation ---------------------------------------------
  const allocations: { category: string; targetPercent: number }[] = [
    { category: "US Equities", targetPercent: 58 },
    { category: "International Equities", targetPercent: 14 },
    { category: "Bonds", targetPercent: 16 },
    { category: "Cash", targetPercent: 8 },
    { category: "Alternatives", targetPercent: 4 },
  ];

  for (const allocation of allocations) {
    await prisma.allocationTarget.create({ data: { briefId: brief.id, ...allocation } });
  }

  console.log(`Seeded Brief ${brief.id} for ${user.name} (${BRIEF_DATE.toDateString()}).`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
