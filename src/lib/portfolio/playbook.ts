/**
 * Today's Playbook (docs/decisions.md #6) — built incrementally, validated
 * against real portfolio data. Milestones 2-6 (candidate filtering,
 * selection, sizing, simulation, evidence, and the Wait state) are one
 * algorithm, reviewed as one pass rather than five isolated pieces.
 */

import { PORTFOLIO_THRESHOLDS } from "./thresholds";
import {
  computeTotalPortfolioValue,
  computeCurrentAllocation,
  computeAllocationGaps,
  marketValue,
} from "./allocation";
import { computePortfolioHealth } from "./rules";
import type { HoldingWithCompany, AllocationTargetLike, AllocationGap } from "./allocation";
import type { PortfolioHealth } from "./rules";

/**
 * Excess Cash = Current Cash − Target Cash (in dollars).
 *
 * Target Cash is expressed as a percentage of total portfolio value in
 * today's Brief (AllocationTarget for the "Cash" category) — this converts
 * that percentage into a dollar figure and compares it against the real
 * cash balance. A negative result means cash is already below target;
 * there's nothing to deploy, not a deficit to fill from elsewhere.
 */
export function computeExcessCash(
  totalPortfolioValue: number,
  cashBalance: number,
  cashTargetPercent: number,
): number {
  const cashTargetValue = totalPortfolioValue * (cashTargetPercent / 100);
  return cashBalance - cashTargetValue;
}

const ACTIONABLE_CATEGORIES = ["US Equities", "International Equities"] as const;
type ActionableCategory = (typeof ACTIONABLE_CATEGORIES)[number];

interface OpportunityCompany {
  id: string;
  ticker: string;
  name: string;
  region: "DOMESTIC" | "INTERNATIONAL";
  currentPrice: number;
}

export interface OpportunityCandidate {
  id: string;
  thesis: string;
  conviction: number;
  companyId: string | null;
  company: OpportunityCompany | null;
}

export interface HoldingSizing {
  sharesToSell: number;
  estimatedProceeds: number;
}

/**
 * REDUCE mechanics — trims a position down to exactly the concentration
 * ceiling. This is genuinely new math: today's ceiling logic only ever
 * blocked new buys at this line before; it never computed a trim amount.
 * Returns null if the position isn't actually over the ceiling (a REDUCE
 * verdict without a real breach shouldn't produce a trade).
 */
export function computeReduceToConcentrationCeiling(
  holding: HoldingWithCompany,
  totalPortfolioValue: number,
): HoldingSizing | null {
  const currentValue = marketValue(holding);
  const ceilingValue = (PORTFOLIO_THRESHOLDS.CONCENTRATION_PERCENT / 100) * totalPortfolioValue;
  if (currentValue <= ceilingValue) return null;

  const excessValue = currentValue - ceilingValue;
  const sharesToSell = Math.min(
    Math.ceil(excessValue / holding.company.currentPrice),
    holding.quantity,
  );
  return { sharesToSell, estimatedProceeds: sharesToSell * holding.company.currentPrice };
}

/** EXIT mechanics — full liquidation. No new sizing logic needed beyond selling everything held. */
export function computeExitSizing(holding: HoldingWithCompany): HoldingSizing {
  return { sharesToSell: holding.quantity, estimatedProceeds: marketValue(holding) };
}

export interface PlaybookWait {
  status: "WAIT";
  excessCash: number;
  reason: string;
}

export interface PlaybookTrade {
  status: "TRADE";
  objective: string;
  /** Supporting context now, not the headline — see the sizing explanation for why. */
  excessCash: number;
  selectedOpportunity: {
    ticker: string;
    companyName: string;
    conviction: number;
    thesis: string;
  };
  trade: {
    ticker: string;
    shares: number;
    estimatedPricePerShare: number;
    estimatedCost: number;
  };
  expectedPortfolio: {
    targetCategory: string;
    expectedCategoryPercent: number;
    expectedCashPercent: number;
    expectedHealthStatus: PortfolioHealth["status"];
    /** True when the trade narrows the gap even though the category may still be UNDERWEIGHT overall. */
    isImproving: boolean;
  };
  /** Facts sourced directly from today's Brief — conviction, thesis, which gap this addresses. */
  evidence: string[];
  /** Dynamically generated from whichever constraint actually bound the trade size today — never a fixed template. */
  sizingExplanation: string;
}

