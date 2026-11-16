import "server-only";
import { prisma } from "@/lib/prisma";
import type { OrganizationInput } from "../schemas";
export const organizationRepository = {
  list: (q?: string, options: { limit?: number; page?: number; sortBy?: string; sortOrder?: "asc" | "desc"; filterBy?: string; filterValue?: string } = {}) => {
    const sortable = ["name", "industry", "companyStage", "country", "createdAt", "updatedAt"];
    const filterable = ["industry", "companyStage", "businessType", "country", "city", "relationshipStage"];
    const filter = options.filterBy && filterable.includes(options.filterBy) && options.filterValue
      ? { [options.filterBy]: options.filterValue }
      : undefined;
    return prisma.organization.findMany({
      where: {
        ...(q ? { OR: ["name", "legalName", "industry", "city", "country"].map((field) => ({ [field]: { contains: q, mode: "insensitive" } })) } : {}),
        ...(filter ?? {}),
      } as never,
      include: { _count: { select: { people: true, leads: true } } },
      orderBy: { [options.sortBy && sortable.includes(options.sortBy) ? options.sortBy : "updatedAt"]: options.sortOrder ?? "desc" } as never,
      skip: ((options.page ?? 1) - 1) * (options.limit ?? 20),
      take: options.limit ?? 20,
    });
  },
  findById: (id: string) => prisma.organization.findUnique({ where: { id }, include: { people: true, leads: true, research: { orderBy: { createdAt: "desc" } }, activities: { orderBy: { createdAt: "desc" }, take: 10 } } }),
  findByName: (name: string) => prisma.organization.findFirst({ where: { name: { equals: name, mode: "insensitive" } } }),
  create: (data: OrganizationInput) => prisma.organization.create({ data }),
  update: (id: string, data: Partial<OrganizationInput>) => prisma.organization.update({ where: { id }, data }),
  delete: (id: string) => prisma.organization.delete({ where: { id } }),
};
