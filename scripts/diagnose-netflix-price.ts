/**
 * Real, targeted diagnostic, following diagnose-netflix-value.ts: that
 * script confirmed Netflix's real fundamentals are correct (a real,
 * sensible EPS of $20.37), which means the Value screen's absurd P/E of
 * 3.6 must trace to the real PRICE side instead — working backward, the
 * screen used an implied price of roughly $73, nowhere near Netflix's
 * real, actual trading price. This calls the exact real
 * fetchSnapshotPrices function the live screen uses — first for NFLX
 * alone, isolating whether a large, real batch request (615 tickers)
 * behaves differently than a single-ticker one — and also inspects the
 * real, raw response directly to confirm what price value Alpaca
 * actually returns.
 *
 * Run with: npx tsx scripts/diagnose-netflix-price.ts
 */

import "dotenv/config";
import { fetchSnapshotPrices, getAlpacaCredentials } from "../src/lib/marketdata/alpaca";

async function main() {
  console.log(
    "=== Real fetchSnapshotPrices(['NFLX']) — the exact function the live screen calls ===",
  );
  const result = await fetchSnapshotPrices(["NFLX"]);
  console.log(result);

  console.log("\n=== Real, raw Alpaca response body, for direct inspection ===");
  const { keyId, secretKey } = getAlpacaCredentials();
  const response = await fetch("https://data.alpaca.markets/v2/stocks/snapshots?symbols=NFLX", {
    headers: {
      "APCA-API-KEY-ID": keyId,
      "APCA-API-SECRET-KEY": secretKey,
      Accept: "application/json",
    },
  });
  const body = await response.json();
  console.log(JSON.stringify(body, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
