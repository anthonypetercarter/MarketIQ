/**
 * The Value signal (decision #21): is a company cheap relative to its own
 * real fundamentals, fused with a real, live price — the piece neither
 * Quality nor Growth needed, since both work entirely off EDGAR data.
 * Deliberately equities-only, same asset-class boundary as every prior
 * screen (decision #12) — funds don't file the operating financial
 * statements this reads.
 *
 * Deliberately split into two real phases, not one combined pass:
 * fundamentals alone can shortlist candidates without ever touching a
 * price; only once that real, cheap filtering has narrowed the field does
 * a real, live price get fetched — and only for the survivors, not the
 * whole market.
 *
 * Real design decisions, each disclosed rather than picked silently:
 *
 * - A $1B real StockholdersEquity floor, not the $1B revenue floor
 *   Quality/Growth used — Value's own natural inputs don't include
 *   revenue at all.
 * - Real P/E requires genuinely positive net income; real P/B requires
 *   genuinely positive stockholders' equity.
 * - "Cheap" is defined against a real, internally-computed median across
 *   the whole qualifying universe itself.
 * - A real, standard-common-stock-only ticker filter — Alpaca's batch
 *   price endpoint rejects the entire request if even one symbol is
 *   invalid, and P/E/P-B don't mean anything for a preferred share
 *   anyway.
 * - A real, most-recent-first cascade for shares outstanding, not a
 *   single fixed period — the real fix for a genuine, live discovery:
 *   Netflix's real 10-for-1 stock split (November 2025) made its
 *   real-but-stale pre-split share count silently incompatible with its
 *   real, live, post-split price, producing an absurd P/E of 3.6 despite
 *   every individual real number being correct on its own. A stock split
 *   doesn't change a company's real underlying earnings or equity — only
 *   how many real shares that total is divided among — so using the most
 *   recently available real share count, even from a different period
 *   than net income/equity, is the economically correct choice, not just
 *   a technical workaround. Checks four real, consecutive quarters,
 *   most-recent-first, using whichever is the first real entry found for
 *   a given company.
 * - A real, cheap safety net as a second layer, not a replacement for the
 *   fix above: any result whose P/E falls below 20% of the real,
 *   internally-computed median is excluded as an implausible outlier.
 *   Costs nothing extra to compute — it's a filter on data already
 *   fetched — and catches whatever real, residual staleness the
 *   four-quarter cascade doesn't (a company that hasn't filed within
 *   that real window, or some other genuine data quirk).
 */

import type { FrameEntry } from "@/lib/marketdata/edgar";
import { looksLikeOperatingCompany } from "./entityFilters";

/** Real, standard US common-stock tickers are plain uppercase letters — a hyphen, period, or digit reliably signals a non-common security (preferred shares, warrants, units) that Value screening doesn't meaningfully apply to anyway. */
const STANDARD_TICKER_PATTERN = /^[A-Z]+$/;

/** A result whose P/E sits below this fraction of the real, computed median is treated as an implausible, likely-stale-data outlier rather than a genuine bargain. */
const OUTLIER_MEDIAN_FRACTION = 0.2;

export interface ValueScreenCandidate {
  cik: number;
  entityName: string;
  ticker: string;
  netIncome: number;
  stockholdersEquity: number;
  sharesOutstanding: number;
}

export interface ValueScreenResult extends ValueScreenCandidate {
  currentPrice: number;
  realPriceToEarnings: number;
  realPriceToBook: number;
}

export interface ValueScreenSummary {
  results: ValueScreenResult[];
  /** The real, computed median P/E across the final, cleaned result set — the internal benchmark "cheap" is measured against. */
  medianPriceToEarnings: number;
  /** The real, computed median P/B across the final, cleaned result set. */
  medianPriceToBook: number;
}

/**
 * Real, defensive helper: given a CIK and a real, most-recent-first list
 * of Frame datasets, returns the first (most recent) real entry found for
 * that company — never guesses at a value none of the real periods
 * actually reported.
 */
