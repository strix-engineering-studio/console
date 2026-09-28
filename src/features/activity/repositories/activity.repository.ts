import "server-only";
import { prisma } from "@/lib/prisma";
import type { ActivityInput } from "../schemas";
export const activityRepository = {
  list: () =>
    prisma.activity.findMany({
      include: { lead: true, organization: true, person: true },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
  findById: (id: string) =>
    prisma.activity.findUnique({
      where: { id },
      include: { lead: true, organization: true, person: true },
    }),
  create: (data: ActivityInput) => prisma.activity.create({ data }),
};
