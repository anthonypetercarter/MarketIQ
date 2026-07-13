/**
 * Today's Playbook (docs/decisions.md #6) — built incrementally, one
 * milestone at a time, each validated against real portfolio data before
 * the next begins.
 *
 * Milestone 1: Excess Cash. Everything else in the Playbook (candidate
 * selection, trade sizing) depends on knowing how much capital is actually
 * available to deploy today — this is that number, and nothing more yet.
 */

/**
 * Excess Cash = Current Cash − Target Cash (in dollars).
 *
 * Target Cash is expressed as a percentage of total portfolio value in
 * today's Brief (AllocationTarget for the "Cash" category) — this converts
 * that percentage into a dollar figure and compares it against the real
 * cash balance. A negative result means cash is already below target;
 * there's nothing to deploy, not a deficit to fill from elsewhere.
 */
export function computeExcessCash(
  totalPortfolioValue: number,
  cashBalance: number,
  cashTargetPercent: number,
): number {
  const cashTargetValue = totalPortfolioValue * (cashTargetPercent / 100);
  return cashBalance - cashTargetValue;
}
