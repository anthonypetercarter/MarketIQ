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

/** A validated BUY verdict on a candidate not currently held — carries what deterministic sizing needs. */
export interface NewPositionVerdictResult {
  ticker: string;
  companyName: string;
  evidence: string[];
  conviction: number;
  currentPrice: number;
}

export interface PortfolioReviewValidationResult {
  narrative: string;
  verdicts: HoldingVerdictResult[];
  /** Validated BUY verdicts on new (currently unheld) positions — zero or more, not capped at one. */
  newPositionVerdicts: NewPositionVerdictResult[];
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

function repairLeakedToolOutput(rawObj: RawReview): { result: RawReview; repaired: boolean } {
  if (typeof rawObj.narrative !== "string") return { result: rawObj, repaired: false };

  const closingTagIndex = rawObj.narrative.indexOf("</narrative>");
  if (closingTagIndex === -1) return { result: rawObj, repaired: false };

  const realNarrative = rawObj.narrative.slice(0, closingTagIndex).trim();
  const afterClosingTag = rawObj.narrative.slice(closingTagIndex);

  const verdictsMatch = afterClosingTag.match(/<verdicts>([\s\S]*?)<\/verdicts>/);
  if (!verdictsMatch) {
    return { result: { ...rawObj, narrative: realNarrative }, repaired: true };
  }

  try {
    const extractedVerdicts = JSON.parse(verdictsMatch[1]);
    return { result: { narrative: realNarrative, verdicts: extractedVerdicts }, repaired: true };
  } catch {
    return { result: { ...rawObj, narrative: realNarrative }, repaired: true };
  }
}

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
  const { result: rawObj, repaired } = repairLeakedToolOutput(
    (typeof raw === "object" && raw !== null ? raw : {}) as RawReview,
  );
  if (repaired) {
    warnings.push(
      "Raw output had narrative/verdicts leaked together (a known model quirk) — repaired before validating. " +
        "If this keeps happening, the prompt constraint may need to be strengthened further.",
    );
  }

  const narrative =
    typeof rawObj.narrative === "string" && rawObj.narrative.trim().length > 0
      ? rawObj.narrative
      : NARRATIVE_FALLBACK;
  if (narrative === NARRATIVE_FALLBACK) {
    warnings.push("Narrative missing or empty in raw AI output — used a fallback.");
  }

  const rawVerdicts: RawVerdictEntry[] = Array.isArray(rawObj.verdicts) ? rawObj.verdicts : [];
  const byTicker = new Map<string, RawVerdictEntry>();
  const candidateEntriesByTicker = new Map<string, RawVerdictEntry>();

  const heldTickers = new Set(packet.holdings.map((h) => h.ticker));
  const candidatesByTicker = new Map(packet.candidates.map((c) => [c.ticker, c]));

  for (const entry of rawVerdicts) {
    if (!entry || typeof entry.ticker !== "string") continue;
    if (heldTickers.has(entry.ticker)) {
      byTicker.set(entry.ticker, entry);
    } else if (candidatesByTicker.has(entry.ticker)) {
      candidateEntriesByTicker.set(entry.ticker, entry);
    } else {
      // Neither a held position nor a real candidate — the AI hallucinating
      // a ticker it wasn't given is exactly the failure mode this exists to catch.
      warnings.push(
        `Raw output included a verdict for "${entry.ticker}", which isn't a held position or a real candidate — discarded.`,
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

  // Candidate BUY verdicts — only BUY is meaningful for a ticker not
  // currently held; anything else (INCREASE/HOLD/REDUCE/EXIT on a position
  // that doesn't exist) is discarded rather than guessed at.
  const newPositionVerdicts: NewPositionVerdictResult[] = [];
  for (const [ticker, raw] of candidateEntriesByTicker) {
    const candidate = candidatesByTicker.get(ticker)!;

    if (raw.verdict !== "BUY") {
      warnings.push(
        `Verdict "${JSON.stringify(raw.verdict)}" for unheld candidate ${ticker} isn't BUY — discarded, since only a new position (BUY) is meaningful for a ticker not currently held.`,
      );
      continue;
    }

    const evidence = Array.isArray(raw.evidence)
      ? raw.evidence.filter((e): e is string => typeof e === "string" && e.trim().length > 0)
      : [];

    if (evidence.length === 0) {
      warnings.push(`No usable evidence for candidate BUY on ${ticker} — discarded.`);
      continue;
    }

    newPositionVerdicts.push({
      ticker: candidate.ticker,
      companyName: candidate.companyName,
      evidence,
      conviction: candidate.conviction,
      currentPrice: candidate.currentPrice,
    });
  }

  // Highest-conviction candidates first — deterministic sizing processes
  // them in this order, same discipline as decision #6's original
  // highest-conviction-first selection.
  newPositionVerdicts.sort((a, b) => b.conviction - a.conviction);

  return { narrative, verdicts, newPositionVerdicts, warnings };
}
