/**
 * Portfolio Review — North Star Vision (docs/decisions.md).
 *
 * The shape actually persisted in PortfolioReview.verdicts (a JSON column
 * — see decision #7 for why this stays a single JSON blob rather than a
 * child table). Shared between the generation script (write) and the
 * Portfolio page (read) so the two can't silently drift apart.
 */

import type { HoldingVerdictResult } from "./validatePortfolioReview";
import type { NewPositionTrade } from "@/lib/portfolio/playbook";

export interface StoredNewPositionVerdict {
  ticker: string;
  companyName: string;
  verdict: "BUY";
  evidence: string[];
  /** Null when the Council approved a new position but there wasn't enough Excess Cash/room left to size it that day. */
  trade: NewPositionTrade | null;
}

export interface StoredPortfolioReviewVerdicts {
  existingHoldings: HoldingVerdictResult[];
  newPositions: StoredNewPositionVerdict[];
}
