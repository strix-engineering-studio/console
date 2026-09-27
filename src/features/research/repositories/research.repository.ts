import "server-only";
import { prisma } from "@/lib/prisma";
import type { ResearchInput } from "../schemas";
export const researchRepository = {
  list: () => prisma.researchRun.findMany({ include: { lead: true, organization: true, person: true }, orderBy: { createdAt: "desc" }, take: 100 }),
  findById: (id: string) => prisma.researchRun.findUnique({ where: { id }, include: { lead: true, organization: true, person: true } }),
  create: (data: ResearchInput) => prisma.researchRun.create({ data }),
  update: (id: string, data: Partial<ResearchInput>) => prisma.researchRun.update({ where: { id }, data }),
  delete: (id: string) => prisma.researchRun.delete({ where: { id } }),
};
