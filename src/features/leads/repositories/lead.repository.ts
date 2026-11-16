import "server-only";
import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";
import type { LeadInput } from "../schemas";

function deterministicLeadId(importKey: string) {
  const normalized = importKey.normalize("NFKD").trim().toLocaleLowerCase("en").replace(/\s+/g, " ");
  const bytes = createHash("sha256").update(`lead:${normalized}`).digest();
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.subarray(0, 16).toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function leadNaturalKey(name: string, organizationId?: string | null, personId?: string | null) {
  const normalizedName = name.normalize("NFKD").toLocaleLowerCase("en")
    .replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
  return `${normalizedName}|${organizationId ?? ""}|${personId ?? ""}`;
}

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
      ...(options.limit ? {
        skip: ((options.page ?? 1) - 1) * options.limit,
        take: options.limit,
      } : {}),
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
  importByKey: async (records: Array<LeadInput & { importKey: string }>) => {
    const existingLeads = await prisma.lead.findMany({
      select: { id: true, name: true, organizationId: true, personId: true },
    });
    const seen = new Set<string>();
    const results = [];
    for (const [index, { importKey, ...record }] of records.entries()) {
      const normalizedKey = importKey.normalize("NFKD").trim().toLocaleLowerCase("en").replace(/\s+/g, " ");
      if (!normalizedKey || seen.has(normalizedKey)) {
        results.push({ index, success: false as const, error: "A unique source importKey is required for every lead in the batch." });
        continue;
      }
      seen.add(normalizedKey);
      const id = deterministicLeadId(normalizedKey);
      try {
        const existing = await prisma.lead.findUnique({ where: { id } });
        if (existing) {
          const lead = await prisma.lead.update({ where: { id }, data: record as never });
          results.push({ index, success: true as const, action: "updated" as const, record: lead });
          continue;
        }

        if (existingLeads.some((candidate) =>
          leadNaturalKey(candidate.name, candidate.organizationId, candidate.personId) ===
          leadNaturalKey(record.name, record.organizationId, record.personId))) {
          results.push({ index, success: false as const, error: "A possible existing lead matches the name and linked records; reconcile it before importing." });
          continue;
        }

        try {
          const lead = await prisma.lead.create({ data: { ...record, id } as never });
          existingLeads.push({ id: lead.id, name: lead.name, organizationId: lead.organizationId, personId: lead.personId });
          await prisma.activity.create({
            data: { type: "LEAD_CREATED", title: `Lead created: ${lead.name}`, leadId: lead.id },
          }).catch(() => undefined);
          results.push({ index, success: true as const, action: "created" as const, record: lead });
        } catch (createError) {
          const raced = await prisma.lead.findUnique({ where: { id } });
          if (!raced) throw createError;
          const lead = await prisma.lead.update({ where: { id }, data: record as never });
          results.push({ index, success: true as const, action: "updated" as const, record: lead });
        }
      } catch {
        results.push({ index, success: false as const, error: "Record could not be created or updated." });
      }
    }
    return results;
  },
  update: (id: string, data: Partial<LeadInput>) =>
    prisma.lead.update({
      where: { id },
      data,
      include: { organization: true, person: true },
    }),
  delete: (id: string) => prisma.lead.delete({ where: { id } }),
};
