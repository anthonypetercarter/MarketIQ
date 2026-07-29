/**
 * The first real Value screen (decision #21): is a company cheap
 * relative to its own real fundamentals? Fuses real EDGAR fundamentals
 * with a real, live price — the piece neither Quality nor Growth needed.
 * A standalone research tool, not wired into automated Portfolio Review.
 *
 * Equities only — funds don't file the statements this reads.
 *
 * Shares outstanding is fetched as a real, 4-quarter, most-recent-first
 * cascade rather than one fixed period — the fix for a genuine, live
 * discovery: Netflix's real 10-for-1 stock split (November 2025) made a
 * single, fixed period's stale, pre-split share count silently
 * incompatible with its real, live, post-split price, producing an
 * absurd P/E of 3.6 despite every individual real number being correct.
 * See docs/decisions.md #21's addendum for the full real diagnosis.
 *
 * Run with: npx tsx scripts/screen-value.ts
 */

import "dotenv/config";
import { fetchFrame, parseFrameEntries, buildCikToTickerMap } from "../src/lib/marketdata/edgar";
import { fetchSnapshotPrices } from "../src/lib/marketdata/alpaca";
import {
  shortlistValueCandidates,
  computeValueScreenResults,
} from "../src/lib/research/valueScreen";

const PERIOD = "CY2024";
const EQUITY_INSTANT_PERIOD = "CY2024Q4I";
// Real, most-recent-first cascade for shares outstanding specifically —
// four real, consecutive quarters, spanning roughly the past year, wide
// enough to comfortably catch a real, intervening stock split like
// Netflix's real November 2025 one.
const SHARES_INSTANT_PERIODS = ["CY2026Q1I", "CY2025Q4I", "CY2025Q3I", "CY2025Q2I"];
const MIN_STOCKHOLDERS_EQUITY_FLOOR = 1_000_000_000;
const PACING_MS = 200;

export async function runValueScreen(): Promise<void> {
  console.log(`Fetching real NetIncomeLoss for ${PERIOD}...`);
  const netIncomeRaw = await fetchFrame("us-gaap", "NetIncomeLoss", "USD", PERIOD);
  const netIncome = parseFrameEntries(netIncomeRaw);
  console.log(`  ${netIncome.length} real companies.`);
  await new Promise((r) => setTimeout(r, PACING_MS));

  console.log(`Fetching real StockholdersEquity for ${EQUITY_INSTANT_PERIOD}...`);
  const equityRaw = await fetchFrame("us-gaap", "StockholdersEquity", "USD", EQUITY_INSTANT_PERIOD);
  const stockholdersEquity = parseFrameEntries(equityRaw);
  console.log(`  ${stockholdersEquity.length} real companies.`);

  console.log(
    `\nFetching real EntityCommonStockSharesOutstanding across ${SHARES_INSTANT_PERIODS.length} real, most-recent-first quarters...`,
  );
  const sharesOutstandingByRecency = [];
  for (const period of SHARES_INSTANT_PERIODS) {
    await new Promise((r) => setTimeout(r, PACING_MS));
    console.log(`  Fetching real ${period}...`);
    const raw = await fetchFrame("dei", "EntityCommonStockSharesOutstanding", "shares", period);
    const parsed = parseFrameEntries(raw);
    console.log(`    ${parsed.length} real companies.`);
    sharesOutstandingByRecency.push(parsed);
  }

  console.log("\nFetching the real CIK-to-ticker mapping...");
  const tickerByCik = await buildCikToTickerMap();
  console.log(`  ${tickerByCik.size} real tickers mapped.`);

  console.log(
    `\nShortlisting: applying the real $${MIN_STOCKHOLDERS_EQUITY_FLOOR / 1_000_000_000}B equity floor and requiring genuine profitability...`,
  );
  const shortlist = shortlistValueCandidates({
    netIncome,
    stockholdersEquity,
    sharesOutstandingByRecency,
    tickerByCik,
    minStockholdersEquityFloor: MIN_STOCKHOLDERS_EQUITY_FLOOR,
  });
  console.log(`  ${shortlist.length} real companies shortlisted, before any price is fetched.`);

  if (shortlist.length === 0) {
    console.log(
      "\nNo real candidates shortlisted at all — worth checking the dei/instantaneous-period " +
        "assumption for shares outstanding before assuming the fundamentals logic is wrong.",
    );
    return;
  }

  console.log(
    `\nFetching real, live prices for ${shortlist.length} shortlisted compan${shortlist.length === 1 ? "y" : "ies"} only...`,
  );
  const pricesMap = await fetchSnapshotPrices(shortlist.map((c) => c.ticker));
  const pricesByTicker = new Map(
    [...pricesMap.entries()].map(([ticker, p]) => [ticker, p.currentPrice]),
  );
  console.log(`  Real prices found for ${pricesByTicker.size}/${shortlist.length}.`);

  const summary = computeValueScreenResults(shortlist, pricesByTicker);
  const sortedByPE = [...summary.results].sort(
    (a, b) => a.realPriceToEarnings - b.realPriceToEarnings,
  );

  console.log(
    `\n${summary.results.length} real companies fully priced (implausible outliers below 20% of the real median already excluded). Real median P/E: ${summary.medianPriceToEarnings.toFixed(1)}, real median P/B: ${summary.medianPriceToBook.toFixed(2)}.`,
  );
  console.log(
    `\nTop 15 cheapest by real P/E (below the real, internal median is genuinely cheap):\n`,
  );
  for (const r of sortedByPE.slice(0, 15)) {
    console.log(
      `  ${r.entityName.padEnd(35)} ${r.ticker.padEnd(8)} P/E ${r.realPriceToEarnings.toFixed(1).padEnd(8)} P/B ${r.realPriceToBook.toFixed(2)}`,
    );
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runValueScreen().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
