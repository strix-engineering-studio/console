import "server-only";
import { prisma } from "@/lib/prisma";
import type { ActivityInput } from "../schemas";
export const activityRepository = {
  list: () => prisma.activity.findMany({ include: { lead: true, organization: true, person: true }, orderBy: { createdAt: "desc" }, take: 200 }),
  create: (data: ActivityInput) => prisma.activity.create({ data }),
};
