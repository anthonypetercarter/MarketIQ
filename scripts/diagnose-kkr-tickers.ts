/**
 * Real, targeted diagnostic: the buildCikToTickerMap fix (relying on
 * SEC's real `title` field to distinguish common stock from preferred/
 * notes) did not actually change the live Value screen's output at all —
 * KKRS, SOJD, and SREA still appeared, completely unchanged. Rather than
 * guess at why, this fetches SEC's real, raw company_tickers.json
 * directly and prints every real entry whose ticker starts with "KKR",
 * to see the actual real title text and CIK structure — confirming or
 * refuting whether the title-keyword approach was ever going to work for
 * these specific real entries.
 *
 * Run with: npx tsx scripts/diagnose-kkr-tickers.ts
 */

import "dotenv/config";

const USER_AGENT = process.env.EDGAR_USER_AGENT;

async function main() {
  if (!USER_AGENT) {
    throw new Error("EDGAR_USER_AGENT must be set in .env");
  }

  console.log("Fetching real company_tickers.json...");
  const response = await fetch("https://www.sec.gov/files/company_tickers.json", {
    headers: { "User-Agent": USER_AGENT },
  });
  const data = (await response.json()) as Record<
    string,
    { cik_str: number; ticker: string; title: string }
  >;

  const entries = Object.values(data);
  console.log(`Real, total entries in the file: ${entries.length}`);

  console.log("\n=== Every real entry whose ticker starts with 'KKR' ===");
  const kkrEntries = entries.filter((e) => e.ticker.toUpperCase().startsWith("KKR"));
  console.log(JSON.stringify(kkrEntries, null, 2));

  console.log(
    "\n=== Every real entry whose ticker starts with 'SO' and title mentions Southern ===",
  );
  const soEntries = entries.filter(
    (e) => e.ticker.toUpperCase().startsWith("SO") && /southern/i.test(e.title),
  );
  console.log(JSON.stringify(soEntries, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
