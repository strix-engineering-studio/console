import "server-only";
import { prisma } from "@/lib/prisma";
import type { PersonInput } from "../schemas";
export const personRepository = {
  list: (q?: string) => prisma.person.findMany({ where: q ? { name: { contains: q, mode: "insensitive" } } : {}, include: { organization: true, _count: { select: { leads: true } } }, orderBy: { updatedAt: "desc" }, take: 250 }),
  findById: (id: string) => prisma.person.findUnique({ where: { id }, include: { organization: true, leads: true, research: { orderBy: { createdAt: "desc" } }, activities: { orderBy: { createdAt: "desc" }, take: 10 } } }),
  findByEmail: (email: string) => prisma.person.findFirst({ where: { email: { equals: email, mode: "insensitive" } } }),
  create: (data: PersonInput) => prisma.person.create({ data }),
  update: (id: string, data: Partial<PersonInput>) => prisma.person.update({ where: { id }, data }),
  delete: (id: string) => prisma.person.delete({ where: { id } }),
};
