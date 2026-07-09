import { prisma } from "@/lib/prisma";

/**
 * The Dashboard only needs the latest Brief plus the relations its approved
 * hierarchy actually shows: top opportunities, primary risks, and the
 * allocation targets. Council assessments are intentionally NOT fetched
 * here — the full nine-voice summary is a Brief-only surface.
 */
export async function getLatestBrief() {
  return prisma.brief.findFirst({
    orderBy: { date: "desc" },
    include: {
      opportunities: {
        include: { company: true },
        orderBy: { conviction: "desc" },
        take: 3,
      },
      risks: {
        take: 2,
      },
      allocationTargets: {
        orderBy: { targetPercent: "desc" },
      },
      user: true,
    },
  });
}

export type LatestBrief = Awaited<ReturnType<typeof getLatestBrief>>;

/**
 * The Brief page is the evidence layer — it needs everything the Dashboard
 * deliberately leaves out: all nine Council assessments, each Risk's
 * traceability back to the assessments that raised it, and the full
 * Recommended Actions list.
 */
export async function getLatestBriefDetail() {
  return prisma.brief.findFirst({
    orderBy: { date: "desc" },
    include: {
      user: true,
      councilAssessments: true,
      opportunities: {
        include: { company: true },
        orderBy: { conviction: "desc" },
      },
      risks: {
        include: { sourceAssessments: true },
      },
      recommendedActions: {
        include: { company: true },
        orderBy: { displayOrder: "asc" },
      },
      allocationTargets: {
        orderBy: { targetPercent: "desc" },
      },
    },
  });
}

export type LatestBriefDetail = Awaited<ReturnType<typeof getLatestBriefDetail>>;
