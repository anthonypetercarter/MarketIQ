/**
 * Track Record — the outcome-measurement loop this project has never had.
 *
 * Every prior Brief and Portfolio Review has produced real, evidenced
 * judgments, but nothing has ever checked whether those judgments turned
 * out to be right. This is the first real building block: given a past
 * verdict, the real price when it was issued, and the real price now,
 * compute an honest classification of whether the market agreed.
 *
 * Deliberately simple and deterministic — this is not itself an AI
 * judgment. It's the measuring stick a future AI judgment (or a human)
 * would need in order to reason about calibration at all.
 */

import type { Verdict } from "./validatePortfolioReview";

export type VerdictAlignment = "aligned" | "misaligned" | "neutral" | "too_early";

export interface VerdictOutcome {
  ticker: string;
  companyName: string;
  verdict: Verdict;
  priceAtVerdict: number;
  currentPrice: number;
  priceChangePercent: number;
  daysElapsed: number;
  alignment: VerdictAlignment;
}

/**
 * A verdict needs real time to actually mean something — one day of noise
 * isn't evidence a BUY was right or wrong. Below this many days, a verdict
 * is reported as "too_early" rather than judged, the same honesty
 * discipline used everywhere else in this project (an unresolved case is
 * stated as unresolved, not forced into a premature answer).
 */
export const MINIMUM_DAYS_FOR_EVALUATION = 7;

/**
 * A move smaller than this, in either direction, is treated as noise
 * rather than a real signal the market agreed or disagreed with the
 * verdict — avoids over-interpreting a 0.3% wiggle as meaningful.
 */
const NOISE_DEADBAND_PERCENT = 1;

/**
 * Computes whether a verdict's real, subsequent price action agrees with
 * what the verdict implied:
 * - BUY/INCREASE implied more exposure was warranted — aligned if the
 *   price genuinely rose since the verdict.
 * - REDUCE/EXIT implied the position should carry less risk or none —
 *   aligned if the price genuinely fell since the verdict (the trim or
 *   exit avoided a real decline).
 * - HOLD has no clean "good" direction by design — it's tracked for
 *   completeness but never scored aligned/misaligned, only neutral or
 *   too_early. Judging a HOLD against price direction would silently
 *   punish patience, which isn't what HOLD claims to optimize for.
 */
export function computeVerdictOutcome(input: {
  ticker: string;
  companyName: string;
  verdict: Verdict;
  priceAtVerdict: number;
  currentPrice: number;
  verdictDate: Date;
  asOfDate: Date;
}): VerdictOutcome {
  const { ticker, companyName, verdict, priceAtVerdict, currentPrice, verdictDate, asOfDate } =
    input;

  const daysElapsed = Math.floor(
    (asOfDate.getTime() - verdictDate.getTime()) / (1000 * 60 * 60 * 24),
  );
  const priceChangePercent =
    priceAtVerdict > 0 ? ((currentPrice - priceAtVerdict) / priceAtVerdict) * 100 : 0;

  let alignment: VerdictAlignment;
  if (daysElapsed < MINIMUM_DAYS_FOR_EVALUATION) {
    alignment = "too_early";
  } else if (verdict === "BUY" || verdict === "INCREASE") {
    alignment =
      priceChangePercent > NOISE_DEADBAND_PERCENT
        ? "aligned"
        : priceChangePercent < -NOISE_DEADBAND_PERCENT
          ? "misaligned"
          : "neutral";
  } else if (verdict === "REDUCE" || verdict === "EXIT") {
    alignment =
      priceChangePercent < -NOISE_DEADBAND_PERCENT
        ? "aligned"
        : priceChangePercent > NOISE_DEADBAND_PERCENT
          ? "misaligned"
          : "neutral";
  } else {
    alignment = "neutral";
  }

  return {
    ticker,
    companyName,
    verdict,
    priceAtVerdict,
    currentPrice,
    priceChangePercent,
    daysElapsed,
    alignment,
  };
}
