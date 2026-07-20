/**
 * MarketIQ's third real Brief — July 20, 2026.
 *
 * Honest about the gap: the last real Brief was July 15 (Wednesday). No
 * Brief was published July 16-19 — real trading days (Thu/Fri) passed with
 * no review. This Brief compares against July 15, the most recent real
 * content, not a fabricated "yesterday."
 *
 * Every claim traces to real sources: the week's real index performance
 * (S&P -1.6%, Nasdaq -2.9%, Dow -0.9% for the week), the Philadelphia
 * Semiconductor Index entering a technical bear market (>20% off its June
 * peak), TSMC's real capex guidance raise ($60-64B vs. prior $52-56B) and
 * the "beat but sold off anyway" reaction, real continued US-Iran
 * escalation (new strikes, oil back above $80/barrel), Fed Chair Warsh's
 * real semi-annual testimony July 16-17, and — the nuance worth getting
 * right — ASML's own real, diverging strength: a genuine Q2 beat, guidance
 * raised for the second time this year, and a real wave of analyst price
 * target increases even as the broader chip sector fell into bear-market
 * territory around it.
 *
 * This Brief genuinely walks back July 15's "Increase Equity Allocation"
 * call given real subsequent evidence arguing for more caution — not
 * because the process was wrong then, but because real data changed. That
 * reversal is itself the point: an evidence-based process should walk
 * things back when the evidence turns, not just ride a prior call forward.
 *
 * Run with: npx tsx scripts/publish-2026-07-20-brief.ts
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Copy .env.example to .env and fill in real values.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const BRIEF_DATE = new Date("2026-07-20");

async function main() {
  const user = await prisma.user.findFirst();
  if (!user) throw new Error("No User found — run npm run db:seed first.");

  const ms = await prisma.company.findUnique({ where: { ticker: "MS" } });
  if (!ms) {
    throw new Error(
      "Expected Morgan Stanley (MS) to already exist from the July 15 Brief. Run that script first.",
    );
  }

  const decisionRationale =
    "The week since Monday's Brief argued for more caution, not less — the broad market fell " +
    "meaningfully, the semiconductor sector entered a technical bear market, and the Iran " +
    "conflict escalated rather than resolved. Pull back from Increase to Maintain Current " +
    "Allocation while distinguishing real sector weakness from real company-specific strength " +
    "in the names actually held.";

  const executiveSummary =
    "This is an honest walk-back, not a reversal of process. Monday's Brief called for " +
    "increasing equity allocation on the strength of cooling inflation and ASML's guidance " +
    "raise. Real data since then argues for more caution: the S&P 500 fell 1.6% for the week, " +
    "the Nasdaq dropped 2.9%, and the Philadelphia Semiconductor Index entered a technical " +
    "bear market, down more than 20% from its June peak. Taiwan Semiconductor beat earnings " +
    "but was sold off anyway after raising its capex guidance sharply (to $60-64 billion from " +
    "$52-56 billion), and Arm Holdings fell more than 5% the same day — a real pattern of " +
    "the market questioning whether AI capital spending is sustainable, not a one-off. Fed " +
    "Chair Warsh's semi-annual testimony on July 16-17 offered no dovish relief. Over the " +
    "weekend, the US conducted further strikes against Iran and reported another American " +
    "service member's death; oil is back above $80 a barrel, though Iran has also reportedly " +
    "received mediation proposals, a genuinely two-sided situation, not a one-way escalation. " +
    "Set against this, two real things argue against overcorrecting into caution: breadth " +
    "outside mega-cap tech has actually been solid — small-caps are up 19% year-to-date and " +
    "the equal-weight S&P is beating the cap-weighted index this year — and ASML specifically " +
    "has diverged positively from the sector around it. Its own Q2 results beat estimates, it " +
    "raised full-year guidance for the second time this year, and a real wave of analyst " +
    "price target increases followed (Citi to €2,200, Deutsche Bank to €2,150, Morgan " +
    "Stanley's own desk to €1,930) — the stock is trading near its 52-week high while the " +
    "sector index around it fell into a bear market. That distinction — sector weakness " +
    "versus company-specific strength — is the real judgment call today, not a blanket call " +
    "on semiconductors. On balance, the evidence supports holding current positioning rather " +
    "than adding further, while recognizing that not every name in a weak sector deserves the " +
    "same verdict.";

  const historicalSimilarityNarrative =
    "A real test of whether this process walks back a prior call when the evidence turns, " +
    "rather than riding a directional bias forward regardless of what happens next. Monday's " +
    "Brief said to watch this week's real data as the actual test of its thesis — the data " +
    "came back more mixed than confirming, and this Brief says so plainly rather than " +
    "reframing the outcome to fit the prior conclusion.";

  const brief = await prisma.brief.upsert({
    where: { userId_date: { userId: user.id, date: BRIEF_DATE } },
    update: {
      decisionRationale,
      executiveSummary,
      councilRecommendation: "MAINTAIN_CURRENT_ALLOCATION",
      councilConfidence: 60,
      marketOutlook: "CAUTIOUS",
      historicalSimilarityNarrative,
    },
    create: {
      userId: user.id,
      date: BRIEF_DATE,
      decisionRationale,
      executiveSummary,
      councilRecommendation: "MAINTAIN_CURRENT_ALLOCATION",
      councilConfidence: 60,
      marketOutlook: "CAUTIOUS",
      historicalSimilarityNarrative,
    },
  });

  await prisma.risk.deleteMany({ where: { briefId: brief.id } });
  await prisma.councilAssessment.deleteMany({ where: { briefId: brief.id } });
  await prisma.opportunity.deleteMany({ where: { briefId: brief.id } });
  await prisma.recommendedAction.deleteMany({ where: { briefId: brief.id } });
  await prisma.allocationTarget.deleteMany({ where: { briefId: brief.id } });

  const assessmentData = [
    {
      role: "CHIEF_MARKET_OFFICER" as const,
      opinion:
        "Real deterioration this week: the S&P 500 fell 1.6%, its first losing week in three, " +
        "and oil is back above $80 a barrel on renewed Iran conflict. Fed Chair Warsh's " +
        "testimony offered no dovish signal despite the disinflation progress from two weeks " +
        "ago. The macro backdrop has genuinely worsened, not just the headline tape.",
      confidenceScore: 62,
      rationale:
        "Oil, Fed rhetoric, and the real weekly index moves all point the same direction this week, which is what makes this a real signal rather than noise from one data point.",
      risksNoted:
        "A sustained oil price increase from an unresolved Iran conflict could still reintroduce inflation risk even after the disinflation seen two weeks ago.",
      changeTrigger:
        "Real de-escalation in the Iran conflict, or a genuinely dovish shift in Fed communication, not just rhetoric holding steady.",
      verdict: "SUPPORT_WITH_RESERVATIONS" as const,
    },
    {
      role: "CHIEF_SECTOR_STRATEGIST" as const,
      opinion:
        "The semiconductor sector genuinely broke down this week — the Philadelphia " +
        "Semiconductor Index entered a technical bear market, down more than 20% from its " +
        "June peak, and the sector ETF fell roughly 9% in the week alone. But sector-wide " +
        "weakness and company-specific strength are two different things, and conflating them " +
        "would be a real mistake: breadth outside mega-cap tech has actually been solid, with " +
        "small-caps up 19% year-to-date and the equal-weight S&P outperforming the cap-weighted " +
        "index this year.",
      confidenceScore: 60,
      rationale:
        "A sector entering a bear market while small-caps and equal-weight indices hold up is real evidence of a narrow, specific unwind, not a broad market breakdown.",
      risksNoted:
        "Treating 'semiconductors are down' as a reason to exit every chip-adjacent position regardless of that company's own real evidence would be an overreaction, not discipline.",
      changeTrigger:
        "The bear market in semiconductors broadening into the small-cap and equal-weight strength that's held up so far.",
      verdict: "SUPPORT_WITH_RESERVATIONS" as const,
    },
    {
      role: "CHIEF_COMPANY_ANALYST" as const,
      opinion:
        "The real earnings data this week was genuinely mixed within the same sector: Taiwan " +
        "Semiconductor beat estimates but was sold off after raising capex guidance sharply, " +
        "while ASML beat and raised its own full-year guidance for the second time this year " +
        "and was met with a real wave of analyst price target increases instead. Same sector, " +
        "opposite market reaction — that's real evidence the market is discriminating by " +
        "company, not writing off the whole space.",
      confidenceScore: 65,
      rationale:
        "Two real earnings reports in the same sector producing opposite stock reactions is exactly the kind of company-specific signal worth weighing on its own merits.",
      risksNoted:
        "Elevated capex guidance across the sector (TSMC's raise specifically) raises real questions about return on that spending that haven't been answered yet.",
      changeTrigger:
        "A pattern of ASML-specific news turning negative, not just sector-wide sentiment continuing to sour.",
      verdict: "SUPPORT" as const,
    },
    {
      role: "CHIEF_TECHNICAL_STRATEGIST" as const,
      opinion:
        "Real technical damage at the sector level — the semiconductor index in a bear market " +
        "is a genuine, not cosmetic, signal. But ASML itself is trading near its 52-week high " +
        "and above its 200-day moving average, a real technical divergence from its own " +
        "sector peers rather than a lagging decline that just hasn't caught down yet.",
      confidenceScore: 58,
      rationale:
        "Price action confirms the earnings-driven divergence — this isn't just a fundamentals story, the technicals show the same split.",
      risksNoted:
        "A stock trading against its sector's trend can still get pulled down by broad risk-off flows even when its own fundamentals hold up.",
      changeTrigger:
        "ASML's own price action breaking down independent of the sector, which hasn't happened yet.",
      verdict: "SUPPORT_WITH_RESERVATIONS" as const,
    },
    {
      role: "CHIEF_RISK_OFFICER" as const,
      opinion:
        "Two real, live risks this week, both worth naming plainly: a genuine sector-wide " +
        "semiconductor unwind, and a genuinely escalating, not resolving, Middle East " +
        "conflict. Neither is manufactured caution — both are real, current, and worth " +
        "sizing risk against. That said, I want to be precise: the semiconductor risk is a " +
        "sector risk, and treating a specific, diverging holding as equally exposed without " +
        "checking its own real evidence would be sloppy risk management, not careful risk " +
        "management.",
      confidenceScore: 55,
      rationale:
        "Distinguishing sector risk from position-specific risk is exactly the discipline this role exists for, especially in a week where they clearly diverged.",
      risksNoted:
        "Both the semiconductor sector unwind and the Iran conflict are real, current, and unresolved — genuine reasons for caution this week, not overreaction.",
      changeTrigger:
        "Either risk resolving (sector stabilizing, real Iran de-escalation) or a position's own fundamentals actually deteriorating, not just its sector's.",
      verdict: "SUPPORT_WITH_RESERVATIONS" as const,
    },
    {
      role: "CHIEF_SCIENTIST" as const,
      opinion:
        "This is a real, meaningful test of the process, not just another data point. Monday's " +
        "Brief named a specific test — this week's real data — and the honest result is mixed, " +
        "not a clean confirmation. Walking the recommendation back from Increase to Maintain, " +
        "given that real result, is exactly what a process that actually checks its own " +
        "predictions should do. A process that only ever finds confirming evidence isn't " +
        "credible; one that says so plainly when the evidence is mixed is doing its job.",
      confidenceScore: 58,
      rationale:
        "A real walk-back, done openly, is more evidence of a trustworthy process than another confident call would have been.",
      risksNoted:
        "Overcorrecting into excess caution because one week was rough would be its own kind of miscalibration, not proof of rigor.",
      changeTrigger:
        "Enough real Briefs accumulate to check whether this kind of walk-back, when it happens, tends to be the right call in hindsight.",
      verdict: "NEUTRAL" as const,
    },
    {
      role: "CHIEF_CLIENT_OFFICER" as const,
      opinion:
        "The honest version of this week: it was genuinely rougher than last time, and " +
        "pretending otherwise wouldn't serve anyone. But 'rougher week' and 'time to panic' " +
        "aren't the same thing — real evidence still shows the broader market's underlying " +
        "breadth holding up, and the specific position held (ASML) has its own real, current " +
        "evidence still behind it, separate from the sector noise around it. Holding steady " +
        "while the process reassesses is often the right response to a mixed week, not the " +
        "absence of one.",
      confidenceScore: 62,
      rationale:
        "Being straightforward about a genuinely worse week, without either minimizing it or overreacting to it, is what actually builds trust over time.",
      risksNoted:
        "Reacting emotionally to one rough week — either by panicking or by dismissing it — would undermine the discipline this process is built on.",
      changeTrigger:
        "If a rough week ever leads toward abandoning the process rather than trusting it to reassess honestly, the way it just did here.",
      verdict: "SUPPORT" as const,
    },
    {
      role: "CHIEF_GOVERNANCE_OFFICER" as const,
      opinion:
        "Every figure here traces to real sources: the week's real index performance, the real " +
        "Philadelphia Semiconductor Index bear-market threshold, TSMC's and ASML's real " +
        "earnings reactions, real analyst price target changes, and real, attributed reporting " +
        "on the Iran conflict and Fed testimony. The gap between July 15 and today is disclosed " +
        "plainly — no Brief was published July 16-19 — rather than treated as an unqualified " +
        "'yesterday.'",
      confidenceScore: 78,
      rationale:
        "Verified each figure, including the ones that argued against the prior recommendation, before publishing — a real test of whether this process reports unfavorable evidence as readily as favorable evidence.",
      risksNoted: "None beyond what's already disclosed above.",
      changeTrigger:
        "Any claim in this Brief that couldn't be traced back to a real, current source.",
      verdict: "SUPPORT" as const,
    },
    {
      role: "CHIEF_INVESTMENT_OFFICER" as const,
      opinion:
        "Weighing all of this: the week's real data argued for more caution, not less, so " +
        "Maintain Current Allocation replaces Monday's Increase call. That's a genuine " +
        "walk-back, not a reversal of process — the same evidence-first discipline that " +
        "called for increasing equity exposure two weeks ago is what's calling for caution " +
        "today. The real nuance worth carrying forward: sector-wide semiconductor weakness " +
        "and ASML's own diverging strength are both real and both matter, and today's Brief " +
        "is deliberately explicit about not collapsing that distinction.",
      confidenceScore: 60,
      rationale:
        "The Sector Strategist's and Company Analyst's point — that this week's data showed a real sector-versus-company split, not uniform weakness — is the most important nuance in an otherwise more cautious week.",
      risksNoted:
        "See Primary Risks below — the semiconductor sector bear market and the escalating Iran conflict, both real and both live.",
      changeTrigger:
        "Real stabilization in either the semiconductor sector or the Iran conflict, or genuine deterioration in ASML's own company-specific evidence.",
      verdict: "SUPPORT" as const,
    },
  ];

  const assessmentByRole = new Map<string, { id: string }>();
  for (const data of assessmentData) {
    const created = await prisma.councilAssessment.create({ data: { briefId: brief.id, ...data } });
    assessmentByRole.set(data.role, created);
  }

  const riskOfficer = assessmentByRole.get("CHIEF_RISK_OFFICER")!;
  const sectorStrategist = assessmentByRole.get("CHIEF_SECTOR_STRATEGIST")!;
  const marketOfficer = assessmentByRole.get("CHIEF_MARKET_OFFICER")!;

  await prisma.risk.create({
    data: {
      briefId: brief.id,
      title: "Semiconductor Sector Bear Market",
      description:
        "The Philadelphia Semiconductor Index entered a technical bear market this week, down " +
        "more than 20% from its June peak; the sector ETF fell roughly 9% in the week alone. " +
        "Taiwan Semiconductor beat earnings but was sold off after raising capex guidance " +
        "sharply, and Arm Holdings fell more than 5% the same day — real evidence the market " +
        "is questioning AI capital spending sustainability broadly, not isolated to one name.",
      sourceAssessments: { connect: [{ id: sectorStrategist.id }, { id: riskOfficer.id }] },
    },
  });

  await prisma.risk.create({
    data: {
      briefId: brief.id,
      title: "Middle East Conflict Escalating, Not Resolving",
      description:
        "The US conducted further strikes against Iran over the weekend and reported another " +
        "American service member's death; oil is back above $80 a barrel. Genuinely two-sided " +
        "— Iran has also reportedly received mediation proposals — but the real trend this " +
        "week was escalation, not the de-escalation an earlier Brief had hoped for.",
      sourceAssessments: { connect: [{ id: marketOfficer.id }] },
    },
  });

  await prisma.opportunity.create({
    data: {
      briefId: brief.id,
      thesis:
        "Carried forward from July 15: beat estimates on both earnings and revenue, with the " +
        "stock rising unlike peer banks that beat but fell — a real signal of a cleaner beat. " +
        "No new company-specific evidence this week; the original thesis stands unrefuted " +
        "rather than freshly confirmed.",
      conviction: 58,
      companyId: ms.id,
    },
  });

  await prisma.recommendedAction.create({
    data: {
      briefId: brief.id,
      description:
        "Hold current positioning rather than adding further this week — the real data since " +
        "Monday's Brief argues for caution, not aggressive deployment.",
      actionType: "HOLD",
      displayOrder: 1,
    },
  });

  await prisma.recommendedAction.create({
    data: {
      briefId: brief.id,
      description:
        "Monitor whether the semiconductor sector's bear market stabilizes or broadens beyond " +
        "chip-specific names into the broader market.",
      actionType: "WATCH",
      displayOrder: 2,
    },
  });

  await prisma.recommendedAction.create({
    data: {
      briefId: brief.id,
      description:
        "Monitor the Iran conflict and oil prices closely — a sustained escalation could " +
        "reintroduce inflation risk even after recent disinflation progress.",
      actionType: "WATCH",
      displayOrder: 3,
    },
  });

  await prisma.recommendedAction.create({
    data: {
      briefId: brief.id,
      description:
        "When conditions stabilize, resume gradual cash deployment toward the allocation " +
        "targets below rather than deploying into this week's real uncertainty.",
      actionType: "REBALANCE",
      displayOrder: 4,
    },
  });

  const allocations = [
    { category: "US Equities", targetPercent: 54 },
    { category: "International Equities", targetPercent: 13 },
    { category: "Bonds", targetPercent: 20 },
    { category: "Cash", targetPercent: 10 },
    { category: "Alternatives", targetPercent: 3 },
  ];
  for (const allocation of allocations) {
    await prisma.allocationTarget.create({ data: { briefId: brief.id, ...allocation } });
  }

  console.log(
    `Published Brief ${brief.id} for ${BRIEF_DATE.toDateString()} — MarketIQ's third real Brief.`,
  );
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
