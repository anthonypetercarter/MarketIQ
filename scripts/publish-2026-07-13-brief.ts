/**
 * Inserts MarketIQ's first real Brief — July 13, 2026.
 *
 * Every factual claim here traces to something real: live prices already
 * synced via `npm run data:refresh-prices` (Alpaca), macro readings
 * confirmed via `npm run data:verify-fred` (FRED, printed in-terminal on
 * 2026-07-13: yield curve 0.35, Fed funds 3.63%, high-yield credit spread
 * 2.69), and current market reporting (S&P/Nasdaq/Dow levels, the
 * SK Hynix-driven semiconductor selloff, the US-Iran escalation and oil
 * spike, this week's earnings calendar). No invented figures.
 *
 * This is NOT prisma/seed.ts's illustrative demo content — that stays as
 * realistic-but-fictional Sprint 1-3 material. This is the first Brief
 * meant to be actually believed and acted on, authored by a human (with
 * AI drafting assistance) reading real data, exactly the "Real Data, Human
 * Council" milestone from docs/decisions.md #5.
 *
 * Run with: npx tsx scripts/publish-2026-07-13-brief.ts
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

const BRIEF_DATE = new Date("2026-07-13");

async function main() {
  const user = await prisma.user.findFirst();
  if (!user) throw new Error("No User found — run npm run db:seed first.");

  const aapl = await prisma.company.findUnique({ where: { ticker: "AAPL" } });
  const jpm = await prisma.company.findUnique({ where: { ticker: "JPM" } });
  if (!aapl || !jpm) {
    throw new Error("Expected AAPL and JPM to already exist from earlier seed data.");
  }

  const decisionRationale =
    "Today's selloff is a real geopolitical and single-sector shock — not a change in the " +
    "underlying macro backdrop. Maintain current positioning through this week's actual " +
    "test: Tuesday's CPI print and the start of bank and semiconductor earnings.";

  const executiveSummary =
    "The council enters today cautious, not alarmed. Markets are down real amounts — the S&P " +
    "500 off roughly 0.4-0.7%, the Nasdaq Composite down closer to 1-1.5% — after the US and " +
    "Iran escalated over the weekend and oil jumped on renewed Strait of Hormuz tensions. " +
    "Separately, and adding to today's weakness, SK Hynix's shares fell sharply in Seoul and on " +
    "its new US listing after a brokerage report questioned its quarterly estimates, dragging " +
    "Micron, Sandisk, Seagate, and other AI-linked chip names down with it — NVIDIA included, " +
    "giving back part of Friday's 4% gain. The Chief Risk Officer's read is the one worth " +
    "weighing most heavily: the semiconductor trade has run hard this year (the sector ETF is " +
    "up roughly 70% year-to-date) and today looks like a crowded trade unwinding on real news, " +
    "not a broad change in conditions. Underneath the noise, the macro backdrop the Chief " +
    "Market Officer watches is still constructive — the yield curve remains positive and " +
    "narrowed slightly today, the Fed funds rate is unchanged, and high-yield credit spreads " +
    "actually tightened, not widened, which is not what a genuine risk-off regime typically " +
    "looks like underneath the surface. The real test is this week, not today: June CPI prints " +
    "Tuesday, expected to show inflation cooling to 3.8% from 4.2%, and bank earnings (JPMorgan " +
    "among them) begin the same day, with ASML and Taiwan Semiconductor's results later in the " +
    "week giving a genuine fundamental read on whether the chip trade's exhaustion is real or " +
    "sentiment-driven. On balance, the evidence supports holding current positioning and using " +
    "this week's real data — not today's geopolitical headline — to decide what comes next.";

  const historicalSimilarityNarrative =
    "Resembles prior geopolitically-driven single-day selloffs layered on an otherwise intact, " +
    "earnings-led bull market — the S&P 500 is still up roughly 11% year-to-date. In comparable " +
    "past episodes, the macro backdrop underneath the headline (credit spreads, the yield curve) " +
    "was the more reliable signal than the day's price action itself.";

  const brief = await prisma.brief.upsert({
    where: { userId_date: { userId: user.id, date: BRIEF_DATE } },
    update: {
      decisionRationale,
      executiveSummary,
      councilRecommendation: "MAINTAIN_CURRENT_ALLOCATION",
      councilConfidence: 64,
      marketOutlook: "CAUTIOUS",
      historicalSimilarityNarrative,
    },
    create: {
      userId: user.id,
      date: BRIEF_DATE,
      decisionRationale,
      executiveSummary,
      councilRecommendation: "MAINTAIN_CURRENT_ALLOCATION",
      councilConfidence: 64,
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
        "The macro backdrop remains constructive underneath today's headlines. The yield curve " +
        "is still positive and actually narrowed slightly today rather than inverting further, " +
        "the Fed funds rate is unchanged, and high-yield credit spreads tightened rather than " +
        "widened — none of that is what a genuine risk-off regime looks like underneath the " +
        "surface. The real near-term risk is oil-driven: Brent and WTI are both up roughly 6-7% " +
        "this week on the Iran escalation, and if that persists it could complicate Tuesday's " +
        "CPI read.",
      confidenceScore: 70,
      rationale:
        "The yield curve spread, Fed funds rate, and high-yield credit spread are the most " +
        "reliable underlying-conditions signals I track, and all three are behaving benignly " +
        "even as headline indices sell off.",
      risksNoted:
        "A sustained oil price shock from the Iran conflict could reintroduce the inflation " +
        "risk the Fed had been putting behind it.",
      changeTrigger:
        "Credit spreads actually widen, or the yield curve re-inverts, rather than today's headline-driven equity weakness alone.",
      verdict: "SUPPORT" as const,
    },
    {
      role: "CHIEF_SECTOR_STRATEGIST" as const,
      opinion:
        "Today's rotation is real but one day old: consumer defensive names gained roughly 1% " +
        "while healthcare fell a similar amount and technology led the market lower. That's a " +
        "classic risk-off rotation pattern, but one session isn't enough to call a trend — it " +
        "could just as easily unwind tomorrow if the geopolitical headline cools.",
      confidenceScore: 62,
      rationale:
        "Sector-level relative performance on a single volatile day is suggestive, not conclusive — I want to see it persist before treating it as a real rotation.",
      risksNoted:
        "Overreacting to one day's sector rotation risks whipsawing into and out of positions on noise rather than signal.",
      changeTrigger:
        "The defensive-over-growth rotation persists for multiple sessions rather than reversing once today's headline passes.",
      verdict: "NEUTRAL" as const,
    },
    {
      role: "CHIEF_COMPANY_ANALYST" as const,
      opinion:
        "This week is a genuine fundamentals test, not a forecast: JPMorgan and the other major " +
        "banks report Tuesday and Wednesday, with ASML and Taiwan Semiconductor's results later " +
        "in the week giving the clearest real read yet on whether AI-linked chip demand is " +
        "actually cooling or whether today's selloff is sentiment ahead of the data. I'd rather " +
        "wait for the actual numbers than guess at them.",
      confidenceScore: 65,
      rationale:
        "Analyst estimates for S&P 500 second-quarter earnings growth are above 20% year-over-year — real numbers this week will confirm or challenge that directly.",
      risksNoted:
        "Elevated expectations going into earnings season raise the bar; a merely-good quarter could still disappoint against that setup.",
      changeTrigger: "This week's actual earnings prints, not today's pre-earnings positioning.",
      verdict: "SUPPORT_WITH_RESERVATIONS" as const,
    },
    {
      role: "CHIEF_TECHNICAL_STRATEGIST" as const,
      opinion:
        "Real technical damage in AI-linked names today: NVIDIA is giving back a real portion " +
        "of Friday's 4% gain, and semiconductor peers are down more sharply — AMD off roughly " +
        "3%, Intel off roughly 6%, memory names considerably more on the SK Hynix-driven " +
        "unwind. That said, this is happening within a still-intact broader uptrend — the S&P " +
        "500 remains up roughly 11% year-to-date and the semiconductor sector ETF is still up " +
        "roughly 70% for the year even after today.",
      confidenceScore: 60,
      rationale:
        "Price and volume are the evidence; today's selloff is real and sector-concentrated, not broad-based capitulation.",
      risksNoted:
        "A crowded, extended trade (semiconductors +70% YTD) is more vulnerable to a sharp unwind than a less-extended one.",
      changeTrigger:
        "The selloff broadens meaningfully beyond semiconductors and AI-linked names into the rest of the market.",
      verdict: "SUPPORT_WITH_RESERVATIONS" as const,
    },
    {
      role: "CHIEF_RISK_OFFICER" as const,
      opinion:
        "I want to be direct: the semiconductor trade was already crowded before today — up " +
        "roughly 70% year-to-date — and a single brokerage report questioning SK Hynix's " +
        "estimates was enough to trigger a real, sharp unwind that dragged the whole group " +
        "lower. That's exactly the signature of an extended, concentrated trade correcting, not " +
        "a fundamental change in AI demand. Layered on top of genuine geopolitical risk from the " +
        "Iran escalation, today argues for discipline, not for adding into the weakness.",
      confidenceScore: 58,
      rationale:
        "Extended, narrow-leadership trades historically correct sharply on comparatively small news — today fits that pattern.",
      risksNoted:
        "Concentrated AI/semiconductor exposure remains the single largest risk to any " +
        "portfolio built around this year's winners; today is a real, live example of why that " +
        "concentration deserves active management.",
      changeTrigger:
        "The semiconductor unwind stabilizes and the sector's move re-aligns with underlying earnings growth rather than multiple expansion.",
      verdict: "SUPPORT_WITH_RESERVATIONS" as const,
    },
    {
      role: "CHIEF_SCIENTIST" as const,
      opinion:
        "This is the first Brief built from real data rather than illustrative content, which " +
        "means there is honestly no council track record yet to validate confidence calibration " +
        "against. I won't overstate certainty I don't have — today's confidence figures are best " +
        "read as the council's honest first attempt, not a calibrated forecast with a track " +
        "record behind it.",
      confidenceScore: 50,
      rationale:
        "Confidence calibration requires a real history of predictions and outcomes to check against, which doesn't exist yet as of today.",
      risksNoted:
        "Treating today's confidence scores as more reliable than they are, before any track record exists to support that reliability.",
      changeTrigger:
        "Enough real Briefs accumulate to actually check whether stated confidence levels have matched real outcomes.",
      verdict: "NEUTRAL" as const,
    },
    {
      role: "CHIEF_CLIENT_OFFICER" as const,
      opinion:
        "For a first morning reading this over coffee: today looks scarier in the headlines " +
        "than the underlying data supports. One geopolitical shock plus one IPO-related unwind " +
        "in a single hot sector is not the same thing as a change in the broader market's " +
        "condition. The right response to a day like today is usually patience, not action — " +
        "and this week's real earnings and inflation data will tell you more than today's " +
        "headline will.",
      confidenceScore: 68,
      rationale:
        "A first-time paper investor's biggest risk today isn't the market — it's reacting to a single volatile headline day as if it were a trend.",
      risksNoted:
        "Starting a paper portfolio on a volatile down day could understandably feel discouraging; that feeling isn't the same as the data actually being bad.",
      changeTrigger:
        "If the discomfort of a volatile first week ever leads toward abandoning the process rather than trusting this week's real data.",
      verdict: "SUPPORT" as const,
    },
    {
      role: "CHIEF_GOVERNANCE_OFFICER" as const,
      opinion:
        "This is the first Brief sourced from genuinely live data — Alpaca for prices, FRED for " +
        "macro readings, current market reporting for context — rather than illustrative " +
        "content. Every figure above traces to one of those three real sources. No fabricated " +
        "numbers, no invented events.",
      confidenceScore: 80,
      rationale:
        "Verified each macro figure against the actual FRED API output and each market claim against current reporting before this Brief was published.",
      risksNoted: "None beyond what's already disclosed above.",
      changeTrigger:
        "Any claim in this Brief that couldn't be traced back to Alpaca, FRED, or a cited real news source.",
      verdict: "SUPPORT" as const,
    },
    {
      role: "CHIEF_INVESTMENT_OFFICER" as const,
      opinion:
        "Weighing all of this: real volatility today, driven by a real geopolitical shock and a " +
        "real single-sector unwind, sitting on top of a macro backdrop that's still genuinely " +
        "constructive. That combination argues for holding current positioning rather than " +
        "reacting to one red day — and using this week's actual data, not today's headline, as " +
        "the real test.",
      confidenceScore: 64,
      rationale:
        "The Market Officer's and Governance Officer's readings on underlying conditions outweigh one day of headline-driven, sector-concentrated price action.",
      risksNoted:
        "See Primary Risks below — synthesized from the Risk Officer's and Technical Strategist's notes on the semiconductor unwind, and the Market Officer's note on oil-driven inflation risk.",
      changeTrigger:
        "This week's actual CPI print and bank/ASML/TSM earnings — if they confirm rather than " +
        "contradict today's selloff, that would be real evidence to reconsider, not today's " +
        "headline alone.",
      verdict: "SUPPORT" as const,
    },
  ];

  const assessmentByRole = new Map<string, { id: string }>();
  for (const data of assessmentData) {
    const created = await prisma.councilAssessment.create({ data: { briefId: brief.id, ...data } });
    assessmentByRole.set(data.role, created);
  }

  const riskOfficer = assessmentByRole.get("CHIEF_RISK_OFFICER")!;
  const technicalStrategist = assessmentByRole.get("CHIEF_TECHNICAL_STRATEGIST")!;
  const marketOfficer = assessmentByRole.get("CHIEF_MARKET_OFFICER")!;

  await prisma.risk.create({
    data: {
      briefId: brief.id,
      title: "AI/Semiconductor Trade Unwind",
      description:
        "The semiconductor sector is up roughly 70% year-to-date, and today's SK Hynix-driven " +
        "selloff — which dragged Micron, Intel, AMD, and NVIDIA lower — shows how quickly that " +
        "extended trade can correct on comparatively small news. A portfolio concentrated in " +
        "this year's AI-linked winners is exposed to further unwinding if this week's ASML and " +
        "Taiwan Semiconductor earnings disappoint.",
      sourceAssessments: { connect: [{ id: riskOfficer.id }, { id: technicalStrategist.id }] },
    },
  });

  await prisma.risk.create({
    data: {
      briefId: brief.id,
      title: "Middle East Oil Shock Feeding Into Inflation",
      description:
        "Brent and WTI crude are both up roughly 6-7% this week as the US and Iran escalated " +
        "over the weekend. A sustained oil price increase could show up in Tuesday's CPI print " +
        "or the following month's, complicating the disinflation narrative the Fed and markets " +
        "have been pricing in.",
      sourceAssessments: { connect: [{ id: marketOfficer.id }] },
    },
  });

  await prisma.opportunity.create({
    data: {
      briefId: brief.id,
      thesis:
        "Showing real relative resilience today (up slightly, roughly +0.35%) while the broader " +
        "tech sector sells off on the semiconductor unwind — a genuine data point on which " +
        "large-cap tech names are and aren't correlated to the AI/chip-specific selloff.",
      conviction: 58,
      companyId: aapl.id,
    },
  });

  await prisma.opportunity.create({
    data: {
      briefId: brief.id,
      thesis:
        "Reports Tuesday alongside the other major banks, a genuine near-term catalyst. Capital " +
        "markets activity and net interest income trends this quarter will be a real read on " +
        "financial-sector health independent of the AI/semiconductor story dominating today's " +
        "headlines.",
      conviction: 55,
      companyId: jpm.id,
    },
  });

  await prisma.opportunity.create({
    data: {
      briefId: brief.id,
      thesis:
        "ASML and Taiwan Semiconductor both report earnings this week — the clearest fundamental " +
        "read available on whether AI-linked chip demand is genuinely cooling or whether today's " +
        "selloff is sentiment running ahead of the data. Worth watching regardless of position, " +
        "since it will validate or challenge the whole sector's 70% year-to-date run.",
      conviction: 60,
      thematicTitle: "Semiconductor Earnings Week",
    },
  });

  await prisma.recommendedAction.create({
    data: {
      briefId: brief.id,
      description:
        "Wait for Tuesday's June CPI print and this week's bank and semiconductor earnings " +
        "before making any allocation change — today's selloff is headline-driven, not yet " +
        "confirmed by real data.",
      actionType: "WATCH",
      displayOrder: 1,
    },
  });

  await prisma.recommendedAction.create({
    data: {
      briefId: brief.id,
      description:
        "If starting new positions this week, size them modestly and phase them in rather than " +
        "committing all at once, given real near-term volatility from both the geopolitical " +
        "situation and the semiconductor unwind.",
      actionType: "BUY",
      displayOrder: 2,
    },
  });

  await prisma.recommendedAction.create({
    data: {
      briefId: brief.id,
      description:
        "Monitor whether the SK Hynix-driven memory and semiconductor selloff stabilizes or " +
        "broadens before adding further AI-linked chip exposure.",
      actionType: "WATCH",
      displayOrder: 3,
    },
  });

  await prisma.recommendedAction.create({
    data: {
      briefId: brief.id,
      description:
        "Deploy cash gradually into the allocation targets below as this week's real data " +
        "clarifies, rather than reacting to today's single volatile session.",
      actionType: "REBALANCE",
      displayOrder: 4,
    },
  });

  const allocations = [
    { category: "US Equities", targetPercent: 54 },
    { category: "International Equities", targetPercent: 12 },
    { category: "Bonds", targetPercent: 20 },
    { category: "Cash", targetPercent: 10 },
    { category: "Alternatives", targetPercent: 4 },
  ];
  for (const allocation of allocations) {
    await prisma.allocationTarget.create({ data: { briefId: brief.id, ...allocation } });
  }

  console.log(
    `Published Brief ${brief.id} for ${BRIEF_DATE.toDateString()} — MarketIQ's first real Brief.`,
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
