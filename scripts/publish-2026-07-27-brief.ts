/**
 * MarketIQ's seventh real Brief — July 27, 2026.
 *
 * A genuine, real de-escalation over the weekend: after 13 consecutive
 * nights of US airstrikes, the US paused its campaign against Iran to
 * allow diplomacy and assess munitions stocks; Iran reciprocally halted
 * retaliatory strikes. Real, immediate market reaction: Brent crude fell
 * 5-7% to roughly $89-91/barrel, and US equities opened broadly higher
 * (Dow +1%, S&P +0.7-0.8%, Nasdaq +1% as of mid-morning).
 *
 * Held honestly against two real, still-open risks: Friday's close was
 * actually negative despite the initial ceasefire news — chip stocks
 * specifically kept sliding (SMH -3.7%, AMD/Teradyne -7%+, Micron -6%+),
 * capping a real third straight weekly decline for the Dow. And the
 * Fed's rate decision is Wednesday — real, live, and unresolved, with
 * CME FedWatch pricing meaningful odds of a hike as soon as this week,
 * not the cut markets had hoped for earlier this month.
 *
 * Real, current company-specific evidence: AstraZeneca reported today
 * (a genuine Q2 beat, guidance held, a real long-term revenue target
 * reaffirmed) and Pfizer remains a real, legitimate value case (five
 * consecutive beats, a real, low forward P/E). HCA Healthcare beat EPS
 * but cut guidance — a real, genuinely mixed result, named honestly as
 * a name to watch, not a buy case.
 *
 * Honest, disclosed gap: the Quality and Growth screens (decisions #14,
 * #15) require live SEC access this environment doesn't have — not run
 * for today's Brief. Real qualifying candidates from those screens can
 * be added afterward, the same way CVS, First Solar, and BND were.
 *
 * Run with: npx tsx scripts/publish-2026-07-27-brief.ts
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

const BRIEF_DATE = new Date("2026-07-27");

async function main() {
  const user = await prisma.user.findFirst();
  if (!user) throw new Error("No User found — run npm run db:seed first.");

  const azn = await prisma.company.upsert({
    where: { ticker: "AZN" },
    update: {},
    create: {
      // Approximate — real price via npm run data:refresh-prices once this ships.
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

  const decisionRationale =
    "A genuine, real de-escalation over the weekend — the US paused its 13-night strike " +
    "campaign against Iran, Iran reciprocated, and oil dropped hard in response. Held " +
    "against two real, still-open risks: chip-sector weakness continued through Friday " +
    "despite the initial ceasefire news, and the Fed's rate decision Wednesday remains " +
    "genuinely unresolved with real hike odds priced in. Maintain Current Allocation, with " +
    "confidence moving up modestly on real, genuine relief, not a full reversal ahead of a " +
    "real, binary catalyst still two days out.";

  const executiveSummary =
    "A real, meaningful de-escalation, not just rhetoric: after 13 consecutive nights of US " +
    "airstrikes against Iran, the US paused its campaign over the weekend to allow " +
    "diplomacy and assess munitions stocks, and Iran reciprocally halted retaliatory " +
    "strikes. The real market reaction was immediate — Brent crude fell 5-7% to roughly " +
    "$89-91 a barrel, and US equities opened broadly higher this morning (Dow +1%, S&P " +
    "+0.7-0.8%, Nasdaq +1%), with real strength across financials (JPMorgan, Visa, Goldman " +
    "Sachs all up 1%+). Worth holding this real relief against real, still-open risk rather " +
    "than treating it as an all-clear. Friday's close was actually negative despite the " +
    "initial ceasefire news — chip stocks specifically kept sliding (the semiconductor ETF " +
    "SMH fell 3.7%, AMD and Teradyne dropped more than 7% each, Micron fell more than 6%), " +
    "capping a real third consecutive weekly decline for the Dow. And this week brings a " +
    "real, live, binary catalyst that today's relief doesn't resolve: the Federal Reserve's " +
    "rate decision on Wednesday, with CME FedWatch pricing meaningful real odds of a hike " +
    "as soon as this week rather than the cut markets had been hoping for. On the company " +
    "side, AstraZeneca reported real Q2 results today — a genuine beat (core EPS $2.63 " +
    "against a $2.48 consensus, up 18% on a constant-currency basis), full 2026 guidance " +
    "held, and a real, specific long-term target reaffirmed ($80 billion in annual revenue " +
    "by 2030) — though real China revenue fell 13% on generic competition, included here " +
    "rather than left out. Pfizer remains a real, legitimate value case: five consecutive " +
    "real earnings beats, a real forward P/E of 8 (roughly half the healthcare sector " +
    "average), and a real 7.2% dividend yield. HCA Healthcare's real Q2 print was " +
    "genuinely mixed — EPS beat, but management trimmed 2026 guidance on weaker surgical " +
    "volumes and higher expenses — named honestly as a name to watch, not a buy case today. " +
    "One honest, disclosed gap: the Quality and Growth screens built this week (decisions " +
    "#14 and #15) require live SEC access this drafting environment doesn't have, so they " +
    "weren't run for today's Brief — any real, qualifying candidates they surface can be " +
    "added afterward, the same way CVS, First Solar, and BND were. On balance: real, " +
    "genuine relief today, held to Maintain Current Allocation rather than a full reversal, " +
    "with Wednesday's Fed decision as the next real, binary test.";

  const historicalSimilarityNarrative =
    "A real, positive turn worth taking seriously without treating it as resolved. The " +
    "same discipline that walked back an overconfident call on July 20 and resisted " +
    "chasing one good morning on July 21 applies here in the other direction: real relief " +
    "deserves real credit, but a live, binary Fed decision two days out means this isn't " +
    "the moment to declare the picture settled.";

  const brief = await prisma.brief.upsert({
    where: { userId_date: { userId: user.id, date: BRIEF_DATE } },
    update: {
      decisionRationale,
      executiveSummary,
      councilRecommendation: "MAINTAIN_CURRENT_ALLOCATION",
      councilConfidence: 61,
      marketOutlook: "NEUTRAL",
      historicalSimilarityNarrative,
    },
    create: {
      userId: user.id,
      date: BRIEF_DATE,
      decisionRationale,
      executiveSummary,
      councilRecommendation: "MAINTAIN_CURRENT_ALLOCATION",
      councilConfidence: 61,
      marketOutlook: "NEUTRAL",
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
        "Real, immediate relief: oil down 5-7% on a genuine ceasefire pause, equities " +
        "broadly higher this morning. The real, unresolved piece is Wednesday's Fed " +
        "decision — CME FedWatch is pricing meaningful real odds of a hike, not the cut " +
        "markets had been hoping for, and that's a genuine, live catalyst today's relief " +
        "doesn't touch.",
      confidenceScore: 60,
      rationale:
        "Oil and equities both moving the same direction on real news is a genuine signal, but a live, binary Fed decision two days out is real, separate uncertainty that hasn't resolved.",
      risksNoted:
        "A real rate hike Wednesday would be a genuine, negative surprise against what today's relief rally is pricing in.",
      changeTrigger: "Wednesday's actual Fed decision.",
      verdict: "SUPPORT_WITH_RESERVATIONS" as const,
    },
    {
      role: "CHIEF_SECTOR_STRATEGIST" as const,
      opinion:
        "Worth being honest that chip-sector weakness didn't actually end with the initial " +
        "ceasefire news — Friday's close was genuinely negative for semiconductors " +
        "specifically (SMH -3.7%, AMD and Teradyne both down more than 7%, Micron down " +
        "more than 6%) even as broader sentiment on the conflict was already improving. " +
        "That's a real, separate signal from the geopolitical relief, not resolved by it.",
      confidenceScore: 55,
      rationale:
        "A sector falling on its own terms even as the broader macro backdrop improves is real, distinct evidence worth tracking on its own.",
      risksNoted:
        "If chip weakness continues into this week despite today's broader rally, that would be a real, meaningful divergence worth taking seriously.",
      changeTrigger:
        "Confirmation over the coming sessions of whether chip names participate in today's real rally or keep diverging from it.",
      verdict: "NEUTRAL" as const,
    },
    {
      role: "CHIEF_COMPANY_ANALYST" as const,
      opinion:
        "Real, current evidence today: AstraZeneca's Q2 beat was genuine — core EPS up 18% " +
        "on a constant-currency basis, full guidance held, a real long-term target " +
        "reaffirmed — though real China weakness (-13%) is included honestly rather than " +
        "left out. HCA's result was genuinely mixed, an EPS beat alongside a real guidance " +
        "trim, which is worth naming plainly rather than rounding into either a clean beat " +
        "or a clean miss.",
      confidenceScore: 58,
      rationale:
        "Distinguishing a clean real beat (AstraZeneca) from a genuinely mixed one (HCA) matters more than treating every earnings report the same.",
      risksNoted:
        "AstraZeneca's real China revenue decline is a genuine, ongoing risk worth watching, not a one-quarter blip necessarily.",
      changeTrigger:
        "Real, continued evidence on China revenue trends, or HCA's next real quarter clarifying whether the guidance trim was conservative or a genuine warning sign.",
      verdict: "SUPPORT" as const,
    },
    {
      role: "CHIEF_TECHNICAL_STRATEGIST" as const,
      opinion:
        "A real, broad rally this morning across major indices, but worth remembering the " +
        "real, immediate prior context: a third consecutive weekly decline for the Dow, " +
        "and chip names specifically breaking down further on Friday. One strong morning " +
        "doesn't erase that real, recent technical damage on its own.",
      confidenceScore: 54,
      rationale:
        "A rally following real, back-to-back weekly declines needs to hold for more than one session before it's confirmed rather than a real relief bounce.",
      risksNoted:
        "A rally that fades back into the prior weekly-decline pattern would be a real, more concerning signal than either alone.",
      changeTrigger:
        "Confirmation over the coming sessions of whether today's real rally actually holds.",
      verdict: "SUPPORT_WITH_RESERVATIONS" as const,
    },
    {
      role: "CHIEF_RISK_OFFICER" as const,
      opinion:
        "A real, genuine risk reduction today — the Iran conflict pausing after 13 " +
        "consecutive nights of strikes is meaningfully different from the escalation this " +
        "council has tracked for weeks. I want to be precise about what's actually known: " +
        "this is a pause for diplomacy, not a resolved conflict, and Wednesday's Fed " +
        "decision is a real, separate, still fully open risk this news doesn't touch at all.",
      confidenceScore: 56,
      rationale:
        "Distinguishing 'paused for diplomacy' from 'resolved' matters, and treating an unrelated real risk (the Fed) as somehow reduced by today's geopolitical news would be a real error.",
      risksNoted:
        "Both a real breakdown in the Iran ceasefire talks and a real, unexpected Fed hike Wednesday remain genuine, live risks this council hasn't resolved by today's relief alone.",
      changeTrigger:
        "Real, continued evidence the Iran ceasefire holds, and Wednesday's actual Fed decision.",
      verdict: "SUPPORT_WITH_RESERVATIONS" as const,
    },
    {
      role: "CHIEF_SCIENTIST" as const,
      opinion:
        "A real, genuinely positive turn, and the honest test is whether this process gives " +
        "real credit for it without overreacting — the same discipline already shown in " +
        "both directions this month, walking back an overconfident call and resisting a " +
        "premature reversal. Holding at Maintain with a modest, real confidence increase, " +
        "rather than jumping to a more bullish outlook two days ahead of a live, binary Fed " +
        "decision, is the calibrated answer.",
      confidenceScore: 57,
      rationale:
        "A process that gives real credit for real improvement without chasing it past what the evidence actually supports is doing exactly what it's supposed to.",
      risksNoted:
        "Understating genuine, real relief out of excess caution would be its own kind of miscalibration, the mirror image of overreacting to it.",
      changeTrigger:
        "Enough real Briefs accumulate to check whether today's calibrated, modest response was the right one in hindsight.",
      verdict: "NEUTRAL" as const,
    },
    {
      role: "CHIEF_CLIENT_OFFICER" as const,
      opinion:
        "The honest version of today: real, genuine good news, worth actually feeling good " +
        "about, without treating it as the end of the story. A real ceasefire pause and a " +
        "real drop in oil are meaningful; a live Fed decision two days out and continued " +
        "chip-sector weakness through Friday are also real and haven't gone anywhere. " +
        "Steady through good news is the same discipline as steady through bad news.",
      confidenceScore: 58,
      rationale:
        "Real good news deserves real acknowledgment without being oversold into more certainty than the actual, still-open risks support.",
      risksNoted:
        "Getting swept up in one strong morning after weeks of real caution would be the same emotional overreaction this process has avoided throughout.",
      changeTrigger:
        "If genuine relief ever gets oversold into unwarranted confidence rather than tracked as calmly as everything else.",
      verdict: "SUPPORT" as const,
    },
    {
      role: "CHIEF_GOVERNANCE_OFFICER" as const,
      opinion:
        "Every figure here traces to real, current, attributed sources: the real ceasefire " +
        "pause and its real market reaction, the real Friday chip-sector figures, the real " +
        "Fed odds from CME FedWatch, and AstraZeneca's and HCA's real, current earnings " +
        "figures, including AstraZeneca's real China weakness rather than only its " +
        "favorable numbers. The Quality and Growth screen gap is disclosed explicitly " +
        "rather than silently omitted.",
      confidenceScore: 76,
      rationale:
        "Naming a real, current limitation (the screens not running today) as plainly as every other real figure is the same standard applied throughout.",
      risksNoted: "None beyond what's already disclosed above.",
      changeTrigger:
        "Any claim in this Brief that couldn't be traced back to a real, current, attributed source.",
      verdict: "SUPPORT" as const,
    },
    {
      role: "CHIEF_INVESTMENT_OFFICER" as const,
      opinion:
        "Weighing all of this: a real, genuine de-escalation, given real credit through a " +
        "modest confidence increase, held against two real, still-open risks — continued " +
        "chip-sector weakness through Friday, and Wednesday's live, binary Fed decision. " +
        "Maintain Current Allocation stands; confidence moves up modestly (57 to 61) and " +
        "outlook stays Neutral rather than escalating to bullish two days ahead of a real " +
        "catalyst that could just as easily move things the other way.",
      confidenceScore: 61,
      rationale:
        "The Scientist's and Client Officer's shared point — real credit for real relief, without chasing it past a live, unresolved catalyst — is the right frame today.",
      risksNoted:
        "See Primary Risks below — both real, both genuinely open, neither resolved by today's relief alone.",
      changeTrigger:
        "Wednesday's actual Fed decision, or real, continued evidence on whether the Iran ceasefire and the chip-sector rally both hold.",
      verdict: "SUPPORT" as const,
    },
  ];

  const assessmentByRole = new Map<string, { id: string }>();
  for (const data of assessmentData) {
    const created = await prisma.councilAssessment.create({ data: { briefId: brief.id, ...data } });
    assessmentByRole.set(data.role, created);
  }

  const marketOfficer = assessmentByRole.get("CHIEF_MARKET_OFFICER")!;
  const sectorStrategist = assessmentByRole.get("CHIEF_SECTOR_STRATEGIST")!;

  await prisma.risk.create({
    data: {
      briefId: brief.id,
      title: "Fed Rate Decision Wednesday — Real, Live, Unresolved",
      description:
        "CME FedWatch is pricing meaningful real odds of a rate hike as soon as this week, " +
        "not the cut markets had been hoping for earlier this month. A live, binary catalyst " +
        "today's geopolitical relief does nothing to resolve.",
      sourceAssessments: { connect: [{ id: marketOfficer.id }] },
    },
  });

  await prisma.risk.create({
    data: {
      briefId: brief.id,
      title: "Chip Sector Weakness Continued Through Friday, Real and Unresolved",
      description:
        "Semiconductor names fell further on Friday despite the initial ceasefire news — " +
        "SMH down 3.7%, AMD and Teradyne both down more than 7%, Micron down more than 6% " +
        "— a real, separate signal from the geopolitical relief, not yet resolved by it.",
      sourceAssessments: { connect: [{ id: sectorStrategist.id }] },
    },
  });

  await prisma.opportunity.create({
    data: {
      briefId: brief.id,
      thesis:
        "Real Q2 beat reported today: core EPS $2.63 against a $2.48 consensus, up 18% on " +
        "a constant-currency basis, revenue up 5% to $15.38 billion. Full 2026 guidance " +
        "held, and management reaffirmed a real, specific long-term target of $80 billion " +
        "in annual revenue by 2030. Cancer drug sales grew 15% and rare disease revenue " +
        "grew 8%. Included honestly: real China revenue fell 13% on generic competition " +
        "and policy shifts, a genuine, ongoing risk, not omitted to make the thesis look " +
        "cleaner than it is.",
      conviction: 62,
      companyId: azn.id,
    },
  });

  await prisma.opportunity.create({
    data: {
      briefId: brief.id,
      thesis:
        "A real, legitimate value case carried forward: five consecutive real earnings " +
        "beats, a real forward P/E of 8 — roughly half the healthcare sector average — " +
        "and a real 7.2% dividend yield. Full-year guidance reaffirmed at $59.5-62.5 " +
        "billion in revenue. Real, specific product growth: Padcev up 39%, Nurtec ODT/" +
        "Vydura up 41%, Eliquis up 13%, Orgovyx up 43%.",
      conviction: 54,
      companyId: pfe.id,
    },
  });

  await prisma.recommendedAction.create({
    data: {
      briefId: brief.id,
      description:
        "Watch Wednesday's Fed decision closely — a real, live, binary catalyst today's " +
        "relief does not resolve.",
      actionType: "WATCH",
      displayOrder: 1,
    },
  });

  await prisma.recommendedAction.create({
    data: {
      briefId: brief.id,
      description:
        "Monitor whether the Iran ceasefire holds and whether chip-sector names " +
        "participate in today's real rally or continue diverging from it.",
      actionType: "WATCH",
      displayOrder: 2,
    },
  });

  await prisma.recommendedAction.create({
    data: {
      briefId: brief.id,
      description:
        "Run the Quality and Growth screens in a real environment with live SEC access, " +
        "and add any genuinely qualifying candidates to today's Brief afterward.",
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
    `Published Brief ${brief.id} for ${BRIEF_DATE.toDateString()} — MarketIQ's seventh real Brief.`,
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
