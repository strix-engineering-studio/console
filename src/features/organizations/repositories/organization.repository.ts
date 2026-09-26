import "server-only";
import { prisma } from "@/lib/prisma";
import type { OrganizationInput } from "../schemas";
export const organizationRepository = {
  list: (q?: string) => prisma.organization.findMany({ where: q ? { name: { contains: q, mode: "insensitive" } } : {}, include: { _count: { select: { people: true, leads: true } } }, orderBy: { updatedAt: "desc" }, take: 250 }),
  findById: (id: string) => prisma.organization.findUnique({ where: { id }, include: { people: true, leads: true, research: { orderBy: { createdAt: "desc" } }, activities: { orderBy: { createdAt: "desc" }, take: 10 } } }),
  findByName: (name: string) => prisma.organization.findFirst({ where: { name: { equals: name, mode: "insensitive" } } }),
  create: (data: OrganizationInput) => prisma.organization.create({ data }),
  update: (id: string, data: Partial<OrganizationInput>) => prisma.organization.update({ where: { id }, data }),
};
