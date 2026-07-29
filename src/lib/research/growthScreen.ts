/**
 * The Growth signal (decision #15): real revenue growth acceleration —
 * not just "revenue went up," but "the rate of growth is genuinely
 * increasing," a stronger real signal than a flat growth number, per the
 * factors originally named when this whole screening effort was scoped.
 * Deliberately equities-only, same asset-class boundary as Quality
 * (decision #14) — funds don't file the operating financial statements
 * this reads at all (see decision #12).
 *
 * Reuses the exact same generic Frames layer built for Quality — zero
 * new fetching code needed, the real payoff of building that layer
 * generically the first time rather than one-off.
 *
 * Real design decisions, two carried over from Quality and one applied
 * proactively this time rather than waiting for a live run to catch it:
 *
 * - The same $1B trailing-revenue floor, for the same reason — keeps
 *   results in the same weight class as what's already seriously held.
 * - Fiscal-year misalignment disclosed, not corrected, for the same real
 *   reason as Quality: a company's own growth trend is unaffected by
 *   when its fiscal year lands.
 * - The current period's growth rate must itself be genuinely positive,
 *   not merely accelerating. Quality's first live run found the exact
 *   failure mode this guards against before it could happen here: a
 *   company shrinking 50% one year and only 10% the next shows a real,
 *   large "acceleration" by raw math, while still genuinely shrinking.
 *   That's Quality's "less distressed, not actually good" bug in a new
 *   shape — applied here in advance rather than discovered the hard way
 *   a second time.
 */

import type { FrameEntry } from "@/lib/marketdata/edgar";
import { looksLikeOperatingCompany } from "./entityFilters";

export interface GrowthScreenResult {
  cik: number;
  entityName: string;
  latestRevenue: number;
  /** Growth rate from the middle to the latest period, as a percent. */
  recentGrowthPercent: number;
  /** Growth rate from the earliest to the middle period, as a percent. */
  priorGrowthPercent: number;
  /** recentGrowthPercent - priorGrowthPercent, in percentage points. Positive means genuinely accelerating. */
  accelerationPoints: number;
}

/**
 * Pure function: joins three real Revenue Frame datasets by CIK — the
 * earliest, middle, and latest of three consecutive real periods. A
 * company must appear in all three or is skipped entirely, never given a
 * partial or guessed-at result. Computes two real, consecutive growth
 * rates, requires the most recent one to be genuinely positive (not just
 * less negative than before), applies the real revenue floor, and
 * returns results sorted by the most genuinely accelerating growth first.
 */
export function computeGrowthScreen(input: {
  earliestRevenue: FrameEntry[];
  middleRevenue: FrameEntry[];
  latestRevenue: FrameEntry[];
  minRevenueFloor: number;
}): GrowthScreenResult[] {
  const { earliestRevenue, middleRevenue, latestRevenue, minRevenueFloor } = input;

  const earliestByCik = new Map(earliestRevenue.map((e) => [e.cik, e]));
  const middleByCik = new Map(middleRevenue.map((e) => [e.cik, e]));
  const latestByCik = new Map(latestRevenue.map((e) => [e.cik, e]));

  const results: GrowthScreenResult[] = [];

  for (const [cik, latest] of latestByCik) {
    const middle = middleByCik.get(cik);
    const earliest = earliestByCik.get(cik);

    // A company missing from any one of the three real periods doesn't
    // get a partial or guessed-at result — it's skipped entirely, same
    // honesty discipline as Quality and every other real data source.
    if (!middle || !earliest) continue;

    if (latest.val < minRevenueFloor) continue;
    // Growth-rate math is nonsensical off a zero or negative revenue
    // base — skip rather than produce a fabricated or infinite rate.
    if (earliest.val <= 0 || middle.val <= 0 || latest.val <= 0) continue;

    const priorGrowthPercent = ((middle.val - earliest.val) / earliest.val) * 100;
    const recentGrowthPercent = ((latest.val - middle.val) / middle.val) * 100;

    // Growth means genuinely growing right now, not just "shrinking less
    // than before" — a company still contracting today doesn't belong on
    // this list, however much the rate of decline has improved. Same
    // real lesson as Quality's positive-current-margin requirement,
    // applied here proactively.
    if (recentGrowthPercent <= 0) continue;

    // A passive investment trust/ETF/fund files real financial
    // statements too, but its real revenue figures (if reported at all)
    // reflect a passive holding vehicle, not genuine operating growth.
    if (!looksLikeOperatingCompany(latest.entityName)) continue;

    results.push({
      cik,
      entityName: latest.entityName,
      latestRevenue: latest.val,
      recentGrowthPercent,
      priorGrowthPercent,
      accelerationPoints: recentGrowthPercent - priorGrowthPercent,
    });
  }

  return results.sort((a, b) => b.accelerationPoints - a.accelerationPoints);
}
