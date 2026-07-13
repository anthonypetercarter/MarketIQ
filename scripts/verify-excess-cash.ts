/**
 * Verifies Today's Playbook Milestone 1 (Excess Cash) against real data:
 * your actual synced Alpaca portfolio and the latest real Brief's Cash
 * target. Prints every input, not just the result, so the math is
 * checkable by eye before Milestone 2 builds on top of it.
 *
 * Run with: npx tsx scripts/verify-excess-cash.ts
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { computeTotalPortfolioValue } from "../src/lib/portfolio/allocation";
import { computeExcessCash } from "../src/lib/portfolio/playbook";

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
    include: { allocationTargets: true },
  });
  if (!brief) throw new Error("No Brief found.");

  const cashTarget = brief.allocationTargets.find((t) => t.category === "Cash");
  if (!cashTarget) throw new Error("Today's Brief has no 'Cash' allocation target.");

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
  const cashTargetPercent = Number(cashTarget.targetPercent);
  const totalValue = computeTotalPortfolioValue(holdingsForCalc, cashBalance);
  const excessCash = computeExcessCash(totalValue, cashBalance, cashTargetPercent);

  console.log(`Brief: ${brief.date.toDateString()}`);
  console.log(`Holdings: ${holdingsForCalc.length} position(s)`);
  console.log(`Total portfolio value: ${formatCurrency(totalValue)}`);
  console.log(`Current cash balance: ${formatCurrency(cashBalance)}`);
  console.log(
    `Today's Cash target: ${cashTargetPercent}% = ${formatCurrency(totalValue * (cashTargetPercent / 100))}`,
  );
  console.log(`Excess Cash (deployable today): ${formatCurrency(excessCash)}`);
  if (excessCash <= 0) {
    console.log(`-> No capital to deploy today — cash is already at or below target.`);
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
