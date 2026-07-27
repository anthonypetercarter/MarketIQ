/**
 * Real, systematic answer to "who's reporting this week" — corrected to
 * query /v1/earningscalendar after discovering /v1/upcomingearnings is
 * fully premium-gated (see docs/decisions.md #13's addendum). Whether
 * this endpoint returns real, forward-looking data on the free tier is a
 * genuine open question — this script reports that honestly rather than
 * treating an empty result as success.
 *
 * Run with: npx tsx scripts/upcoming-earnings.ts
 */

import "dotenv/config";
import { fetchEarningsCalendar } from "../src/lib/marketdata/earningsCalendar";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function inSevenDaysIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10);
}

async function main() {
  const dateStart = todayIso();
  const dateEnd = inSevenDaysIso();

  console.log(`Fetching real earnings calendar data from ${dateStart} to ${dateEnd}...`);
  const entries = await fetchEarningsCalendar({ dateStart, dateEnd });

  if (entries.length === 0) {
    console.log(
      "\nNo entries returned for this future date range. This is real, useful information, " +
        "not necessarily a bug: the free tier may only return already-reported results, since " +
        "the show_upcoming flag that would force forward-looking data is itself premium-only. " +
        "Worth checking api-ninjas.com/pricing if forward-looking data specifically is needed.",
    );
    return;
  }

  const sorted = [...entries].sort((a, b) => (a.date < b.date ? -1 : 1));

  console.log(`\nReal earnings calendar entries (${sorted.length}):\n`);
  for (const e of sorted) {
    const revenueText =
      e.actualRevenue !== null
        ? `revenue $${(e.actualRevenue / 1_000_000_000).toFixed(2)}B`
        : "no revenue figure";
    const epsText = e.actualEps !== null ? `EPS ${e.actualEps}` : "no EPS figure";
    console.log(`  ${e.date}  ${e.ticker.padEnd(8)}  ${revenueText}, ${epsText}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
