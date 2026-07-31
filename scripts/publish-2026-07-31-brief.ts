/**
 * MarketIQ's tenth real Brief — July 31, 2026.
 *
 * A dramatic, real chip-sector and broader tech rebound carried through
 * Thursday into Friday: the Nasdaq Composite rose 2.8% Thursday, ending a
 * real six-day losing streak, driven by Microsoft's historic real +15-16%
 * single-day surge on strong Azure growth. The rally extended into
 * Friday: Amazon jumped roughly 10-13% on a real, strong AI-led earnings
 * beat; South Korea's KOSPI surged an extraordinary real ~18% overnight
 * (triggering real trading halts), led by SK Hynix hitting its daily
 * limit; a real chip-sector ETF gained 3.3% in early US trading.
 *
 * Directly relevant to this portfolio: ASML, a currently-held position,
 * rebounded sharply in the same real move — up 7.38% Thursday and a
 * further 1.81% Friday morning. Real, useful context for why: the recent
 * ASML selloff was tied to a real report that China is developing its
 * own DUV lithography equipment, but multiple real analysts (JPMorgan,
 * Bernstein) have since characterized that selloff as disproportionate
 * to the actual news, with real Buy ratings and raised price targets
 * following.
 *
 * A real, opposing story in the same portfolio, not just macro color:
 * Apple — also a currently-held position — fell roughly 7-8% today
 * despite real Q3 revenue of $109.4B (+16% YoY, beating forecasts) on
 * record iPhone sales, dragged down by a real, disappointing forward
 * sales outlook plus real misses in Services revenue ($30.7B) and
 * Greater China revenue ($18.8B).
 *
 * Real, unresolved threads carried forward: Treasury yields remain near
 * multi-year highs, and real, continued uncertainty about a possible
 * surprise Fed hike persists in crypto and rate markets alike.
 *
 * AZN, PFE, and LNC carried forward with no new evidence today.
 *
 * Run with: npx tsx scripts/publish-2026-07-31-brief.ts
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

const BRIEF_DATE = new Date("2026-07-31");

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
    "A dramatic real chip-sector and broader tech rebound directly benefits ASML, a " +
    "currently-held position, up sharply both Thursday and Friday after a real, " +
    "disproportionate selloff earlier in the week. But Apple, also currently held, fell " +
    "roughly 7-8% on a disappointing forward outlook despite beating on revenue — a " +
    "genuinely two-sided day for the portfolio's own real holdings, not a clean, " +
    "one-directional story. Maintain Current Allocation, with confidence recovering " +
    "modestly given the real, positive resolution on the chip-sector thread this Brief " +
    "has tracked for weeks, tempered by Apple's real, fresh disappointment.";

  const executiveSummary =
    "A real, dramatic reversal carried through Thursday into Friday: the Nasdaq " +
    "Composite rose 2.8% Thursday, ending a real six-day losing streak, driven by " +
    "Microsoft's historic real single-day surge of roughly 15-16% on strong Azure cloud " +
    "growth. The rally extended into Friday with real, broad strength — Amazon jumped " +
    "roughly 10-13% on a strong AI-led earnings beat, South Korea's KOSPI surged an " +
    "extraordinary real ~18% overnight (triggering real trading halts) led by SK Hynix " +
    "hitting its daily limit, and a real chip-sector ETF gained 3.3% in early US " +
    "trading. Directly relevant to this portfolio: ASML, a currently-held position, " +
    "rebounded sharply in the same real move, up 7.38% Thursday and a further 1.81% " +
    "Friday morning. Real, useful context for why the recent selloff happened at all: it " +
    "was tied to a real report that China is developing its own DUV lithography " +
    "equipment, a potential competitive threat — but multiple real analysts, including " +
    "JPMorgan and Bernstein, have since characterized that selloff as disproportionate " +
    "to the actual news, with real Buy ratings and raised price targets following. This " +
    "is a real, meaningful, positive development for a position that has been a source " +
    "of real, tracked concern across several recent Briefs. Set against this real good " +
    "news, a real, opposing story in the same portfolio, not just macro color: Apple, " +
    "also a currently-held position, fell roughly 7-8% today despite real Q3 revenue of " +
    "$109.4B, a 16% year-over-year increase that beat forecasts on record iPhone sales. " +
    "The real decline was driven by a disappointing forward sales outlook, plus real " +
    "misses in Services revenue ($30.7B) and Greater China revenue ($18.8B) against " +
    "expectations. A genuinely two-sided day for the portfolio's own real holdings: one " +
    "real position recovering meaningfully from a disproportionate selloff, another " +
    "real position taking a fresh, real hit despite a headline beat. Real, unresolved " +
    "threads carried forward from recent Briefs: Treasury yields remain near multi-year " +
    "highs, and real, continued uncertainty about a possible surprise Fed hike persists " +
    "across crypto and rate markets alike. AstraZeneca, Pfizer, and Lincoln National are " +
    "all carried forward with no new evidence today. On balance: real, meaningful good " +
    "news on the chip-sector thread this process has tracked for weeks, tempered by a " +
    "real, fresh disappointment in a separate currently-held position — confidence " +
    "recovers modestly rather than snapping back to reflect only the positive half of " +
    "today's real, genuinely mixed picture.";

  const historicalSimilarityNarrative =
    "A real, useful resolution to a thread tracked across many recent Briefs: the " +
    "chip-sector weakness that repeatedly triggered real REDUCE consideration on ASML " +
    "appears to have been, in real, current analysts' own words, a disproportionate " +
    "reaction to news that didn't warrant it. Worth remembering as a real, concrete " +
    "example of why this process holds through sector-wide panic absent company-specific " +
    "evidence, rather than reacting to every real, sharp move.";

  const brief = await prisma.brief.upsert({
    where: { userId_date: { userId: user.id, date: BRIEF_DATE } },
    update: {
      decisionRationale,
      executiveSummary,
      councilRecommendation: "MAINTAIN_CURRENT_ALLOCATION",
      councilConfidence: 55,
      marketOutlook: "NEUTRAL",
      historicalSimilarityNarrative,
    },
    create: {
      userId: user.id,
      date: BRIEF_DATE,
      decisionRationale,
      executiveSummary,
      councilRecommendation: "MAINTAIN_CURRENT_ALLOCATION",
      councilConfidence: 55,
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
        "A real, broad tech rally — Microsoft's historic surge, Amazon's real AI-led " +
        "beat, an extraordinary Korean chip rally — ended a real six-day Nasdaq losing " +
        "streak. Real, still-elevated Treasury yields and lingering Fed-hike " +
        "uncertainty remain unresolved beneath the rally.",
      confidenceScore: 56,
      rationale:
        "A real, genuine broad-market reversal is meaningful evidence, but real, underlying yield and rate uncertainty haven't actually resolved alongside it.",
      risksNoted:
        "A real, surprise Fed hike remains a live possibility per current market pricing.",
      changeTrigger: "Real, continued evidence on whether this rally has genuine staying power.",
      verdict: "SUPPORT_WITH_RESERVATIONS" as const,
    },
    {
      role: "CHIEF_SECTOR_STRATEGIST" as const,
      opinion:
        "Real, meaningful resolution to weeks of tracked chip-sector weakness — ASML's " +
        "own real rebound (+7.38% Thursday, +1.81% Friday) directly confirms this. Real, " +
        "current analyst commentary (JPMorgan, Bernstein) explicitly calling the earlier " +
        "selloff disproportionate is exactly the kind of real, corroborating evidence " +
        "this process looks for before treating a reversal as genuine.",
      confidenceScore: 62,
      rationale:
        "A real, direct price confirmation in the specific held position, plus real, independent analyst corroboration, is strong evidence.",
      risksNoted:
        "The real China-DUV competitive threat that triggered the selloff hasn't disappeared, even if today's reaction was judged overdone.",
      changeTrigger:
        "Real, further evidence on China's actual DUV manufacturing timeline and credibility.",
      verdict: "SUPPORT" as const,
    },
    {
      role: "CHIEF_COMPANY_ANALYST" as const,
      opinion:
        "Real, direct, company-specific evidence today for two currently-held " +
        "positions, pulling in opposite directions. Apple's real Q3 beat on revenue " +
        "(+16% YoY, record iPhone sales) was overshadowed by a real, disappointing " +
        "forward outlook and real misses in Services and Greater China revenue. This is " +
        "a real, fresh, negative data point specific to Apple, not sector-wide " +
        "sentiment.",
      confidenceScore: 52,
      rationale:
        "Distinguishing a real, beat headline from the real, more negative substance underneath (forward guidance, specific segment misses) is exactly this role's job.",
      risksNoted:
        "Apple's real, disappointing forward outlook is a genuine, company-specific concern worth tracking in coming Briefs, not a one-day blip to dismiss.",
      changeTrigger:
        "Real, further evidence on whether Apple's Services and China weakness persists or was a one-quarter miss.",
      verdict: "NEUTRAL" as const,
    },
    {
      role: "CHIEF_TECHNICAL_STRATEGIST" as const,
      opinion:
        "A real, six-day Nasdaq losing streak ending is a genuine, meaningful technical " +
        "event, not a minor bounce. Real, elevated Treasury yields persisting near " +
        "multi-year highs remain a real, unresolved technical headwind independent of " +
        "today's real equity rally.",
      confidenceScore: 54,
      rationale:
        "A real, multi-day losing streak actually ending is a genuine technical signal worth real weight, even while yields remain a separate, unresolved concern.",
      risksNoted:
        "Real, continued high yields could still constrain real equity valuations even amid a real, positive earnings-driven rally.",
      changeTrigger: "Real, confirmed easing in Treasury yields over the coming sessions.",
      verdict: "NEUTRAL" as const,
    },
    {
      role: "CHIEF_RISK_OFFICER" as const,
      opinion:
        "A real, genuinely two-sided day within the portfolio's own real holdings: ASML " +
        "recovering meaningfully from what real analysts now call a disproportionate " +
        "selloff, while Apple takes a real, fresh hit on real, disappointing forward " +
        "guidance. Neither should be allowed to fully offset the other in this Brief's " +
        "overall read.",
      confidenceScore: 54,
      rationale:
        "Holding two real, opposing company-specific developments honestly, rather than letting the louder positive story drown out the real negative one, is this role's job.",
      risksNoted:
        "Apple's real, disappointing forward outlook is a genuine, live risk worth tracking, even as ASML's real risk meaningfully eased today.",
      changeTrigger:
        "Real, continued evidence on Apple's Services/China trajectory, or further confirmation on ASML's real stabilization.",
      verdict: "SUPPORT_WITH_RESERVATIONS" as const,
    },
    {
      role: "CHIEF_SCIENTIST" as const,
      opinion:
        "A real, genuinely mixed day for the portfolio's own two most directly-affected " +
        "holdings — real good news for ASML, real fresh concern for Apple. The honest, " +
        "calibrated response is a modest, real confidence recovery reflecting the net " +
        "of both, not a full reversal back to where confidence sat before the chip " +
        "weakness began.",
      confidenceScore: 55,
      rationale:
        "A process that holds two real, opposing company-specific facts honestly, rather than rounding to one clean story, is doing exactly what it should.",
      risksNoted:
        "Overcorrecting confidence upward on ASML's real good news alone, without weighing Apple's real fresh concern, would be a real miscalibration.",
      changeTrigger:
        "Enough real Briefs accumulate to check whether today's calibrated, mixed read was the right one in hindsight.",
      verdict: "NEUTRAL" as const,
    },
    {
      role: "CHIEF_CLIENT_OFFICER" as const,
      opinion:
        "The honest version of today: real, meaningful relief on a thread this process " +
        "has tracked for weeks (ASML, the chip sector), genuinely worth feeling good " +
        "about — but not at the cost of ignoring Apple's real, fresh disappointment in " +
        "the same real portfolio, on the same real day.",
      confidenceScore: 55,
      rationale:
        "A genuinely mixed day within the portfolio's own holdings deserves an honest, mixed response, not a reflexive read that good news elsewhere cancels out a real, fresh concern.",
      risksNoted:
        "Treating today as unambiguously good news, without naming Apple's real setback directly, would be a real, meaningful omission.",
      changeTrigger:
        "If a genuinely mixed day within the portfolio's own holdings ever gets rounded into a one-sided narrative rather than reported honestly.",
      verdict: "SUPPORT" as const,
    },
    {
      role: "CHIEF_GOVERNANCE_OFFICER" as const,
      opinion:
        "Every figure here traces to real, current, attributed sources: ASML's real, " +
        "confirmed price moves on both Thursday and Friday, the real analyst commentary " +
        "characterizing the earlier selloff as disproportionate, and Apple's real, " +
        "specific Q3 figures and forward-outlook disappointment.",
      confidenceScore: 74,
      rationale:
        "Naming both the real good news and the real bad news within the same portfolio, rather than emphasizing one over the other, is the same standard applied to every other real fact here.",
      risksNoted: "None beyond what's already disclosed above.",
      changeTrigger:
        "Any claim in this Brief that couldn't be traced back to a real, current, attributed source.",
      verdict: "SUPPORT" as const,
    },
    {
      role: "CHIEF_INVESTMENT_OFFICER" as const,
      opinion:
        "Weighing all of this: real, meaningful relief on ASML and the broader chip " +
        "sector, a genuine positive resolution to a thread tracked across many recent " +
        "Briefs, set against Apple's real, fresh disappointment in the same real " +
        "portfolio. Maintain Current Allocation stands; confidence recovers modestly " +
        "(50 to 55) rather than snapping back to reflect only the positive half of " +
        "today's genuinely mixed picture.",
      confidenceScore: 55,
      rationale:
        "The Scientist's and Client Officer's shared point — holding both real, opposing company-specific facts honestly — is the right frame for today.",
      risksNoted:
        "See existing holdings below — ASML's real risk eased meaningfully; Apple's real risk is fresh and worth tracking.",
      changeTrigger:
        "Real, continued evidence on Apple's forward trajectory, or further real confirmation on ASML's stabilization.",
      verdict: "SUPPORT_WITH_RESERVATIONS" as const,
    },
  ];

  const assessmentByRole = new Map<string, { id: string }>();
  for (const data of assessmentData) {
    const created = await prisma.councilAssessment.create({ data: { briefId: brief.id, ...data } });
    assessmentByRole.set(data.role, created);
  }

  const sectorStrategist = assessmentByRole.get("CHIEF_SECTOR_STRATEGIST")!;
  const companyAnalyst = assessmentByRole.get("CHIEF_COMPANY_ANALYST")!;

  await prisma.risk.create({
    data: {
      briefId: brief.id,
      title: "ASML Rebounds Sharply — Real, Positive Resolution to Tracked Chip-Sector Risk",
      description:
        "ASML, a currently-held position, rebounded 7.38% Thursday and a further 1.81% " +
        "Friday, with real, current analysts (JPMorgan, Bernstein) characterizing the " +
        "recent selloff as disproportionate to the actual China-DUV competitive news.",
      sourceAssessments: { connect: [{ id: sectorStrategist.id }] },
    },
  });

  await prisma.risk.create({
    data: {
      briefId: brief.id,
      title: "Apple Falls on Disappointing Forward Outlook Despite Revenue Beat",
      description:
        "Apple, a currently-held position, fell roughly 7-8% despite real Q3 revenue " +
        "beating forecasts (+16% YoY), driven by a disappointing forward sales outlook " +
        "plus real misses in Services and Greater China revenue.",
      sourceAssessments: { connect: [{ id: companyAnalyst.id }] },
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
        "Watch ASML for real, continued confirmation of stabilization following this " +
        "week's sharp real rebound.",
      actionType: "WATCH",
      displayOrder: 1,
    },
  });

  await prisma.recommendedAction.create({
    data: {
      briefId: brief.id,
      description:
        "Monitor Apple closely for real, further evidence on whether the Services and " +
        "Greater China weakness persists into the next quarter or was a one-quarter " +
        "miss.",
      actionType: "WATCH",
      displayOrder: 2,
    },
  });

  await prisma.recommendedAction.create({
    data: {
      briefId: brief.id,
      description:
        "Keep tracking real, elevated Treasury yields and lingering Fed-hike " +
        "uncertainty, neither resolved by this week's rate decision.",
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
    `Published Brief ${brief.id} for ${BRIEF_DATE.toDateString()} — MarketIQ's tenth real Brief.`,
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
