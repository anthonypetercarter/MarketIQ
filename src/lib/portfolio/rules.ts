import { PORTFOLIO_THRESHOLDS } from "./thresholds";
import {
  computeAllocationGaps,
  computeCurrentAllocation,
  marketValue,
  computeTotalPortfolioValue,
} from "./allocation";
import type { HoldingWithCompany, AllocationTargetLike, AllocationGap } from "./allocation";

export type RecommendedChangeKind =
  "CONCENTRATION" | "DRIFT" | "CASH_DEPLOYMENT" | "MISSING_EXPOSURE";

export interface RecommendedChange {
  id: string;
  kind: RecommendedChangeKind;
  headline: string;
  detail: string;
  /** Answers "why am I seeing this?" — always a citation to a specific Brief field. */
  evidence: string;
  /** Lower = more severe. Concentration (risk) outranks Missing Exposure (informational), per Capital Preservation First. */
  severity: number;
}

interface OpportunityLike {
  id: string;
  thesis: string;
  conviction: number;
  companyId: string | null;
  thematicTitle: string | null;
  company: { id: string; name: string } | null;
}

interface RecommendedActionLike {
  id: string;
  description: string;
  actionType: string;
}

/**
 * Rule A — Allocation Drift. A tracked category off by ALLOCATION_DRIFT_POINTS
 * or more from today's target.
 */
function ruleAllocationDrift(gaps: AllocationGap[]): RecommendedChange[] {
  return gaps
    .filter((g) => g.status === "OVERWEIGHT" || g.status === "UNDERWEIGHT")
    .map((g) => {
      const direction = g.status === "OVERWEIGHT" ? "above" : "below";
      return {
        id: `drift-${g.category}`,
        kind: "DRIFT" as const,
        headline: `${g.status === "OVERWEIGHT" ? "Overweight" : "Underweight"} ${g.category}`,
        detail: `Your portfolio is ${Math.abs(g.gapPoints!).toFixed(1)} points ${direction} today's ${g.category} target.`,
        evidence: `From today's Recommended Allocation: ${g.category} target is ${g.targetPercent}%; your actual allocation is ${g.actualPercent!.toFixed(1)}%.`,
        severity: 2,
      };
    });
}

/**
 * Rule B — Concentration Flag. A single holding at or above
 * CONCENTRATION_PERCENT of total portfolio value. Evidence cites the
 * concentration guideline referenced in today's Recommended Actions
 * (the REBALANCE/REDUCE copy uses the same threshold) rather than a
 * fabricated structural link to a Risk row, since Risk isn't linked to
 * Company in the schema.
 */
function ruleConcentration(
  holdings: HoldingWithCompany[],
  totalValue: number,
): RecommendedChange[] {
  return holdings
    .map((h) => ({ holding: h, pct: totalValue > 0 ? (marketValue(h) / totalValue) * 100 : 0 }))
    .filter(({ pct }) => pct >= PORTFOLIO_THRESHOLDS.CONCENTRATION_PERCENT)
    .map(({ holding, pct }) => ({
      id: `concentration-${holding.company.id}`,
      kind: "CONCENTRATION" as const,
      headline: `${holding.company.name} is concentrated`,
      detail: `${holding.company.ticker} makes up ${pct.toFixed(1)}% of your total portfolio.`,
      evidence: `Today's Recommended Actions flag trimming any single position that exceeds ${PORTFOLIO_THRESHOLDS.CONCENTRATION_PERCENT}% of total equity exposure.`,
      severity: 1,
    }));
}

/**
 * Rule C — Missing Exposure. A company-specific Opportunity in today's
 * Brief that isn't held. Deliberately informational, not a buy signal —
 * see docs/decisions.md for why this was renamed from "Unrepresented
 * Opportunity."
 */
