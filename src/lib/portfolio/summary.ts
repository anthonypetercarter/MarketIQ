import type { HoldingWithCompany } from "./allocation";
import { computeTotalPortfolioValue } from "./allocation";

export interface PortfolioSummary {
  totalValue: number;
  todaysChangeValue: number;
  todaysChangePercent: number;
  totalReturnValue: number;
  totalReturnPercent: number;
}

export function computePortfolioSummary(
  holdings: HoldingWithCompany[],
  cashBalance: number,
): PortfolioSummary {
  const totalValue = computeTotalPortfolioValue(holdings, cashBalance);

  const todaysChangeValue = holdings.reduce(
    (sum, h) => sum + h.quantity * (h.company.currentPrice - h.company.previousClosePrice),
    0,
  );
  const previousTotalValue = totalValue - todaysChangeValue;
  const todaysChangePercent =
    previousTotalValue > 0 ? (todaysChangeValue / previousTotalValue) * 100 : 0;

  const totalCostBasis = holdings.reduce((sum, h) => sum + h.quantity * h.costBasis, 0);
  const totalReturnValue = holdings.reduce(
    (sum, h) => sum + h.quantity * (h.company.currentPrice - h.costBasis),
    0,
  );
  const totalReturnPercent = totalCostBasis > 0 ? (totalReturnValue / totalCostBasis) * 100 : 0;

  return {
    totalValue,
    todaysChangeValue,
    todaysChangePercent,
    totalReturnValue,
    totalReturnPercent,
  };
}
