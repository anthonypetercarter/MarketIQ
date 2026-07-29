/**
 * Real, targeted diagnostic: the Value screen's first live run returned
 * zero real companies for BOTH instantaneous facts it queried
 * (StockholdersEquity and EntityCommonStockSharesOutstanding), while the
 * duration fact (NetIncomeLoss) worked fine with thousands of real
 * companies. Rather than guess at a fix, this fetches the RAW response
 * for a well-known, definitely-real instant fact (Assets — every real
 * company reports this) to isolate whether the period FORMAT itself is
 * wrong, separate from any specific concept name.
 *
 * Run with: npx tsx scripts/diagnose-instant-frame.ts
 */

import "dotenv/config";

const USER_AGENT = process.env.EDGAR_USER_AGENT;

async function main() {
  if (!USER_AGENT) {
    throw new Error("EDGAR_USER_AGENT must be set in .env");
  }

  const url = "https://data.sec.gov/api/xbrl/frames/us-gaap/Assets/USD/CY2024Q4I.json";
  console.log(`Fetching real, raw response from: ${url}`);

  const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  console.log(`\nReal HTTP status: ${response.status} ${response.statusText}`);

  const text = await response.text();
  console.log(`\nReal, raw response body (first 2000 chars):`);
  console.log(text.slice(0, 2000));

  if (response.ok) {
    try {
      const json = JSON.parse(text);
      console.log("\n\nReal top-level keys:", Object.keys(json));
      if (Array.isArray(json.data)) {
        console.log(`Real "data" array length: ${json.data.length}`);
        if (json.data.length > 0) {
          console.log("First real entry:", JSON.stringify(json.data[0], null, 2));
        }
      }
    } catch {
      console.log("\n\nCould not parse as JSON despite a 200 status.");
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
