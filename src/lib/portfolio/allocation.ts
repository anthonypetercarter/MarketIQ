import { PORTFOLIO_THRESHOLDS } from "./thresholds";

export interface HoldingWithCompany {
  id: string;
  quantity: number;
  costBasis: number;
  company: {
    id: string;
    ticker: string;
    name: string;
    sector: string;
    currentPrice: number;
    previousClosePrice: number;
    region: "DOMESTIC" | "INTERNATIONAL";
    assetType: "EQUITY" | "FUND";
    /** Orthogonal to assetType — routes a holding into the Bonds allocation category regardless of region. Defaults to EQUITY. See decision #12. */
    assetClass: "EQUITY" | "BOND";
  };
}

export interface AllocationTargetLike {
  category: string;
  targetPercent: number;
}

export interface CurrentAllocationEntry {
  category: "US Equities" | "International Equities" | "Bonds" | "Cash";
  actualValue: number;
  actualPercent: number;
}

export type AllocationStatus = "ALIGNED" | "OVERWEIGHT" | "UNDERWEIGHT" | "NOT_TRACKED";

export interface AllocationGap {
  category: string;
  targetPercent: number;
  /** null for categories not modeled as real holdings — only Alternatives now, since decision #12 added real Bonds tracking. See docs/decisions.md. */
  actualPercent: number | null;
  gapPoints: number | null;
  status: AllocationStatus;
}

export function marketValue(holding: HoldingWithCompany): number {
  return holding.quantity * holding.company.currentPrice;
}

export function computeTotalPortfolioValue(
  holdings: HoldingWithCompany[],
  cashBalance: number,
): number {
  return holdings.reduce((sum, h) => sum + marketValue(h), 0) + cashBalance;
}

/** Actual allocation across the four categories now modeled with real holdings — see decision #12 for Bonds. */
export function computeCurrentAllocation(
  holdings: HoldingWithCompany[],
  cashBalance: number,
): CurrentAllocationEntry[] {
  const total = computeTotalPortfolioValue(holdings, cashBalance);

  // Bonds are routed by assetClass first, independent of region — a bond
  // ETF is a real, domestic-listed ticker, but must never be silently
  // counted as a US Equity. Everything else falls through to the
  // existing region-based equity routing, unchanged.
  const bondValue = holdings
    .filter((h) => h.company.assetClass === "BOND")
    .reduce((sum, h) => sum + marketValue(h), 0);
  const domesticValue = holdings
    .filter((h) => h.company.assetClass !== "BOND" && h.company.region === "DOMESTIC")
    .reduce((sum, h) => sum + marketValue(h), 0);
  const internationalValue = holdings
    .filter((h) => h.company.assetClass !== "BOND" && h.company.region === "INTERNATIONAL")
    .reduce((sum, h) => sum + marketValue(h), 0);

  const pct = (value: number) => (total > 0 ? (value / total) * 100 : 0);

  return [
    { category: "US Equities", actualValue: domesticValue, actualPercent: pct(domesticValue) },
    {
      category: "International Equities",
      actualValue: internationalValue,
      actualPercent: pct(internationalValue),
    },
    { category: "Bonds", actualValue: bondValue, actualPercent: pct(bondValue) },
    { category: "Cash", actualValue: cashBalance, actualPercent: pct(cashBalance) },
  ];
}

export interface SectorExposureEntry {
  sector: string;
  percent: number;
}

/** Groups holdings by Company.sector for the Sector Exposure section, which reuses AllocationBar. */
export function computeSectorExposure(
  holdings: HoldingWithCompany[],
  cashBalance: number,
): SectorExposureEntry[] {
  const total = computeTotalPortfolioValue(holdings, cashBalance);
  const bySector = new Map<string, number>();
  for (const h of holdings) {
    bySector.set(h.company.sector, (bySector.get(h.company.sector) ?? 0) + marketValue(h));
  }
  return Array.from(bySector.entries())
    .map(([sector, value]) => ({ sector, percent: total > 0 ? (value / total) * 100 : 0 }))
    .sort((a, b) => b.percent - a.percent);
}

/** Merges actual allocation against every Brief AllocationTarget category, including untracked ones. */
export function computeAllocationGaps(
  current: CurrentAllocationEntry[],
  targets: AllocationTargetLike[],
): AllocationGap[] {
  return targets.map((target) => {
    const match = current.find((c) => c.category === target.category);
    if (!match) {
      return {
        category: target.category,
        targetPercent: target.targetPercent,
        actualPercent: null,
        gapPoints: null,
        status: "NOT_TRACKED",
      };
    }
    const gapPoints = match.actualPercent - target.targetPercent;
    const status: AllocationStatus =
      Math.abs(gapPoints) < PORTFOLIO_THRESHOLDS.ALLOCATION_DRIFT_POINTS
        ? "ALIGNED"
        : gapPoints > 0
          ? "OVERWEIGHT"
          : "UNDERWEIGHT";
    return {
      category: target.category,
      targetPercent: target.targetPercent,
      actualPercent: match.actualPercent,
      gapPoints,
      status,
    };
  });
}
