/**
 * Track Record — the outcome-measurement loop this project has never had
 * until now. Two real, distinct sources of signal:
 *
 * 1. Every currently-held position's real performance since it was
 *    actually bought — this works today, with zero new infrastructure,
 *    because Holding.costBasis already captures the real price paid when
 *    a Buy/Increase verdict was actually acted on.
 *
 * 2. Verdict-level evaluation using the newly-captured priceAtVerdict
 *    field (added this session) — this starts accumulating from today's
 *    Portfolio Review forward. Reviews generated before this field
 *    existed are skipped honestly, not guessed at.
 *
 * Run with: npx tsx scripts/evaluate-track-record.ts
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { computeVerdictOutcome } from "../src/lib/council/trackRecord";
import type { StoredPortfolioReviewVerdicts } from "../src/lib/council/portfolioReviewTypes";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Copy .env.example to .env and fill in real values.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function formatSignedPercent(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

async function main() {
  const portfolio = await prisma.portfolio.findFirst({
    include: { holdings: { include: { company: true } } },
  });
  if (!portfolio) throw new Error("No Portfolio found.");

  console.log("=".repeat(70));
  console.log("REAL HOLDINGS PERFORMANCE (since actual purchase — real cost basis)");
  console.log("=".repeat(70));
  if (portfolio.holdings.length === 0) {
    console.log("No holdings yet.");
  }
  for (const h of portfolio.holdings) {
    const costBasis = Number(h.costBasis);
    const currentPrice = Number(h.company.currentPrice);
    const changePercent = costBasis > 0 ? ((currentPrice - costBasis) / costBasis) * 100 : 0;
    console.log(
      `${h.company.ticker} (${h.company.name}): bought at ${formatCurrency(costBasis)}, now ${formatCurrency(currentPrice)} (${formatSignedPercent(changePercent)})`,
    );
  }

  const companies = await prisma.company.findMany();
  const currentPriceByTicker = new Map(companies.map((c) => [c.ticker, Number(c.currentPrice)]));

  const allReviews = await prisma.portfolioReview.findMany({ orderBy: { date: "asc" } });

  console.log(`\n${"=".repeat(70)}`);
  console.log("VERDICT-LEVEL TRACK RECORD (requires priceAtVerdict, captured going forward)");
  console.log("=".repeat(70));

  let anyEvaluated = false;
  let skippedNoPrice = 0;
  let skippedTooEarly = 0;

  for (const review of allReviews) {
    const verdicts = review.verdicts as unknown as Partial<StoredPortfolioReviewVerdicts>;
    const holdingVerdicts = verdicts.existingHoldings ?? [];

    for (const v of holdingVerdicts) {
      const priceAtVerdict = (v as { priceAtVerdict?: number }).priceAtVerdict;
      if (typeof priceAtVerdict !== "number") {
        skippedNoPrice++;
        continue;
      }

      const currentPrice = currentPriceByTicker.get(v.ticker);
      if (currentPrice === undefined) continue;

      const outcome = computeVerdictOutcome({
        ticker: v.ticker,
        companyName: v.companyName,
        verdict: v.verdict,
        priceAtVerdict,
        currentPrice,
        verdictDate: new Date(review.date),
        asOfDate: new Date(),
      });

      if (outcome.alignment === "too_early") {
        skippedTooEarly++;
        continue;
      }

      anyEvaluated = true;
      console.log(
        `${new Date(review.date).toDateString()}  ${outcome.ticker.padEnd(6)} ${outcome.verdict.padEnd(9)} -> ${outcome.alignment.padEnd(10)} (${formatSignedPercent(outcome.priceChangePercent)} over ${outcome.daysElapsed}d)`,
      );
    }
  }

  if (!anyEvaluated) {
    console.log(
      "\nNo verdicts old enough (7+ real days) with captured priceAtVerdict yet. This starts " +
        "accumulating from today's Portfolio Review forward — check back once at least a " +
        "week of real reviews exist.",
    );
  }
  if (skippedNoPrice > 0) {
    console.log(
      `\n(${skippedNoPrice} verdict(s) from reviews generated before priceAtVerdict was captured — skipped honestly, not guessed at.)`,
    );
  }
  if (skippedTooEarly > 0) {
    console.log(`(${skippedTooEarly} verdict(s) not yet old enough to evaluate.)`);
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
