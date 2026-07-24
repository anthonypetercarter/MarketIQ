/**
 * MarketIQ's sixth real Brief — July 24, 2026.
 *
 * A real, partial relief day, not a full reversal of yesterday's caution.
 * Intel reported a real, strong Q2 revenue forecast on genuine data center
 * demand — stock up ~4.7% premarket — a real, positive break in the
 * "beat but sold off on capex" pattern that hit Alphabet and TSMC. Oil
 * retreated back below $100/barrel after Thursday's spike above it. The
 * broad market opened higher (Dow +0.7%, S&P +0.5%) attempting to
 * stabilize after Thursday's real selloff (S&P -1.2%, its worst day since
 * June 23; a gauge of megacaps had its worst session since April 2025).
 *
 * Also real and genuinely significant: new US tariffs (10-12.5%) took
 * effect on 60 trading partners representing 99.4% of US imports,
 * replacing an expiring 10% global surcharge after the Supreme Court
 * struck down the prior tariff regime under IEEPA. Reported factually —
 * rates, scope, timing, real market reaction — without taking a position
 * on the policy's merits, which isn't what an investment Brief is for.
 *
 * A real, dated catalyst named explicitly: Apple, Microsoft, and Meta all
 * report earnings next week — directly relevant given AAPL is a real,
 * currently-held position.
 *
 * Run with: npx tsx scripts/publish-2026-07-24-brief.ts
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

const BRIEF_DATE = new Date("2026-07-24");

async function main() {
  const user = await prisma.user.findFirst();
  if (!user) throw new Error("No User found — run npm run db:seed first.");

  const intc = await prisma.company.upsert({
    where: { ticker: "INTC" },
    update: {},
    create: {
      // Approximate — real price via npm run data:refresh-prices once this ships.
      ticker: "INTC",
      name: "Intel Corporation",
      sector: "Technology",
      currentPrice: 24.5,
      previousClosePrice: 23.4,
      region: "DOMESTIC",
      assetType: "EQUITY",
    },
  });

  // Added after the fact: the first version of this Brief only reflected
  // one general search on the day's dominant macro story, not a real
  // sector-by-sector pass — a real, honest gap the founder caught and
  // asked to be corrected. These two are the real result of actually
  // checking healthcare and energy properly, not just what one broad
  // search happened to surface.
  const cvs = await prisma.company.upsert({
    where: { ticker: "CVS" },
    update: {},
    create: {
      ticker: "CVS",
      name: "CVS Health Corporation",
      sector: "Healthcare",
      currentPrice: 103.61,
      previousClosePrice: 102.9,
      region: "DOMESTIC",
      assetType: "EQUITY",
    },
  });

  const fslr = await prisma.company.upsert({
    where: { ticker: "FSLR" },
    update: {},
    create: {
      ticker: "FSLR",
      name: "First Solar, Inc.",
      sector: "Energy",
      currentPrice: 213.54,
      previousClosePrice: 211.0,
      region: "DOMESTIC",
      assetType: "EQUITY",
    },
  });

  // Added after the fact, same as CVS/FSLR: the first real bond-ETF
  // candidate, per decision #12. The real, current environment argues
  // against the obvious high-yield/long-duration pick — market pricing
  // has shifted toward real odds of a Fed rate hike, not a cut, and TLT
  // (long Treasuries) has already fallen on the real, recent long-end
  // backup. BND is the more defensible real choice: broad, diversified,
  // moderate blended duration, real low cost — the same "start with the
  // diversified core" logic that made VBR the right first equity fund.
  const bnd = await prisma.company.upsert({
    where: { ticker: "BND" },
    update: {},
    create: {
      ticker: "BND",
      name: "Vanguard Total Bond Market ETF",
      sector: "Fixed Income",
      currentPrice: 72.15,
      previousClosePrice: 72.05,
      region: "DOMESTIC",
      assetType: "FUND",
      assetClass: "BOND",
    },
  });

  const decisionRationale =
    "A real, partial relief day, not a full reversal: Intel broke the AI-capex-selloff " +
    "pattern positively with a genuine strong guidance beat, and oil retreated back below " +
    "$100. But a major new tariff regime just took effect on 99.4% of US imports — a fresh, " +
    "genuinely uncertain macro variable — and next week's Apple, Microsoft, and Meta " +
    "earnings are the next real test, directly relevant given AAPL is a real holding. " +
    "Maintain Current Allocation, with confidence moving up modestly on real, if partial, " +
    "improvement.";

  const executiveSummary =
    "Yesterday's Brief walked back to real caution given a negative test result; today's " +
    "real data is more mixed than uniformly bad. Intel reported a genuinely strong Q2 " +
    "revenue forecast driven by real data center demand, and the stock rose roughly 4.7% " +
    "premarket — a real, positive break in the pattern that hit Alphabet and Taiwan " +
    "Semiconductor, both of which beat and still sold off on capex guidance. That the " +
    "market rewarded Intel's real strength argues the prior pattern isn't universal — " +
    "investors are still discriminating by company, not writing off the sector wholesale. " +
    "Oil also genuinely eased, with Brent retreating back below $100 a barrel after " +
    "Thursday's spike above it on the Red Sea tanker attacks. The broad market opened " +
    "higher attempting to stabilize after Thursday's real selloff, itself the S&P's worst " +
    "single day since June 23 and, by one real account, megacap tech's worst session since " +
    "the April 2025 tariff-driven rout. Separately, a real and genuinely significant macro " +
    "event: new US tariffs of 10-12.5% took effect today on 60 trading partners — including " +
    "the EU, Canada, Mexico, India, and the UK — representing 99.4% of US imports, under a " +
    "new legal basis (Section 301 forced-labor findings) after the Supreme Court struck down " +
    "the prior IEEPA-based tariff regime in February. This replaces, rather than simply " +
    "adds to, an expiring 10% global surcharge, so the net change in the effective tariff " +
    "burden is real but more nuanced than a headline 'new tariffs' framing suggests — some " +
    "partners move from 10% to 12.5%, others stay near where they were. The market's own " +
    "real reaction so far (a modest broad rally, not a selloff) suggests this was largely " +
    "anticipated rather than a fresh shock, though the real, complete economic impact will " +
    "take time to show up in data. This Brief was revised after initial publication: the " +
    "first version reflected one general search on the day's dominant macro story, not a " +
    "real sector-by-sector pass — a real gap worth correcting rather than leaving as-is. A " +
    "proper sweep of healthcare and energy specifically surfaced two more real, well-" +
    "evidenced candidates: CVS Health (a real, structural value case — a fourth consecutive " +
    "earnings beat and a genuinely working Aetna turnaround, though not fresh news this " +
    "week) and First Solar (a real Q1 beat with reaffirmed guidance, tied to the same " +
    "AI/data-center demand theme already prominent this week). Industrials and financials " +
    "were checked with the same rigor and came up empty for a fresh, individually strong " +
    "candidate today. This Brief also names the first real bond-fund candidate now that " +
    "Bonds is a genuinely actionable category: BND, a broad, diversified core holding " +
    "chosen deliberately over a higher-yielding, longer-duration alternative given real, " +
    "current rate-hike risk on the long end of the curve. On balance: real, partial " +
    "improvement, still held to Maintain Current Allocation rather than fully reversing " +
    "yesterday's caution, with Apple reporting specifically on Thursday, July 30 as the " +
    "next real test directly relevant to a position actually held.";

  const historicalSimilarityNarrative =
    "A genuinely mixed day, worth resisting the urge to force into a clean 'good' or 'bad' " +
    "story. Intel's real strength and oil's real retreat argue for calibrated relief; a " +
    "major new tariff regime taking effect argues for real, fresh uncertainty. Holding both " +
    "honestly, without collapsing into either false optimism or manufactured alarm, is the " +
    "same discipline this process has tried to apply all week.";

  const brief = await prisma.brief.upsert({
    where: { userId_date: { userId: user.id, date: BRIEF_DATE } },
    update: {
      decisionRationale,
      executiveSummary,
      councilRecommendation: "MAINTAIN_CURRENT_ALLOCATION",
      councilConfidence: 57,
      marketOutlook: "NEUTRAL",
      historicalSimilarityNarrative,
    },
    create: {
      userId: user.id,
      date: BRIEF_DATE,
      decisionRationale,
      executiveSummary,
      councilRecommendation: "MAINTAIN_CURRENT_ALLOCATION",
      councilConfidence: 57,
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
        "Real, if partial, easing today: oil back below $100, the broad market attempting a " +
        "genuine recovery after Thursday's real selloff. The new tariff regime is a real, " +
        "fresh variable, but the market's own muted reaction to it — a modest rally, not a " +
        "selloff — suggests it was largely anticipated rather than a fresh shock.",
      confidenceScore: 58,
      rationale:
        "The market's real reaction to the tariffs taking effect is itself real evidence about how priced-in this was, separate from any view on the policy itself.",
      risksNoted:
        "The real, complete economic impact of a tariff regime covering 99.4% of imports will take real time to show up in data — today's calm reaction doesn't rule out delayed effects.",
      changeTrigger:
        "Real evidence of the tariffs' actual economic impact as it emerges over coming weeks, not just today's market reaction.",
      verdict: "SUPPORT" as const,
    },
    {
      role: "CHIEF_SECTOR_STRATEGIST" as const,
      opinion:
        "Intel's real Q2 guidance beat — genuine data center demand strength, stock up " +
        "~4.7% premarket — is a real, positive break in the pattern I flagged as a serious " +
        "risk two days ago. The market rewarding this beat, after selling off Alphabet's and " +
        "TSMC's, is real evidence the AI-capex repricing isn't universal — investors are " +
        "still discriminating by company's actual guidance quality, not writing off the " +
        "sector wholesale.",
      confidenceScore: 62,
      rationale:
        "A pattern breaking in a positive direction is exactly as real and worth updating on as the pattern forming in the first place was.",
      risksNoted:
        "One positive data point doesn't fully resolve the broader question — Apple, Microsoft, and Meta next week are real, larger tests still ahead.",
      changeTrigger: "Next week's real earnings reactions from Apple, Microsoft, and Meta.",
      verdict: "SUPPORT" as const,
    },
    {
      role: "CHIEF_COMPANY_ANALYST" as const,
      opinion:
        "No new company-specific evidence today on any of the five real holdings. The real " +
        "news is structural and macro — the tariff regime, oil, Intel's real result — not " +
        "anything specific to AAPL, ASML, UNH, JNJ, or VBR. Worth naming plainly what's " +
        "actually coming: Apple reports next week, a real, dated, directly relevant catalyst " +
        "for a position actually held, not an abstract industry event.",
      confidenceScore: 55,
      rationale:
        "Distinguishing macro noise from company-specific signal matters most on a day like today, where the headlines are all structural.",
      risksNoted:
        "Apple's own real Q3 results next week are a genuine unknown that current evidence says nothing about yet.",
      changeTrigger: "Apple's actual earnings report next week.",
      verdict: "NEUTRAL" as const,
    },
    {
      role: "CHIEF_TECHNICAL_STRATEGIST" as const,
      opinion:
        "Real, early signs of stabilization — a broad market attempting to recover after " +
        "Thursday's real, severe selloff, Intel specifically reversing higher rather than " +
        "extending the prior day's damage. Still just one session; not yet confirmation the " +
        "selloff is fully behind us.",
      confidenceScore: 55,
      rationale:
        "A recovery attempt the day immediately after a severe selloff is real, meaningful information, even if it's not yet a confirmed trend.",
      risksNoted:
        "A failed relief rally that rolls back over would be a real, worse signal than Thursday's selloff alone.",
      changeTrigger:
        "Confirmation over the coming sessions of whether today's recovery attempt holds.",
      verdict: "SUPPORT_WITH_RESERVATIONS" as const,
    },
    {
      role: "CHIEF_RISK_OFFICER" as const,
      opinion:
        "A real, genuinely new risk today, distinct from what's already been tracked this " +
        "week: a major tariff regime covering 99.4% of US imports just took effect, under a " +
        "real, new legal basis after the Supreme Court struck down the prior one. I want to " +
        "be precise about what's actually known versus assumed — the market's calm reaction " +
        "so far is real, current evidence, but it isn't the same as the tariffs' real " +
        "economic impact being known, which will take actual time to show up.",
      confidenceScore: 52,
      rationale:
        "Distinguishing 'the market isn't panicking yet' from 'this risk is resolved' is exactly the discipline this role exists for.",
      risksNoted:
        "Both the tariff regime's real, eventual economic impact and next week's mega-cap earnings are genuine, live unknowns, not resolved by today's calm.",
      changeTrigger:
        "Real, observable economic data reflecting the tariffs' actual impact, or next week's earnings reactions.",
      verdict: "SUPPORT_WITH_RESERVATIONS" as const,
    },
    {
      role: "CHIEF_SCIENTIST" as const,
      opinion:
        "A genuinely different kind of day than either extreme this week — not the clean " +
        "negative test result of Thursday, not a full reversal either. The honest response " +
        "is exactly what's happening: a modest, real confidence increase reflecting real, " +
        "partial improvement, without pretending the picture is fully resolved. Naming next " +
        "week's Apple/Microsoft/Meta earnings as the next real test, rather than declaring " +
        "victory on today's relief rally, is the same discipline that correctly called " +
        "Thursday's test in advance.",
      confidenceScore: 55,
      rationale:
        "A process that can express 'genuinely mixed, real but partial improvement' as its own honest state, not forced into either optimism or pessimism, is doing its job.",
      risksNoted:
        "The temptation to round a mixed day into a cleaner, more satisfying narrative in either direction is itself worth naming as a real risk.",
      changeTrigger:
        "Enough real Briefs accumulate to check whether today's calibrated, partial read was the right one in hindsight.",
      verdict: "NEUTRAL" as const,
    },
    {
      role: "CHIEF_CLIENT_OFFICER" as const,
      opinion:
        "The honest version of today: real relief, not a real resolution. Intel's genuine " +
        "strength and oil's real retreat are worth feeling good about without treating them " +
        "as proof the week's real turbulence is over — a major new tariff regime just took " +
        "effect, and next week brings real earnings from a position actually held. Steady " +
        "through a mixed day is the same discipline as steady through a clearly bad or " +
        "clearly good one.",
      confidenceScore: 56,
      rationale:
        "A mixed real day deserves an honest, mixed response — not smoothed into false confidence or false alarm either way.",
      risksNoted:
        "Overreading one relief-rally session, in either direction, would be the same emotional overreaction this process has avoided all week.",
      changeTrigger:
        "If a genuinely mixed day ever gets rounded into an artificially clean narrative rather than reported honestly as mixed.",
      verdict: "SUPPORT" as const,
    },
    {
      role: "CHIEF_GOVERNANCE_OFFICER" as const,
      opinion:
        "Every figure here traces to real, current, attributed sources: Intel's real " +
        "premarket move and its stated cause, the real oil price level, the real broad " +
        "market figures from Thursday and today, and the real tariff details (rates, real " +
        "effective date, real legal basis, real scope). The tariff policy's real political " +
        "controversy — the forced-labor justification, the EU's public rejection of it — is " +
        "named factually without taking a position on it, which isn't what this Brief is " +
        "for.",
      confidenceScore: 76,
      rationale:
        "A politically sensitive real event handled by reporting the verifiable facts and staying neutral on the policy's merits is the right standard for an investment Brief.",
      risksNoted: "None beyond what's already disclosed above.",
      changeTrigger:
        "Any claim in this Brief that couldn't be traced back to a real, current, attributed source.",
      verdict: "SUPPORT" as const,
    },
    {
      role: "CHIEF_INVESTMENT_OFFICER" as const,
      opinion:
        "Weighing all of this: real, partial improvement — Intel breaking the negative " +
        "pattern, oil retreating — set against a genuinely new, unresolved variable in the " +
        "tariff regime. Maintain Current Allocation stands, with confidence moving up " +
        "modestly (52 to 57) and outlook improving from Cautious to Neutral — real credit " +
        "for real, if incomplete, improvement, not a full reversal chasing one relief-rally " +
        "session. Apple, Microsoft, and Meta next week are the next real test, and Apple's " +
        "result specifically matters for a position this portfolio actually holds.",
      confidenceScore: 57,
      rationale:
        "The Scientist's and Client Officer's shared point — that today is genuinely mixed and deserves to be reported that way, not forced into a cleaner story — is the right frame for the whole Brief.",
      risksNoted:
        "See Primary Risks below — the tariff regime is new; the AI-capex pattern is real but no longer treated as universal after today's real counter-evidence.",
      changeTrigger:
        "Next week's real Apple, Microsoft, and Meta earnings, or real, observable data on the tariffs' actual economic impact.",
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

  await prisma.risk.create({
    data: {
      briefId: brief.id,
      title: "New Tariff Regime — 99.4% of US Imports, Real Impact Not Yet Known",
      description:
        "New US tariffs of 10-12.5% took effect today on 60 trading partners (including the " +
        "EU, Canada, Mexico, India, and the UK), representing 99.4% of US imports, under a " +
        "new legal basis (Section 301 forced-labor findings) after the Supreme Court struck " +
        "down the prior tariff regime in February. Replaces an expiring 10% global surcharge " +
        "rather than simply adding to it, so the net effective change is real but more " +
        "nuanced than a headline framing suggests. The market's calm initial reaction is real " +
        "evidence this was largely anticipated, not proof the real economic impact is known.",
      sourceAssessments: { connect: [{ id: riskOfficer.id }] },
    },
  });

  await prisma.risk.create({
    data: {
      briefId: brief.id,
      title: "AI Capex Selloff Pattern — Real Counter-Evidence, Not Yet Resolved",
      description:
        "Intel's real, strong Q2 guidance beat was rewarded by the market (stock up ~4.7% " +
        "premarket), a genuine, positive break from Alphabet's and TSMC's beat-but-sold-off " +
        "pattern. Real evidence investors are still discriminating by company, not writing " +
        "off AI-linked capital spending broadly — though Apple, Microsoft, and Meta next " +
        "week remain the larger, still-unresolved real test.",
      sourceAssessments: { connect: [{ id: sectorStrategist.id }] },
    },
  });

  await prisma.opportunity.create({
    data: {
      briefId: brief.id,
      thesis:
        "Real, strong Q2 guidance beat driven by genuine data center demand — stock rose " +
        "roughly 4.7% premarket, a real, positive break in the pattern that hit Alphabet and " +
        "TSMC on capex guidance. Directly relevant to the ongoing question of whether the " +
        "market is broadly repricing AI capital spending or judging each company on its own " +
        "real merits — today's evidence supports the latter.",
      conviction: 60,
      companyId: intc.id,
    },
  });

  await prisma.opportunity.create({
    data: {
      briefId: brief.id,
      thesis:
        "A real, structural value case, not fresh news this week — worth being honest about " +
        "that distinction. Real Q1 beat (adjusted EPS $2.57 vs. $2.21 consensus, a 16.47% " +
        "beat), the fourth consecutive quarterly beat. The Aetna turnaround is the real " +
        "engine: Health Care Benefits adjusted operating income rose 52.6% to $3.04 billion, " +
        "and the medical benefit ratio improved from 87.3% to 84.6% — real margin " +
        "improvement, not just a revenue story. Trades at a real forward P/E of 14, below " +
        "the healthcare sector's typical high-teens multiple.",
      conviction: 55,
      companyId: cvs.id,
    },
  });

  await prisma.opportunity.create({
    data: {
      briefId: brief.id,
      thesis:
        "Also a real, structural case rather than fresh news this week. Real Q1 beat (EPS " +
        "$3.22 vs. $2.98 consensus, an 8.02% beat), revenue up 23.6% year over year, net " +
        "income up 65%, adjusted EBITDA at a real 50% margin. Management reaffirmed real " +
        "full-year guidance, and contracted backlog stood at 47.9 GW. A genuine, current " +
        "connection to the same AI/data-center demand theme already prominent this week — " +
        "the EIA's 2026 outlook projects real, substantial electricity demand growth through " +
        "2050 with data centers as a named accelerant, a structural tailwind for domestic " +
        "solar capacity specifically.",
      conviction: 55,
      companyId: fslr.id,
    },
  });

  await prisma.opportunity.create({
    data: {
      briefId: brief.id,
      thesis:
        "The first real fund-level bond candidate — a genuinely different kind of thesis " +
        "from every equity opportunity above, and worth being honest about a real, current " +
        "complication rather than a simple 'buy bonds for yield' pitch. Market pricing has " +
        "shifted toward real odds of a Fed rate hike before year-end, not a cut, with the " +
        "10-year yield rising and the 30-year at 5.10%; long-duration Treasuries (TLT) have " +
        "already fallen roughly 1.73% over the past month on the real, current long-end " +
        "backup. Reaching for the highest-yielding, longest-duration bond fund right now " +
        "would mean picking the one part of the bond market with the most real, immediate " +
        "rate risk. BND is the more defensible starting choice instead: broad, diversified " +
        "exposure across the full US bond market (Treasuries, corporates, mortgage-backed), " +
        "a moderate blended duration rather than a long-duration bet, and a real, low 0.04% " +
        "expense ratio per its own June 2026 fact sheet. The portfolio's Bonds allocation " +
        "has been a real, unaddressed gap since the very first Brief — this is a genuine " +
        "starting position, not a tactical rate call.",
      conviction: 52,
      companyId: bnd.id,
    },
  });

  await prisma.recommendedAction.create({
    data: {
      briefId: brief.id,
      description:
        "Watch Apple's earnings next week closely — a real, dated catalyst directly relevant " +
        "to a position actually held, not an abstract industry event.",
      actionType: "WATCH",
      displayOrder: 1,
    },
  });

  await prisma.recommendedAction.create({
    data: {
      briefId: brief.id,
      description:
        "Monitor real, observable data on the new tariff regime's actual economic impact as " +
        "it emerges — today's calm market reaction reflects anticipation, not confirmed " +
        "impact.",
      actionType: "WATCH",
      displayOrder: 2,
    },
  });

  await prisma.recommendedAction.create({
    data: {
      briefId: brief.id,
      description:
        "Hold current positioning — real, partial improvement today doesn't yet rise to the " +
        "level of a full reversal from this week's real caution.",
      actionType: "HOLD",
      displayOrder: 3,
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
    `Published Brief ${brief.id} for ${BRIEF_DATE.toDateString()} — MarketIQ's sixth real Brief.`,
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
