/**
 * Refreshes Company.currentPrice / previousClosePrice from real Alpaca
 * market data. Run with: npm run data:refresh-prices
 *
 * Deliberately a manual script for now, not a cron job — see
 * docs/decisions.md #5's staging discipline: prove the ingestion is correct
 * by running it by hand a few mornings before automating *when* it runs.
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { fetchSnapshotPrices } from "../src/lib/marketdata/alpaca";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Copy .env.example to .env and fill in real values.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const companies = await prisma.company.findMany();

  if (companies.length === 0) {
    console.log("No companies found — nothing to refresh.");
    return;
  }

  const tickers = companies.map((c) => c.ticker);
  console.log(`Fetching real prices for ${tickers.length} tickers: ${tickers.join(", ")}`);

  const prices = await fetchSnapshotPrices(tickers);

  let updated = 0;
  const skipped: string[] = [];

  for (const company of companies) {
    const price = prices.get(company.ticker);
    if (!price) {
      skipped.push(company.ticker);
      continue;
    }

    await prisma.company.update({
      where: { id: company.id },
      data: {
        currentPrice: price.currentPrice,
        previousClosePrice: price.previousClosePrice,
      },
    });
    updated++;
  }

  console.log(`Updated ${updated}/${companies.length} companies with real prices.`);
  if (skipped.length > 0) {
    console.log(`No snapshot data returned for: ${skipped.join(", ")} (left unchanged).`);
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
