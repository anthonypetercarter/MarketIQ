/**
 * The Balance Sheet strength screen (decision #22): how leveraged is a
 * company, using a real, standard total-liabilities-to-total-assets
 * ratio. Lower means a genuinely safer, less-leveraged balance sheet. A
 * standalone research tool, not wired into automated Portfolio Review —
 * same discipline as Quality, Growth, and Value before it.
 *
 * Equities only — funds don't file the statements this reads.
 *
 * Structurally simpler than Value: no live price is needed at all, and
 * both real facts used here (Assets, Liabilities) are already confirmed
 * working instant facts — `Assets` specifically was directly verified
 * against a live response in scripts/diagnose-instant-frame.ts before
 * the Value screen was ever built.
 *
 * Run with: npx tsx scripts/screen-balance-sheet.ts
 */

import "dotenv/config";
import { fetchFrame, parseFrameEntries, buildCikToTickerMap } from "../src/lib/marketdata/edgar";
import { computeBalanceSheetScreen } from "../src/lib/research/balanceSheetScreen";

const INSTANT_PERIOD = "CY2024Q4I";
const MIN_ASSETS_FLOOR = 1_000_000_000;
const PACING_MS = 200;

export async function runBalanceSheetScreen(): Promise<void> {
  console.log(`Fetching real Assets for ${INSTANT_PERIOD}...`);
  const assetsRaw = await fetchFrame("us-gaap", "Assets", "USD", INSTANT_PERIOD);
  const assets = parseFrameEntries(assetsRaw);
  console.log(`  ${assets.length} real companies.`);
  await new Promise((r) => setTimeout(r, PACING_MS));

  console.log(`Fetching real Liabilities for ${INSTANT_PERIOD}...`);
  const liabilitiesRaw = await fetchFrame("us-gaap", "Liabilities", "USD", INSTANT_PERIOD);
  const liabilities = parseFrameEntries(liabilitiesRaw);
  console.log(`  ${liabilities.length} real companies.`);

  console.log("\nFetching the real CIK-to-ticker mapping...");
  const tickerByCik = await buildCikToTickerMap();
  console.log(`  ${tickerByCik.size} real tickers mapped.`);

  console.log(
    `\nJoining by CIK, applying the real $${MIN_ASSETS_FLOOR / 1_000_000_000}B assets floor...`,
  );
  const results = computeBalanceSheetScreen({
    assets,
    liabilities,
    tickerByCik,
    minAssetsFloor: MIN_ASSETS_FLOOR,
  });

  console.log(`\n${results.length} real companies passed the floor and had complete data.`);
  console.log(`\nTop 15 strongest real balance sheets (lowest leverage ratio first):\n`);
  for (const r of results.slice(0, 15)) {
    console.log(
      `  ${r.entityName.padEnd(35)} ${r.ticker.padEnd(8)} liabilities/assets ${(r.leverageRatio * 100).toFixed(1)}%`,
    );
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runBalanceSheetScreen().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