function ruleMissingExposure(
  opportunities: OpportunityLike[],
  holdings: HoldingWithCompany[],
): RecommendedChange[] {
  const heldCompanyIds = new Set(holdings.map((h) => h.company.id));
  return opportunities
    .filter((o) => o.companyId && o.company && !heldCompanyIds.has(o.companyId))
    .map((o) => ({
      id: `missing-${o.companyId}`,
      kind: "MISSING_EXPOSURE" as const,
      headline: `Missing Exposure — ${o.company!.name}`,
      detail: `Today's Brief lists ${o.company!.name} as a Top Opportunity that isn't currently in your portfolio.`,
      evidence: `From today's Top Opportunities: ${o.company!.name}, conviction ${o.conviction}/100 — "${o.thesis}"`,
      severity: 4,
    }));
}

/**
 * Rule D — Cash Deployment Signal. Cash sitting CASH_DEPLOYMENT_GAP_POINTS
 * or more above target, when today's Brief has a REBALANCE action —
 * evidence cites that action's exact text, a real structural link.
 */
function ruleCashDeployment(
  gaps: AllocationGap[],
  actions: RecommendedActionLike[],
): RecommendedChange[] {
  const cash = gaps.find((g) => g.category === "Cash");
  const rebalanceAction = actions.find((a) => a.actionType === "REBALANCE");
  if (!cash || cash.gapPoints === null || !rebalanceAction) return [];
  if (cash.gapPoints < PORTFOLIO_THRESHOLDS.CASH_DEPLOYMENT_GAP_POINTS) return [];

  return [
    {
      id: "cash-deployment",
      kind: "CASH_DEPLOYMENT" as const,
      headline: "Cash Deployment Opportunity",
      detail: `Your cash balance is ${cash.gapPoints.toFixed(1)} points above today's ${cash.targetPercent}% target.`,
      evidence: `From today's Recommended Actions: "${rebalanceAction.description}"`,
      severity: 3,
    },
  ];
}

export function computeRecommendedChanges(input: {
  holdings: HoldingWithCompany[];
  cashBalance: number;
  allocationTargets: AllocationTargetLike[];
  opportunities: OpportunityLike[];
  recommendedActions: RecommendedActionLike[];
}): RecommendedChange[] {
  const { holdings, cashBalance, allocationTargets, opportunities, recommendedActions } = input;
  const totalValue = computeTotalPortfolioValue(holdings, cashBalance);
  const current = computeCurrentAllocation(holdings, cashBalance);
  const gaps = computeAllocationGaps(current, allocationTargets);

  const changes = [
    ...ruleConcentration(holdings, totalValue),
    ...ruleAllocationDrift(gaps),
    ...ruleCashDeployment(gaps, recommendedActions),
    ...ruleMissingExposure(opportunities, holdings),
  ];

  return changes.sort((a, b) => a.severity - b.severity);
}

export interface PortfolioHealth {
  status: "ALIGNED" | "OVERWEIGHT" | "UNDERWEIGHT";
  primaryIssue: RecommendedChange | null;
  briefDate: Date;
}

/**
 * Tier 0. Overall status is derived from combined equity exposure (US +
 * International together) against combined equity targets — that's the
 * dimension the Council's headline recommendation actually speaks to,
 * even when the domestic/international split within it is skewed.
 */
export function computePortfolioHealth(
  gaps: AllocationGap[],
  changes: RecommendedChange[],
  briefDate: Date,
): PortfolioHealth {
  const equityGaps = gaps.filter(
    (g) => g.category === "US Equities" || g.category === "International Equities",
  );
  const totalActualEquity = equityGaps.reduce((sum, g) => sum + (g.actualPercent ?? 0), 0);
  const totalTargetEquity = equityGaps.reduce((sum, g) => sum + g.targetPercent, 0);
  const equityGapPoints = totalActualEquity - totalTargetEquity;

  const status: PortfolioHealth["status"] =
    Math.abs(equityGapPoints) < PORTFOLIO_THRESHOLDS.ALLOCATION_DRIFT_POINTS
      ? "ALIGNED"
      : equityGapPoints > 0
        ? "OVERWEIGHT"
        : "UNDERWEIGHT";

  return {
    status,
    primaryIssue: changes.length > 0 ? changes[0] : null,
    briefDate,
  };
}
