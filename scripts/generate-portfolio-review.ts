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
  marketValue,
} from "../src/lib/portfolio/allocation";
import {
  computeExcessCash,
  sizeApprovedBuys,
  computeReduceToConcentrationCeiling,
  computeExitSizing,
} from "../src/lib/portfolio/playbook";
import { assembleResearchPacket } from "../src/lib/council/researchPacket";
import { callCouncilForPortfolioReview } from "../src/lib/council/generatePortfolioReview";
import { validatePortfolioReview } from "../src/lib/council/validatePortfolioReview";
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

  const packet = assembleResearchPacket({
    holdings: holdingsForCalc,
    cashBalance,
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
    excessCash,
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
      trade: buyTradeByTicker.get(v.ticker) ?? null,
    });
  }

  // Sell-side: REDUCE only produces a real trade when the position is
  // actually over its own concentration ceiling — a qualitative REDUCE
  // issued for a different reason has no mechanical trim to compute yet,
  // and is shown honestly as such rather than guessed at. EXIT is always
  // computable (full liquidation).
  const reduceVerdicts = result.verdicts.filter((v) => v.verdict === "REDUCE" && v.validated);
  for (const v of reduceVerdicts) {
    const holding = holdingByTicker.get(v.ticker);
    const trade = holding
      ? computeReduceToConcentrationCeiling(holding, totalPortfolioValue)
      : null;
    todaysActions.push({
      ticker: v.ticker,
      companyName: v.companyName,
      verdict: "REDUCE",
      evidence: v.evidence,
      side: "SELL",
      trade,
    });
  }

  const exitVerdicts = result.verdicts.filter((v) => v.verdict === "EXIT" && v.validated);
  for (const v of exitVerdicts) {
    const holding = holdingByTicker.get(v.ticker);
    const trade = holding ? computeExitSizing(holding) : null;
    todaysActions.push({
      ticker: v.ticker,
      companyName: v.companyName,
      verdict: "EXIT",
      evidence: v.evidence,
      side: "SELL",
      trade,
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
    console.log(
      `  ${v.ticker} (${v.companyName}): ${v.verdict}${v.validated ? "" : " [safe default]"}`,
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
