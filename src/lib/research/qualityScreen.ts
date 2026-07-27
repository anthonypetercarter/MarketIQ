/**
 * The Quality signal (decision #14): real net income margin, and
 * specifically its real trend across two periods — a margin genuinely
 * improving is a stronger signal than one good period alone. Deliberately
 * equities-only; funds don't file the operating financial statements
 * this reads at all (see decision #12's asset-class boundary).
 *
 * Two real design decisions locked in before building, not defaults
 * picked silently:
 *
 * - A $1B trailing-revenue floor, applied here (after the real Frame
 *   fetch, as free local filtering) rather than as a fetch-time
 *   parameter — keeps results in the same weight class as what's already
 *   seriously considered (AAPL, JNJ, UNH, CVS), and cleanly excludes the
 *   real noise a raw Frame contains (thousands of companies, including
 *   genuine micro-caps and shell-adjacent names).
 * - Fiscal-year misalignment across companies is disclosed, not
 *   corrected. A real company's own margin trend is unaffected by when
 *   its fiscal year lands — that comparison is always the company
 *   against itself. Trying to force every company onto a strict calendar
 *   quarter would penalize genuinely good, legitimate businesses for an
 *   irrelevant reason (Apple's own real fiscal year ends in September).
 */

import type { FrameEntry } from "@/lib/marketdata/edgar";

export interface QualityScreenResult {
  cik: number;
  entityName: string;
  currentRevenue: number;
  currentNetIncome: number;
  currentMarginPercent: number;
  priorMarginPercent: number;
  /** currentMarginPercent - priorMarginPercent, in percentage points. Positive means genuinely improving. */
  marginChangePoints: number;
}

/**
 * Pure function: joins four real Frame datasets by CIK (a company must
 * appear in all four — current & prior revenue, current & prior net
 * income — or it's skipped, not guessed at with a partial picture),
 * computes each company's real margin for both periods, applies the real
 * revenue floor, and returns results sorted by the most genuinely
 * improving margin first.
 */
export function computeQualityScreen(input: {
  currentRevenue: FrameEntry[];
  priorRevenue: FrameEntry[];
  currentNetIncome: FrameEntry[];
  priorNetIncome: FrameEntry[];
  minRevenueFloor: number;
}): QualityScreenResult[] {
  const { currentRevenue, priorRevenue, currentNetIncome, priorNetIncome, minRevenueFloor } = input;

  const currentRevenueByCik = new Map(currentRevenue.map((e) => [e.cik, e]));
  const priorRevenueByCik = new Map(priorRevenue.map((e) => [e.cik, e]));
  const currentNetIncomeByCik = new Map(currentNetIncome.map((e) => [e.cik, e]));
  const priorNetIncomeByCik = new Map(priorNetIncome.map((e) => [e.cik, e]));

  const results: QualityScreenResult[] = [];

  for (const [cik, curRev] of currentRevenueByCik) {
    const priorRev = priorRevenueByCik.get(cik);
    const curNI = currentNetIncomeByCik.get(cik);
    const priorNI = priorNetIncomeByCik.get(cik);

    // A company missing from any one of the four real datasets for this
    // period doesn't get a partial or guessed-at result — it's skipped
    // entirely, same honesty discipline as every other real data source.
    if (!priorRev || !curNI || !priorNI) continue;

    if (curRev.val < minRevenueFloor) continue;
    if (curRev.val <= 0 || priorRev.val <= 0) continue; // avoid a divide-by-zero or a nonsensical negative-revenue margin

    const currentMarginPercent = (curNI.val / curRev.val) * 100;
    const priorMarginPercent = (priorNI.val / priorRev.val) * 100;

    results.push({
      cik,
      entityName: curRev.entityName,
      currentRevenue: curRev.val,
      currentNetIncome: curNI.val,
      currentMarginPercent,
      priorMarginPercent,
      marginChangePoints: currentMarginPercent - priorMarginPercent,
    });
  }

  return results.sort((a, b) => b.marginChangePoints - a.marginChangePoints);
}
