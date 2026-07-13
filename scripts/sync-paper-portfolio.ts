/**
 * Syncs MarketIQ's Portfolio/Holding tables to match a real Alpaca paper
 * trading account exactly — read-only, one direction (Alpaca -> us).
 * Run with: npm run data:sync-portfolio
 *
 * This does NOT place trades. Trading happens in Alpaca's own dashboard (or
 * their API directly, outside this codebase); this script only observes
 * and reflects whatever is actually there, the same way
 * refresh-market-data.ts observes prices without ever placing an order.
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { fetchAccount, fetchPositions } from "../src/lib/marketdata/alpacaTrading";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Copy .env.example to .env and fill in real values.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.findFirst();
  if (!user) {
    throw new Error("No User found — run npm run db:seed first.");
  }

  console.log("Fetching real account and positions from Alpaca...");
  const [account, positions] = await Promise.all([fetchAccount(), fetchPositions()]);

  const portfolio = await prisma.portfolio.upsert({
    where: { userId: user.id },
    update: { cashBalance: account.cashBalance },
    create: { userId: user.id, cashBalance: account.cashBalance },
  });
  console.log(`Cash balance synced: $${account.cashBalance.toFixed(2)}`);

  const syncedTickers = new Set<string>();

  for (const position of positions) {
    syncedTickers.add(position.ticker);

    // Company metadata (name, sector, region) isn't in Alpaca's positions
    // response — only symbol, quantity, and price. For a ticker we already
    // know about (from seed data or a prior sync), leave that metadata
    // alone and only update price. For a genuinely new ticker — a real
    // trade placed for a company MarketIQ has never seen — create it with
    // honest placeholders and flag it for manual correction, rather than
    // guessing at a sector we don't actually know.
    const existingCompany = await prisma.company.findUnique({ where: { ticker: position.ticker } });

    const priceFields =
      position.currentPrice !== null && position.previousClosePrice !== null
        ? { currentPrice: position.currentPrice, previousClosePrice: position.previousClosePrice }
        : {};

    const company = existingCompany
      ? await prisma.company.update({ where: { id: existingCompany.id }, data: priceFields })
      : await prisma.company.create({
          data: {
            ticker: position.ticker,
            name: position.ticker, // placeholder — Alpaca's positions endpoint doesn't return a company name
            sector: "Unknown", // placeholder — needs a real fundamentals source or manual correction
            region: "DOMESTIC", // placeholder — best-guess default, correct manually if wrong
            currentPrice: position.currentPrice ?? 0,
            previousClosePrice: position.previousClosePrice ?? 0,
          },
        });

    if (!existingCompany) {
      console.log(
        `New ticker from Alpaca not previously known: ${position.ticker} — created with placeholder name/sector/region. Correct these manually (e.g. via npm run db:studio) for accurate Sector Exposure.`,
      );
    }

    await prisma.holding.upsert({
      where: { portfolioId_companyId: { portfolioId: portfolio.id, companyId: company.id } },
      update: { quantity: position.quantity, costBasis: position.costBasisPerShare },
      create: {
        portfolioId: portfolio.id,
        companyId: company.id,
        quantity: position.quantity,
        costBasis: position.costBasisPerShare,
      },
    });
  }

  // Remove holdings for positions that no longer exist in Alpaca (closed
  // positions) — this is a mirror, not an accumulator.
  const existingHoldings = await prisma.holding.findMany({
    where: { portfolioId: portfolio.id },
    include: { company: true },
  });
  const closedHoldings = existingHoldings.filter((h) => !syncedTickers.has(h.company.ticker));
  if (closedHoldings.length > 0) {
    await prisma.holding.deleteMany({ where: { id: { in: closedHoldings.map((h) => h.id) } } });
    console.log(
      `Removed ${closedHoldings.length} closed position(s): ${closedHoldings.map((h) => h.company.ticker).join(", ")}`,
    );
  }

  console.log(`Synced ${positions.length} open position(s) from your Alpaca paper account.`);
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
