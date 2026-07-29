/**
 * The Balance Sheet strength signal (decision #22): how leveraged is a
 * company, using a real, standard ratio — total liabilities divided by
 * total assets. Lower means a genuinely safer, less-leveraged balance
 * sheet. Deliberately equities-only, same asset-class boundary as every
 * prior screen (decision #12) — funds don't file the operating financial
 * statements this reads.
 *
 * Structurally simpler than Value: no live price is needed at all. A
 * leverage ratio is purely computable from two real EDGAR facts, so this
 * is a single-pass join-and-rank, not Value's two-phase
 * shortlist-then-price design. There's also no equivalent to Value's
 * stock-split problem — a real stock split changes a company's share
 * count, not its real total assets or liabilities, so this factor isn't
 * exposed to that same kind of data-timing mismatch.
 *
 * Real design decisions, disclosed rather than picked silently:
 *
 * - A $1B real total-assets floor, reusing a fact this screen already
 *   fetches rather than adding revenue just for filter-consistency with
 *   Quality/Growth.
 * - Both real facts must be genuinely positive — a real company can't
 *   have negative total assets or liabilities by definition; a violation
 *   here would indicate a real data problem, not a legitimate company,
 *   and is excluded rather than producing a nonsensical ratio.
 * - Ranked directly by the real, computed ratio itself (lowest first),
 *   not against an internally-computed median the way Value's "cheap"
 *   was defined — a genuinely low leverage ratio is straightforwardly
 *   safer, with no equivalent "implausible outlier" risk to guard
 *   against.
 */

import type { FrameEntry } from "@/lib/marketdata/edgar";
import { looksLikeOperatingCompany } from "./entityFilters";

export interface BalanceSheetScreenResult {
  cik: number;
  entityName: string;
  ticker: string;
  totalAssets: number;
  totalLiabilities: number;
  /** Total liabilities / total assets — lower is a genuinely stronger, less-leveraged balance sheet. */
  leverageRatio: number;
}

/**
 * Pure function: joins real Assets and Liabilities by CIK, requiring
 * complete real data in both or skipping a company entirely, applies the
 * real assets floor, and returns results sorted by the lowest (safest)
 * real leverage ratio first.
 */
export function computeBalanceSheetScreen(input: {
  assets: FrameEntry[];
  liabilities: FrameEntry[];
  tickerByCik: Map<number, string>;
  minAssetsFloor: number;
}): BalanceSheetScreenResult[] {
  const { assets, liabilities, tickerByCik, minAssetsFloor } = input;

  const liabilitiesByCik = new Map(liabilities.map((e) => [e.cik, e]));

  const results: BalanceSheetScreenResult[] = [];
  for (const asset of assets) {
    const liability = liabilitiesByCik.get(asset.cik);
    // A company missing real liabilities data doesn't get a partial or
    // guessed-at result — skipped entirely, same honesty discipline as
    // every other real screen.
    if (!liability) continue;

    if (asset.val < minAssetsFloor) continue;
    // Real assets and liabilities are both absolute totals — a real
    // company can't have a negative one by definition. A violation here
    // signals a genuine data problem, not a legitimate result to rank.
    if (asset.val <= 0 || liability.val <= 0) continue;

    // A passive investment trust/ETF/fund files real financial
    // statements too, but a near-zero real leverage ratio is
    // structurally meaningless for a vehicle that just holds a
    // commodity — not evidence of genuine financial discipline.
    if (!looksLikeOperatingCompany(asset.entityName)) continue;

    const ticker = tickerByCik.get(asset.cik);
    if (!ticker) continue;

    results.push({
      cik: asset.cik,
      entityName: asset.entityName,
      ticker,
      totalAssets: asset.val,
      totalLiabilities: liability.val,
      leverageRatio: liability.val / asset.val,
    });
  }

  return results.sort((a, b) => a.leverageRatio - b.leverageRatio);
}
