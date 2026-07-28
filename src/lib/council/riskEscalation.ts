/**
 * Decision #19: real, persistent risk-flag detection — how many
 * consecutive prior real days did a ticker show a REDUCE verdict with no
 * mechanical trim computed (neither the concentration ceiling nor
 * category rebalancing explained it)? That specific, real pattern is the
 * signal a company/sector-specific risk REDUCE has no sizing mechanism
 * for yet, and is what drives the escalating ceiling in
 * computeRiskEscalatedReduce (src/lib/portfolio/playbook.ts).
 *
 * Deliberately a pure function operating on already-fetched historical
 * data, not a database query itself — the real Prisma lookup happens in
 * the orchestrating script, same separation as every other piece of real
 * logic in this project.
 */

import type { StoredPortfolioReviewVerdicts } from "./portfolioReviewTypes";

/**
 * `pastReviewsDescending` must be ordered most-recent-first, and must NOT
 * include today's review (which doesn't exist yet at the point this is
 * called). Counts real, consecutive matches starting from the most
 * recent past day, stopping at the first day that breaks the pattern —
 * a HOLD, a REDUCE that did get a real mechanical trim, or no verdict
 * for this ticker at all that day (a real, honest reset, not assumed to
 * still be flagged).
 */
export function countConsecutiveRiskFlaggedDays(
  ticker: string,
  pastReviewsDescending: StoredPortfolioReviewVerdicts[],
): number {
  let count = 0;
  for (const review of pastReviewsDescending) {
    const action = review.todaysActions.find((a) => a.ticker === ticker);
    const isRiskFlagged =
      action !== undefined &&
      action.side === "SELL" &&
      action.verdict === "REDUCE" &&
      action.trade === null;

    if (isRiskFlagged) {
      count++;
    } else {
      break;
    }
  }
  return count;
}