function findMostRecentEntry(cik: number, framesByRecency: FrameEntry[][]): FrameEntry | undefined {
  for (const frame of framesByRecency) {
    const entry = frame.find((e) => e.cik === cik);
    if (entry) return entry;
  }
  return undefined;
}

/**
 * Phase 1 — pure, no price needed. Joins real net income and stockholders'
 * equity by CIK (a company must appear in both, requiring the same real
 * period for these two — a stock split doesn't affect either of these
 * totals, so no cascade is needed for them). Shares outstanding uses the
 * real, most-recent-first cascade instead, since a stale share count is
 * exactly what a stock split silently breaks. Applies the real equity
 * floor and excludes any company with a real loss or negative book value.
 */
export function shortlistValueCandidates(input: {
  netIncome: FrameEntry[];
  stockholdersEquity: FrameEntry[];
  /** Real, most-recent-first cascade of shares-outstanding snapshots — checked in order per company, using whichever is the first (most recent) real entry found. */
  sharesOutstandingByRecency: FrameEntry[][];
  tickerByCik: Map<number, string>;
  minStockholdersEquityFloor: number;
}): ValueScreenCandidate[] {
  const {
    netIncome,
    stockholdersEquity,
    sharesOutstandingByRecency,
    tickerByCik,
    minStockholdersEquityFloor,
  } = input;

  const netIncomeByCik = new Map(netIncome.map((e) => [e.cik, e]));

  const candidates: ValueScreenCandidate[] = [];
  for (const equity of stockholdersEquity) {
    const ni = netIncomeByCik.get(equity.cik);
    const shares = findMostRecentEntry(equity.cik, sharesOutstandingByRecency);
    // A company missing net income entirely, or missing shares
    // outstanding across every real period checked, doesn't get a
    // partial or guessed-at result — skipped entirely, same honesty
    // discipline as Quality and Growth before it.
    if (!ni || !shares) continue;

    if (equity.val < minStockholdersEquityFloor) continue;
    if (ni.val <= 0 || equity.val <= 0 || shares.val <= 0) continue;

    const ticker = tickerByCik.get(equity.cik);
    if (!ticker) continue;
    if (!STANDARD_TICKER_PATTERN.test(ticker)) continue;
    if (!looksLikeOperatingCompany(equity.entityName)) continue;

    candidates.push({
      cik: equity.cik,
      entityName: equity.entityName,
      ticker,
      netIncome: ni.val,
      stockholdersEquity: equity.val,
      sharesOutstanding: shares.val,
    });
  }
  return candidates;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

/**
 * Phase 2 — pure, given real prices already fetched for the shortlist.
 * Computes each candidate's real P/E and P/B, skips any candidate whose
 * real price wasn't available (never fabricated), computes a real,
 * "raw" median across every priced result to use as the honest reference
 * point, then excludes any result whose P/E falls below the real outlier
 * threshold before computing the final, displayed median on the cleaned
 * set.
 */
export function computeValueScreenResults(
  candidates: ValueScreenCandidate[],
  pricesByTicker: Map<string, number>,
): ValueScreenSummary {
  const rawResults: ValueScreenResult[] = [];

  for (const c of candidates) {
    const currentPrice = pricesByTicker.get(c.ticker);
    if (currentPrice === undefined) continue;

    const earningsPerShare = c.netIncome / c.sharesOutstanding;
    const bookValuePerShare = c.stockholdersEquity / c.sharesOutstanding;
    if (earningsPerShare <= 0 || bookValuePerShare <= 0) continue;

    rawResults.push({
      ...c,
      currentPrice,
      realPriceToEarnings: currentPrice / earningsPerShare,
      realPriceToBook: currentPrice / bookValuePerShare,
    });
  }

  const rawMedianPE = median(rawResults.map((r) => r.realPriceToEarnings));
  const outlierFloor = rawMedianPE * OUTLIER_MEDIAN_FRACTION;
  const cleanedResults = rawResults.filter((r) => r.realPriceToEarnings >= outlierFloor);

  return {
    results: cleanedResults,
    medianPriceToEarnings: median(cleanedResults.map((r) => r.realPriceToEarnings)),
    medianPriceToBook: median(cleanedResults.map((r) => r.realPriceToBook)),
  };
}
