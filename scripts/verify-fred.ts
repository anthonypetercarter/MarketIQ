/**
 * Verifies the FRED connection by fetching the three macro series we
 * track and printing them. Not part of any generation pipeline yet —
 * Milestone 2 (the Research Packet) is what will actually consume these.
 * This script exists purely to give an immediate "the key works" moment,
 * the same way `data:refresh-prices` does for Alpaca.
 *
 * Run with: npm run data:verify-fred
 */

import "dotenv/config";
import { fetchLatestObservations } from "../src/lib/marketdata/fred";
import { FRED_SERIES } from "../src/lib/marketdata/fredSeries";

async function main() {
  for (const [label, seriesId] of Object.entries(FRED_SERIES)) {
    const observations = await fetchLatestObservations(seriesId);
    if (observations.length === 0) {
      console.log(`${label} (${seriesId}): no recent published data`);
      continue;
    }
    const [latest, previous] = observations;
    const trend = previous
      ? latest.value > previous.value
        ? "up"
        : latest.value < previous.value
          ? "down"
          : "flat"
      : "";
    console.log(
      `${label} (${seriesId}): ${latest.value} as of ${latest.date}` +
        (previous ? ` (${trend} from ${previous.value} on ${previous.date})` : ""),
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
