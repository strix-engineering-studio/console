import "server-only";
import { prisma } from "@/lib/prisma";
import type { PersonInput } from "../schemas";
export const personRepository = {
  list: (q?: string, options: { limit?: number; page?: number; sortBy?: string; sortOrder?: "asc" | "desc"; filterBy?: string; filterValue?: string } = {}) => {
    const sortable = ["name", "title", "seniority", "createdAt", "updatedAt"];
    const filterable = ["seniority", "buyingRole", "country", "city", "organizationId", "isDecisionMaker"];
    const filter = options.filterBy && filterable.includes(options.filterBy) && options.filterValue
      ? { [options.filterBy]: options.filterValue }
      : undefined;
    return prisma.person.findMany({
      where: {
        ...(q ? { OR: ["name", "email", "title", "city", "country"].map((field) => ({ [field]: { contains: q, mode: "insensitive" } })) } : {}),
        ...(filter ?? {}),
      } as never,
      include: { organization: true, _count: { select: { leads: true } } },
      orderBy: { [options.sortBy && sortable.includes(options.sortBy) ? options.sortBy : "updatedAt"]: options.sortOrder ?? "desc" } as never,
      skip: ((options.page ?? 1) - 1) * (options.limit ?? 20),
      take: options.limit ?? 20,
    });
  },
  findById: (id: string) =>
    prisma.person.findUnique({
      where: { id },
      include: {
        organization: true,
        leads: true,
        research: { orderBy: { createdAt: "desc" } },
        activities: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    }),
  findByEmail: (email: string) =>
    prisma.person.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    }),
  create: (data: PersonInput) => prisma.person.create({ data }),
  update: (id: string, data: Partial<PersonInput>) =>
    prisma.person.update({ where: { id }, data }),
  delete: (id: string) => prisma.person.delete({ where: { id } }),
};
