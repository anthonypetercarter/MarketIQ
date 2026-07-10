import { prisma } from "@/lib/prisma";

export async function getPortfolioWithBriefContext() {
  const portfolio = await prisma.portfolio.findFirst({
    include: {
      holdings: {
        include: { company: true },
      },
    },
  });

  if (!portfolio) return null;

  const brief = await prisma.brief.findFirst({
    orderBy: { date: "desc" },
    include: {
      allocationTargets: true,
      opportunities: { include: { company: true } },
      recommendedActions: true,
    },
  });

  if (!brief) return null;

  return { portfolio, brief };
}

export type PortfolioWithBriefContext = Awaited<ReturnType<typeof getPortfolioWithBriefContext>>;
