/**
 * FRED series IDs worth tracking for macro context. Named here rather than
 * used as raw strings elsewhere, so the mapping from "what this represents"
 * to "which series" is documented in one place.
 */
export const FRED_SERIES = {
  /** 10-Year minus 2-Year Treasury yield spread. Negative = inverted yield curve. */
  YIELD_CURVE_10Y2Y: "T10Y2Y",
  /** Effective federal funds rate. */
  FED_FUNDS_RATE: "FEDFUNDS",
  /** ICE BofA US High Yield Index Option-Adjusted Spread — a credit-stress proxy. */
  CREDIT_SPREAD_HIGH_YIELD: "BAMLH0A0HYM2",
} as const;
