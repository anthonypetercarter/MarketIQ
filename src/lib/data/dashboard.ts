import { prisma } from "@/lib/prisma";

export async function getDashboardData() {
  const [briefs, portfolio] = await Promise.all([
    prisma.brief.findMany({
      orderBy: { date: "desc" },
      take: 2,
      include: {
        recommendedActions: {
          include: { company: true },
          orderBy: { displayOrder: "asc" },
        },
        risks: true,
        allocationTargets: true,
        user: true,
      },
    }),
    prisma.portfolio.findFirst({
      include: { holdings: { include: { company: true } } },
    }),
  ]);

  const [today, yesterday] = briefs;

  if (!today || !portfolio) return null;

  return { today, yesterday: yesterday ?? null, portfolio };
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;
