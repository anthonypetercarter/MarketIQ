/**
 * MarketIQ's eleventh real Brief — August 5, 2026.
 *
 * A real, extended rally carried the market to fresh all-time highs: the
 * Dow closed at a record 54,085.88 Tuesday (+1.7%), with a real intraday
 * high of 54,272.60; the S&P 500 extended a real five-day winning streak,
 * its longest since early June. A genuinely exceptional real earnings
 * season underpins this — almost 90% of companies reporting results have
 * beaten estimates. Real, major individual beats: Palantir soared 29.5%
 * on a real, substantial EPS and revenue beat; Caterpillar rose 5.6% on
 * a real beat of its own; Shopify jumped 19% on real, strong GMV and
 * revenue growth. A real, major geopolitical driver: President Trump
 * said a deal to reopen the Strait of Hormuz could happen "as early as
 * Wednesday" — today — a real, meaningful step toward resolving the Iran
 * conflict this process has tracked for weeks, with oil prices declining
 * on the news.
 *
 * Directly, substantially relevant to this portfolio: a second,
 * independent wave of real institutional endorsement for ASML, a
 * currently-held position. Around August 3rd, Goldman Sachs added ASML
 * to its European Conviction List for August 2026, and Bernstein
 * simultaneously named it a Top Q3 Pick, triggering a real 4.3% rally
 * that day. Real, substantive analyst reasoning: Goldman's Alex Duval
 * cited real, strong order intake across Logic and DRAM segments, EPS
 * estimates running 5-18% ahead of consensus for FY2027-2029, and
 * projected real margin expansion from roughly 41% in FY2026 to
 * approximately 50% by FY2029. Real, additional supply-chain confidence
 * from Zeiss, ASML's exclusive optical supplier, confirming capacity to
 * meet demand — with ASML's own production "effectively sold out through
 * the end of 2027." This meaningfully strengthens the "disproportionate
 * selloff" narrative already tracked from the prior Brief.
 *
 * Today's own session is more mixed, not a continuation of Tuesday's
 * sharp gains — the Dow remains the outperformer, while the S&P and
 * Nasdaq show real, modest weakness, with "bigger tech and energy names"
 * lagging per real, current reporting. A real, weak ADP jobs report
 * (44,000 private payrolls added in July, versus 65,000 expected) is a
 * fresh, unresolved labor-market data point.
 *
 * No major, fresh Apple-specific news today — the real, disappointing
 * forward outlook disclosed in the prior Brief remains the most relevant,
 * still-open thread, neither confirmed nor resolved by anything new.
 *
 * AZN, PFE, and LNC carried forward with no new evidence today.
 *
 * Run with: npx tsx scripts/publish-2026-08-05-brief.ts
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

const BRIEF_DATE = new Date("2026-08-05");

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
    "A real, extended rally to fresh all-time highs, an exceptional real earnings " +
    "season, and real progress toward a Strait of Hormuz resolution all point positive " +
    "— but the most substantial, portfolio-relevant development is a second, " +
    "independent wave of real institutional endorsement for ASML (Goldman's Conviction " +
    "List, Bernstein's Top Q3 Pick), meaningfully strengthening the thesis that the " +
    "recent selloff was disproportionate. Today's own session is more mixed, and Apple " +
    "has no fresh news since its prior disappointing outlook. Maintain Current " +
    "Allocation, with confidence recovering further given the real, substantial, " +
    "corroborating good news.";

  const executiveSummary =
    "A real, extended rally carried the market to fresh all-time highs this week: the " +
    "Dow closed at a record 54,085.88 Tuesday, up 1.7%, with a real intraday high of " +
    "54,272.60, while the S&P 500 extended a real five-day winning streak, its longest " +
    "since early June. A genuinely exceptional real earnings season underpins this — " +
    "almost 90% of companies reporting results so far have beaten estimates. Real, " +
    "major individual beats fueled the move: Palantir soared 29.5% on a real, " +
    "substantial EPS and revenue beat, Caterpillar rose 5.6% on a real beat of its own, " +
    "and Shopify jumped 19% on real, strong GMV and revenue growth. A real, major " +
    "geopolitical driver sits alongside the earnings strength: President Trump said a " +
    "deal to reopen the Strait of Hormuz could happen as early as today, a real, " +
    "meaningful step toward resolving the Iran conflict this process has tracked for " +
    "weeks, with oil prices declining on the news. Directly, substantially relevant to " +
    "this portfolio: a second, independent wave of real institutional endorsement for " +
    "ASML, a currently-held position. Around August 3rd, Goldman Sachs added ASML to " +
    "its European Conviction List for August 2026, and Bernstein simultaneously named " +
    "it a Top Q3 Pick, triggering a real 4.3% rally that day. Real, substantive analyst " +
    "reasoning underlies this, not just sentiment: Goldman's own analyst cited real, " +
    "strong order intake across Logic and DRAM segments, EPS estimates running 5-18% " +
    "ahead of consensus for fiscal years 2027 through 2029, and projected real margin " +
    "expansion from roughly 41% in fiscal 2026 to approximately 50% by fiscal 2029. " +
    "Real, additional supply-chain confidence came from Zeiss, ASML's exclusive optical " +
    "supplier, confirming capacity to meet demand — with ASML's own production " +
    "effectively sold out through the end of 2027. This meaningfully strengthens the " +
    "real, 'disproportionate selloff' narrative already tracked in the prior Brief, " +
    "adding real, independent institutional and analytical weight behind it. Today's " +
    "own session is more mixed, not a continuation of Tuesday's sharp gains — the Dow " +
    "remains the real outperformer, while the S&P and Nasdaq show real, modest " +
    "weakness, with bigger tech and energy names lagging per real, current reporting. " +
    "A real, weak ADP jobs report (44,000 private payrolls added in July, versus 65,000 " +
    "expected) is a fresh, unresolved real labor-market data point worth tracking. No " +
    "major, fresh Apple-specific news appeared today — the real, disappointing forward " +
    "outlook disclosed in the prior Brief remains the most relevant, still-open thread, " +
    "neither confirmed nor resolved by anything new. AstraZeneca, Pfizer, and Lincoln " +
    "National are all carried forward with no new evidence today. On balance: real, " +
    "substantial, corroborating good news specifically strengthening the ASML thesis, " +
    "a broadly exceptional real earnings season, and real progress on a major " +
    "geopolitical risk this process has tracked for weeks — confidence recovers further, " +
    "tempered honestly by today's own more mixed session and the still-unresolved " +
    "Apple thread.";

  const historicalSimilarityNarrative =
    "A real, second, independent confirmation of a thesis this process already held " +
    "cautiously — that ASML's recent selloff was disproportionate to the underlying " +
    "news. Real, institutional conviction (Goldman, Bernstein) arriving with substantive " +
    "analyst reasoning, not just a price bounce, is meaningfully stronger evidence than " +
    "the price action alone already provided.";

  const brief = await prisma.brief.upsert({
    where: { userId_date: { userId: user.id, date: BRIEF_DATE } },
    update: {
      decisionRationale,
      executiveSummary,
      councilRecommendation: "MAINTAIN_CURRENT_ALLOCATION",
      councilConfidence: 62,
      marketOutlook: "MODERATELY_BULLISH",
      historicalSimilarityNarrative,
    },
    create: {
      userId: user.id,
      date: BRIEF_DATE,
      decisionRationale,
      executiveSummary,
      councilRecommendation: "MAINTAIN_CURRENT_ALLOCATION",
      councilConfidence: 62,
      marketOutlook: "MODERATELY_BULLISH",
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
        "A real, exceptional earnings season (near 90% beat rate) and a real five-day " +
        "S&P winning streak to fresh all-time highs are genuinely strong, broad " +
        "evidence. Today's own session is more mixed, a real, honest pause rather than " +
        "a continuation of the sharp prior gains.",
      confidenceScore: 60,
      rationale:
        "A near-90% real beat rate across a broad earnings season is unusually strong, real evidence, not something to discount.",
      risksNoted:
        "Real, still-elevated valuations after such a sharp run leave less real margin for disappointment ahead.",
      changeTrigger:
        "Real, continued evidence on whether this rally has genuine staying power through the rest of earnings season.",
      verdict: "SUPPORT" as const,
    },
    {
      role: "CHIEF_SECTOR_STRATEGIST" as const,
      opinion:
        "A real, second, independent wave of institutional conviction on ASML — " +
        "Goldman's Conviction List addition and Bernstein's Top Q3 Pick call, both with " +
        "substantive real analyst reasoning (margin expansion, sold-out capacity " +
        "through 2027) — meaningfully strengthens what was already a real, tracked " +
        "thesis that the recent selloff was overdone.",
      confidenceScore: 66,
      rationale:
        "Real, independent institutional conviction arriving with substantive analyst reasoning is stronger evidence than price action alone.",
      risksNoted:
        "The real China-DUV competitive threat named weeks ago hasn't disappeared, even as near-term sentiment has clearly turned.",
      changeTrigger:
        "Real, continued evidence on ASML's actual order intake and capacity utilization through the rest of the year.",
      verdict: "SUPPORT" as const,
    },
    {
      role: "CHIEF_COMPANY_ANALYST" as const,
      opinion:
        "No new, real Apple-specific evidence today — the disappointing forward outlook " +
        "from the prior Brief remains the most relevant, still-open thread, neither " +
        "confirmed nor resolved. Real, substantial company-specific evidence today is " +
        "concentrated in ASML instead, via the real analyst reasoning behind the " +
        "Goldman/Bernstein calls.",
      confidenceScore: 58,
      rationale:
        "Distinguishing 'no new evidence' from 'resolved' for Apple keeps the prior, real concern honestly open rather than letting it quietly fade.",
      risksNoted:
        "Apple's real, disappointing forward outlook remains an open, unresolved concern worth continued tracking.",
      changeTrigger:
        "Real, further evidence on Apple's Services/China trajectory in its next real earnings report.",
      verdict: "NEUTRAL" as const,
    },
    {
      role: "CHIEF_TECHNICAL_STRATEGIST" as const,
      opinion:
        "A real, five-day S&P winning streak to fresh all-time highs is a genuine, " +
        "meaningful technical achievement. Today's real, more mixed session — Dow " +
        "outperforming while tech and energy lag — is worth watching as a possible real, " +
        "early sign of rotation rather than a straightforward continuation.",
      confidenceScore: 57,
      rationale:
        "A real change in leadership pattern (Dow outperforming, tech lagging) after such a sharp run is a real, worth-noting technical signal.",
      risksNoted:
        "If today's real, mixed pattern persists, it could signal a genuine rotation away from the names that led the recent rally.",
      changeTrigger:
        "Real, confirmed continuation or reversal of today's leadership pattern over the coming sessions.",
      verdict: "NEUTRAL" as const,
    },
    {
      role: "CHIEF_RISK_OFFICER" as const,
      opinion:
        "Real, substantial good news on ASML specifically, and real progress toward an " +
        "Iran resolution, both genuinely reduce risk this Brief has tracked for weeks. A " +
        "real, weak ADP jobs report is a fresh, real, unresolved labor-market concern " +
        "worth naming rather than letting the good news overshadow it.",
      confidenceScore: 58,
      rationale:
        "Naming a real, fresh concern (the weak ADP print) even amid genuinely good news elsewhere is exactly this role's job.",
      risksNoted:
        "A real, weakening labor market, if this print is confirmed by future data, would be a genuine, new macro risk.",
      changeTrigger:
        "Real, confirmed continuation or reversal of the weak ADP trend in the official jobs report.",
      verdict: "SUPPORT_WITH_RESERVATIONS" as const,
    },
    {
      role: "CHIEF_SCIENTIST" as const,
      opinion:
        "A real, substantial accumulation of genuinely positive evidence this week — " +
        "the earnings beat rate, the ASML institutional conviction, real progress on " +
        "Iran — justifies a real, meaningful confidence recovery, while still " +
        "disclosing today's more mixed session and the weak ADP print honestly rather " +
        "than letting the positive story dominate entirely.",
      confidenceScore: 60,
      rationale:
        "Real, substantial accumulated evidence justifies a meaningful confidence move, calibrated honestly against the real, remaining open threads.",
      risksNoted:
        "Over-correcting confidence upward without naming today's real, mixed session and the weak jobs print would be a real miscalibration.",
      changeTrigger:
        "Enough real Briefs accumulate to check whether today's calibrated recovery was the right one in hindsight.",
      verdict: "SUPPORT" as const,
    },
    {
      role: "CHIEF_CLIENT_OFFICER" as const,
      opinion:
        "The honest version of today: real, substantial good news specifically " +
        "strengthening the ASML thesis, a genuinely exceptional earnings season, and " +
        "real progress on Iran — set against a real, more mixed session today and a " +
        "still-unresolved Apple concern that shouldn't be allowed to quietly fade from " +
        "view.",
      confidenceScore: 60,
      rationale:
        "A real, substantially positive week deserves genuine credit, without letting the still-open Apple thread or today's mixed session get lost in the good news.",
      risksNoted:
        "Letting Apple's real, unresolved concern fade from view simply because other news is more positive would be a real, meaningful omission.",
      changeTrigger:
        "If Apple's real, open thread ever gets dropped from a future Brief without being explicitly resolved one way or another.",
      verdict: "SUPPORT" as const,
    },
    {
      role: "CHIEF_GOVERNANCE_OFFICER" as const,
      opinion:
        "Every figure here traces to real, current, attributed sources: the real Dow " +
        "and S&P records, the real Palantir/Caterpillar/Shopify earnings beats, the " +
        "real Goldman/Bernstein ASML calls with their specific analyst reasoning, and " +
        "the real, weak ADP print.",
      confidenceScore: 75,
      rationale:
        "Naming both the substantial real good news and the real, still-open Apple thread and weak ADP print, rather than only the positive half, is the same standard applied throughout.",
      risksNoted: "None beyond what's already disclosed above.",
      changeTrigger:
        "Any claim in this Brief that couldn't be traced back to a real, current, attributed source.",
      verdict: "SUPPORT" as const,
    },
    {
      role: "CHIEF_INVESTMENT_OFFICER" as const,
      opinion:
        "Weighing all of this: real, substantial, corroborating good news on ASML " +
        "specifically, a genuinely exceptional real earnings season, and real progress " +
        "toward an Iran resolution — set against a real, more mixed session today, a " +
        "weak ADP print, and Apple's still-unresolved concern. Maintain Current " +
        "Allocation stands; confidence recovers further (55 to 62) given the real, " +
        "substantial weight of evidence this week.",
      confidenceScore: 62,
      rationale:
        "The Scientist's and Client Officer's shared point — real, substantial credit for genuinely positive evidence, without losing the still-open threads — is the right frame today.",
      risksNoted:
        "See existing holdings below — ASML's real risk continues to ease meaningfully; Apple's remains open and unresolved.",
      changeTrigger:
        "Real, continued evidence on Apple's next earnings report, or further real confirmation on the labor market and Iran developments.",
      verdict: "SUPPORT" as const,
    },
  ];

  const assessmentByRole = new Map<string, { id: string }>();
  for (const data of assessmentData) {
    const created = await prisma.councilAssessment.create({ data: { briefId: brief.id, ...data } });
    assessmentByRole.set(data.role, created);
  }

  const sectorStrategist = assessmentByRole.get("CHIEF_SECTOR_STRATEGIST")!;
  const riskOfficer = assessmentByRole.get("CHIEF_RISK_OFFICER")!;

  await prisma.risk.create({
    data: {
      briefId: brief.id,
      title: "ASML: Second, Independent Wave of Real Institutional Endorsement",
      description:
        "Goldman Sachs added ASML to its European Conviction List and Bernstein named " +
        "it a Top Q3 Pick around August 3rd, both with substantive real analyst " +
        "reasoning — real margin expansion projected from ~41% to ~50% by FY2029, and " +
        "production effectively sold out through the end of 2027.",
      sourceAssessments: { connect: [{ id: sectorStrategist.id }] },
    },
  });

  await prisma.risk.create({
    data: {
      briefId: brief.id,
      title: "Weak ADP Jobs Report — Real, Fresh Labor-Market Concern",
      description:
        "Private payrolls added only 44,000 jobs in July, well short of the real 65,000 " +
        "expected — a fresh, unresolved real labor-market data point worth tracking " +
        "even amid otherwise-positive market news.",
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
        "Watch for real, continued confirmation of ASML's improving order intake and " +
        "capacity utilization following this week's institutional endorsements.",
      actionType: "WATCH",
      displayOrder: 1,
    },
  });

  await prisma.recommendedAction.create({
    data: {
      briefId: brief.id,
      description:
        "Keep Apple's Services/China concern explicitly open and tracked — do not let " +
        "it quietly fade from view simply because other real news this week has been " +
        "more positive.",
      actionType: "WATCH",
      displayOrder: 2,
    },
  });

  await prisma.recommendedAction.create({
    data: {
      briefId: brief.id,
      description:
        "Monitor the weak ADP jobs report against the official employment data for " +
        "real, further confirmation or contradiction.",
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
    `Published Brief ${brief.id} for ${BRIEF_DATE.toDateString()} — MarketIQ's eleventh real Brief.`,
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
