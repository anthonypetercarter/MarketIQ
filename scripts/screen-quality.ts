/**
 * The first real, market-wide Quality screen (decision #14): fetches
 * real net income and revenue across every reporting company for two
 * real periods, and surfaces which real companies — above a $1B revenue
 * floor, and genuinely profitable today, not just less unprofitable than
 * before — have real, improving margins. A standalone research tool,
 * not wired into automated Portfolio Review: its output seeds real,
 * deliberate research (the same EDGAR-plus-news process used for every
 * real Opportunity), not something acted on automatically.
 *
 * Equities only — funds don't file the statements this reads.
 *
 * Real, disclosed limitation: only the primary "Revenues" tag is used
 * for now, not the full fallback list already built for per-company
 * lookups. A company reporting revenue under the alternate real tag
 * (RevenueFromContractWithCustomerExcludingAssessedTax) will be missing
 * from this specific screen, not misrepresented — a known, honest gap,
 * not silently papered over.
 *
 * Run with: npx tsx scripts/screen-quality.ts
 */

import "dotenv/config";
import { fetchFrame, parseFrameEntries } from "../src/lib/marketdata/edgar";
import { computeQualityScreen } from "../src/lib/research/qualityScreen";

const CURRENT_PERIOD = "CY2024";
const PRIOR_PERIOD = "CY2023";
const MIN_REVENUE_FLOOR = 1_000_000_000;
const PACING_MS = 200;

function formatBillions(value: number): string {
  return `$${(value / 1_000_000_000).toFixed(2)}B`;
}

async function main() {
  console.log(`Fetching real Revenues for ${CURRENT_PERIOD}...`);
  const currentRevenueRaw = await fetchFrame("us-gaap", "Revenues", "USD", CURRENT_PERIOD);
  const currentRevenue = parseFrameEntries(currentRevenueRaw);
  console.log(`  ${currentRevenue.length} real companies.`);
  await new Promise((r) => setTimeout(r, PACING_MS));

  console.log(`Fetching real Revenues for ${PRIOR_PERIOD}...`);
  const priorRevenueRaw = await fetchFrame("us-gaap", "Revenues", "USD", PRIOR_PERIOD);
  const priorRevenue = parseFrameEntries(priorRevenueRaw);
  console.log(`  ${priorRevenue.length} real companies.`);
  await new Promise((r) => setTimeout(r, PACING_MS));

  console.log(`Fetching real NetIncomeLoss for ${CURRENT_PERIOD}...`);
  const currentNetIncomeRaw = await fetchFrame("us-gaap", "NetIncomeLoss", "USD", CURRENT_PERIOD);
  const currentNetIncome = parseFrameEntries(currentNetIncomeRaw);
  console.log(`  ${currentNetIncome.length} real companies.`);
  await new Promise((r) => setTimeout(r, PACING_MS));

  console.log(`Fetching real NetIncomeLoss for ${PRIOR_PERIOD}...`);
  const priorNetIncomeRaw = await fetchFrame("us-gaap", "NetIncomeLoss", "USD", PRIOR_PERIOD);
  const priorNetIncome = parseFrameEntries(priorNetIncomeRaw);
  console.log(`  ${priorNetIncome.length} real companies.`);

  console.log(
    `\nJoining by CIK, applying the real $${MIN_REVENUE_FLOOR / 1_000_000_000}B revenue floor and requiring a genuinely positive current margin...`,
  );
  const results = computeQualityScreen({
    currentRevenue,
    priorRevenue,
    currentNetIncome,
    priorNetIncome,
    minRevenueFloor: MIN_REVENUE_FLOOR,
  });

  console.log(
    `\n${results.length} real companies passed the floor and had complete data in both periods.`,
  );
  console.log(`\nTop 15 by genuinely improving margin (${PRIOR_PERIOD} -> ${CURRENT_PERIOD}):\n`);
  for (const r of results.slice(0, 15)) {
    const sign = r.marginChangePoints >= 0 ? "+" : "";
    console.log(
      `  ${r.entityName.padEnd(35)} revenue ${formatBillions(r.currentRevenue).padEnd(10)} margin ${r.priorMarginPercent.toFixed(1)}% -> ${r.currentMarginPercent.toFixed(1)}% (${sign}${r.marginChangePoints.toFixed(1)}pt)`,
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
