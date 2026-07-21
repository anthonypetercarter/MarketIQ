/**
 * Thresholds driving the Sprint 2 rule engine (src/lib/portfolio/rules.ts).
 * Centralized here, not inlined in the rules themselves, for the same
 * reason as CONFIDENCE_THRESHOLDS in lib/confidence.ts — a single edit
 * point if these need adjusting once checked against real behavior.
 */
export const PORTFOLIO_THRESHOLDS = {
  /** Rule A — a category's actual vs. target allocation, in percentage points, before it's flagged as drift. */
  ALLOCATION_DRIFT_POINTS: 5,
  /** Rule B — a single EQUITY holding's share of total portfolio value before it's flagged as concentrated. */
  CONCENTRATION_PERCENT: 8,
  /**
   * A FUND holding's own, higher concentration ceiling — a diversified
   * basket of companies doesn't carry one company's idiosyncratic risk, so
   * capping it at the same 8% as a single stock would misrepresent its
   * actual risk. Still a real, non-zero cap — even a diversified fund
   * shouldn't consume an entire day's excess cash in one trade.
   */
  FUND_CONCENTRATION_PERCENT: 40,
  /** Rule D — cash's actual vs. target allocation, in percentage points, before a deployment signal fires. */
  CASH_DEPLOYMENT_GAP_POINTS: 5,
} as const;
