import type { CouncilRecommendation, CouncilRole, ActionType } from "@prisma/client";

export const RECOMMENDATION_LABEL: Record<CouncilRecommendation, string> = {
  INCREASE_EQUITY_ALLOCATION: "Increase Equity Allocation",
  MAINTAIN_CURRENT_ALLOCATION: "Maintain Current Allocation",
  REDUCE_EQUITY_ALLOCATION: "Reduce Equity Allocation",
};

export const ROLE_LABEL: Record<CouncilRole, string> = {
  CHIEF_MARKET_OFFICER: "Chief Market Officer",
  CHIEF_SECTOR_STRATEGIST: "Chief Sector Strategist",
  CHIEF_COMPANY_ANALYST: "Chief Company Analyst",
  CHIEF_TECHNICAL_STRATEGIST: "Chief Technical Strategist",
  CHIEF_RISK_OFFICER: "Chief Risk Officer",
  CHIEF_SCIENTIST: "Chief Scientist",
  CHIEF_CLIENT_OFFICER: "Chief Client Officer",
  CHIEF_GOVERNANCE_OFFICER: "Chief Governance Officer",
  CHIEF_INVESTMENT_OFFICER: "Chief Investment Officer",
};

/** Display order for the Council Summary — the CIO's synthesis reads last, after every independent voice. */
export const ROLE_ORDER: CouncilRole[] = [
  "CHIEF_MARKET_OFFICER",
  "CHIEF_SECTOR_STRATEGIST",
  "CHIEF_COMPANY_ANALYST",
  "CHIEF_TECHNICAL_STRATEGIST",
  "CHIEF_RISK_OFFICER",
  "CHIEF_SCIENTIST",
  "CHIEF_CLIENT_OFFICER",
  "CHIEF_GOVERNANCE_OFFICER",
  "CHIEF_INVESTMENT_OFFICER",
];

export const ACTION_TYPE_LABEL: Record<ActionType, string> = {
  BUY: "Buy",
  REDUCE: "Reduce",
  HOLD: "Hold",
  WATCH: "Watch",
  REBALANCE: "Rebalance",
};
