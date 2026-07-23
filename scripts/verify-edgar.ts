/**
 * Confirms the real SEC EDGAR integration actually works end to end:
 * real ticker-to-CIK lookup, a real company facts fetch, and real
 * extracted fundamentals — not synthetic test data.
 *
 * Run with: npx tsx scripts/verify-edgar.ts
 */

import "dotenv/config";
import { lookupCik, fetchCompanyFacts, extractKeyFundamentals } from "../src/lib/marketdata/edgar";

const TEST_TICKER = "AAPL";

async function main() {
  console.log(`Looking up real CIK for ${TEST_TICKER}...`);
  const cik = await lookupCik(TEST_TICKER);
  if (!cik) {
    throw new Error(`No CIK found for ${TEST_TICKER} — check the ticker or SEC's mapping file.`);
  }
  console.log(`Real CIK: ${cik}`);

  console.log(`\nFetching real company facts for CIK ${cik}...`);
  const companyFacts = await fetchCompanyFacts(cik);
  console.log(`Real entity name: ${companyFacts.entityName}`);

  const fundamentals = extractKeyFundamentals(companyFacts);
  console.log("\nReal extracted fundamentals:");
  console.log(JSON.stringify(fundamentals, null, 2));

  if (!fundamentals.revenue && !fundamentals.netIncome && !fundamentals.totalAssets) {
    console.log(
      "\nWarning: no fundamentals extracted at all — either the company genuinely doesn't " +
        "report these under the known tags, or something's wrong with the parsing. Worth " +
        "checking the raw companyFacts response if this happens for a large, well-known company.",
    );
  } else {
    console.log("\nReal SEC EDGAR integration confirmed working end to end.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
