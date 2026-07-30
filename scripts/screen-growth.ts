/**
 * The first real Growth screen (decision #15): fetches real revenue
 * across every reporting company for three consecutive real periods, and
 * surfaces which real companies — above a $1B revenue floor, and
 * genuinely growing today, not just declining more slowly — have real,
 * accelerating growth. A standalone research tool, not wired into
 * automated Portfolio Review: its output seeds real, deliberate research
 * (the same EDGAR-plus-news process used for every real Opportunity),
 * not something acted on automatically.
 *
 * Equities only — funds don't file the statements this reads. Same real,
 * disclosed limitation as Quality: only the primary "Revenues" tag is
 * used, not the full fallback list — a company using the alternate real
 * tag is missing from this specific screen, not misrepresented.
 *
 * Run standalone with: npx tsx scripts/screen-growth.ts
 * Also reused by scripts/research-daily.ts (decision #17) — the core
 * logic is exported as runGrowthScreen so both call sites share the
 * exact same real fetch-and-compute logic, not a copy of it.
 */

import "dotenv/config";
import { fetchFrame, parseFrameEntries, buildCikToTickerMap } from "../src/lib/marketdata/edgar";
import { computeGrowthScreen } from "../src/lib/research/growthScreen";
import type { GrowthScreenResult } from "../src/lib/research/growthScreen";

const EARLIEST_PERIOD = "CY2022";
const MIDDLE_PERIOD = "CY2023";
const LATEST_PERIOD = "CY2024";
const MIN_REVENUE_FLOOR = 1_000_000_000;
const PACING_MS = 200;

/** A real GrowthScreenResult with its ticker resolved (decision #24), same real enhancement as Quality's. */
export interface GrowthScreenResultWithTicker extends GrowthScreenResult {
  ticker: string;
}

function formatBillions(value: number): string {
  return `$${(value / 1_000_000_000).toFixed(2)}B`;
}

export async function runGrowthScreen(): Promise<GrowthScreenResultWithTicker[]> {
  console.log(`Fetching real Revenues for ${EARLIEST_PERIOD}...`);
  const earliestRaw = await fetchFrame("us-gaap", "Revenues", "USD", EARLIEST_PERIOD);
  const earliestRevenue = parseFrameEntries(earliestRaw);
  console.log(`  ${earliestRevenue.length} real companies.`);
  await new Promise((r) => setTimeout(r, PACING_MS));

  console.log(`Fetching real Revenues for ${MIDDLE_PERIOD}...`);
  const middleRaw = await fetchFrame("us-gaap", "Revenues", "USD", MIDDLE_PERIOD);
  const middleRevenue = parseFrameEntries(middleRaw);
  console.log(`  ${middleRevenue.length} real companies.`);
  await new Promise((r) => setTimeout(r, PACING_MS));

  console.log(`Fetching real Revenues for ${LATEST_PERIOD}...`);
  const latestRaw = await fetchFrame("us-gaap", "Revenues", "USD", LATEST_PERIOD);
  const latestRevenue = parseFrameEntries(latestRaw);
  console.log(`  ${latestRevenue.length} real companies.`);

  console.log(
    `\nJoining by CIK, applying the real $${MIN_REVENUE_FLOOR / 1_000_000_000}B revenue floor and requiring genuinely positive current growth...`,
  );
  const results = computeGrowthScreen({
    earliestRevenue,
    middleRevenue,
    latestRevenue,
    minRevenueFloor: MIN_REVENUE_FLOOR,
  });

  console.log(
    `\n${results.length} real companies passed the floor and had complete data in all three periods.`,
  );

  console.log("\nFetching the real CIK-to-ticker mapping...");
  const tickerByCik = await buildCikToTickerMap();
  const resultsWithTicker: GrowthScreenResultWithTicker[] = results.flatMap((r) => {
    const ticker = tickerByCik.get(r.cik);
    return ticker ? [{ ...r, ticker }] : [];
  });

  console.log(
    `\nTop 15 by genuinely accelerating growth (${EARLIEST_PERIOD} -> ${MIDDLE_PERIOD} -> ${LATEST_PERIOD}):\n`,
  );
  for (const r of resultsWithTicker.slice(0, 15)) {
    const sign = r.accelerationPoints >= 0 ? "+" : "";
    console.log(
      `  ${r.entityName.padEnd(35)} ${r.ticker.padEnd(8)} revenue ${formatBillions(r.latestRevenue).padEnd(10)} growth ${r.priorGrowthPercent.toFixed(1)}% -> ${r.recentGrowthPercent.toFixed(1)}% (${sign}${r.accelerationPoints.toFixed(1)}pt)`,
    );
  }
  return resultsWithTicker;
}

// Only run when this file is executed directly, not when research-daily.ts
// imports runGrowthScreen from it.
if (import.meta.url === `file://${process.argv[1]}`) {
  runGrowthScreen().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
