import "server-only";
import { prisma } from "@/lib/prisma";
export const dashboardRepository = {
  summary: async () => {
    const [total, fresh, researching, engaged, leads, activityCount] = await Promise.all([
      prisma.lead.count(), prisma.lead.count({ where: { status: "NEW" } }), prisma.lead.count({ where: { status: "RESEARCHING" } }), prisma.lead.count({ where: { status: "ENGAGED" } }),
      prisma.lead.findMany({ orderBy: { updatedAt: "desc" }, take: 8, select: { id: true, name: true, status: true, updatedAt: true } }), prisma.activity.count(),
    ]);
    return { total, fresh, researching, engaged, leads, activityCount };
  },
};
