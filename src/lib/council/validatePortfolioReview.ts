/**
 * Portfolio Review — North Star Vision (docs/decisions.md).
 *
 * Validates the Council's raw AI output against the research packet before
 * anything is persisted. Per decision #5's discipline: the AI may interpret
 * and judge, but every verdict must concern a company actually held, and
 * every verdict needs real evidence — never a fact the packet didn't
 * contain.
 *
 * Critically: one malformed or unvalidatable verdict degrades to a safe
 * HOLD for that holding alone. It does not invalidate the other N-1 real
 * verdicts, and it does not throw — a single bad holding in a nine-position
 * portfolio shouldn't block the whole morning's review.
 */

import type { ResearchPacket } from "./researchPacket";

export const VALID_VERDICTS = ["BUY", "INCREASE", "HOLD", "REDUCE", "EXIT"] as const;
export type Verdict = (typeof VALID_VERDICTS)[number];

export interface HoldingVerdictResult {
  ticker: string;
  companyName: string;
  verdict: Verdict;
  evidence: string[];
  /** False when this verdict was degraded to a safe default because the raw output failed validation. */
  validated: boolean;
}

export interface PortfolioReviewValidationResult {
  narrative: string;
  verdicts: HoldingVerdictResult[];
  /** Human-readable notes on any degradations — for logging, not for display. */
  warnings: string[];
}

interface RawVerdictEntry {
  ticker?: unknown;
  companyName?: unknown;
  verdict?: unknown;
  evidence?: unknown;
}

interface RawReview {
  narrative?: unknown;
  verdicts?: unknown;
}

function isValidVerdict(value: unknown): value is Verdict {
  return typeof value === "string" && (VALID_VERDICTS as readonly string[]).includes(value);
}

function safeHold(ticker: string, companyName: string, reason: string): HoldingVerdictResult {
  return {
    ticker,
    companyName,
    verdict: "HOLD",
    evidence: [
      `Unable to generate a validated verdict today (${reason}) — held as a safe default.`,
    ],
    validated: false,
  };
}

const NARRATIVE_FALLBACK =
  "The committee reviewed the portfolio today; a narrative summary could not be generated.";

/**
 * Validates raw AI output against the packet it was generated from. Never
 * throws — always returns a complete, safe result, one entry per real
 * holding in the packet, regardless of how malformed the raw input was.
 */
export function validatePortfolioReview(
  raw: unknown,
  packet: ResearchPacket,
): PortfolioReviewValidationResult {
  const warnings: string[] = [];
  const rawObj = (typeof raw === "object" && raw !== null ? raw : {}) as RawReview;

  const narrative =
    typeof rawObj.narrative === "string" && rawObj.narrative.trim().length > 0
      ? rawObj.narrative
      : NARRATIVE_FALLBACK;
  if (narrative === NARRATIVE_FALLBACK) {
    warnings.push("Narrative missing or empty in raw AI output — used a fallback.");
  }

  const rawVerdicts: RawVerdictEntry[] = Array.isArray(rawObj.verdicts) ? rawObj.verdicts : [];
  const byTicker = new Map<string, RawVerdictEntry>();
  for (const entry of rawVerdicts) {
    if (entry && typeof entry.ticker === "string") {
      byTicker.set(entry.ticker, entry);
    }
  }

  const heldTickers = new Set(packet.holdings.map((h) => h.ticker));

  // Flag (don't fail on) verdicts for tickers not actually held — the AI
  // hallucinating a position that doesn't exist is exactly the failure mode
  // this validation exists to catch.
  for (const entry of rawVerdicts) {
    if (typeof entry.ticker === "string" && !heldTickers.has(entry.ticker)) {
      warnings.push(
        `Raw output included a verdict for "${entry.ticker}", which isn't a held position — discarded.`,
      );
    }
  }

  const verdicts: HoldingVerdictResult[] = packet.holdings.map((holding) => {
    const raw = byTicker.get(holding.ticker);

    if (!raw) {
      warnings.push(`No verdict returned for ${holding.ticker} — defaulted to HOLD.`);
      return safeHold(holding.ticker, holding.companyName, "no verdict returned");
    }

    if (!isValidVerdict(raw.verdict)) {
      warnings.push(
        `Invalid verdict value for ${holding.ticker}: ${JSON.stringify(raw.verdict)} — defaulted to HOLD.`,
      );
      return safeHold(holding.ticker, holding.companyName, "invalid verdict value");
    }

    const evidence = Array.isArray(raw.evidence)
      ? raw.evidence.filter((e): e is string => typeof e === "string" && e.trim().length > 0)
      : [];

    if (evidence.length === 0) {
      warnings.push(
        `No usable evidence for ${holding.ticker} — defaulted to HOLD despite a stated verdict.`,
      );
      return safeHold(holding.ticker, holding.companyName, "no evidence provided");
    }

    return {
      ticker: holding.ticker,
      companyName: holding.companyName,
      verdict: raw.verdict,
      evidence,
      validated: true,
    };
  });

  return { narrative, verdicts, warnings };
}
