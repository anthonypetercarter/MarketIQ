/**
 * Portfolio Review — North Star Vision (docs/decisions.md).
 *
 * Assembles the structured input the Council's single AI call reads. Pure
 * function: real data in, structured packet out, no AI logic here. This is
 * the "facts" half of the structured-input/structured-output/validated
 * discipline decision #5 established — the AI call downstream is only
 * allowed to interpret what's in this packet, never introduce a fact that
 * isn't.
 */

import type { HoldingWithCompany, AllocationGap } from "@/lib/portfolio/allocation";
import { marketValue, computeTotalPortfolioValue } from "@/lib/portfolio/allocation";

export interface ResearchPacketHolding {
  ticker: string;
  companyName: string;
  sector: string;
  region: "DOMESTIC" | "INTERNATIONAL";
  quantity: number;
  costBasis: number;
  currentPrice: number;
  marketValue: number;
  percentOfPortfolio: number;
  unrealizedGainPercent: number;
}

export interface ResearchPacketRisk {
  title: string;
  description: string;
}

export interface ResearchPacketOpportunity {
  companyTicker: string | null;
  thematicTitle: string | null;
  thesis: string;
  conviction: number;
}

export interface ResearchPacketAllocationGap {
  category: string;
  actualPercent: number | null;
  targetPercent: number;
  status: string;
}

export interface ResearchPacket {
  briefDate: string;
  councilRecommendation: string;
  councilConfidence: number;
  marketOutlook: string;
  executiveSummary: string;
  decisionRationale: string;
  risks: ResearchPacketRisk[];
  opportunities: ResearchPacketOpportunity[];
  allocationGaps: ResearchPacketAllocationGap[];
  holdings: ResearchPacketHolding[];
  cashBalance: number;
  totalPortfolioValue: number;
}

interface BriefForPacket {
  date: Date;
  councilRecommendation: string;
  councilConfidence: number;
  marketOutlook: string;
  executiveSummary: string;
  decisionRationale: string;
  risks: ResearchPacketRisk[];
  opportunities: {
    company: { ticker: string } | null;
    thematicTitle: string | null;
    thesis: string;
    conviction: number;
  }[];
}

export function assembleResearchPacket(input: {
  holdings: HoldingWithCompany[];
  cashBalance: number;
  brief: BriefForPacket;
  allocationGaps: AllocationGap[];
}): ResearchPacket {
  const { holdings, cashBalance, brief, allocationGaps } = input;
  const totalPortfolioValue = computeTotalPortfolioValue(holdings, cashBalance);

  const packetHoldings: ResearchPacketHolding[] = holdings.map((h) => {
    const value = marketValue(h);
    return {
      ticker: h.company.ticker,
      companyName: h.company.name,
      sector: h.company.sector,
      region: h.company.region,
      quantity: h.quantity,
      costBasis: h.costBasis,
      currentPrice: h.company.currentPrice,
      marketValue: value,
      percentOfPortfolio: totalPortfolioValue > 0 ? (value / totalPortfolioValue) * 100 : 0,
      unrealizedGainPercent:
        h.costBasis > 0 ? ((h.company.currentPrice - h.costBasis) / h.costBasis) * 100 : 0,
    };
  });

  return {
    briefDate: brief.date.toISOString().slice(0, 10),
    councilRecommendation: brief.councilRecommendation,
    councilConfidence: brief.councilConfidence,
    marketOutlook: brief.marketOutlook,
    executiveSummary: brief.executiveSummary,
    decisionRationale: brief.decisionRationale,
    risks: brief.risks,
    opportunities: brief.opportunities.map((o) => ({
      companyTicker: o.company?.ticker ?? null,
      thematicTitle: o.thematicTitle,
      thesis: o.thesis,
      conviction: o.conviction,
    })),
    allocationGaps: allocationGaps.map((g) => ({
      category: g.category,
      actualPercent: g.actualPercent,
      targetPercent: g.targetPercent,
      status: g.status,
    })),
    holdings: packetHoldings,
    cashBalance,
    totalPortfolioValue,
  };
}
