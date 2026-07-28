/**
 * Generates and publishes today's Portfolio Review — the Council's single
 * AI call reviewing the whole portfolio together, once per real morning.
 * Per North Star Vision (docs/decisions.md): generated once, published,
 * then read (not regenerated) on every subsequent page load.
 *
 * Today's Actions unifies every real, sized move the Council approved:
 * new positions (BUY), additions to existing ones (INCREASE), and
 * concentration-driven trims or full exits (REDUCE/EXIT) — the first time
 * all four verdict types get real trade sizing, not just brand-new BUYs.
 *
 * Requires ANTHROPIC_API_KEY in .env. Run with:
 *   npx tsx scripts/generate-portfolio-review.ts
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  computeCurrentAllocation,
  computeAllocationGaps,
  computeTotalPortfolioValue,
  categorizeHolding,
  marketValue,
} from "../src/lib/portfolio/allocation";
import {
  computeExcessCash,
  sizeApprovedBuys,
  computeReduceToConcentrationCeiling,
  computeCategoryOverweightValue,
  sizeCategoryRebalanceReduces,
  computeRiskEscalatedReduce,
  computeExitSizing,
} from "../src/lib/portfolio/playbook";
import { countConsecutiveRiskFlaggedDays } from "../src/lib/council/riskEscalation";
import { assembleResearchPacket } from "../src/lib/council/researchPacket";
import { callCouncilForPortfolioReview } from "../src/lib/council/generatePortfolioReview";
import { validatePortfolioReview } from "../src/lib/council/validatePortfolioReview";
import { fetchFundamentalsResilient, type KeyFundamentals } from "../src/lib/marketdata/edgar";
import type {
  StoredPortfolioReviewVerdicts,
  TodaysAction,
} from "../src/lib/council/portfolioReviewTypes";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Copy .env.example to .env and fill in real values.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const portfolio = await prisma.portfolio.findFirst({
    include: { holdings: { include: { company: true } } },
  });
  if (!portfolio) throw new Error("No Portfolio found — run npm run data:sync-portfolio first.");
  if (portfolio.holdings.length === 0) {
    console.log("Portfolio has no holdings yet — nothing for the Council to review.");
    return;
  }

  const brief = await prisma.brief.findFirst({
    orderBy: { date: "desc" },
    include: {
      risks: true,
      opportunities: { include: { company: true } },
      allocationTargets: true,
    },
  });
  if (!brief) throw new Error("No Brief found — publish one first.");

  const holdingsForCalc = portfolio.holdings.map((h) => ({
    id: h.id,
    quantity: Number(h.quantity),
    costBasis: Number(h.costBasis),
    company: {
      id: h.company.id,
      ticker: h.company.ticker,
      name: h.company.name,
      sector: h.company.sector,
      currentPrice: Number(h.company.currentPrice),
      previousClosePrice: Number(h.company.previousClosePrice),
      region: h.company.region,
      assetType: h.company.assetType,
      assetClass: h.company.assetClass,
    },
  }));
  const holdingByTicker = new Map(holdingsForCalc.map((h) => [h.company.ticker, h]));

  const cashBalance = Number(portfolio.cashBalance);
  const currentAllocation = computeCurrentAllocation(holdingsForCalc, cashBalance);
  const allocationTargets = brief.allocationTargets.map((t) => ({
    category: t.category,
    targetPercent: Number(t.targetPercent),
  }));
  const gaps = computeAllocationGaps(currentAllocation, allocationTargets);

  // Real, primary-source fundamentals from SEC EDGAR (decision #11) — best
  // effort. A company EDGAR can't resolve (a fund, a real network issue)
  // degrades to null for that one company; it never blocks the review.
  const companiesToFetch = [
    ...portfolio.holdings.map((h) => h.company),
    ...brief.opportunities.map((o) => o.company).filter((c) => c !== null),
  ];
  const uniqueCompaniesByTicker = new Map(companiesToFetch.map((c) => [c.ticker, c]));

  console.log(
    `Fetching real EDGAR fundamentals for ${uniqueCompaniesByTicker.size} compan${uniqueCompaniesByTicker.size === 1 ? "y" : "ies"}...`,
  );
  const fundamentalsByTicker = new Map<string, KeyFundamentals | null>();
  for (const company of uniqueCompaniesByTicker.values()) {
    if (company.assetType === "FUND") {
      // A fund doesn't file its own 10-K/10-Q the way a single company
      // does — not a failure, just genuinely not applicable.
      fundamentalsByTicker.set(company.ticker, null);
      continue;
    }

    const result = await fetchFundamentalsResilient(company.ticker, company.cik);
    fundamentalsByTicker.set(company.ticker, result?.fundamentals ?? null);

    // Cache a newly-discovered CIK so the next run skips the ticker-mapping
    // lookup entirely for this company — a real CIK never changes.
    if (result && company.cik !== result.cik) {
      await prisma.company.update({ where: { id: company.id }, data: { cik: result.cik } });
    }

    // Real, polite pacing between SEC requests per their fair-access policy
    // — this is a real government system, not a commercial API meant for
    // rapid-fire automated traffic.
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  const foundCount = [...fundamentalsByTicker.values()].filter((f) => f !== null).length;
  console.log(
    `Real fundamentals found for ${foundCount}/${uniqueCompaniesByTicker.size} compan${uniqueCompaniesByTicker.size === 1 ? "y" : "ies"}.`,
  );

  // Real, past reviews for this portfolio, fetched once and reused for two
  // real purposes: seeding each holding's priorConviction in today's packet
  // (decision #20) and, later below, risk-escalation's consecutive-day
  // streak (decision #19). Ordered most-recent-first, explicitly excluding
  // today's date in case this script is ever re-run for the same real day.
  const pastReviews = await prisma.portfolioReview.findMany({
    where: { portfolioId: portfolio.id, date: { lt: brief.date } },
    orderBy: { date: "desc" },
    take: 10,
  });
  const pastReviewVerdicts: StoredPortfolioReviewVerdicts[] = pastReviews.map(
    (r) => r.verdicts as unknown as StoredPortfolioReviewVerdicts,
  );

  // Each holding's real conviction score from the single most recent past
  // review only — not searched further back, since older data would be a
  // staler real signal for what should be today's comparison. Missing
  // entirely (day one, or a validation-degraded prior verdict) means
  // undefined, never fabricated.
  const priorConvictionByTicker = new Map<string, number | undefined>();
  const mostRecentPastReview = pastReviewVerdicts[0];
  if (mostRecentPastReview) {
    for (const h of mostRecentPastReview.existingHoldings) {
      if (h.conviction !== undefined) priorConvictionByTicker.set(h.ticker, h.conviction);
    }
  }

  const packet = assembleResearchPacket({
    holdings: holdingsForCalc,
    cashBalance,
    fundamentalsByTicker,
    priorConvictionByTicker,
    brief: {
      date: brief.date,
      councilRecommendation: brief.councilRecommendation,
      councilConfidence: brief.councilConfidence,
      marketOutlook: brief.marketOutlook,
      executiveSummary: brief.executiveSummary,
      decisionRationale: brief.decisionRationale,
      risks: brief.risks,
      opportunities: brief.opportunities.map((o) => ({
        company: o.company
          ? {
              ticker: o.company.ticker,
              name: o.company.name,
              currentPrice: Number(o.company.currentPrice),
              region: o.company.region,
              assetType: o.company.assetType,
              assetClass: o.company.assetClass,
            }
          : null,
        thematicTitle: o.thematicTitle,
        thesis: o.thesis,
        conviction: o.conviction,
      })),
    },
    allocationGaps: gaps,
  });

  console.log(`Convening the Council to review ${packet.holdings.length} holding(s)...`);
  const raw = await callCouncilForPortfolioReview(packet);

  const result = validatePortfolioReview(raw, packet);

  if (result.warnings.length > 0) {
    console.log(
      "\nValidation warnings (degraded holdings shown as safe HOLD, other verdicts unaffected):",
    );
    for (const w of result.warnings) console.log(`  - ${w}`);
  }

  const totalPortfolioValue = computeTotalPortfolioValue(holdingsForCalc, cashBalance);
  const cashTargetPercent = gaps.find((g) => g.category === "Cash")?.targetPercent ?? 0;
  const excessCash = computeExcessCash(totalPortfolioValue, cashBalance, cashTargetPercent);

  // Sell-side is sized FIRST, before any BUY/INCREASE sizing — a real fix
  // for a real, repeated problem: AZN and LNC were both independently
  // approved by the Council multiple times, each time landing on
  // "approved, but no room to size it today," because BUY sizing used to
  // only ever see the cash balance as it stood before today's own
  // REDUCEs were priced in. A same-day REDUCE's real proceeds are real,
  // spendable capital by the time a person actually executes both trades
  // in the order this Brief recommends — the fix simply lets sizing see
  // that, rather than pretending a sell today can't fund a buy today.
  //
  // REDUCE can be sized two real, independent ways — over its own
  // concentration ceiling (unchanged), or as part of a genuine category
  // rebalance (decision #16's addendum): trimming to help close a real,
  // disclosed overweight in the category this holding belongs to.
  // Multiple REDUCEs in the same overweight category share one real,
  // shrinking "gap to close" — the sell-side mirror of the shared cash
  // pool new BUYs already compete for. Whichever real mechanism produces
  // the larger trim is used; if neither applies, the honest "no
  // mechanical trim" fallback still shows, same as before. EXIT is
  // always computable (full liquidation).
  const reduceVerdicts = result.verdicts.filter((v) => v.verdict === "REDUCE" && v.validated);

  const reduceHoldingsByCategory = new Map<string, typeof holdingsForCalc>();
  for (const v of reduceVerdicts) {
    const holding = holdingByTicker.get(v.ticker);
    if (!holding) continue;
    const category = categorizeHolding(holding.company);
    const existing = reduceHoldingsByCategory.get(category) ?? [];
    existing.push(holding);
    reduceHoldingsByCategory.set(category, existing);
  }

  const categoryDrivenTradeByTicker = new Map<
    string,
    { sharesToSell: number; estimatedProceeds: number }
  >();
  for (const [category, categoryHoldings] of reduceHoldingsByCategory) {
    const categoryOverweightValue = computeCategoryOverweightValue(
      gaps,
      category,
      totalPortfolioValue,
    );
    if (categoryOverweightValue <= 0) continue;
    const sized = sizeCategoryRebalanceReduces({
      holdings: categoryHoldings,
      categoryOverweightValue,
    });
    for (const [ticker, trade] of sized) {
      categoryDrivenTradeByTicker.set(ticker, trade);
    }
  }

  // Risk-escalation (decision #19) using the real, past review history
  // already fetched above, before packet assembly.
  const reduceTradeByTicker = new Map<
    string,
    { sharesToSell: number; estimatedProceeds: number }
  >();
  for (const v of reduceVerdicts) {
    const holding = holdingByTicker.get(v.ticker);
    const concentrationTrade = holding
      ? computeReduceToConcentrationCeiling(holding, totalPortfolioValue)
      : null;
    const categoryTrade = categoryDrivenTradeByTicker.get(v.ticker) ?? null;

    // Either real, independent justification supports at least that much
    // of a trim — take whichever is larger rather than picking one
    // arbitrarily over the other.
    let trade =
      concentrationTrade && categoryTrade
        ? concentrationTrade.estimatedProceeds >= categoryTrade.estimatedProceeds
          ? concentrationTrade
          : categoryTrade
        : (concentrationTrade ?? categoryTrade);

    // Neither real mechanism explained this REDUCE — the real, honest
    // signature of a company/sector-specific risk call, which had no
    // sizing mechanism at all until decision #19. A persistent, real,
    // multi-day pattern is treated as stronger evidence than a single
    // day's flag, so the effective ceiling tightens the longer this
    // exact ticker keeps showing up this way.
    if (!trade && holding) {
      const consecutiveFlaggedDays = countConsecutiveRiskFlaggedDays(v.ticker, pastReviewVerdicts);
      trade = computeRiskEscalatedReduce(holding, totalPortfolioValue, consecutiveFlaggedDays);
    }

    if (trade) reduceTradeByTicker.set(v.ticker, trade);
  }

  const exitVerdicts = result.verdicts.filter((v) => v.verdict === "EXIT" && v.validated);
  const exitTradeByTicker = new Map<string, { sharesToSell: number; estimatedProceeds: number }>();
  for (const v of exitVerdicts) {
    const holding = holdingByTicker.get(v.ticker);
    if (holding) exitTradeByTicker.set(v.ticker, computeExitSizing(holding));
  }

  const realSellProceedsToday =
    [...reduceTradeByTicker.values()].reduce((sum, t) => sum + t.estimatedProceeds, 0) +
    [...exitTradeByTicker.values()].reduce((sum, t) => sum + t.estimatedProceeds, 0);
  const availableCashForBuys = excessCash + realSellProceedsToday;

  // Buy-side: INCREASE (existing holdings) get priority over brand-new BUY
  // candidates for the same shared cash pool — reinforcing an already-vetted
  // position ahead of opening a new one. A real, explicit choice, not an
  // accident of array order; easy to revisit if it produces the wrong call
  // in practice.
  const increaseVerdicts = result.verdicts.filter((v) => v.verdict === "INCREASE" && v.validated);
  const increaseCandidates = increaseVerdicts.flatMap((v) => {
    const holding = holdingByTicker.get(v.ticker);
    if (!holding) return [];
    return [
      {
        ticker: holding.company.ticker,
        companyName: holding.company.name,
        currentPrice: holding.company.currentPrice,
        assetType: holding.company.assetType,
        currentValue: marketValue(holding),
      },
    ];
  });
  const newBuyCandidates = result.newPositionVerdicts.map((v) => ({
    ticker: v.ticker,
    companyName: v.companyName,
    currentPrice: v.currentPrice,
    assetType: v.assetType,
    currentValue: 0,
  }));

  const buyTrades = sizeApprovedBuys({
    candidates: [...increaseCandidates, ...newBuyCandidates],
    excessCash: availableCashForBuys,
    totalPortfolioValue,
  });
  const buyTradeByTicker = new Map(buyTrades.map((t) => [t.ticker, t]));

  const todaysActions: TodaysAction[] = [];

  for (const v of increaseVerdicts) {
    todaysActions.push({
      ticker: v.ticker,
      companyName: v.companyName,
      verdict: "INCREASE",
      evidence: v.evidence,
      side: "BUY",
      priceAtVerdict: v.priceAtVerdict,
      trade: buyTradeByTicker.get(v.ticker) ?? null,
    });
  }

  for (const v of result.newPositionVerdicts) {
    todaysActions.push({
      ticker: v.ticker,
      companyName: v.companyName,
      verdict: "BUY",
      evidence: v.evidence,
      side: "BUY",
      priceAtVerdict: v.currentPrice,
      trade: buyTradeByTicker.get(v.ticker) ?? null,
    });
  }

  for (const v of reduceVerdicts) {
    todaysActions.push({
      ticker: v.ticker,
      companyName: v.companyName,
      verdict: "REDUCE",
      evidence: v.evidence,
      side: "SELL",
      priceAtVerdict: v.priceAtVerdict,
      trade: reduceTradeByTicker.get(v.ticker) ?? null,
    });
  }

  for (const v of exitVerdicts) {
    todaysActions.push({
      ticker: v.ticker,
      companyName: v.companyName,
      verdict: "EXIT",
      evidence: v.evidence,
      side: "SELL",
      priceAtVerdict: v.priceAtVerdict,
      trade: exitTradeByTicker.get(v.ticker) ?? null,
    });
  }

  const storedVerdicts: StoredPortfolioReviewVerdicts = {
    existingHoldings: result.verdicts,
    todaysActions,
  };

  const review = await prisma.portfolioReview.upsert({
    where: { portfolioId_date: { portfolioId: portfolio.id, date: brief.date } },
    update: { briefId: brief.id, narrative: result.narrative, verdicts: storedVerdicts },
    create: {
      portfolioId: portfolio.id,
      briefId: brief.id,
      date: brief.date,
      narrative: result.narrative,
      verdicts: storedVerdicts,
    },
  });

  console.log(`\nPublished Portfolio Review ${review.id} for ${brief.date.toDateString()}.\n`);
  console.log("Narrative:");
  console.log(result.narrative);

  console.log("\nExisting Holdings:");
  for (const v of result.verdicts) {
    const convictionText =
      v.conviction !== undefined ? ` (conviction: ${v.conviction})` : " (no conviction score)";
    console.log(
      `  ${v.ticker} (${v.companyName}): ${v.verdict}${convictionText}${v.validated ? "" : " [safe default]"}`,
    );
    for (const e of v.evidence) console.log(`    - ${e}`);
  }

  if (todaysActions.length === 0) {
    console.log("\nToday's Actions: none recommended today.");
  } else {
    console.log("\nToday's Actions:");
    for (const a of todaysActions) {
      console.log(`  ${a.ticker} (${a.companyName}): ${a.verdict}`);
      for (const e of a.evidence) console.log(`    - ${e}`);
      if (a.side === "BUY") {
        if (a.trade) {
          console.log(
            `    -> Buy ${a.trade.shares} shares (~$${a.trade.estimatedPricePerShare}/share, ~$${a.trade.estimatedCost.toFixed(2)} total)`,
          );
        } else {
          console.log(`    -> Approved, but no Excess Cash/room left to size it today.`);
        }
      } else {
        if (a.trade) {
          console.log(
            `    -> Sell ${a.trade.sharesToSell} shares (~$${a.trade.estimatedProceeds.toFixed(2)} proceeds)`,
          );
        } else {
          console.log(
            `    -> Council recommended REDUCE, but this position isn't currently over its concentration ceiling — no mechanical trim computed.`,
          );
        }
      }
    }
  }
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
