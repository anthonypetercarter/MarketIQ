/**
 * Real, targeted diagnostic: the Value screen's live output showed
 * Netflix at a real P/E of 3.6 — an immediately, obviously wrong number
 * given Netflix's real, well-known valuation (typically 30s-40s). Rather
 * than guess at the cause, this fetches all three real Frames the Value
 * screen actually joins and prints Netflix's own entry from each side by
 * side — specifically the real accession number and real as-of/period-end
 * date for each — to directly confirm or refute whether the three facts
 * genuinely come from the same real filing, or were silently joined
 * across mismatched real filings/periods.
 *
 * Run with: npx tsx scripts/diagnose-netflix-value.ts
 */

import "dotenv/config";
import { fetchFrame, buildCikToTickerMap } from "../src/lib/marketdata/edgar";

const NETFLIX_CIK = 1065280;

async function main() {
  const tickerByCik = await buildCikToTickerMap();
  console.log(`Real ticker for CIK ${NETFLIX_CIK}: ${tickerByCik.get(NETFLIX_CIK)}`);

  const netIncomeRaw = (await fetchFrame("us-gaap", "NetIncomeLoss", "USD", "CY2024")) as {
    data: { cik: number; accn: string; end: string; start?: string; val: number }[];
  };
  const equityRaw = (await fetchFrame("us-gaap", "StockholdersEquity", "USD", "CY2024Q4I")) as {
    data: { cik: number; accn: string; end: string; val: number }[];
  };
  const sharesRaw = (await fetchFrame(
    "dei",
    "EntityCommonStockSharesOutstanding",
    "shares",
    "CY2024Q4I",
  )) as { data: { cik: number; accn: string; end: string; val: number }[] };

  const ni = netIncomeRaw.data.find((e) => e.cik === NETFLIX_CIK);
  const equity = equityRaw.data.find((e) => e.cik === NETFLIX_CIK);
  const shares = sharesRaw.data.find((e) => e.cik === NETFLIX_CIK);

  console.log("\n=== Netflix's real entry from each of the three real Frames ===");
  console.log("NetIncomeLoss:", JSON.stringify(ni, null, 2));
  console.log("StockholdersEquity:", JSON.stringify(equity, null, 2));
  console.log("EntityCommonStockSharesOutstanding:", JSON.stringify(shares, null, 2));

  if (ni && equity && shares) {
    console.log("\n=== Real accession numbers (same real filing would share this) ===");
    console.log("NetIncomeLoss accn:", ni.accn);
    console.log("StockholdersEquity accn:", equity.accn);
    console.log("SharesOutstanding accn:", shares.accn);
    console.log(
      "\nSame real filing for all three?",
      ni.accn === equity.accn && equity.accn === shares.accn,
    );

    const eps = ni.val / shares.val;
    console.log(`\nReal computed EPS from these three real facts: ${eps.toFixed(2)}`);
    console.log(`Real net income: $${(ni.val / 1e9).toFixed(2)}B`);
    console.log(`Real shares outstanding: ${(shares.val / 1e6).toFixed(1)}M`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
