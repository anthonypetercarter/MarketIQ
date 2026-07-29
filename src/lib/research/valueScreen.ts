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
 * whole market. Combining both into one function would force fetching
 * every candidate's real price up front, most of which get thrown away
 * by the fundamentals filter anyway.
 *
 * Real design decisions, each disclosed rather than picked silently:
 *
 * - A $1B real StockholdersEquity floor, not the $1B revenue floor
 *   Quality/Growth used. Value's own natural inputs (net income, book
 *   value, shares outstanding) don't include revenue at all — refetching
 *   Revenues purely for floor-consistency would mean a fourth real Frame
 *   call for no other purpose.
 * - Real P/E requires genuinely positive net income; real P/B requires
 *   genuinely positive stockholders' equity — both ratios are nonsensical
 *   against a real loss or negative book value, excluded rather than
 *   computed into a misleading or inverted-looking ratio.
 * - "Cheap" is defined against a real, internally-computed median across
 *   the whole qualifying universe itself, not an arbitrary fixed number
 *   or an external industry-average data source that neither exists nor
 *   is needed here.
 * - A real, standard-common-stock-only ticker filter, added after a live
 *   run surfaced the real cause directly: Alpaca's batch price endpoint
 *   rejects the ENTIRE request if even one symbol is invalid — a real
 *   preferred-share ticker (ASB-PF) crashed the price fetch for all 687
 *   otherwise-valid candidates in one shot. SEC's own ticker-mapping file
 *   includes every real, registered share class a company has, not just
 *   common stock — preferred shares, warrants, and units all appear
 *   there too. Real, standard US common-stock tickers are virtually
 *   always plain uppercase letters; a hyphen, period, or other character
 *   reliably signals something else. This is also a real, substantive
 *   filter, not just a technical workaround — P/E and P/B don't mean
 *   anything for a preferred share, which trades more like a bond with a
 *   fixed dividend than a claim on real, variable earnings.
 */

import type { FrameEntry } from "@/lib/marketdata/edgar";

/** Real, standard US common-stock tickers are plain uppercase letters — a hyphen, period, or digit reliably signals a non-common security (preferred shares, warrants, units) that Value screening doesn't meaningfully apply to anyway. */
const STANDARD_TICKER_PATTERN = /^[A-Z]+$/;

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
  /** The real, computed median P/E across every qualifying company — the internal benchmark "cheap" is measured against. */
  medianPriceToEarnings: number;
  /** The real, computed median P/B across every qualifying company. */
  medianPriceToBook: number;
}

/**
 * Phase 1 — pure, no price needed. Joins three real Frame datasets by
 * CIK, requiring complete real data in all three or skipping a company
 * entirely, applies the real equity floor, and excludes any company with
 * a real loss or negative book value. Real prices haven't been fetched
 * yet at this point — that only happens for whatever this phase returns.
 */
export function shortlistValueCandidates(input: {
  netIncome: FrameEntry[];
  stockholdersEquity: FrameEntry[];
  sharesOutstanding: FrameEntry[];
  tickerByCik: Map<number, string>;
  minStockholdersEquityFloor: number;
}): ValueScreenCandidate[] {
  const {
    netIncome,
    stockholdersEquity,
    sharesOutstanding,
    tickerByCik,
    minStockholdersEquityFloor,
  } = input;

  const netIncomeByCik = new Map(netIncome.map((e) => [e.cik, e]));
  const sharesByCik = new Map(sharesOutstanding.map((e) => [e.cik, e]));

  const candidates: ValueScreenCandidate[] = [];
  for (const equity of stockholdersEquity) {
    const ni = netIncomeByCik.get(equity.cik);
    const shares = sharesByCik.get(equity.cik);
    // A company missing from any one of the three real datasets doesn't
    // get a partial or guessed-at result — skipped entirely, same
    // honesty discipline as Quality and Growth before it.
    if (!ni || !shares) continue;

    if (equity.val < minStockholdersEquityFloor) continue;
    if (ni.val <= 0 || equity.val <= 0 || shares.val <= 0) continue;

    const ticker = tickerByCik.get(equity.cik);
    if (!ticker) continue;
    if (!STANDARD_TICKER_PATTERN.test(ticker)) continue;

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

/**
 * Phase 2 — pure, given real prices already fetched for the shortlist.
 * Computes each candidate's real P/E and P/B, skips any candidate whose
 * real price wasn't available (never fabricated), and computes the real
 * median across whatever real results remain.
 */
export function computeValueScreenResults(
  candidates: ValueScreenCandidate[],
  pricesByTicker: Map<string, number>,
): ValueScreenSummary {
  const results: ValueScreenResult[] = [];

  for (const c of candidates) {
    const currentPrice = pricesByTicker.get(c.ticker);
    if (currentPrice === undefined) continue;

    const earningsPerShare = c.netIncome / c.sharesOutstanding;
    const bookValuePerShare = c.stockholdersEquity / c.sharesOutstanding;
    if (earningsPerShare <= 0 || bookValuePerShare <= 0) continue;

    results.push({
      ...c,
      currentPrice,
      realPriceToEarnings: currentPrice / earningsPerShare,
      realPriceToBook: currentPrice / bookValuePerShare,
    });
  }

  const median = (values: number[]): number => {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  };

  return {
    results,
    medianPriceToEarnings: median(results.map((r) => r.realPriceToEarnings)),
    medianPriceToBook: median(results.map((r) => r.realPriceToBook)),
  };
}
