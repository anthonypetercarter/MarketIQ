import { prisma } from "@/lib/prisma";

/**
 * The Brief page is the evidence layer — nine Council assessments, each
 * Risk's traceability back to the assessments that raised it, the full
 * Recommended Actions list.
 *
 * Since Yesterday (moved here from the retired Dashboard) needs yesterday's
 * Brief for a straight Brief-vs-Brief diff, plus the real Portfolio for its
 * one portfolio-dependent item ("Portfolio Health changed"). This is a
 * deliberate, narrow exception to decision #4's Brief/Portfolio separation
 * — Brief fetches Portfolio only for this one comparison, nothing else on
 * the page touches it. Worth documenting rather than leaving silent.
 */
export async function getBriefWithSinceYesterday() {
  const [briefs, portfolio] = await Promise.all([
    prisma.brief.findMany({
      orderBy: { date: "desc" },
      take: 2,
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
    }),
    prisma.portfolio.findFirst({
      include: { holdings: { include: { company: true } } },
    }),
  ]);

  const [today, yesterday] = briefs;
  if (!today) return null;

  return { today, yesterday: yesterday ?? null, portfolio: portfolio ?? null };
}

export type BriefWithSinceYesterday = Awaited<ReturnType<typeof getBriefWithSinceYesterday>>;
