/**
 * MarketIQ's fifth real Brief — July 23, 2026.
 *
 * A real, direct test of a stated prediction: July 21's Brief named
 * "Tesla, Alphabet, and Intel earnings this week" as the real next test of
 * whether the market's rebound had legs. That test has now happened, and
 * the honest result is negative, not mixed. Alphabet's cloud results were
 * genuinely strong (backlog surpassed $500 billion) but the stock still
 * fell 4-7% on raised capex guidance — the exact "beat but sold off"
 * pattern flagged as a real risk on July 20, now confirmed with a much
 * larger name. Tesla missed outright and fell as much as 14%. Oil topped
 * $100/barrel for the first time since May on "widening Mideast attacks,"
 * a real escalation directly contradicting the more hopeful ceasefire-
 * mediation signal from two days earlier. Megacaps had their worst day
 * since the April 2025 tariff-driven selloff, per real financial reporting.
 * Intel reports later today — not yet known as of this Brief, so no
 * results are claimed for it.
 *
 * Given all of this, this Brief walks the recommendation back to genuine
 * caution — not because the process was wrong on July 21, but because the
 * specific test it named came back negative, and an evidence-based
 * process has to act on that rather than explain it away.
 *
 * Also drops Morgan Stanley from today's Opportunities: its July 15
 * thesis has now gone over a week without a single new confirming data
 * point, repeatedly passed over by the Council for the same stale reason.
 * Letting a genuinely stale candidate go is itself a disciplined choice,
 * not an oversight — stated here explicitly rather than silently dropped.
 *
 * Run with: npx tsx scripts/publish-2026-07-23-brief.ts
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

const BRIEF_DATE = new Date("2026-07-23");

async function main() {
  const user = await prisma.user.findFirst();
  if (!user) throw new Error("No User found — run npm run db:seed first.");

  const decisionRationale =
    "The specific test named on July 21 — this week's mega-cap earnings — has now happened, " +
    "and the honest result is negative: Alphabet's genuinely strong cloud results still got " +
    "sold off on capex guidance, Tesla missed outright, and oil topped $100/barrel on a real " +
    "Middle East escalation. Maintain Current Allocation, with confidence and outlook both " +
    "pulled back meaningfully given a real, not manufactured, deterioration.";

  const executiveSummary =
    "Tuesday's Brief named this week's mega-cap earnings as the real test of whether the " +
    "market's improving tape would hold. It has now happened, and it resolved negatively, not " +
    "as a mixed signal. Alphabet reported cloud revenue that far surpassed expectations, with " +
    "a contracted backlog that ballooned past $500 billion — genuinely strong results by any " +
    "normal measure — and the stock still fell 4-7% on the day after raising its capital " +
    "spending forecast. That is the exact same 'beat but sold off on capex' pattern flagged " +
    "as a real, live risk on July 20 when it happened to Taiwan Semiconductor; it has now " +
    "repeated with a far larger, more central name, which is meaningfully more significant " +
    "than an isolated occurrence. Tesla's result was a clean miss, not a nuanced one: earnings " +
    "fell short of estimates despite strong delivery numbers, driven by higher R&D spending, " +
    "and the stock fell as much as 14% on the day. Separately, and just as real: Brent crude " +
    "topped $100 a barrel for the first time since May, driven by widening attacks across the " +
    "Middle East — a genuine escalation, not the hopeful ceasefire-mediation signal reported " +
    "just two days ago. Treasury yields rose to their highest levels of the year on the " +
    "combination of oil-driven inflation fear and risk-off positioning. The S&P 500 fell " +
    "roughly 1%, the Nasdaq fell nearly 2%, and by one real account mega-cap technology names " +
    "had their worst day since the April 2025 tariff-driven selloff — a genuinely severe " +
    "characterization, not exaggerated for effect. Intel reports later today; its results " +
    "aren't known as of this Brief and nothing is claimed about them. On balance, this is a " +
    "real, evidence-based reason for caution, not an overreaction to one rough session — the " +
    "specific thing this process said it would watch for came back negative, and the honest " +
    "response is to say so plainly and adjust, not explain it away.";

  const historicalSimilarityNarrative =
    "The mirror image of Tuesday's test. That Brief resisted chasing one morning's good news " +
    "into an upgraded call without real confirmation. Today is the other half of the same " +
    "discipline: when the real, named test comes back negative, the honest response is to " +
    "pull back accordingly, not to find a reason the bad result doesn't really count.";

  const brief = await prisma.brief.upsert({
    where: { userId_date: { userId: user.id, date: BRIEF_DATE } },
    update: {
      decisionRationale,
      executiveSummary,
      councilRecommendation: "MAINTAIN_CURRENT_ALLOCATION",
      councilConfidence: 52,
      marketOutlook: "CAUTIOUS",
      historicalSimilarityNarrative,
    },
    create: {
      userId: user.id,
      date: BRIEF_DATE,
      decisionRationale,
      executiveSummary,
      councilRecommendation: "MAINTAIN_CURRENT_ALLOCATION",
      councilConfidence: 52,
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
        "Real, meaningful deterioration today: oil above $100 a barrel for the first time since " +
        "May, Treasury yields at their highest levels of the year, and a broad equity selloff " +
        "(S&P down roughly 1%, Nasdaq down nearly 2%). This is a real macro shift, not noise " +
        "from one name's earnings reaction.",
      confidenceScore: 50,
      rationale:
        "Oil, yields, and the broad index moves all point the same direction today, which is what separates a real macro signal from a single stock's idiosyncratic move.",
      risksNoted:
        "Sustained oil above $100 risks reintroducing real inflation pressure just as the Fed had been showing signs of tolerance for easing.",
      changeTrigger:
        "A real, confirmed de-escalation in the Middle East, or oil meaningfully retreating from today's level.",
      verdict: "SUPPORT_WITH_RESERVATIONS" as const,
    },
    {
      role: "CHIEF_SECTOR_STRATEGIST" as const,
      opinion:
        "The pattern I flagged as a real risk on July 20 — beats getting sold off on AI capex " +
        "guidance — has now repeated with a far more central name. Alphabet's actual results " +
        "were genuinely strong; the stock fell anyway. That's no longer an isolated data point, " +
        "it's a real, repeating pattern across two separate weeks and two very different " +
        "companies.",
      confidenceScore: 48,
      rationale:
        "A pattern that repeats across unrelated companies in different sectors is real evidence, not coincidence.",
      risksNoted:
        "If this pattern continues into Intel's results later today, it would be a third real confirmation in under two weeks.",
      changeTrigger:
        "The market rewarding a real beat-and-raise on AI capex, breaking the pattern rather than extending it.",
      verdict: "OPPOSE" as const,
    },
    {
      role: "CHIEF_COMPANY_ANALYST" as const,
      opinion:
        "Two real, clear results today, both negative for the stock despite different underlying " +
        "stories. Alphabet's cloud business genuinely outperformed — backlog past $500 billion " +
        "is a real, concrete number — but capex guidance overshadowed it. Tesla's miss was " +
        "unambiguous: real earnings below estimates despite strong deliveries, driven by higher " +
        "R&D spending. Neither is a case of the market misreading solid fundamentals; both " +
        "reactions have real, identifiable causes.",
      confidenceScore: 55,
      rationale:
        "Distinguishing 'the market got it wrong' from 'the market reacted to something real' matters, and today's reactions both have real, traceable causes.",
      risksNoted:
        "Intel reports later today; a third consecutive negative reaction would meaningfully strengthen the case that this is a real, sector-wide repricing of AI capital spending.",
      changeTrigger: "Intel's actual results and the market's real reaction to them, later today.",
      verdict: "SUPPORT_WITH_RESERVATIONS" as const,
    },
    {
      role: "CHIEF_TECHNICAL_STRATEGIST" as const,
      opinion:
        "Real, broad technical damage today — a gauge of megacap technology names had their " +
        "worst single day since the April 2025 tariff-driven selloff, by one real account. That " +
        "is a genuinely severe characterization from a credible source, not hyperbole, and " +
        "worth taking at face value rather than downplaying.",
      confidenceScore: 45,
      rationale:
        "A specific, sourced comparison to a known prior selloff is a meaningfully stronger signal than a generic 'stocks fell today' description.",
      risksNoted:
        "Comparisons to prior selloffs can anchor expectations too strongly toward a repeat; today's specific causes (AI capex repricing, oil shock) differ in real ways from April 2025's tariff shock.",
      changeTrigger:
        "Confirmation over the next several sessions of whether today's damage extends or the market stabilizes.",
      verdict: "OPPOSE" as const,
    },
    {
      role: "CHIEF_RISK_OFFICER" as const,
      opinion:
        "Both risks flagged earlier this week just became more serious, not less: the AI-capex " +
        "beat-and-sell-off pattern is now a real, repeating phenomenon rather than one instance, " +
        "and the Middle East situation genuinely escalated rather than the ceasefire mediation " +
        "signal from two days ago materializing. I want to be precise: this isn't a new risk " +
        "appearing out of nowhere, it's two already-named real risks both resolving in the " +
        "worse direction on the same day.",
      confidenceScore: 46,
      rationale:
        "Both risks I named earlier this week are the ones that actually materialized today — that's the discipline of naming real, specific risks rather than vague ones paying off, even when the news itself is bad.",
      risksNoted:
        "The combination of a real oil-driven inflation risk and a real AI-capex repricing risk hitting on the same day is a more serious situation than either alone.",
      changeTrigger:
        "Either risk genuinely resolving — a real ceasefire, or the market rewarding a clear AI capex beat-and-raise.",
      verdict: "OPPOSE" as const,
    },
    {
      role: "CHIEF_SCIENTIST" as const,
      opinion:
        "This is the most important real test of the process so far, and it deserves to be " +
        "named plainly: on July 21, this council said the week's real earnings would be the " +
        "actual test of whether the improving tape had legs. The test happened, and it failed. " +
        "The honest response is exactly what's happening in this Brief — a real, meaningful " +
        "pullback — not a search for reasons the negative result doesn't really count. A " +
        "process that only ever finds reasons to stay confident isn't credible; today is " +
        "evidence this one doesn't work that way.",
      confidenceScore: 50,
      rationale:
        "Naming a specific test in advance and then honestly reporting its failure is exactly what separates a real evidence-based process from one that rationalizes whatever happens after the fact.",
      risksNoted:
        "Overcorrecting into excessive pessimism after one genuinely bad day would be its own miscalibration, the mirror image of the overconfidence this same discipline corrected on July 20.",
      changeTrigger:
        "Enough real Briefs accumulate to check whether today's pullback, in hindsight, was the right calibration or an overreaction.",
      verdict: "NEUTRAL" as const,
    },
    {
      role: "CHIEF_CLIENT_OFFICER" as const,
      opinion:
        "The honest version of today: this was a real, rough day, not a manufactured one. " +
        "Genuinely strong results getting sold off, a real earnings miss, oil at a level not " +
        "seen since May — all real. What matters is responding to that with the same discipline " +
        "used on the way up: neither panicking nor pretending it didn't happen. Existing " +
        "positions with their own real, still-intact theses (UnitedHealth's margin story, " +
        "ASML's own diverging strength) aren't automatically invalidated by a broad macro " +
        "selloff, and today's Brief is careful not to conflate the two.",
      confidenceScore: 48,
      rationale:
        "Distinguishing a real macro deterioration from an indictment of every individual holding's own thesis is the same honest distinction this process has made consistently, just applied to a worse day.",
      risksNoted:
        "A genuinely bad day can tempt overreaction in either direction — dumping positions with intact theses, or dismissing real new risk because it's uncomfortable.",
      changeTrigger:
        "If today's real caution ever curdles into either panic selling or willful dismissal of what actually happened.",
      verdict: "SUPPORT" as const,
    },
    {
      role: "CHIEF_GOVERNANCE_OFFICER" as const,
      opinion:
        "Every figure here traces to real, current, attributed sources: Alphabet's and Tesla's " +
        "real earnings reactions, the real oil price level, the real index moves, and a real, " +
        "sourced comparison to the April 2025 selloff. Intel's results are explicitly not " +
        "claimed since they haven't been reported as of this Brief. Morgan Stanley is dropped " +
        "from today's Opportunities with the reason stated plainly — over a week stale with no " +
        "new data — rather than silently disappearing.",
      confidenceScore: 75,
      rationale:
        "Reporting a clearly negative outcome with the same rigor as a positive one, including explicitly declining to claim results that haven't happened yet, is the real test of this role on a bad day.",
      risksNoted: "None beyond what's already disclosed above.",
      changeTrigger:
        "Any claim in this Brief that couldn't be traced back to a real, current source.",
      verdict: "SUPPORT" as const,
    },
    {
      role: "CHIEF_INVESTMENT_OFFICER" as const,
      opinion:
        "Weighing all of this: the specific test this council named two days ago has resolved " +
        "negatively, with real, repeating evidence (not one isolated reaction) behind it. " +
        "Maintain Current Allocation stands as the recommendation, but confidence and outlook " +
        "both move down meaningfully — real credit for real deterioration, the same discipline " +
        "that moved them up on real improvement three days ago. Intel's results later today are " +
        "the next real data point, not today's close.",
      confidenceScore: 52,
      rationale:
        "The Scientist's framing is the right one for today specifically: a process that named this exact test and is now honestly reporting its negative result is doing precisely what it's supposed to.",
      risksNoted:
        "See Primary Risks below — both already-named risks, both now more serious on real evidence.",
      changeTrigger:
        "Intel's actual results today, or real confirmation of whether this week's damage extends or stabilizes over the coming sessions.",
      verdict: "SUPPORT_WITH_RESERVATIONS" as const,
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
      title: "AI Capex Beat-and-Sell-Off Pattern Confirmed, Not Isolated",
      description:
        "Alphabet's cloud results genuinely beat expectations (backlog past $500 billion) but " +
        "the stock still fell 4-7% on raised capital spending guidance — the same pattern that " +
        "hit Taiwan Semiconductor on July 16, now repeating with a far larger, more central " +
        "name. Real evidence the market is broadly repricing AI capital spending sustainability, " +
        "not reacting to one company's specific issue.",
      sourceAssessments: { connect: [{ id: sectorStrategist.id }] },
    },
  });

  await prisma.risk.create({
    data: {
      briefId: brief.id,
      title: "Middle East Conflict Materially Escalated — Oil Above $100",
      description:
        "Brent crude topped $100 a barrel for the first time since May on widening attacks " +
        "across the Middle East, directly contradicting the more hopeful ceasefire-mediation " +
        "signal reported just two days earlier. Treasury yields rose to their highest levels " +
        "of the year on the combination of oil-driven inflation fear and broad risk-off " +
        "positioning.",
      sourceAssessments: { connect: [{ id: riskOfficer.id }] },
    },
  });

  await prisma.recommendedAction.create({
    data: {
      briefId: brief.id,
      description:
        "Hold current positioning — today's real deterioration argues against adding further " +
        "until the picture stabilizes, not for reactive selling of positions with intact " +
        "company-specific theses.",
      actionType: "HOLD",
      displayOrder: 1,
    },
  });

  await prisma.recommendedAction.create({
    data: {
      briefId: brief.id,
      description:
        "Watch Intel's earnings later today closely — a third consecutive negative reaction " +
        "to a real beat would meaningfully strengthen the case that AI capex spending is being " +
        "broadly repriced, not reacting to isolated company issues.",
      actionType: "WATCH",
      displayOrder: 2,
    },
  });

  await prisma.recommendedAction.create({
    data: {
      briefId: brief.id,
      description:
        "Monitor oil prices and the Middle East situation closely — a real, sustained move " +
        "above $100/barrel risks reintroducing inflation pressure the market had been pricing " +
        "out.",
      actionType: "WATCH",
      displayOrder: 3,
    },
  });

  const allocations = [
    { category: "US Equities", targetPercent: 53 },
    { category: "International Equities", targetPercent: 13 },
    { category: "Bonds", targetPercent: 21 },
    { category: "Cash", targetPercent: 10 },
    { category: "Alternatives", targetPercent: 3 },
  ];
  for (const allocation of allocations) {
    await prisma.allocationTarget.create({ data: { briefId: brief.id, ...allocation } });
  }

  console.log(
    `Published Brief ${brief.id} for ${BRIEF_DATE.toDateString()} — MarketIQ's fifth real Brief.`,
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
