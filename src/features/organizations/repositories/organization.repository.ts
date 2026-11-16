import "server-only";
import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";
import type { OrganizationInput } from "../schemas";

function normalizeIdentityPart(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("en")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function organizationIdentity(name: string, address: string) {
  return JSON.stringify([
    normalizeIdentityPart(name),
    normalizeIdentityPart(address),
  ]);
}

function deterministicOrganizationId(identity: string) {
  const bytes = createHash("sha256").update(identity).digest();
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.subarray(0, 16).toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

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
      ...(options.limit ? {
        skip: ((options.page ?? 1) - 1) * options.limit,
        take: options.limit,
      } : {}),
    });
  },
  findById: (id: string) => prisma.organization.findUnique({ where: { id }, include: { people: true, leads: true, research: { orderBy: { createdAt: "desc" } }, activities: { orderBy: { createdAt: "desc" }, take: 10 } } }),
  findByName: (name: string) => prisma.organization.findFirst({ where: { name: { equals: name, mode: "insensitive" } } }),
  create: (data: OrganizationInput) => prisma.organization.create({ data }),
  importByIdentity: async (records: OrganizationInput[]) => {
    const existing = await prisma.organization.findMany({
      select: { id: true, name: true, address: true },
    });
    const matches = new Map<string, string[]>();
    const missingAddressByName = new Map<string, string[]>();
    for (const row of existing) {
      if (!row.address?.trim()) {
        const nameKey = normalizeIdentityPart(row.name);
        missingAddressByName.set(nameKey, [
          ...(missingAddressByName.get(nameKey) ?? []),
          row.id,
        ]);
        continue;
      }
      const key = organizationIdentity(row.name, row.address);
      matches.set(key, [...(matches.get(key) ?? []), row.id]);
    }

    const seen = new Set<string>();
    const results = [];
    for (const [index, record] of records.entries()) {
      const address = record.address?.trim();
      if (!record.name.trim() || !address) {
        results.push({ index, success: false as const, error: "A company name and address are required for safe matching." });
        continue;
      }

      const key = organizationIdentity(record.name, address);
      const nameKey = normalizeIdentityPart(record.name);
      if (missingAddressByName.has(nameKey)) {
        results.push({ index, success: false as const, error: "An existing organization with this name has no address; reconcile it before importing." });
        continue;
      }
      if (seen.has(key)) {
        results.push({ index, success: false as const, error: "Duplicate company name and address in this batch." });
        continue;
      }
      seen.add(key);

      const candidates = matches.get(key) ?? [];
      if (candidates.length > 1) {
        results.push({ index, success: false as const, error: "Multiple existing organizations match this company and address; reconcile them before importing." });
        continue;
      }

      const deterministicId = deterministicOrganizationId(key);
      try {
        if (candidates.length === 1) {
          const row = await prisma.organization.update({
            where: { id: candidates[0] },
            data: record as never,
            select: { id: true, name: true, address: true },
          });
          results.push({ index, success: true as const, action: "updated" as const, record: row });
          continue;
        }

        const byId = await prisma.organization.findUnique({ where: { id: deterministicId } });
        if (byId) {
          if (!byId.address || organizationIdentity(byId.name, byId.address) !== key) {
            results.push({ index, success: false as const, error: "Deterministic identity conflicts with an existing organization." });
            continue;
          }
          const row = await prisma.organization.update({
            where: { id: deterministicId },
            data: record as never,
            select: { id: true, name: true, address: true },
          });
          results.push({ index, success: true as const, action: "updated" as const, record: row });
          matches.set(key, [row.id]);
          continue;
        }

        try {
          const row = await prisma.organization.create({
            data: { ...record, id: deterministicId } as never,
            select: { id: true, name: true, address: true },
          });
          results.push({ index, success: true as const, action: "created" as const, record: row });
          matches.set(key, [row.id]);
        } catch (createError) {
          // A concurrent retry can win the deterministic _id first. Re-read
          // it and update only when it represents the same normalized identity.
          const raced = await prisma.organization.findUnique({ where: { id: deterministicId } });
          if (!raced?.address || organizationIdentity(raced.name, raced.address) !== key) {
            throw createError;
          }
          const row = await prisma.organization.update({
            where: { id: deterministicId },
            data: record as never,
            select: { id: true, name: true, address: true },
          });
          results.push({ index, success: true as const, action: "updated" as const, record: row });
          matches.set(key, [row.id]);
        }
      } catch {
        results.push({ index, success: false as const, error: "Record could not be created or updated." });
      }
    }

    return results;
  },
  update: (id: string, data: Partial<OrganizationInput>) => prisma.organization.update({ where: { id }, data }),
  delete: (id: string) => prisma.organization.delete({ where: { id } }),
};
