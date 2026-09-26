import "server-only";
import { prisma } from "@/lib/prisma";
export const researchRepository = {
  list: () => prisma.researchRun.findMany({ include: { lead: true, organization: true, person: true }, orderBy: { createdAt: "desc" }, take: 100 }),
  findById: (id: string) => prisma.researchRun.findUnique({ where: { id }, include: { lead: true, organization: true, person: true } }),
};
