/**
 * MarketIQ's second real Brief — July 15, 2026.
 *
 * Every claim traces to real sources: live prices already synced via
 * npm run data:refresh-prices (Alpaca), and current market reporting for
 * everything else — June CPI (3.5% YoY, down from May's 4.2%, below the
 * 3.8% expected), June PPI (-0.3%, below expectations), ASML's earnings
 * beat + raised annual guidance + 30% capacity expansion announcement,
 * Morgan Stanley's earnings beat, and Fed officials (Waller, Warsh)
 * remaining hawkish despite the cooling data.
 *
 * This Brief deliberately tests Monday's (July 13) two flagged risks
 * against what actually happened this week, rather than carrying them
 * forward unchanged: "AI/Semiconductor Trade Unwind" and "Middle East Oil
 * Shock Feeding Into Inflation" were both explicitly named as things to
 * watch — the real data this week did not confirm either fear. That's
 * itself real, reportable content, not a reason to quietly drop the risks
 * without comment.
 *
 * No Brief exists for July 14 — nobody published one that day. This Brief
 * is honest about that gap rather than pretending otherwise.
 *
 * Run with: npx tsx scripts/publish-2026-07-15-brief.ts
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

const BRIEF_DATE = new Date("2026-07-15");

async function main() {
  const user = await prisma.user.findFirst();
  if (!user) throw new Error("No User found — run npm run db:seed first.");

  const asml = await prisma.company.findUnique({ where: { ticker: "ASML" } });
  if (!asml) throw new Error("Expected ASML to already exist from earlier seed data.");

  const morganStanley = await prisma.company.upsert({
    where: { ticker: "MS" },
    update: {},
    create: {
      ticker: "MS",
      name: "Morgan Stanley",
      sector: "Financials",
      currentPrice: 230.31,
      previousClosePrice: 228.09,
      region: "DOMESTIC",
    },
  });

  const decisionRationale =
    "This week's real data confirmed rather than contradicted Monday's thesis — inflation " +
    "cooled sharply and chip demand proved durable via ASML's own guidance. Increase equity " +
    "allocation, while watching whether the Fed's continued hawkishness and today's uncertain " +
    "market leadership become real headwinds.";

  const executiveSummary =
    "Monday's Brief named two specific things to watch this week — whether oil-driven " +
    "inflation risk would show up in the data, and whether the semiconductor selloff was a " +
    "real derating or a sharp, temporary correction. Both have now been tested against real " +
    "data, and neither fear materialized. June CPI cooled to 3.5% year-over-year, well below " +
    "the 3.8% expected and down sharply from May's 4.2% — despite oil prices running roughly " +
    "16% above their recent low. June PPI came in soft as well, down 0.3% against expectations " +
    "of no change. On the semiconductor question, Tuesday's rebound (the sector ETF up 2.5%) " +
    "was reinforced today by ASML's own numbers: the company raised its annual sales forecast " +
    "above Wall Street's expectations and announced a 30% increase in chipmaking equipment " +
    "capacity, both real signals that AI-linked demand hasn't cooled the way Monday's selloff " +
    "implied. Bank earnings added a more mixed note — Morgan Stanley beat cleanly and its stock " +
    "rose on the news, while JPMorgan, Bank of America, and Wells Fargo all beat estimates but " +
    "saw their shares fall regardless, and Fed officials Waller and Warsh both struck a hawkish " +
    "tone on rates even as the inflation data cooled. Market commentary today also flagged that " +
    "this bounce lacks clear new leadership — the sector rotation everyone's watching for hasn't " +
    "clearly arrived yet. On balance, the evidence that mattered this week came back " +
    "constructive, which is real grounds to increase equity allocation — while treating the " +
    "Fed's stance and the market's uncertain leadership as the new things worth watching, not " +
    "declaring the picture fully resolved.";

  const historicalSimilarityNarrative =
    "A real test-and-confirm week: two specific, named risks were checked against actual data " +
    "rather than assumed to persist, and the data came back more constructive than the " +
    "headline-driven selloff implied three days earlier. Worth remembering the inverse can " +
    "happen too — this is a track record entry, not a guarantee the pattern repeats.";

  const brief = await prisma.brief.upsert({
    where: { userId_date: { userId: user.id, date: BRIEF_DATE } },
    update: {
      decisionRationale,
      executiveSummary,
      councilRecommendation: "INCREASE_EQUITY_ALLOCATION",
      councilConfidence: 70,
      marketOutlook: "MODERATELY_BULLISH",
      historicalSimilarityNarrative,
    },
    create: {
      userId: user.id,
      date: BRIEF_DATE,
      decisionRationale,
      executiveSummary,
      councilRecommendation: "INCREASE_EQUITY_ALLOCATION",
      councilConfidence: 70,
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
        "Real disinflation progress this week: June CPI at 3.5% year-over-year, down sharply " +
        "from May's 4.2% and below the 3.8% expected, with June PPI also softer than forecast. " +
        "That said, Fed officials Waller and Warsh both struck a hawkish tone on rates despite " +
        "the cooler data, and the 10-year Treasury yield remains elevated near 4.62%. The macro " +
        "backdrop improved this week; it isn't fully resolved.",
      confidenceScore: 74,
      rationale:
        "Inflation data is the clearest real signal I track, and this week's prints moved " +
        "meaningfully in the right direction — but a hawkish Fed against cooling inflation is " +
        "a real tension worth watching, not dismissing.",
      risksNoted:
        "If the Fed's hawkish rhetoric translates into actual policy resistance against further " +
        "easing, that would work against the market's current optimism.",
      changeTrigger:
        "The Fed's actual policy actions, not just rhetoric, diverging meaningfully from what " +
        "cooling inflation would typically justify.",
      verdict: "SUPPORT" as const,
    },
    {
      role: "CHIEF_SECTOR_STRATEGIST" as const,
      opinion:
        "Real rebound in chips this week — the sector ETF gained 2.5% Tuesday and technology " +
        "led sector gains, extending further today on ASML's guidance. That's genuine " +
        "improvement from Monday's selloff. But today's commentary is honest about a real " +
        "gap: there's no clear new leadership group emerging from this bounce yet — the " +
        "mega-cap names that led earlier this year haven't clearly reasserted themselves, and " +
        "no other rotational winner has taken their place.",
      confidenceScore: 65,
      rationale:
        "A real rebound is worth crediting, but 'the selloff reversed' and 'clear leadership " +
        "has emerged' are two different claims, and only the first is supported by this week's " +
        "data so far.",
      risksNoted:
        "A rebound without clear leadership can be more fragile than one with an identifiable, " +
        "sustained driver.",
      changeTrigger:
        "A specific sector or group of names clearly leading the market for multiple sessions, not just a broad bounce.",
      verdict: "SUPPORT_WITH_RESERVATIONS" as const,
    },
    {
      role: "CHIEF_COMPANY_ANALYST" as const,
      opinion:
        "Real earnings data now in hand, and it's genuinely mixed rather than uniformly good: " +
        "ASML beat and raised its full-year outlook, and Morgan Stanley beat cleanly with its " +
        "stock rising on the news. But JPMorgan, Bank of America, and Wells Fargo all beat " +
        "estimates too, and all three saw their shares fall anyway — a real signal that beating " +
        "estimates alone isn't earning the market's confidence this earnings season.",
      confidenceScore: 72,
      rationale:
        "Actual reported numbers, not estimates, are the most reliable signal available this week, and on balance more names beat than missed.",
      risksNoted:
        "Stocks falling despite real earnings beats (JPMorgan, Bank of America, Wells Fargo) suggests elevated expectations or other concerns outweighing the headline numbers.",
      changeTrigger: "A pattern of real misses, not just a mixed stock reaction to real beats.",
      verdict: "SUPPORT" as const,
    },
    {
      role: "CHIEF_TECHNICAL_STRATEGIST" as const,
      opinion:
        "Real technical improvement: the semiconductor sector's Tuesday rebound extended into " +
        "today on ASML's news, and the volatility index has eased to roughly 16.4 from higher " +
        "levels earlier in the week — both consistent with a market working through, not " +
        "deepening, last week's selloff.",
      confidenceScore: 68,
      rationale:
        "Price action and volatility both moved the same direction this week — confirmation, not just one data point.",
      risksNoted:
        "A rebound this quick, without confirmed new leadership, can still round-trip if the next real catalyst disappoints.",
      changeTrigger: "Volatility re-accelerating or the rebound failing to hold its recent levels.",
      verdict: "SUPPORT" as const,
    },
    {
      role: "CHIEF_RISK_OFFICER" as const,
      opinion:
        "I want to be precise about what actually happened, since it's genuinely good " +
        "discipline to check: Monday I flagged two risks — a crowded semiconductor trade " +
        "unwinding, and an oil-driven inflation shock. Neither materialized as feared this " +
        "week. The chip trade rebounded rather than continuing to unwind, and CPI cooled " +
        "despite elevated oil prices rather than reaccelerating. That's worth crediting " +
        "honestly. What's real and current now: the Fed's hawkish stance against cooling data, " +
        "and a market bounce without confirmed leadership — different risks than Monday's, not " +
        "smaller ones.",
      confidenceScore: 63,
      rationale:
        "Checking whether previously flagged risks actually materialized is exactly the discipline this role exists for — and this week, they didn't.",
      risksNoted:
        "A market bounce without clear leadership, combined with a Fed that hasn't confirmed " +
        "it will follow cooling inflation with easier policy, are the live risks now.",
      changeTrigger:
        "Either the Fed's actual policy path or the market's leadership question resolving in a way that changes the risk picture again.",
      verdict: "SUPPORT_WITH_RESERVATIONS" as const,
    },
    {
      role: "CHIEF_SCIENTIST" as const,
      opinion:
        "This is the first real test of whether this council's stated change triggers actually " +
        "get honored rather than just stated. Monday's Brief named exactly what would need to " +
        "happen to change the view — this week's CPI print and bank/ASML/TSM earnings — and " +
        "those real events have now happened and came back constructive. That's one clean data " +
        "point in favor of the process working as designed. It's one data point, not a track " +
        "record; I'm raising confidence slightly from Monday's intentionally low starting point, " +
        "not claiming calibration this council hasn't earned yet.",
      confidenceScore: 62,
      rationale:
        "A stated change trigger that was actually checked against real outcomes, rather than quietly forgotten, is exactly what building a real track record requires.",
      risksNoted:
        "Over-crediting one favorable data point before there's enough history to know if this council's confidence levels are genuinely well-calibrated.",
      changeTrigger:
        "Enough real Briefs accumulate to check calibration properly — this is one data point toward that, not the answer yet.",
      verdict: "SUPPORT" as const,
    },
    {
      role: "CHIEF_CLIENT_OFFICER" as const,
      opinion:
        "For anyone who found Monday's Brief unsettling: the specific things that were worrying " +
        "— a possible inflation flare-up, a semiconductor trade genuinely breaking down — were " +
        "checked against this week's real data, and neither one happened. That's not luck, " +
        "it's the actual reason this council waits for real data before reacting to a single " +
        "volatile day. Today's real news — ASML's guidance, a clean Morgan Stanley beat, " +
        "cooling inflation — is grounds for cautious optimism, not certainty.",
      confidenceScore: 72,
      rationale:
        "Showing that patience through Monday's volatility was rewarded by this week's real data is more convincing than just asserting patience is usually right.",
      risksNoted:
        "Swinging from Monday's caution to today's optimism too quickly could itself become a pattern of overreacting to whichever direction the latest headline points.",
      changeTrigger:
        "If today's constructive data leads toward overconfidence rather than continued attention to the Fed and leadership questions still open.",
      verdict: "SUPPORT" as const,
    },
    {
      role: "CHIEF_GOVERNANCE_OFFICER" as const,
      opinion:
        "Every figure in this Brief traces to real, current sources — the actual June CPI and " +
        "PPI releases, ASML's and Morgan Stanley's real earnings reports, and real, attributed " +
        "commentary from Fed officials. No Brief was published for July 14 — that gap is " +
        "disclosed here rather than papered over, and this Brief compares against July 13's " +
        "content since that's the most recent real Brief that exists.",
      confidenceScore: 80,
      rationale:
        "Verified each figure against real reporting before publishing, and confirmed the July 14 gap rather than silently treating July 13 as 'yesterday.'",
      risksNoted: "None beyond what's already disclosed above.",
      changeTrigger:
        "Any claim in this Brief that couldn't be traced back to a real, current source.",
      verdict: "SUPPORT" as const,
    },
    {
      role: "CHIEF_INVESTMENT_OFFICER" as const,
      opinion:
        "Weighing all of this: the two specific risks Monday's Brief named were tested against " +
        "real data this week, and neither materialized. That's genuine evidence to increase " +
        "equity allocation, not just a headline improving. The Fed's hawkish stance and the " +
        "market's still-unclear leadership are the real things worth watching now — different " +
        "concerns than Monday's, not smaller ones, which is why confidence moves up but not to " +
        "an unqualified level.",
      confidenceScore: 70,
      rationale:
        "The Risk Officer's and Scientist's point — that this week was an actual test of Monday's stated concerns, and the test came back constructive — is the strongest evidence available today.",
      risksNoted:
        "See Primary Risks below — synthesized from the Market Officer's note on Fed hawkishness and the Sector Strategist's note on unclear leadership.",
      changeTrigger:
        "The Fed's actual policy path or a clearer market leadership signal — either resolving " +
        "in a way that would change today's view again.",
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
      title: "Fed Remains Hawkish Despite Cooling Inflation",
      description:
        "Fed officials Waller and Warsh both struck a hawkish tone on rates this week even as " +
        "June CPI and PPI both came in below expectations. Markets have sharply cut the odds of " +
        "a near-term rate hike (from roughly 42% to 17% per CME FedWatch), which could reverse " +
        "if the Fed pushes back against that repricing.",
      sourceAssessments: { connect: [{ id: marketOfficer.id }] },
    },
  });

  await prisma.risk.create({
    data: {
      briefId: brief.id,
      title: "Uncertain Market Leadership",
      description:
        "This week's bounce lacks a clearly identified leadership group — commentary notes the " +
        "mega-cap names that led earlier this year haven't clearly reasserted themselves, and " +
        "semiconductors remain volatile rather than establishing a clear trend. A rebound " +
        "without confirmed leadership can be more fragile than one with an identifiable driver.",
      sourceAssessments: { connect: [{ id: sectorStrategist.id }] },
    },
  });

  await prisma.opportunity.create({
    data: {
      briefId: brief.id,
      thesis:
        "Beat and raised its full-year sales forecast above Wall Street expectations today, " +
        "citing durable AI-linked demand, and announced a 30% increase in chipmaking equipment " +
        "production capacity — real, company-reported evidence against the 'AI demand is " +
        "cooling' fear that drove Monday's semiconductor selloff.",
      conviction: 74,
      companyId: asml.id,
    },
  });

  await prisma.opportunity.create({
    data: {
      briefId: brief.id,
      thesis:
        "Beat Wall Street estimates on both earnings ($3.46/share vs. $2.94 expected) and " +
        "revenue ($21.35B vs. $19.64B expected) today, and — unlike JPMorgan, Bank of America, " +
        "and Wells Fargo, which also beat but fell anyway — its stock actually rose on the " +
        "news, a real signal of a cleaner beat.",
      conviction: 62,
      companyId: morganStanley.id,
    },
  });

  await prisma.recommendedAction.create({
    data: {
      briefId: brief.id,
      description:
        "Consider adding to international equity exposure via ASML, given today's real " +
        "guidance raise and capacity expansion announcement.",
      actionType: "BUY",
      displayOrder: 1,
    },
  });

  await prisma.recommendedAction.create({
    data: {
      briefId: brief.id,
      description:
        "Monitor Fed commentary closely — this week's hawkish tone against cooling inflation " +
        "is a real tension that could resolve in either direction.",
      actionType: "WATCH",
      displayOrder: 2,
    },
  });

  await prisma.recommendedAction.create({
    data: {
      briefId: brief.id,
      description:
        "Watch for confirmed market leadership before assuming this week's bounce is durable — " +
        "a broad rebound without a clear driver is different from a trend.",
      actionType: "WATCH",
      displayOrder: 3,
    },
  });

  await prisma.recommendedAction.create({
    data: {
      briefId: brief.id,
      description:
        "Deploy cash gradually toward the allocation targets below as this week's constructive data is confirmed by continued real evidence, not all at once on one good week.",
      actionType: "REBALANCE",
      displayOrder: 4,
    },
  });

  const allocations = [
    { category: "US Equities", targetPercent: 56 },
    { category: "International Equities", targetPercent: 15 },
    { category: "Bonds", targetPercent: 18 },
    { category: "Cash", targetPercent: 8 },
    { category: "Alternatives", targetPercent: 3 },
  ];
  for (const allocation of allocations) {
    await prisma.allocationTarget.create({ data: { briefId: brief.id, ...allocation } });
  }

  console.log(
    `Published Brief ${brief.id} for ${BRIEF_DATE.toDateString()} — MarketIQ's second real Brief.`,
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
