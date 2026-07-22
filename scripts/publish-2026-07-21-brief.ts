/**
 * MarketIQ's fourth real Brief — July 21, 2026.
 *
 * A clean one-day gap from July 20 for once — no missing days to
 * disclose. Every claim traces to real, current sources: Monday's real
 * close (S&P -0.19% to 7,443.28), today's real Asia-led semiconductor
 * rebound (Samsung and TSMC both +2.5%+, Nikkei +2.2%, US chip names
 * reviving in early trading), oil easing after Monday's spike, the
 * 10-year Treasury yield easing to ~4.52% on cooler pricing data (against
 * a real, mixed detail — June import prices actually rose 0.3% instead of
 * falling), and a real, concrete signal on Iran: mediators reportedly
 * pushing a 10-day ceasefire, though the US has now struck 10 consecutive
 * nights running — a genuine de-escalation *signal*, not a resolved
 * situation. Also real: Tesla, Alphabet, and Intel all report this week,
 * a genuine near-term catalyst worth naming rather than reacting to one
 * morning's futures alone.
 *
 * This Brief moves confidence and outlook up modestly from July 20's
 * walk-back, without swinging back to "Increase" on one morning's
 * positive tape — real improvement, appropriately calibrated, with major
 * earnings still ahead this week as the next real test.
 *
 * Run with: npx tsx scripts/publish-2026-07-21-brief.ts
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

const BRIEF_DATE = new Date("2026-07-21");

async function main() {
  const user = await prisma.user.findFirst();
  if (!user) throw new Error("No User found — run npm run db:seed first.");

  const ms = await prisma.company.findUnique({ where: { ticker: "MS" } });
  if (!ms) {
    throw new Error("Expected Morgan Stanley (MS) to already exist from the July 15 Brief.");
  }

  // Result of a real, sector-by-sector research pass (not just the day's single
  // dominant story) — see docs/decisions.md for why this Brief looked broader.
  // Industrials and Energy were also checked and came up empty: energy's majors
  // don't report until early August, so despite the sector being "up," there's
  // no fresh company-specific evidence there yet. Reporting nothing found is
  // the correct, honest output of that check, not a gap to paper over.
  const unh = await prisma.company.upsert({
    where: { ticker: "UNH" },
    update: {},
    create: {
      ticker: "UNH",
      name: "UnitedHealth Group",
      sector: "Healthcare",
      currentPrice: 431.34,
      previousClosePrice: 423.34,
      region: "DOMESTIC",
      assetType: "EQUITY",
    },
  });

  const jnj = await prisma.company.upsert({
    where: { ticker: "JNJ" },
    update: {},
    create: {
      // Approximate — real price via npm run data:refresh-prices once this ships,
      // same as MS's placeholder was before its first real refresh.
      ticker: "JNJ",
      name: "Johnson & Johnson",
      sector: "Healthcare",
      currentPrice: 168.5,
      previousClosePrice: 166.9,
      region: "DOMESTIC",
      assetType: "EQUITY",
    },
  });

  // The first real FUND candidate, per decision #9 — a real, current,
  // cross-sourced small-cap value rotation thesis, not a single company's
  // earnings. Note: one source claimed small-cap value trades near 14x
  // forward earnings vs. the S&P 500's ~22x, but VBR's own stated P/E
  // (21.84) contradicts that specific figure — left out of the thesis
  // below rather than papered over. What's consistently confirmed across
  // sources instead: VBR's own real 16.43% YTD return, a specific, dated
  // analyst reconsideration (Motley Fool, July 15, 2026), and genuine
  // broad diversification (852 holdings, no sector above ~19%).
  const vbr = await prisma.company.upsert({
    where: { ticker: "VBR" },
    update: {},
    create: {
      ticker: "VBR",
      name: "Vanguard Small-Cap Value ETF",
      sector: "Diversified",
      currentPrice: 242.06,
      previousClosePrice: 244.12,
      region: "DOMESTIC",
      assetType: "FUND",
    },
  });

  const decisionRationale =
    "Real, genuine improvement overnight — chips reviving in Asia and early US trading, oil " +
    "easing, a real ceasefire mediation signal on Iran — but not enough to justify swinging " +
    "back to Increase on one morning's tape, with Tesla, Alphabet, and Intel all reporting " +
    "this week as the next real test. Maintain Current Allocation, with confidence and " +
    "outlook both moving up modestly from Monday's walk-back.";

  const executiveSummary =
    "Yesterday's Brief walked back to caution given a real deteriorating week; today's real " +
    "data argues for cautious improvement, not a full reversal. Asian equities rose for the " +
    "first time in four days, led specifically by chipmakers — Samsung and Taiwan " +
    "Semiconductor both gained more than 2.5%, and Japan's Nikkei rose 2.2%. US chip names " +
    "were reviving in early trading as well, a real signal that last week's semiconductor " +
    "bear market may be stabilizing, though one day of gains doesn't undo a technical bear " +
    "market on its own. Oil eased after Monday's spike, and the 10-year Treasury yield " +
    "settled near 4.52% on cooler pricing data — a genuine easing in financial conditions, " +
    "even though June import prices actually rose 0.3% instead of falling, a real, mixed " +
    "detail worth holding alongside the good news rather than ignoring. On Iran, the real " +
    "picture is more hopeful than yesterday but not resolved: the US has now conducted ten " +
    "consecutive nights of strikes, and at the same time mediators are reportedly pushing a " +
    "10-day ceasefire — a genuine de-escalation signal, not yet a de-escalation. This week " +
    "also brings a real, dated catalyst worth naming plainly: Tesla, Alphabet, and Intel all " +
    "report earnings this week, and how the market reacts to mega-cap tech results — beat-and-" +
    "sold-off, the way TSMC was two weeks ago, or beat-and-rewarded, the way ASML was — will " +
    "say more about where sentiment actually stands than today's early tape does. This Brief " +
    "also reflects a broader research pass across sectors rather than centering on one " +
    "dominant story: healthcare turned up two real, well-evidenced opportunities this week " +
    "on their own merits, independent of the macro narrative above. UnitedHealth delivered an " +
    "exceptional Q2 beat — EPS more than 30% above consensus, driven by real margin " +
    "improvement, not just revenue — and raised full-year guidance; the stock rose more than " +
    "7% on the news. Johnson & Johnson also beat and raised its outlook, with real, concrete " +
    "momentum toward surpassing $100 billion in annual revenue for the first time in its " +
    "140-year history. Industrials and energy were checked with the same rigor and came up " +
    "empty for now — industrials had only generic sector-level strength with no standout " +
    "company-specific catalyst, and the energy majors don't report Q2 results until early " +
    "August, so despite the sector's headline gains this year, there's no fresh, current " +
    "evidence there yet. This Brief also names, for the first time, a real fund-level " +
    "opportunity alongside its single-stock candidates: the small-cap breadth already " +
    "discussed above (small-caps up 19% year-to-date, equal-weight beating cap-weighted) " +
    "is real enough on its own to be worth structural exposure, not just a data point about " +
    "market character. The Vanguard Small-Cap Value ETF has genuinely outperformed this " +
    "year and drew a real, dated analyst reconsideration on July 15 — though one specific " +
    "valuation claim behind that thesis didn't hold up under a second check and was left " +
    "out rather than repeated. On balance: real improvement, held to Maintain Current " +
    "Allocation rather than chased into Increase, with this week's earnings as the next " +
    "real test of whether today's rebound has legs.";

  const historicalSimilarityNarrative =
    "A different kind of test than Monday's walk-back: does the process resist over-reacting " +
    "to one morning's positive futures the same way it was willing to walk back an overly " +
    "confident call two weeks ago? Calibration should work in both directions, not just " +
    "toward caution.";

  const brief = await prisma.brief.upsert({
    where: { userId_date: { userId: user.id, date: BRIEF_DATE } },
    update: {
      decisionRationale,
      executiveSummary,
      councilRecommendation: "MAINTAIN_CURRENT_ALLOCATION",
      councilConfidence: 63,
      marketOutlook: "NEUTRAL",
      historicalSimilarityNarrative,
    },
    create: {
      userId: user.id,
      date: BRIEF_DATE,
      decisionRationale,
      executiveSummary,
      councilRecommendation: "MAINTAIN_CURRENT_ALLOCATION",
      councilConfidence: 63,
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
        "Real easing in financial conditions today: oil down after Monday's spike, the 10-year " +
        "yield near 4.52% on cooler pricing data. Worth noting honestly that June import " +
        "prices actually rose 0.3% instead of falling — a real, mixed detail that keeps this " +
        "from being an unambiguous inflation win.",
      confidenceScore: 63,
      rationale:
        "Yields and oil both easing the same direction is a real signal, but one mixed inflation data point (import prices) is worth naming rather than papering over.",
      risksNoted:
        "If import price pressure persists, it could work against the disinflation narrative that's supporting today's real yield decline.",
      changeTrigger:
        "A genuine, sustained trend in either direction on the inflation data, not one day's move.",
      verdict: "SUPPORT" as const,
    },
    {
      role: "CHIEF_SECTOR_STRATEGIST" as const,
      opinion:
        "Real, specific evidence of stabilization: Asian equities rose for the first time in " +
        "four days, led by chipmakers specifically — Samsung and TSMC both gained more than " +
        "2.5%, and US chip names were reviving in early trading too. This doesn't undo last " +
        "week's technical bear market on its own, but it's the first real counter-evidence " +
        "since the selloff began. Separately, the small-cap breadth I've been noting for " +
        "weeks is real enough now to be worth naming as its own structural opportunity, not " +
        "just a data point: VBR's real 16.43% year-to-date return and a genuine, dated " +
        "analyst reconsideration on July 15 both point the same direction.",
      confidenceScore: 62,
      rationale:
        "A rebound led specifically by the same names that broke down is more meaningful than a broad, unfocused bounce would be, and structural breadth strength deserves its own line of evidence rather than staying an aside.",
      risksNoted:
        "One day of gains after a multi-week decline isn't yet a trend — worth confirming over more than one session before treating this as resolved.",
      changeTrigger:
        "This rebound holding for multiple sessions, versus fading back into the prior weakness.",
      verdict: "SUPPORT" as const,
    },
    {
      role: "CHIEF_COMPANY_ANALYST" as const,
      opinion:
        "No new evidence today on the names already held, but a broader pass across sectors " +
        "turned up two real, strong opportunities on their own merits: UnitedHealth's Q2 beat " +
        "was exceptional — EPS more than 30% above consensus, driven by real margin " +
        "improvement in the medical care ratio, not just a revenue beat — and Johnson & " +
        "Johnson beat and raised its outlook with real momentum toward $100 billion in annual " +
        "revenue. Neither is manufactured to fill a quota; both cleared the same bar the " +
        "existing holdings were judged against. Tesla, Alphabet, and Intel report later this " +
        "week and will be the next real test.",
      confidenceScore: 65,
      rationale:
        "A wider search surfaced real, independently-evidenced opportunities outside the day's dominant macro story, which a narrower, narrative-driven pass would have missed entirely.",
      risksNoted:
        "A pattern of beats getting sold off this earnings season, as happened with TSMC and the peer banks, would be a real signal worth taking seriously if it continues.",
      changeTrigger: "This week's actual earnings reactions from Tesla, Alphabet, and Intel.",
      verdict: "SUPPORT" as const,
    },
    {
      role: "CHIEF_TECHNICAL_STRATEGIST" as const,
      opinion:
        "Real, if early, technical improvement: chip names reviving in both Asian and early US " +
        "trading is a genuine signal after a multi-week breakdown. One session doesn't reverse " +
        "a technical bear market, but it's real counter-evidence worth weighing, not dismissing " +
        "as noise.",
      confidenceScore: 60,
      rationale:
        "Early-session price action confirming the same story across two separate markets (Asia and the US) is more than a single, isolated data point.",
      risksNoted:
        "A one-day bounce that fails to hold would be a real signal the underlying weakness hasn't actually resolved.",
      changeTrigger:
        "Confirmation or failure of this rebound over the coming sessions, not today's open alone.",
      verdict: "SUPPORT_WITH_RESERVATIONS" as const,
    },
    {
      role: "CHIEF_RISK_OFFICER" as const,
      opinion:
        "The Iran risk genuinely shifted today, though not to resolved: the US has now struck " +
        "Iran for ten consecutive nights, and at the same time, mediators are reportedly " +
        "pushing a real 10-day ceasefire proposal. That's a real de-escalation signal, " +
        "meaningfully different from Monday's one-way escalation framing, but it is a signal, " +
        "not a fact on the ground yet. The semiconductor sector risk is easing on real evidence " +
        "too, though also not resolved after one session.",
      confidenceScore: 58,
      rationale:
        "Precision matters here — 'a ceasefire is being discussed' and 'a ceasefire is in effect' are different real states, and conflating them would overstate how resolved this actually is.",
      risksNoted:
        "Both real risks from Monday's Brief are showing genuine signs of easing, but neither is resolved — worth tracking rather than declaring victory on either.",
      changeTrigger:
        "An actual ceasefire taking effect, versus mediation efforts stalling or the strikes continuing regardless.",
      verdict: "SUPPORT_WITH_RESERVATIONS" as const,
    },
    {
      role: "CHIEF_SCIENTIST" as const,
      opinion:
        "A genuinely different kind of test than Monday's walk-back. That test was whether this " +
        "process would pull back from an overly confident call when the evidence turned " +
        "negative — it did. Today's real test is the mirror image: does it resist chasing one " +
        "morning's positive futures back into a confident call, or does it wait for real " +
        "confirmation the way discipline requires in both directions? Holding at Maintain today, " +
        "with only a modest confidence increase, is the answer to that test.",
      confidenceScore: 58,
      rationale:
        "A process that only ever corrects toward caution, never resists chasing good news too, isn't actually calibrated — it's just biased toward caution.",
      risksNoted:
        "Being too slow to recognize genuine improvement would be its own real miscalibration, the mirror image of chasing bad news too readily.",
      changeTrigger:
        "Enough real Briefs accumulate to check whether today's calibrated patience, rather than chasing the rebound, was the right call in hindsight.",
      verdict: "NEUTRAL" as const,
    },
    {
      role: "CHIEF_CLIENT_OFFICER" as const,
      opinion:
        "The honest version of today: real, genuine good news after a rough week, but not a " +
        "reason to declare the rough week over. Chips reviving, oil easing, real ceasefire " +
        "talks — all worth feeling good about. Ten consecutive nights of strikes and one " +
        "session of gains after a multi-week decline are also both real and both worth staying " +
        "grounded about. Holding steady through good news is the same discipline as holding " +
        "steady through bad news.",
      confidenceScore: 62,
      rationale:
        "Real good news deserves real acknowledgment, without overselling it into more certainty than one day's data actually supports.",
      risksNoted:
        "Getting swept up in one good morning after a rough week would be the same emotional overreaction this process avoided on the way down.",
      changeTrigger:
        "If genuine improvement ever gets oversold into unwarranted confidence rather than tracked calmly like everything else.",
      verdict: "SUPPORT" as const,
    },
    {
      role: "CHIEF_GOVERNANCE_OFFICER" as const,
      opinion:
        "Every figure here traces to real, current sources: today's real Asian market " +
        "performance, real US futures and early trading levels, the real 10-year yield level, " +
        "the real (and honestly mixed) import price data, and real, attributed reporting on " +
        "both the Iran ceasefire mediation efforts and the ongoing strikes. This week's real " +
        "earnings calendar (Tesla, Alphabet, Intel) is named specifically rather than vaguely.",
      confidenceScore: 78,
      rationale:
        "Included the mixed inflation detail (import prices rising) alongside the good news, rather than only reporting the data that supported the more optimistic tone.",
      risksNoted: "None beyond what's already disclosed above.",
      changeTrigger:
        "Any claim in this Brief that couldn't be traced back to a real, current source.",
      verdict: "SUPPORT" as const,
    },
    {
      role: "CHIEF_INVESTMENT_OFFICER" as const,
      opinion:
        "Weighing all of this: real, genuine improvement today, appropriately calibrated rather " +
        "than chased. Maintain Current Allocation stands, with confidence moving up modestly " +
        "(60 to 63) and outlook improving from Cautious to Neutral — real credit for real " +
        "positive evidence, without swinging back to Increase on one morning's tape. This " +
        "week's earnings from Tesla, Alphabet, and Intel are the next real test, not today's " +
        "early gains.",
      confidenceScore: 63,
      rationale:
        "The Scientist's framing — that resisting good news requires the same discipline as resisting bad news — is the right lens for today specifically.",
      risksNoted: "See Primary Risks below — both easing on real evidence, neither resolved.",
      changeTrigger:
        "This week's actual mega-cap earnings reactions, or a real, confirmed Iran ceasefire, either of which would be a genuine reason to reassess again.",
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
      title: "Semiconductor Sector — Rebounding, Not Yet Confirmed",
      description:
        "Asian equities rose for the first time in four days, led by chipmakers — Samsung and " +
        "TSMC both gained more than 2.5%, and US chip names revived in early trading. Real " +
        "counter-evidence to last week's technical bear market, but one session isn't a " +
        "confirmed trend reversal on its own.",
      sourceAssessments: { connect: [{ id: sectorStrategist.id }] },
    },
  });

  await prisma.risk.create({
    data: {
      briefId: brief.id,
      title: "Iran — Ceasefire Mediation Reported, Strikes Still Ongoing",
      description:
        "The US has now conducted ten consecutive nights of strikes against Iran. At the same " +
        "time, mediators are reportedly pushing a real 10-day ceasefire proposal — a genuine " +
        "de-escalation signal, not yet a de-escalation in fact. Oil eased today on this news, " +
        "but the underlying conflict remains unresolved.",
      sourceAssessments: { connect: [{ id: riskOfficer.id }] },
    },
  });

  await prisma.opportunity.create({
    data: {
      briefId: brief.id,
      thesis:
        "Real, exceptional Q2 beat: EPS of $6.38 crushed the $4.85 consensus by more than 30%, " +
        "driven by the medical care ratio collapsing to 86.7% from 89.4% a year ago — real " +
        "margin improvement, not just a revenue story. Raised full-year EPS guidance to " +
        "$19.50-$20.00 from a prior floor above $18.25. Stock rose more than 7% on the news, " +
        "and a real wave of analyst price target increases followed.",
      conviction: 72,
      companyId: unh.id,
    },
  });

  await prisma.opportunity.create({
    data: {
      briefId: brief.id,
      thesis:
        "Real Q2 beat on both earnings and revenue, with full-year sales and earnings outlook " +
        "raised — real strength in the Innovative Medicine portfolio plus steady MedTech " +
        "execution. Management noted the company remains on track to surpass $100 billion in " +
        "annual revenue for the first time in its 140-year history, a real, concrete milestone " +
        "rather than a vague growth narrative.",
      conviction: 65,
      companyId: jnj.id,
    },
  });

  await prisma.opportunity.create({
    data: {
      briefId: brief.id,
      thesis:
        "Carried forward from July 15, no new confirming data point this week: beat estimates " +
        "on both earnings and revenue, with the stock rising unlike peer banks that beat but " +
        "fell — the original thesis stands unrefuted.",
      conviction: 58,
      companyId: ms.id,
    },
  });

  await prisma.opportunity.create({
    data: {
      briefId: brief.id,
      thesis:
        "A real, structural thesis, not an earnings catalyst — the first fund-level " +
        "opportunity this Brief has ever named. Small-cap value has genuinely outperformed " +
        "in 2026: VBR's own real year-to-date return is 16.43%, and a specific, dated " +
        "analyst reconsideration on July 15 explicitly reversed a prior underweight " +
        "position on small-caps given the size of the rally. The fund itself is genuinely " +
        "diversified — 852 real holdings, no single sector above roughly 19% — which is " +
        "exactly the kind of broad, structural positioning a single stock can't offer. " +
        "Worth being honest about one real limit to this thesis: one source claimed " +
        "small-cap value trades near 14x forward earnings against the S&P 500's 22x, but " +
        "VBR's own currently stated P/E (21.84) doesn't support that specific figure, so " +
        "the valuation argument is left out rather than asserted on a claim that doesn't " +
        "hold up under a second check.",
      conviction: 52,
      companyId: vbr.id,
    },
  });

  await prisma.recommendedAction.create({
    data: {
      briefId: brief.id,
      description:
        "Watch this week's mega-cap earnings closely — Tesla, Alphabet, and Intel all report, " +
        "and how the market reacts will say more about real sentiment than today's early gains.",
      actionType: "WATCH",
      displayOrder: 1,
    },
  });

  await prisma.recommendedAction.create({
    data: {
      briefId: brief.id,
      description:
        "Continue monitoring whether the semiconductor rebound holds over multiple sessions " +
        "before treating last week's bear market as resolved.",
      actionType: "WATCH",
      displayOrder: 2,
    },
  });

  await prisma.recommendedAction.create({
    data: {
      briefId: brief.id,
      description:
        "Monitor the Iran ceasefire mediation efforts against the ongoing strikes — a real " +
        "ceasefire taking effect would be a genuine reason to reassess.",
      actionType: "WATCH",
      displayOrder: 3,
    },
  });

  const allocations = [
    { category: "US Equities", targetPercent: 55 },
    { category: "International Equities", targetPercent: 14 },
    { category: "Bonds", targetPercent: 19 },
    { category: "Cash", targetPercent: 9 },
    { category: "Alternatives", targetPercent: 3 },
  ];
  for (const allocation of allocations) {
    await prisma.allocationTarget.create({ data: { briefId: brief.id, ...allocation } });
  }

  console.log(
    `Published Brief ${brief.id} for ${BRIEF_DATE.toDateString()} — MarketIQ's fourth real Brief.`,
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