export type PlaybookResult = PlaybookWait | PlaybookTrade;

const REGION_TO_CATEGORY: Record<"DOMESTIC" | "INTERNATIONAL", ActionableCategory> = {
  DOMESTIC: "US Equities",
  INTERNATIONAL: "International Equities",
};

/**
 * Which of the three real sizing constraints actually determined the trade
 * size. Never a fixed template — the explanation shown to the user must
 * reflect whichever one was genuinely binding today, since a different
 * constraint could easily bind on a different day.
 */
export type BindingConstraint = "CONCENTRATION_LIMIT" | "EXCESS_CASH" | "ALLOCATION_GAP";

function determineBindingConstraint(
  gapClosingValue: number,
  excessCash: number,
  concentrationRoom: number,
): BindingConstraint {
  const min = Math.min(gapClosingValue, excessCash, concentrationRoom);
  if (min === concentrationRoom) return "CONCENTRATION_LIMIT";
  if (min === excessCash) return "EXCESS_CASH";
  return "ALLOCATION_GAP";
}

function explainSizing(
  constraint: BindingConstraint,
  concentrationPercent: number,
  excessCash: number,
  category: string,
): string {
  if (constraint === "CONCENTRATION_LIMIT") {
    return `Sized to the portfolio's ${concentrationPercent}% single-holding concentration limit — the allocation gap and available cash both would have allowed a larger position.`;
  }
  if (constraint === "EXCESS_CASH") {
    return `Sized to today's full deployable Excess Cash (${formatUsd(excessCash)}) — the allocation gap and concentration limit both would have allowed more.`;
  }
  return `Sized to fully close today's ${category} allocation gap — this trade alone brings the category to target.`;
}

function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

/** Adds a simulated trade to a holdings array without mutating the input — used only to project Expected Portfolio, never persisted. */
function withSimulatedTrade(
  holdings: HoldingWithCompany[],
  company: OpportunityCompany,
  additionalShares: number,
): HoldingWithCompany[] {
  const existing = holdings.find((h) => h.company.id === company.id);
  if (existing) {
    return holdings.map((h) =>
      h.company.id === company.id ? { ...h, quantity: h.quantity + additionalShares } : h,
    );
  }
  return [
    ...holdings,
    {
      id: `simulated-${company.id}`,
      quantity: additionalShares,
      costBasis: company.currentPrice,
      company: {
        id: company.id,
        ticker: company.ticker,
        name: company.name,
        sector: "Unknown",
        currentPrice: company.currentPrice,
        previousClosePrice: company.currentPrice,
        region: company.region,
      },
    },
  ];
}

/**
 * Today's Playbook — the full V1 algorithm. Cash deployment only (no sells),
 * one highest-conviction trade per day, Excess Cash bounded, concentration
 * ceiling respected, "wait" is a real and correct output. See
 * docs/decisions.md #6 for the full scoping rationale.
 */
