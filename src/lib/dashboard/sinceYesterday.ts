import { RECOMMENDATION_LABEL } from "@/lib/labels";
import type { CouncilRecommendation } from "@prisma/client";
import type { PortfolioHealth } from "@/lib/portfolio/rules";

export interface SinceYesterdayItem {
  id: string;
  text: string;
}

interface BriefForComparison {
  councilRecommendation: CouncilRecommendation;
  councilConfidence: number;
  risks: { title: string }[];
  recommendedActions: { description: string; actionType: string }[];
}

export function computeSinceYesterday(
  yesterday: BriefForComparison,
  today: BriefForComparison,
  yesterdayHealth: PortfolioHealth["status"],
  todayHealth: PortfolioHealth["status"],
): SinceYesterdayItem[] {
  const items: SinceYesterdayItem[] = [];

  if (yesterday.councilRecommendation !== today.councilRecommendation) {
    items.push({
      id: "recommendation",
      text: `Recommendation changed from ${RECOMMENDATION_LABEL[yesterday.councilRecommendation]} to ${RECOMMENDATION_LABEL[today.councilRecommendation]}.`,
    });
  }

  const confidenceDelta = today.councilConfidence - yesterday.councilConfidence;
  if (confidenceDelta !== 0) {
    const direction = confidenceDelta > 0 ? "up" : "down";
    items.push({
      id: "confidence",
      text: `Confidence ${direction} ${Math.abs(confidenceDelta)} points, from ${yesterday.councilConfidence}% to ${today.councilConfidence}%.`,
    });
  }

  const yesterdayRiskTitles = new Set(yesterday.risks.map((r) => r.title));
  const todayRiskTitles = new Set(today.risks.map((r) => r.title));
  for (const risk of today.risks) {
    if (!yesterdayRiskTitles.has(risk.title)) {
      items.push({ id: `risk-new-${risk.title}`, text: `New risk identified: ${risk.title}.` });
    }
  }
  for (const risk of yesterday.risks) {
    if (!todayRiskTitles.has(risk.title)) {
      items.push({
        id: `risk-removed-${risk.title}`,
        text: `Risk no longer flagged: ${risk.title}.`,
      });
    }
  }

  const yesterdayActionDescriptions = new Set(
    yesterday.recommendedActions.map((a) => a.description),
  );
  const todayActionDescriptions = new Set(today.recommendedActions.map((a) => a.description));
  for (const action of today.recommendedActions) {
    if (!yesterdayActionDescriptions.has(action.description)) {
      items.push({
        id: `action-new-${action.description}`,
        text: `New recommendation: ${action.description}`,
      });
    }
  }
  for (const action of yesterday.recommendedActions) {
    if (!todayActionDescriptions.has(action.description)) {
      items.push({
        id: `action-removed-${action.description}`,
        text: `Recommendation removed: ${action.description}`,
      });
    }
  }

  if (yesterdayHealth !== todayHealth) {
    items.push({
      id: "health",
      text: `Portfolio Health changed from ${formatHealthStatus(yesterdayHealth)} to ${formatHealthStatus(todayHealth)}.`,
    });
  }

  return items;
}

function formatHealthStatus(status: PortfolioHealth["status"]): string {
  if (status === "ALIGNED") return "Aligned";
  if (status === "OVERWEIGHT") return "Overweight";
  return "Underweight";
}
