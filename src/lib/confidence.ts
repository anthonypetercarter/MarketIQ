/**
 * Confidence is stored as a number (0-100); the label shown in the UI is
 * always derived from it, never stored separately, so the two can't drift
 * out of sync. See prisma/schema.prisma for the storage-side rationale.
 *
 * Thresholds live here as config, not inlined in the function body, so
 * they're a single edit point if the founder wants different cutoffs once
 * these are checked against real numbers.
 */
export const CONFIDENCE_THRESHOLDS = {
  VERY_HIGH: 85,
  HIGH: 70,
  MEDIUM: 50,
} as const;

export type ConfidenceLabel = "Low" | "Medium" | "High" | "Very High";

export function confidenceLabel(score: number): ConfidenceLabel {
  if (score >= CONFIDENCE_THRESHOLDS.VERY_HIGH) return "Very High";
  if (score >= CONFIDENCE_THRESHOLDS.HIGH) return "High";
  if (score >= CONFIDENCE_THRESHOLDS.MEDIUM) return "Medium";
  return "Low";
}
