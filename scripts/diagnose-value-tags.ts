/**
 * Follow-up to diagnose-instant-frame.ts: that diagnostic ruled out the
 * period format itself (Assets/CY2024Q4I returned 6,249 real companies).
 * The problem is specific to the two tags the Value screen actually
 * used. This tests two real, distinct hypotheses directly:
 *
 * 1. StockholdersEquity may have the exact same real XBRL tag-
 *    inconsistency problem already discovered and solved for revenue
 *    (decision #11) — many real companies report total equity under
 *    StockholdersEquityIncludingPortionAttributableToNoncontrollingInterest
 *    instead.
 * 2. EntityCommonStockSharesOutstanding lives in the `dei` taxonomy,
 *    genuinely different in purpose (entity-level metadata, not an
 *    accounting fact) — worth confirming directly whether SEC's Frames
 *    API supports `dei` concepts the same way at all, rather than
 *    assuming it does.
 *
 * Run with: npx tsx scripts/diagnose-value-tags.ts
 */

import "dotenv/config";

const USER_AGENT = process.env.EDGAR_USER_AGENT;

async function checkFrame(taxonomy: string, concept: string, unit: string, period: string) {
  const url = `https://data.sec.gov/api/xbrl/frames/${taxonomy}/${concept}/${unit}/${period}.json`;
  console.log(`\n${"=".repeat(70)}`);
  console.log(`Checking: ${taxonomy}/${concept}/${unit}/${period}`);
  console.log("=".repeat(70));

  const response = await fetch(url, { headers: { "User-Agent": USER_AGENT! } });
  console.log(`Real HTTP status: ${response.status} ${response.statusText}`);

  const text = await response.text();
  if (!response.ok) {
    console.log(`Real, raw error body:`, text.slice(0, 500));
    return;
  }

  try {
    const json = JSON.parse(text);
    const count = Array.isArray(json.data) ? json.data.length : "N/A (no data array)";
    console.log(`Real "pts" field: ${json.pts}, real "data" array length: ${count}`);
    if (Array.isArray(json.data) && json.data.length > 0) {
      console.log("First real entry:", JSON.stringify(json.data[0]));
    }
  } catch {
    console.log("Could not parse as JSON:", text.slice(0, 500));
  }
}

async function main() {
  if (!USER_AGENT) {
    throw new Error("EDGAR_USER_AGENT must be set in .env");
  }

  await checkFrame("us-gaap", "StockholdersEquity", "USD", "CY2024Q4I");
  await new Promise((r) => setTimeout(r, 300));

  await checkFrame(
    "us-gaap",
    "StockholdersEquityIncludingPortionAttributableToNoncontrollingInterest",
    "USD",
    "CY2024Q4I",
  );
  await new Promise((r) => setTimeout(r, 300));

  await checkFrame("dei", "EntityCommonStockSharesOutstanding", "shares", "CY2024Q4I");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
