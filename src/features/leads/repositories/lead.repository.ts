import "server-only";
import { prisma } from "@/lib/prisma";
import type { LeadInput } from "../schemas";

export const leadRepository = {
  list: (q?: string, options: { limit?: number; page?: number; sortBy?: string; sortOrder?: "asc" | "desc"; filterBy?: string; filterValue?: string } = {}) => {
    const sortable = ["name", "status", "priority", "source", "createdAt", "updatedAt", "overallScore"];
    const filterable = ["status", "priority", "source", "qualificationStatus", "organizationId", "personId"];
    const filter = options.filterBy && filterable.includes(options.filterBy) && options.filterValue
      ? { [options.filterBy]: options.filterValue }
      : undefined;
    return prisma.lead.findMany({
      where: {
        ...(q ? { OR: ["name", "description"].map((field) => ({ [field]: { contains: q, mode: "insensitive" } })) } : {}),
        ...(filter ?? {}),
      } as never,
      include: { organization: true, person: true },
      orderBy: { [options.sortBy && sortable.includes(options.sortBy) ? options.sortBy : "updatedAt"]: options.sortOrder ?? "desc" } as never,
      skip: ((options.page ?? 1) - 1) * (options.limit ?? 20),
      take: options.limit ?? 20,
    });
  },
  findById: (id: string) =>
    prisma.lead.findUnique({
      where: { id },
      include: {
        organization: true,
        person: true,
        research: { orderBy: { createdAt: "desc" } },
        activities: { orderBy: { createdAt: "desc" } },
      },
    }),
  create: async (data: LeadInput) => {
    const lead = await prisma.lead.create({
      data,
      include: { organization: true, person: true },
    });
    await prisma.activity.create({
      data: {
        type: "LEAD_CREATED",
        title: `Lead created: ${lead.name}`,
        leadId: lead.id,
      },
    });
    return lead;
  },
  update: (id: string, data: Partial<LeadInput>) =>
    prisma.lead.update({
      where: { id },
      data,
      include: { organization: true, person: true },
    }),
  delete: (id: string) => prisma.lead.delete({ where: { id } }),
};
