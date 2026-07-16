/**
 * Generates and publishes today's Portfolio Review — the Council's single
 * AI call reviewing the whole portfolio together, once per real morning.
 * Per North Star Vision (docs/decisions.md): generated once, published,
 * then read (not regenerated) on every subsequent page load.
 *
 * Requires ANTHROPIC_API_KEY in .env. Run with:
 *   npx tsx scripts/generate-portfolio-review.ts
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { computeCurrentAllocation, computeAllocationGaps } from "../src/lib/portfolio/allocation";
import { assembleResearchPacket } from "../src/lib/council/researchPacket";
import { callCouncilForPortfolioReview } from "../src/lib/council/generatePortfolioReview";
import { validatePortfolioReview } from "../src/lib/council/validatePortfolioReview";

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
    },
  }));

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
        company: o.company ? { ticker: o.company.ticker } : null,
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

  const review = await prisma.portfolioReview.upsert({
    where: { portfolioId_date: { portfolioId: portfolio.id, date: brief.date } },
    update: { briefId: brief.id, narrative: result.narrative, verdicts: result.verdicts },
    create: {
      portfolioId: portfolio.id,
      briefId: brief.id,
      date: brief.date,
      narrative: result.narrative,
      verdicts: result.verdicts,
    },
  });

  console.log(`\nPublished Portfolio Review ${review.id} for ${brief.date.toDateString()}.\n`);
  console.log("Narrative:");
  console.log(result.narrative);
  console.log("\nVerdicts:");
  for (const v of result.verdicts) {
    console.log(
      `  ${v.ticker} (${v.companyName}): ${v.verdict}${v.validated ? "" : " [safe default]"}`,
    );
    for (const e of v.evidence) console.log(`    - ${e}`);
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
