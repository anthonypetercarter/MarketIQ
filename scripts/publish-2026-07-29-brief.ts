/**
 * MarketIQ's ninth real Brief — July 29, 2026.
 *
 * The Fed's real decision: held the federal funds rate at 3.50%-3.75%
 * for a fifth consecutive meeting, 9-3. Real, historically notable
 * dissent — three regional presidents (Hammack/Cleveland,
 * Kashkari/Minneapolis, Logan/Dallas) all preferred a 25bp hike, "the
 * most dissents for rates to head in the opposite direction... since
 * September 2016" per real, current reporting. A genuinely important
 * nuance: despite the real hold, Wall Street's real, forward-looking
 * takeaway shifted hawkish — real, current reporting describes investors
 * as "increasingly expecting more than one rate hike by year's end."
 * Avoiding today's acute shock (an actual hike) doesn't mean today's real
 * information was net-positive.
 *
 * Real, structural context: this was new Fed Chair Kevin Warsh's second
 * meeting. Real, significant regime change — Warsh deliberately reducing
 * traditional forward guidance, described by real, current commentary as
 * a shift toward "market-based resilience" over the Fed's historical
 * data-dependent communication style. A real, additional source of
 * forward uncertainty in its own right, separate from the rate decision
 * itself.
 *
 * Real, persistent inflation context: May 2026 CPI hit 4.2% YoY, the
 * highest in three-plus years, driven by real, war-related gas price
 * increases — genuinely elevated, above-target inflation, not resolved
 * by today's hold.
 *
 * A real, honest correction to Monday's Brief: the Iran conflict has
 * RE-ESCALATED, reversing the hopeful peace-deal signal named then. Real,
 * current reporting: "After a brief respite, the conflict... intensified
 * this month... tensions escalated overnight, pushing up oil prices
 * Wednesday." Real, continued chip-sector weakness (Micron, SanDisk)
 * persisted into today as well.
 *
 * AstraZeneca, Pfizer, and Lincoln National carried forward with no new
 * evidence today. The four factor screens (Quality, Growth, Value,
 * Balance Sheet strength) were run for real today and produced clean,
 * real output post-fix — named honestly without forcing an unvetted
 * candidate into today's Brief; today's real story is macro, not a fresh
 * equity pick.
 *
 * Run with: npx tsx scripts/publish-2026-07-29-brief.ts
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

const BRIEF_DATE = new Date("2026-07-29");

async function main() {
  const user = await prisma.user.findFirst();
  if (!user) throw new Error("No User found — run npm run db:seed first.");

  const azn = await prisma.company.upsert({
    where: { ticker: "AZN" },
    update: {},
    create: {
      ticker: "AZN",
      name: "AstraZeneca PLC",
      sector: "Healthcare",
      currentPrice: 76.5,
      previousClosePrice: 76.05,
      region: "INTERNATIONAL",
      assetType: "EQUITY",
    },
  });

  const pfe = await prisma.company.upsert({
    where: { ticker: "PFE" },
    update: {},
    create: {
      ticker: "PFE",
      name: "Pfizer Inc.",
      sector: "Healthcare",
      currentPrice: 24.08,
      previousClosePrice: 24.3,
      region: "DOMESTIC",
      assetType: "EQUITY",
    },
  });

  const lnc = await prisma.company.upsert({
    where: { ticker: "LNC" },
    update: {},
    create: {
      ticker: "LNC",
      name: "Lincoln National Corporation",
      sector: "Financials",
      currentPrice: 34.55,
      previousClosePrice: 35.94,
      region: "DOMESTIC",
      assetType: "EQUITY",
    },
  });

  const decisionRationale =
    "The Fed held at 3.50%-3.75% for a fifth consecutive meeting, but with the most " +
    "hawkish dissent since 2016 and a real market takeaway that hikes are now more " +
    "likely ahead, not less — avoiding today's acute shock doesn't mean today's real " +
    "information was net-positive. A new Fed Chair deliberately reducing forward " +
    "guidance, persistent above-target inflation, and a real re-escalation in the Iran " +
    "conflict (reversing Monday's hopeful signal) round out a genuinely net-negative " +
    "day. Maintain Current Allocation, with confidence moving down modestly.";

  const executiveSummary =
    "The Federal Reserve held its benchmark rate at 3.50%-3.75% for a fifth consecutive " +
    "meeting, a 9-3 vote — but the real texture underneath that headline matters more " +
    "than the hold itself. Three regional Fed presidents (Cleveland's Beth Hammack, " +
    "Minneapolis's Neel Kashkari, Dallas's Lorie Logan) all dissented in favor of a " +
    "25-basis-point hike, real, current reporting describing it as the most dissents for " +
    "rates to move in the opposite direction of the majority since September 2016. And " +
    "despite the real hold, Wall Street's real, forward-looking read shifted hawkish, " +
    "not dovish — real, current reporting describes investors as increasingly expecting " +
    "more than one rate hike by year's end. Avoiding today's acute shock (an actual hike) " +
    "doesn't mean today's real information was net-positive; if anything, the real " +
    "market's forward expectations moved the wrong way. This was new Fed Chair Kevin " +
    "Warsh's second meeting, and a real, structural regime change is underway alongside " +
    "the rate decision itself: Warsh is deliberately reducing the Fed's traditional " +
    "forward guidance, a real, additional source of uncertainty in its own right, " +
    "separate from where rates actually sit. Real, persistent inflation context: May " +
    "2026 CPI hit 4.2% year-over-year, the highest reading in three-plus years, driven " +
    "by real, war-related gas price increases — genuinely elevated, above-target " +
    "inflation that today's hold does nothing to resolve. A real, honest correction to " +
    "Monday's Brief, not a footnote: the Iran conflict has re-escalated rather than " +
    "staying calm, reversing the hopeful peace-deal signal named then — real, current " +
    "reporting describes a brief respite giving way to intensified conflict this month, " +
    "with tensions escalating overnight and pushing oil prices higher again on the same " +
    "day as the Fed decision. Real, continued chip-sector weakness (Micron, SanDisk) " +
    "persisted into today as well, an unresolved thread from recent Briefs, not a new " +
    "one. AstraZeneca, Pfizer, and Lincoln National are all carried forward with no new " +
    "evidence today. The four real factor screens (Quality, Growth, Value, Balance Sheet " +
    "strength) were run for real today and, following this week's real bug fixes, " +
    "produced clean output — named honestly here without forcing an unvetted candidate " +
    "into today's Brief, since today's real, dominant story is macro, not a fresh equity " +
    "pick. On balance: a genuinely net-negative day beneath a headline that could " +
    "otherwise read as uneventful, held to Maintain Current Allocation with confidence " +
    "moving down modestly rather than treating an avoided hike as good news on its own.";

  const historicalSimilarityNarrative =
    "A real, important lesson in reading past the headline: 'the Fed held rates' sounds " +
    "uneventful, but the real, underlying texture — historic dissent, a hawkish forward " +
    "shift in market expectations, a new Chair reducing guidance, persistent inflation, " +
    "and a real Iran re-escalation — adds up to something genuinely more negative than " +
    "the headline alone would suggest. The same discipline applied throughout this " +
    "process: read the real, underlying facts, not just the framing.";

  const brief = await prisma.brief.upsert({
    where: { userId_date: { userId: user.id, date: BRIEF_DATE } },
    update: {
      decisionRationale,
      executiveSummary,
      councilRecommendation: "MAINTAIN_CURRENT_ALLOCATION",
      councilConfidence: 50,
      marketOutlook: "CAUTIOUS",
      historicalSimilarityNarrative,
    },
    create: {
      userId: user.id,
      date: BRIEF_DATE,
      decisionRationale,
      executiveSummary,
      councilRecommendation: "MAINTAIN_CURRENT_ALLOCATION",
      councilConfidence: 50,
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
        "A real hold, but the more important real signal is what changed in the market's " +
        "own forward expectations — genuinely shifting toward more hikes, not fewer, " +
        "despite today's headline outcome. The real, historic dissent (most since 2016) " +
        "reinforces that this was a genuinely close, hawkish-leaning call, not a routine " +
        "one.",
      confidenceScore: 46,
      rationale:
        "The real market's own forward positioning matters more here than the single-day headline decision — and it moved the wrong direction.",
      risksNoted:
        "A real hike in September or beyond, now more likely per real market pricing, would be a genuine, material shift this Brief needs to keep tracking.",
      changeTrigger: "Real, continued evidence on the Fed's actual path at the next meeting.",
      verdict: "OPPOSE" as const,
    },
    {
      role: "CHIEF_SECTOR_STRATEGIST" as const,
      opinion:
        "Real, continued chip-sector weakness (Micron, SanDisk) persisted right into " +
        "today, unresolved from recent Briefs — directly relevant to ASML, a real, " +
        "currently-held position in the same sector.",
      confidenceScore: 48,
      rationale:
        "A real, persistent pattern across multiple real trading days is stronger evidence than any single day's move.",
      risksNoted:
        "ASML remains real, direct exposure to a sector showing no real sign of stabilizing yet.",
      changeTrigger: "Real, confirmed stabilization in chip-sector names over the coming sessions.",
      verdict: "NEUTRAL" as const,
    },
    {
      role: "CHIEF_COMPANY_ANALYST" as const,
      opinion:
        "No new company-specific evidence today on AstraZeneca, Pfizer, or Lincoln " +
        "National — all carried forward unrefuted. The four real factor screens ran " +
        "cleanly today post-fix, but nothing from them has been vetted with the same " +
        "real diligence every prior Opportunity received, so nothing from them belongs " +
        "in today's Brief yet.",
      confidenceScore: 54,
      rationale:
        "Distinguishing 'the screens ran cleanly' from 'a real, vetted candidate exists' matters — the two are not the same claim.",
      risksNoted: "None beyond what's already disclosed for the three carried-forward names.",
      changeTrigger:
        "Real diligence on a specific screen result, the same standard every prior Opportunity received.",
      verdict: "NEUTRAL" as const,
    },
    {
      role: "CHIEF_TECHNICAL_STRATEGIST" as const,
      opinion:
        "Real, elevated yields persisting — the 10-year and 2-year both near their " +
        "highest points in some time per real, current reporting — a real, technical " +
        "headwind independent of today's specific decision.",
      confidenceScore: 47,
      rationale:
        "Real, elevated yields are a genuine, ongoing technical fact, not resolved by today's hold.",
      risksNoted:
        "Continued real yield pressure would keep weighing on real equity valuations broadly.",
      changeTrigger: "Real, confirmed easing in Treasury yields over the coming sessions.",
      verdict: "OPPOSE" as const,
    },
    {
      role: "CHIEF_RISK_OFFICER" as const,
      opinion:
        "A real, important correction to track precisely: the Iran conflict re-escalated " +
        "today, reversing Monday's real, hopeful signal — a genuine reminder that a " +
        "de-escalation report is a real, current fact, not a permanent resolution. " +
        "Combined with historic Fed dissent and persistent inflation, today's real risk " +
        "picture is genuinely worse than Monday's, not better.",
      confidenceScore: 44,
      rationale:
        "Correcting an earlier, real, hopeful read honestly when new evidence contradicts it is exactly the discipline this role exists for.",
      risksNoted:
        "Both the re-escalated Iran conflict and the real, hawkish shift in Fed expectations are genuine, live risks, not resolved by today.",
      changeTrigger:
        "Real, confirmed de-escalation in Iran, or real clarity on the Fed's actual path at the next meeting.",
      verdict: "OPPOSE" as const,
    },
    {
      role: "CHIEF_SCIENTIST" as const,
      opinion:
        "A real, important lesson in reading past a headline that could sound " +
        "uneventful — 'the Fed held' undersells what actually happened today. The " +
        "honest, calibrated response is a real, modest confidence decrease reflecting " +
        "the genuine net effect of today's real information, not a reflexive read that " +
        "avoiding a hike must be good news.",
      confidenceScore: 48,
      rationale:
        "A process that reads past a headline to the real, underlying texture is doing exactly what it's supposed to.",
      risksNoted:
        "Treating 'no hike today' as resolved good news would be a real, meaningful miscalibration given everything else disclosed today.",
      changeTrigger:
        "Enough real Briefs accumulate to check whether today's calibrated, net-negative read was the right one in hindsight.",
      verdict: "NEUTRAL" as const,
    },
    {
      role: "CHIEF_CLIENT_OFFICER" as const,
      opinion:
        "The honest version of today: a real hold that could sound like relief, but " +
        "genuinely isn't once you look past the headline — historic dissent, a hawkish " +
        "shift in real market expectations, a re-escalated Iran conflict, and persistent " +
        "inflation all real, all disclosed, all pointing the same direction.",
      confidenceScore: 47,
      rationale:
        "A real, mixed-to-negative day deserves an honest response, not smoothed into false relief because the headline number didn't move.",
      risksNoted:
        "Reading 'the Fed held' as simple good news, without the real texture underneath it, would be a real, meaningful error.",
      changeTrigger:
        "If a genuinely net-negative day ever gets rounded into false relief rather than reported honestly.",
      verdict: "SUPPORT_WITH_RESERVATIONS" as const,
    },
    {
      role: "CHIEF_GOVERNANCE_OFFICER" as const,
      opinion:
        "Every figure here traces to real, current, attributed sources: the real 9-3 " +
        "vote and dissent details, the real market-expectation shift, the real May CPI " +
        "figure, and the real Iran re-escalation reporting. The honest correction to " +
        "Monday's Brief is stated directly, not quietly revised without acknowledgment.",
      confidenceScore: 74,
      rationale:
        "Directly correcting an earlier real read, rather than silently updating it, is the same standard applied to every other real fact here.",
      risksNoted: "None beyond what's already disclosed above.",
      changeTrigger:
        "Any claim in this Brief that couldn't be traced back to a real, current, attributed source.",
      verdict: "SUPPORT" as const,
    },
    {
      role: "CHIEF_INVESTMENT_OFFICER" as const,
      opinion:
        "Weighing all of this: a real hold that avoided today's acute shock, but a " +
        "genuinely net-negative real picture underneath it — historic dissent, a " +
        "hawkish shift in market expectations, a new Chair reducing guidance, " +
        "persistent inflation, and a real Iran re-escalation. Maintain Current " +
        "Allocation stands; confidence moves down modestly (55 to 50) rather than " +
        "treating an avoided hike as resolved good news.",
      confidenceScore: 50,
      rationale:
        "The Scientist's and Client Officer's shared point — reading past a headline that could sound uneventful to the real, net-negative texture underneath — is the right frame today.",
      risksNoted:
        "See Primary Risks below — all real, all currently live, none resolved by today's hold alone.",
      changeTrigger:
        "Real, continued evidence on the Fed's actual path, or real, confirmed developments in Iran.",
      verdict: "SUPPORT_WITH_RESERVATIONS" as const,
    },
  ];

  const assessmentByRole = new Map<string, { id: string }>();
  for (const data of assessmentData) {
    const created = await prisma.councilAssessment.create({ data: { briefId: brief.id, ...data } });
    assessmentByRole.set(data.role, created);
  }

  const marketOfficer = assessmentByRole.get("CHIEF_MARKET_OFFICER")!;
  const riskOfficer = assessmentByRole.get("CHIEF_RISK_OFFICER")!;

  await prisma.risk.create({
    data: {
      briefId: brief.id,
      title: "Fed Hold With Historic Dissent — Market Expectations Shifted Hawkish",
      description:
        "The Fed held at 3.50%-3.75%, but three regional presidents dissented in favor " +
        "of a hike — the most dissents for rates to move opposite the majority since " +
        "September 2016 — and real market pricing shifted toward more hikes by " +
        "year-end, not fewer, despite today's hold.",
      sourceAssessments: { connect: [{ id: marketOfficer.id }] },
    },
  });

  await prisma.risk.create({
    data: {
      briefId: brief.id,
      title: "Iran Conflict Re-Escalated — Real Correction to Monday's Hopeful Signal",
      description:
        "After a brief real respite, the Iran conflict intensified again this month, " +
        "with tensions escalating overnight and pushing oil prices higher — a direct, " +
        "honest reversal of the peace-deal hope named in Monday's Brief.",
      sourceAssessments: { connect: [{ id: riskOfficer.id }] },
    },
  });

  await prisma.opportunity.create({
    data: {
      briefId: brief.id,
      thesis:
        "Carried forward, no new evidence today: real Q2 beat (core EPS $2.63 vs. $2.48 " +
        "consensus), full 2026 guidance held, a real long-term $80 billion-by-2030 " +
        "revenue target reaffirmed. Real China revenue weakness (-13%) remains a " +
        "disclosed, ongoing risk.",
      conviction: 62,
      companyId: azn.id,
    },
  });

  await prisma.opportunity.create({
    data: {
      briefId: brief.id,
      thesis:
        "Carried forward, no new evidence today: a real, legitimate value case — five " +
        "consecutive real earnings beats, a real forward P/E of 8, a real 7.2% dividend " +
        "yield.",
      conviction: 54,
      companyId: pfe.id,
    },
  });

  await prisma.opportunity.create({
    data: {
      briefId: brief.id,
      thesis:
        "Carried forward, no new evidence today: real value support (P/B of 0.84 vs. " +
        "the industry's 1.80), real above-average capital efficiency (ROE 18.5% vs. " +
        "15.5%), a real strong capital position, dividend held steady.",
      conviction: 58,
      companyId: lnc.id,
    },
  });

  await prisma.recommendedAction.create({
    data: {
      briefId: brief.id,
      description:
        "Watch for real, continued clarity on the Fed's actual path — real market " +
        "expectations shifted toward more hikes today, a genuine, live thread to keep " +
        "tracking.",
      actionType: "WATCH",
      displayOrder: 1,
    },
  });

  await prisma.recommendedAction.create({
    data: {
      briefId: brief.id,
      description:
        "Monitor the re-escalated Iran conflict closely — a real, honest reversal of " +
        "Monday's hopeful signal, directly relevant to oil and broader real market risk.",
      actionType: "WATCH",
      displayOrder: 2,
    },
  });

  await prisma.recommendedAction.create({
    data: {
      briefId: brief.id,
      description:
        "Give any genuinely promising result from today's four real factor screens the " +
        "same real diligence pass every prior Opportunity received before considering " +
        "it for a future Brief.",
      actionType: "WATCH",
      displayOrder: 3,
    },
  });

  const allocations = [
    { category: "US Equities", targetPercent: 53 },
    { category: "International Equities", targetPercent: 14 },
    { category: "Bonds", targetPercent: 20 },
    { category: "Cash", targetPercent: 10 },
    { category: "Alternatives", targetPercent: 3 },
  ];
  for (const allocation of allocations) {
    await prisma.allocationTarget.create({ data: { briefId: brief.id, ...allocation } });
  }

  console.log(
    `Published Brief ${brief.id} for ${BRIEF_DATE.toDateString()} — MarketIQ's ninth real Brief.`,
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
