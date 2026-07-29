/**
 * The first real Value screen (decision #21): is a company cheap
 * relative to its own real fundamentals? Fuses real EDGAR fundamentals
 * with a real, live price — the piece neither Quality nor Growth needed.
 * A standalone research tool, not wired into automated Portfolio Review.
 *
 * Equities only — funds don't file the statements this reads.
 *
 * Real, unverified assumption, disclosed rather than hidden: shares
 * outstanding is fetched from the `dei` taxonomy's
 * `EntityCommonStockSharesOutstanding` concept, as an instantaneous fact
 * (the "I" period suffix), the same way Assets/Liabilities are — this
 * hasn't been confirmed against a live response the way `us-gaap` facts
 * were in scripts/diagnose-frames-response.ts. If this run produces
 * unexpectedly few or zero results, checking that assumption first is
 * the right place to look before assuming the logic itself is wrong.
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
const INSTANT_PERIOD = "CY2024Q4I";
const MIN_STOCKHOLDERS_EQUITY_FLOOR = 1_000_000_000;
const PACING_MS = 200;

export async function runValueScreen(): Promise<void> {
  console.log(`Fetching real NetIncomeLoss for ${PERIOD}...`);
  const netIncomeRaw = await fetchFrame("us-gaap", "NetIncomeLoss", "USD", PERIOD);
  const netIncome = parseFrameEntries(netIncomeRaw);
  console.log(`  ${netIncome.length} real companies.`);
  await new Promise((r) => setTimeout(r, PACING_MS));

  console.log(`Fetching real StockholdersEquity for ${INSTANT_PERIOD}...`);
  const equityRaw = await fetchFrame("us-gaap", "StockholdersEquity", "USD", INSTANT_PERIOD);
  const stockholdersEquity = parseFrameEntries(equityRaw);
  console.log(`  ${stockholdersEquity.length} real companies.`);
  await new Promise((r) => setTimeout(r, PACING_MS));

  console.log(`Fetching real EntityCommonStockSharesOutstanding for ${INSTANT_PERIOD}...`);
  const sharesRaw = await fetchFrame(
    "dei",
    "EntityCommonStockSharesOutstanding",
    "shares",
    INSTANT_PERIOD,
  );
  const sharesOutstanding = parseFrameEntries(sharesRaw);
  console.log(`  ${sharesOutstanding.length} real companies.`);

  console.log("\nFetching the real CIK-to-ticker mapping...");
  const tickerByCik = await buildCikToTickerMap();
  console.log(`  ${tickerByCik.size} real tickers mapped.`);

  console.log(
    `\nShortlisting: applying the real $${MIN_STOCKHOLDERS_EQUITY_FLOOR / 1_000_000_000}B equity floor and requiring genuine profitability...`,
  );
  const shortlist = shortlistValueCandidates({
    netIncome,
    stockholdersEquity,
    sharesOutstanding,
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
    `\n${summary.results.length} real companies fully priced. Real median P/E: ${summary.medianPriceToEarnings.toFixed(1)}, real median P/B: ${summary.medianPriceToBook.toFixed(2)}.`,
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