export function computeTodaysPlaybook(input: {
  holdings: HoldingWithCompany[];
  cashBalance: number;
  allocationTargets: AllocationTargetLike[];
  opportunities: OpportunityCandidate[];
  briefDate: Date;
}): PlaybookResult {
  const { holdings, cashBalance, allocationTargets, opportunities, briefDate } = input;

  const totalValue = computeTotalPortfolioValue(holdings, cashBalance);
  const currentAllocation = computeCurrentAllocation(holdings, cashBalance);
  const gaps = computeAllocationGaps(currentAllocation, allocationTargets);

  const cashTargetPercent = gaps.find((g) => g.category === "Cash")?.targetPercent ?? 0;
  const excessCash = computeExcessCash(totalValue, cashBalance, cashTargetPercent);

  if (excessCash <= 0) {
    return {
      status: "WAIT",
      excessCash,
      reason: "No excess cash available to deploy today — cash is already at or below target.",
    };
  }

  const underweightGaps = gaps.filter(
    (g): g is AllocationGap & { category: ActionableCategory } =>
      (ACTIONABLE_CATEGORIES as readonly string[]).includes(g.category) &&
      g.status === "UNDERWEIGHT",
  );

  if (underweightGaps.length === 0) {
    return {
      status: "WAIT",
      excessCash,
      reason:
        "Portfolio is aligned or overweight in every actionable category — no deployment needed today.",
    };
  }

  const ceilingValue = (PORTFOLIO_THRESHOLDS.CONCENTRATION_PERCENT / 100) * totalValue;

  const candidates = opportunities
    .filter((o): o is OpportunityCandidate & { company: OpportunityCompany } => Boolean(o.company))
    .map((o) => {
      const category = REGION_TO_CATEGORY[o.company.region];
      const gap = underweightGaps.find((g) => g.category === category);
      const existingHolding = holdings.find((h) => h.company.id === o.companyId);
      const currentPositionValue = existingHolding ? marketValue(existingHolding) : 0;
      return { opportunity: o, category, gap, currentPositionValue };
    })
    .filter(
      (c): c is typeof c & { gap: AllocationGap } =>
        c.gap !== undefined && c.currentPositionValue < ceilingValue,
    )
    .sort((a, b) => b.opportunity.conviction - a.opportunity.conviction);

  if (candidates.length === 0) {
    return {
      status: "WAIT",
      excessCash,
      reason: "No high-conviction opportunity in an underweight category today.",
    };
  }

  for (const candidate of candidates) {
    const { opportunity, category, gap, currentPositionValue } = candidate;
    const company = opportunity.company;

    const gapClosingValue = (Math.abs(gap.gapPoints!) / 100) * totalValue;
    const concentrationRoom = ceilingValue - currentPositionValue;
    const sizeDollars = Math.min(gapClosingValue, excessCash, concentrationRoom);
    const shares = Math.floor(sizeDollars / company.currentPrice);

    if (shares < 1) continue; // not enough room/cash for even one share — try the next candidate

    const estimatedCost = shares * company.currentPrice;

    // Simulate: add this trade to current holdings, spend the cash, re-run
    // the same allocation/health functions used everywhere else, unchanged.
    const simulatedHoldings = withSimulatedTrade(holdings, company, shares);
    const simulatedCash = cashBalance - estimatedCost;
    const simulatedAllocation = computeCurrentAllocation(simulatedHoldings, simulatedCash);
    const simulatedGaps = computeAllocationGaps(simulatedAllocation, allocationTargets);
    const simulatedHealth = computePortfolioHealth(simulatedGaps, [], briefDate);

    const expectedCategoryEntry = simulatedAllocation.find((a) => a.category === category)!;
    const expectedCashEntry = simulatedAllocation.find((a) => a.category === "Cash")!;
    const direction = gap.gapPoints! < 0 ? "below" : "above";

    const simulatedGapForCategory = simulatedGaps.find((g) => g.category === category)!;
    const isImproving =
      simulatedGapForCategory.gapPoints !== null &&
      Math.abs(simulatedGapForCategory.gapPoints) < Math.abs(gap.gapPoints!);

    const bindingConstraint = determineBindingConstraint(
      gapClosingValue,
      excessCash,
      concentrationRoom,
    );
    const sizingExplanation = explainSizing(
      bindingConstraint,
      PORTFOLIO_THRESHOLDS.CONCENTRATION_PERCENT,
      excessCash,
      category,
    );

    return {
      status: "TRADE",
      objective: `Increase ${category} exposure from ${gap.actualPercent!.toFixed(1)}% toward the ${gap.targetPercent}% target.`,
      excessCash,
      selectedOpportunity: {
        ticker: company.ticker,
        companyName: company.name,
        conviction: opportunity.conviction,
        thesis: opportunity.thesis,
      },
      trade: {
        ticker: company.ticker,
        shares,
        estimatedPricePerShare: company.currentPrice,
        estimatedCost,
      },
      expectedPortfolio: {
        targetCategory: category,
        expectedCategoryPercent: expectedCategoryEntry.actualPercent,
        expectedCashPercent: expectedCashEntry.actualPercent,
        expectedHealthStatus: simulatedHealth.status,
        isImproving,
      },
      evidence: [
        `Highest-conviction opportunity today (${opportunity.conviction}/100).`,
        opportunity.thesis,
        `Addresses today's ${category} allocation gap (${Math.abs(gap.gapPoints!).toFixed(1)} points ${direction} target).`,
      ],
      sizingExplanation,
    };
  }

  return {
    status: "WAIT",
    excessCash,
    reason:
      "Excess cash is not sufficient to buy even one share of today's highest-conviction opportunities.",
  };
}
