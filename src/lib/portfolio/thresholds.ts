/**
 * Thresholds driving the Sprint 2 rule engine (src/lib/portfolio/rules.ts).
 * Centralized here, not inlined in the rules themselves, for the same
 * reason as CONFIDENCE_THRESHOLDS in lib/confidence.ts — a single edit
 * point if these need adjusting once checked against real behavior.
 */
export const PORTFOLIO_THRESHOLDS = {
  /** Rule A — a category's actual vs. target allocation, in percentage points, before it's flagged as drift. */
  ALLOCATION_DRIFT_POINTS: 5,
  /** Rule B — a single holding's share of total portfolio value before it's flagged as concentrated. */
  CONCENTRATION_PERCENT: 8,
  /** Rule D — cash's actual vs. target allocation, in percentage points, before a deployment signal fires. */
  CASH_DEPLOYMENT_GAP_POINTS: 5,
} as const;
