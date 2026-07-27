/**
 * Real, systematic answer to "who's reporting this week" — the actual
 * fix for the reactive research bias the founder flagged directly: every
 * candidate so far surfaced because it was already newsworthy, not
 * because it was checked. This is a standalone research tool, not part
 * of the automated Portfolio Review pipeline — its output is meant to
 * seed real, deliberate research (EDGAR + news), not to be acted on
 * automatically.
 *
 * Run with: npx tsx scripts/upcoming-earnings.ts
 */

import "dotenv/config";
import { fetchUpcomingEarnings } from "../src/lib/marketdata/earningsCalendar";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function inSevenDaysIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10);
}

async function main() {
  const startDate = todayIso();
  const endDate = inSevenDaysIso();

  console.log(`Fetching real, upcoming earnings from ${startDate} to ${endDate}...`);
  const entries = await fetchUpcomingEarnings({ startDate, endDate });

  if (entries.length === 0) {
    console.log("No real, upcoming earnings found in this window.");
    return;
  }

  const sorted = [...entries].sort((a, b) => (a.date < b.date ? -1 : 1));

  console.log(`\nReal, upcoming earnings (${sorted.length} companies):\n`);
  for (const e of sorted) {
    const epsText = e.epsEstimated !== null ? `EPS est. ${e.epsEstimated}` : "no EPS estimate";
    const revenueText =
      e.revenueEstimated !== null
        ? `revenue est. $${(e.revenueEstimated / 1_000_000_000).toFixed(2)}B`
        : "no revenue estimate";
    console.log(`  ${e.date}  ${e.ticker.padEnd(8)} (${e.exchange})  ${epsText}, ${revenueText}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
