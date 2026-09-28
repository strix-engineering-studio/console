import "server-only";
import { prisma } from "@/lib/prisma";
import type { LeadInput } from "../schemas";

export const leadRepository = {
  list: (q?: string, status?: string) =>
    prisma.lead.findMany({
      where: {
        ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
        ...(status ? { status: status as never } : {}),
      },
      include: { organization: true, person: true },
      orderBy: { updatedAt: "desc" },
      take: 250,
    }),
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
