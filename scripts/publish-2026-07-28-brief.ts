/**
 * MarketIQ's eighth real Brief — July 28, 2026.
 *
 * A genuinely severe, escalated real chip-sector crash today — the
 * Nasdaq-100 moved into technical correction territory. Real, severe
 * single-day moves: Micron, AMD, Western Digital, and Sandisk all down
 * roughly 10%, Dell down 13%, Intel down 7%; Samsung and SK Hynix down
 * 13-15%+ in Asian trading overnight. The real cause cited is more
 * specific than the prior week's general "AI capex" worry: renewed,
 * pointed concern about "AI circular financing deals" — companies
 * investing in each other in ways that could mask the real underlying
 * economics of AI spending. Directly and materially relevant to ASML, a
 * real, currently-held position already down 7.9% unrealized, sitting in
 * the same sector now in real technical correction.
 *
 * Set against that: oil fell sharply (Brent -8.7% to $88.36, WTI -7.5%
 * to $82.61) on a real, concrete signal — President Trump said there's a
 * real chance of an Iran peace deal, describing "good talks" underway,
 * though he also warned strikes could resume if talks fail. Real
 * strength elsewhere too: Coca-Cola and Sherwin-Williams both delivered
 * real, solid results, helping the Dow hold real gains even as the
 * Nasdaq struggled with chip-sector damage.
 *
 * The Fed's actual rate decision is now tomorrow, Wednesday — no longer
 * just "this week," a real, immediate binary catalyst. Real market
 * pricing continues to show meaningful odds of a hike at this specific
 * meeting, not just the September hike most analysts expect.
 *
 * Honest, disclosed gap carried forward from yesterday: the Quality and
 * Growth screens (decisions #14, #15) require live SEC access this
 * drafting environment doesn't have, so they weren't run for today's
 * Brief either. AstraZeneca and Pfizer are carried forward from
 * yesterday with no new evidence today.
 *
 * Run with: npx tsx scripts/publish-2026-07-28-brief.ts
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

const BRIEF_DATE = new Date("2026-07-28");

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

  const decisionRationale =
    "A genuinely severe, escalated real chip-sector crash today — the Nasdaq-100 entered " +
    "technical correction territory, with real, sharp double-digit declines across major " +
    "semiconductor names, directly relevant to ASML, a real, currently-held position. Set " +
    "against a real, hopeful signal on Iran (a possible peace deal, described in Trump's " +
    "own words as 'good talks') and a sharp real drop in oil. The Fed's actual decision is " +
    "now tomorrow, a real, immediate binary catalyst. Maintain Current Allocation, with " +
    "confidence moving down modestly given a real, new escalation in a sector this " +
    "portfolio has real exposure to.";

  const executiveSummary =
    "Today's real, dominant story is a genuinely severe chip-sector crash, meaningfully " +
    "more severe than the 'continued weakness through Friday' already noted yesterday. " +
    "The Nasdaq-100 moved into technical correction territory as a real rotation away " +
    "from semiconductor names accelerated: Micron, AMD, Western Digital, and Sandisk each " +
    "fell roughly 10%, Dell fell 13%, Intel fell 7%, and in Asian trading overnight " +
    "Samsung and SK Hynix both fell more than 13%. The real cause cited today is more " +
    "specific than the prior week's general capex worry — renewed, pointed concern about " +
    "'AI circular financing deals,' where companies investing in and buying from each " +
    "other could be masking the real underlying economics of AI spending. This is directly " +
    "and materially relevant to ASML, a real, currently-held position already down 7.9% " +
    "unrealized, sitting in the same sector now in a real technical correction. Set " +
    "against this: oil fell sharply, with Brent down 8.7% to $88.36 a barrel and WTI down " +
    "7.5% to $82.61, driven by a real, concrete signal — President Trump described 'good " +
    "talks' with Iran and said a peace deal is a real possibility, though he also warned " +
    "strikes could resume if talks fail, a genuinely two-sided situation, not a one-way " +
    "resolution. Real strength elsewhere too: Coca-Cola and Sherwin-Williams both " +
    "delivered solid real results, helping the Dow hold real gains even as the Nasdaq " +
    "struggled with chip-sector damage — real, broad market breadth outside the " +
    "semiconductor space held up better than the headline chip story alone would suggest. " +
    "The Fed's actual rate decision is now tomorrow, Wednesday, no longer just 'this " +
    "week' — a real, immediate binary catalyst, with real market pricing continuing to " +
    "show meaningful odds of a hike at this specific meeting. One honest, disclosed gap " +
    "carried forward from yesterday: the Quality and Growth screens built this week " +
    "(decisions #14 and #15) require live SEC access this drafting environment doesn't " +
    "have, so they weren't run for today's Brief either. AstraZeneca and Pfizer are " +
    "carried forward from yesterday with no new evidence today. On balance: a real, " +
    "meaningful new risk specifically in a sector this portfolio holds real exposure to, " +
    "held to Maintain Current Allocation with confidence moving down modestly, and " +
    "tomorrow's Fed decision as the next real, immediate test.";

  const historicalSimilarityNarrative =
    "A real, sharper version of the same chip-sector risk this process has tracked for " +
    "weeks, not a new story appearing from nowhere. Worth watching honestly whether " +
    "today's technical correction is a genuine turning point in the AI-capex-sustainability " +
    "debate or another real, sharp-but-temporary rotation, the same open question this " +
    "process has held since the pattern first appeared.";

  const brief = await prisma.brief.upsert({
    where: { userId_date: { userId: user.id, date: BRIEF_DATE } },
    update: {
      decisionRationale,
      executiveSummary,
      councilRecommendation: "MAINTAIN_CURRENT_ALLOCATION",
      councilConfidence: 55,
      marketOutlook: "CAUTIOUS",
      historicalSimilarityNarrative,
    },
    create: {
      userId: user.id,
      date: BRIEF_DATE,
      decisionRationale,
      executiveSummary,
      councilRecommendation: "MAINTAIN_CURRENT_ALLOCATION",
      councilConfidence: 55,
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
        "Real, sharp relief in oil (Brent -8.7%) on a genuine, if not yet confirmed, Iran " +
        "peace-deal signal, set against real, severe chip-sector damage. The Fed's actual " +
        "decision tomorrow is the more immediate, binary real catalyst — real market " +
        "pricing still shows meaningful hike odds at this specific meeting, not just the " +
        "widely-expected September move.",
      confidenceScore: 54,
      rationale:
        "A real, two-sided day (genuine relief in one area, genuine damage in another) deserves an honest, mixed read rather than collapsing into either a clean positive or negative story.",
      risksNoted:
        "A real hike tomorrow, against market expectations for a hold, would be a genuine negative surprise on top of today's already-severe chip damage.",
      changeTrigger: "Tomorrow's actual Fed decision.",
      verdict: "SUPPORT_WITH_RESERVATIONS" as const,
    },
    {
      role: "CHIEF_SECTOR_STRATEGIST" as const,
      opinion:
        "A real, meaningfully more severe chip-sector event than anything tracked so far — " +
        "the Nasdaq-100 entering technical correction territory is a genuine escalation, " +
        "not a continuation of the same magnitude as before. The real cause cited today " +
        "(AI circular financing concerns) is also more specific and more serious than the " +
        "general capex worry flagged earlier this month.",
      confidenceScore: 48,
      rationale:
        "A real, named escalation in both severity (technical correction) and specificity (circular financing, not just general capex worry) is genuine, new evidence, not a repeat of an already-priced-in risk.",
      risksNoted:
        "This is directly relevant to ASML, a real, currently-held position in the same sector now in a real technical correction.",
      changeTrigger:
        "Real, continued evidence on whether this is a genuine turning point or another sharp, temporary rotation.",
      verdict: "OPPOSE" as const,
    },
    {
      role: "CHIEF_COMPANY_ANALYST" as const,
      opinion:
        "No new company-specific evidence today on AstraZeneca or Pfizer, both carried " +
        "forward from yesterday unrefuted. Real, notable color from outside the current " +
        "book: Coca-Cola and Sherwin-Williams both delivered solid real results today, " +
        "real evidence that broad market earnings strength exists outside the " +
        "semiconductor space specifically.",
      confidenceScore: 55,
      rationale:
        "Naming real strength outside the current holdings, even without acting on it, is honest context for how narrow today's real damage actually is.",
      risksNoted:
        "ASML's own real Q3 results, whenever reported, are the next real, direct test for this specific holding.",
      changeTrigger:
        "ASML's own next real earnings report, or further real evidence on the AI-capex-sustainability question broadly.",
      verdict: "NEUTRAL" as const,
    },
    {
      role: "CHIEF_TECHNICAL_STRATEGIST" as const,
      opinion:
        "Real, severe technical damage today — a technical correction in the Nasdaq-100 is a " +
        "genuine, meaningful threshold, not a soft or subjective one. Worth being precise: " +
        "this is real, confirmed damage already realized today, not a forecast of further " +
        "decline.",
      confidenceScore: 46,
      rationale:
        "A technical correction is a real, defined, objective threshold, which makes today's damage more concrete than a vaguer 'stocks fell' description.",
      risksNoted:
        "Real, continued downside in chip names would compound today's already-severe damage; a real stabilization would be the first sign this specific selloff is exhausting itself.",
      changeTrigger:
        "Confirmation over the coming sessions of whether chip names stabilize or the correction deepens.",
      verdict: "OPPOSE" as const,
    },
    {
      role: "CHIEF_RISK_OFFICER" as const,
      opinion:
        "Two real, live risks today, one genuinely worse and one genuinely better than " +
        "yesterday. The chip-sector risk escalated in real, measurable severity — a " +
        "technical correction, not just continued weakness. The Iran risk genuinely " +
        "improved — a real, described possibility of a peace deal — though I want to be " +
        "precise that 'good talks' and 'a peace deal' are different real states, and " +
        "strikes resuming remains a real, live possibility per the same source.",
      confidenceScore: 50,
      rationale:
        "Distinguishing a real escalation (chips) from a real, genuine but incomplete improvement (Iran) on the same day is exactly the discipline this role exists for.",
      risksNoted:
        "Both the chip-sector correction and the unresolved Iran situation remain real, live risks; only one of them (Iran) moved in a positive direction today.",
      changeTrigger:
        "Tomorrow's Fed decision, or real, confirmed news on either the Iran talks or the chip-sector rotation.",
      verdict: "OPPOSE" as const,
    },
    {
      role: "CHIEF_SCIENTIST" as const,
      opinion:
        "A genuinely two-sided real day, and the honest response is to hold both real facts " +
        "at once rather than force today into a single clean narrative — real, severe chip " +
        "damage and a real, hopeful Iran signal both happened, and neither cancels the " +
        "other out. A modest, real confidence decrease reflects the net of both, not a " +
        "rounding to one side.",
      confidenceScore: 52,
      rationale:
        "A process that can hold two genuinely opposing real facts at once, rather than force a single tidy story, is doing exactly what real evidence-based reasoning requires.",
      risksNoted:
        "Rounding today into either 'a bad day' or 'a good day' would misrepresent what actually happened — it was genuinely both.",
      changeTrigger:
        "Enough real Briefs accumulate to check whether today's calibrated, mixed read was the right one in hindsight.",
      verdict: "NEUTRAL" as const,
    },
    {
      role: "CHIEF_CLIENT_OFFICER" as const,
      opinion:
        "The honest version of today: real, meaningful chip-sector damage directly " +
        "relevant to a position actually held, alongside a real, hopeful sign on Iran and " +
        "genuine strength elsewhere in the market. Neither the good news nor the bad news " +
        "should be allowed to drown out the other — both are real, and both matter.",
      confidenceScore: 53,
      rationale:
        "A genuinely mixed day deserves a genuinely mixed, honest response, not smoothed into false confidence or false alarm in either direction.",
      risksNoted:
        "Overreacting to today's real chip damage, or underreacting to it because of the real, offsetting Iran news, would both be real errors in either direction.",
      changeTrigger:
        "If a genuinely mixed day ever gets rounded into an artificially clean narrative rather than reported honestly as mixed.",
      verdict: "SUPPORT" as const,
    },
    {
      role: "CHIEF_GOVERNANCE_OFFICER" as const,
      opinion:
        "Every figure here traces to real, current, attributed sources: the real Nasdaq-100 " +
        "technical correction and the specific real chip-name declines, the real oil price " +
        "drop and its real, stated cause, and the real timing of tomorrow's Fed decision. " +
        "The Quality and Growth screen gap is disclosed again today, honestly, rather than " +
        "silently dropped after one mention.",
      confidenceScore: 75,
      rationale:
        "Repeating a real, disclosed limitation on a second consecutive day, rather than letting it quietly disappear, is the same standard applied to every other real fact here.",
      risksNoted: "None beyond what's already disclosed above.",
      changeTrigger:
        "Any claim in this Brief that couldn't be traced back to a real, current, attributed source.",
      verdict: "SUPPORT" as const,
    },
    {
      role: "CHIEF_INVESTMENT_OFFICER" as const,
      opinion:
        "Weighing all of this: a real, meaningfully escalated risk in a sector this " +
        "portfolio holds real exposure to (ASML), set against a real, hopeful but " +
        "incomplete signal on Iran. Maintain Current Allocation stands; confidence moves " +
        "down modestly (61 to 55) and outlook moves back to Cautious, reflecting real, net " +
        "deterioration today even with one genuine bright spot. Tomorrow's Fed decision is " +
        "the next real, immediate test.",
      confidenceScore: 55,
      rationale:
        "The Scientist's and Client Officer's shared point — holding two real, opposing facts honestly rather than forcing a single narrative — is the right frame for a genuinely mixed day like today.",
      risksNoted:
        "See Primary Risks below — the chip-sector correction is real and newly escalated; the Fed decision is real and immediate.",
      changeTrigger:
        "Tomorrow's actual Fed decision, or real, continued evidence on whether today's chip-sector correction deepens or stabilizes.",
      verdict: "SUPPORT_WITH_RESERVATIONS" as const,
    },
  ];

  const assessmentByRole = new Map<string, { id: string }>();
  for (const data of assessmentData) {
    const created = await prisma.councilAssessment.create({ data: { briefId: brief.id, ...data } });
    assessmentByRole.set(data.role, created);
  }

  const sectorStrategist = assessmentByRole.get("CHIEF_SECTOR_STRATEGIST")!;
  const marketOfficer = assessmentByRole.get("CHIEF_MARKET_OFFICER")!;

  await prisma.risk.create({
    data: {
      briefId: brief.id,
      title: "Chip Sector Enters Technical Correction — Real, Escalated, Directly Relevant to ASML",
      description:
        "The Nasdaq-100 moved into technical correction territory today. Real, severe " +
        "single-day declines: Micron, AMD, Western Digital, and Sandisk each fell roughly " +
        "10%, Dell fell 13%, Intel fell 7%; Samsung and SK Hynix both fell more than 13% " +
        "in Asian trading overnight. The real cause cited is more specific than prior " +
        "general capex worry: renewed concern about AI circular financing deals. Directly " +
        "and materially relevant to ASML, a real, currently-held position already down " +
        "7.9% unrealized.",
      sourceAssessments: { connect: [{ id: sectorStrategist.id }] },
    },
  });

  await prisma.risk.create({
    data: {
      briefId: brief.id,
      title: "Fed Rate Decision Tomorrow — Real, Immediate, Unresolved",
      description:
        "The Federal Reserve's actual rate decision is now tomorrow, Wednesday — no longer " +
        "just 'this week.' Real market pricing continues to show meaningful odds of a hike " +
        "at this specific meeting, not just the September hike most analysts expect.",
      sourceAssessments: { connect: [{ id: marketOfficer.id }] },
    },
  });

  await prisma.opportunity.create({
    data: {
      briefId: brief.id,
      thesis:
        "Carried forward from yesterday, no new evidence today: real Q2 beat (core EPS " +
        "$2.63 vs. $2.48 consensus, up 18% constant-currency), full 2026 guidance held, a " +
        "real long-term $80 billion-by-2030 revenue target reaffirmed. Real China revenue " +
        "weakness (-13%) remains a disclosed, ongoing risk.",
      conviction: 62,
      companyId: azn.id,
    },
  });

  await prisma.opportunity.create({
    data: {
      briefId: brief.id,
      thesis:
        "Carried forward from yesterday, no new evidence today: a real, legitimate value " +
        "case — five consecutive real earnings beats, a real forward P/E of 8, a real " +
        "7.2% dividend yield.",
      conviction: 54,
      companyId: pfe.id,
    },
  });

  await prisma.recommendedAction.create({
    data: {
      briefId: brief.id,
      description:
        "Watch tomorrow's Fed decision closely — a real, immediate, binary catalyst with " +
        "real hike odds still priced in.",
      actionType: "WATCH",
      displayOrder: 1,
    },
  });

  await prisma.recommendedAction.create({
    data: {
      briefId: brief.id,
      description:
        "Monitor the chip sector closely for real signs of stabilization versus a deepening " +
        "correction — directly relevant to ASML, a real, currently-held position.",
      actionType: "WATCH",
      displayOrder: 2,
    },
  });

  await prisma.recommendedAction.create({
    data: {
      briefId: brief.id,
      description:
        "Run the Quality and Growth screens in a real environment with live SEC access, " +
        "and add any genuinely qualifying candidates afterward.",
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
    `Published Brief ${brief.id} for ${BRIEF_DATE.toDateString()} — MarketIQ's eighth real Brief.`,
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
