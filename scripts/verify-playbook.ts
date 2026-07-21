/**
 * Prints Today's Playbook against your real Alpaca-synced portfolio and
 * the real latest Brief — no UI yet, per docs/decisions.md #6. This is
 * the terminal-only validation step before Milestone 7 (the actual
 * Portfolio page UI) begins.
 *
 * Run with: npx tsx scripts/verify-playbook.ts
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { computeTodaysPlaybook } from "../src/lib/portfolio/playbook";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Copy .env.example to .env and fill in real values.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

async function main() {
  const portfolio = await prisma.portfolio.findFirst({
    include: { holdings: { include: { company: true } } },
  });
  if (!portfolio) throw new Error("No Portfolio found — run npm run data:sync-portfolio first.");

  const brief = await prisma.brief.findFirst({
    orderBy: { date: "desc" },
    include: {
      allocationTargets: true,
      opportunities: { include: { company: true } },
    },
  });
  if (!brief) throw new Error("No Brief found.");

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

  const opportunitiesForCalc = brief.opportunities.map((o) => ({
    id: o.id,
    thesis: o.thesis,
    conviction: o.conviction,
    companyId: o.companyId,
    company: o.company
      ? {
          id: o.company.id,
          ticker: o.company.ticker,
          name: o.company.name,
          region: o.company.region,
          currentPrice: Number(o.company.currentPrice),
        }
      : null,
  }));

  const allocationTargets = brief.allocationTargets.map((t) => ({
    category: t.category,
    targetPercent: Number(t.targetPercent),
  }));

  const result = computeTodaysPlaybook({
    holdings: holdingsForCalc,
    cashBalance: Number(portfolio.cashBalance),
    allocationTargets,
    opportunities: opportunitiesForCalc,
    briefDate: brief.date,
  });

  console.log(`\nBrief: ${brief.date.toDateString()}\n`);
  console.log("TODAY'S PLAYBOOK\n");

  if (result.status === "WAIT") {
    console.log(`Excess Cash\n${formatCurrency(result.excessCash)}\n`);
    console.log(`Recommendation\nWait — ${result.reason}\n`);
    console.log(`(Excess Cash: ${formatCurrency(result.excessCash)})`);
    return;
  }

  console.log(`Objective\n${result.objective}\n`);
  console.log(
    `Today's Best Trade\nBuy ${result.trade.shares} shares of ${result.trade.ticker} (${result.selectedOpportunity.companyName})\n~${formatCurrency(result.trade.estimatedPricePerShare)}/share, ~${formatCurrency(result.trade.estimatedCost)} total\n`,
  );
  const healthLabel = result.expectedPortfolio.isImproving
    ? `${result.expectedPortfolio.expectedHealthStatus} (Improving)`
    : result.expectedPortfolio.expectedHealthStatus;
  console.log(
    `Expected Result\n${result.expectedPortfolio.targetCategory}: ~${result.expectedPortfolio.expectedCategoryPercent.toFixed(1)}%\nPortfolio Health: ${healthLabel}\n`,
  );
  console.log(`Why`);
  for (const item of result.evidence) {
    console.log(`- ${item}`);
  }
  console.log(`- ${result.sizingExplanation}`);
  console.log(`- (Excess Cash available today: ${formatCurrency(result.excessCash)})`);
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
