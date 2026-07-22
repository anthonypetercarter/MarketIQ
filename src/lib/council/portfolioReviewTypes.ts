/**
 * Portfolio Review — North Star Vision (docs/decisions.md).
 *
 * The shape actually persisted in PortfolioReview.verdicts (a JSON column
 * — see decision #7 for why this stays a single JSON blob rather than a
 * child table). Shared between the generation script (write) and the
 * Portfolio page (read) so the two can't silently drift apart.
 *
 * `todaysActions` unifies every real, sized move the Council approved —
 * new positions (BUY), additions to existing ones (INCREASE), and
 * concentration-driven trims or full exits (REDUCE/EXIT) — into one list.
 * A position can appear in both `existingHoldings` (the full reviewed
 * record, including its evidence) and `todaysActions` (the real trade) —
 * that's intentional: Existing Holdings is the complete supporting detail
 * every position gets, Today's Actions is the lead, conclusion-first
 * summary of what actually changed.
 */

import type { HoldingVerdictResult, Verdict } from "./validatePortfolioReview";
import type { BuyTrade, HoldingSizing } from "@/lib/portfolio/playbook";

export interface TodaysActionBuySide {
  ticker: string;
  companyName: string;
  verdict: "BUY" | "INCREASE";
  evidence: string[];
  side: "BUY";
  /** Null when the Council approved the move but there wasn't enough Excess Cash/room left to size it that day. */
  trade: BuyTrade | null;
}

export interface TodaysActionSellSide {
  ticker: string;
  companyName: string;
  verdict: "REDUCE" | "EXIT";
  evidence: string[];
  side: "SELL";
  /**
   * Null when the Council issued a qualitative REDUCE that isn't backed by
   * a concentration-ceiling breach — the deterministic sizing layer only
   * computes a real trim for a concentration-driven overage today; a
   * reduce issued for a different reason has no mechanical trade to
   * compute yet. Always non-null for EXIT (full liquidation is always computable).
   */
  trade: HoldingSizing | null;
}

export type TodaysAction = TodaysActionBuySide | TodaysActionSellSide;

export interface StoredPortfolioReviewVerdicts {
  existingHoldings: HoldingVerdictResult[];
  todaysActions: TodaysAction[];
}

export type { Verdict };
