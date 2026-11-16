import "server-only";
import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";
import type { PersonInput } from "../schemas";

function personIdentityKeys(record: Pick<PersonInput, "email" | "linkedinUrl">) {
  const keys: string[] = [];
  if (record.email?.trim()) keys.push(`email:${record.email.trim().toLocaleLowerCase("en")}`);
  if (record.linkedinUrl?.trim()) {
    const profile = record.linkedinUrl.trim().toLocaleLowerCase("en")
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split(/[?#]/)[0]
      .replace(/\/+$/, "");
    keys.push(`linkedin:${profile}`);
  }
  return keys;
}

function personNameOrganizationKey(name: string, organizationId?: string | null) {
  const normalizedName = name.normalize("NFKD").toLocaleLowerCase("en")
    .replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
  return `${normalizedName}|${organizationId ?? ""}`;
}

function deterministicPersonId(key: string) {
  const bytes = createHash("sha256").update(key).digest();
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.subarray(0, 16).toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

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
  importByIdentity: async (records: PersonInput[]) => {
    const existing = await prisma.person.findMany({ select: { id: true, name: true, organizationId: true, email: true, linkedinUrl: true } });
    const identities = new Map<string, Set<string>>();
    const unkeyedPeople = new Map<string, Set<string>>();
    const addIdentity = (key: string, id: string) => {
      const ids = identities.get(key) ?? new Set<string>();
      ids.add(id);
      identities.set(key, ids);
    };
    for (const person of existing) {
      const keys = personIdentityKeys(person);
      for (const key of keys) addIdentity(key, person.id);
      if (keys.length === 0) {
        const key = personNameOrganizationKey(person.name, person.organizationId);
        const ids = unkeyedPeople.get(key) ?? new Set<string>();
        ids.add(person.id);
        unkeyedPeople.set(key, ids);
      }
    }

    const seenKeys = new Set<string>();
    const results = [];
    for (const [index, record] of records.entries()) {
      const keys = personIdentityKeys(record);
      if (keys.length === 0) {
        results.push({ index, success: false as const, error: "Email or LinkedIn profile is required for safe person matching." });
        continue;
      }
      if (keys.some((key) => seenKeys.has(key))) {
        results.push({ index, success: false as const, error: "Duplicate person identity in this batch." });
        continue;
      }
      keys.forEach((key) => seenKeys.add(key));

      const possibleLegacyMatch = unkeyedPeople.get(personNameOrganizationKey(record.name, record.organizationId));
      if (possibleLegacyMatch?.size) {
        results.push({ index, success: false as const, error: "A matching person without email or LinkedIn exists; reconcile that record before importing." });
        continue;
      }

      try {
      const candidateIds = new Set(keys.flatMap((key) => [...(identities.get(key) ?? [])]));
      if (candidateIds.size > 1) {
        results.push({ index, success: false as const, error: "Email and LinkedIn profile match different people; reconcile before importing." });
        continue;
      }
      if (candidateIds.size === 1) {
        const id = [...candidateIds][0];
        const person = await prisma.person.update({ where: { id }, data: record as never });
        keys.forEach((key) => addIdentity(key, id));
        results.push({ index, success: true as const, action: "updated" as const, record: person });
        continue;
      }

      const stableKey = keys.find((key) => key.startsWith("email:")) ?? keys[0];
      const id = deterministicPersonId(stableKey);
      try {
        const person = await prisma.person.create({ data: { ...record, id } as never });
        keys.forEach((key) => addIdentity(key, id));
        results.push({ index, success: true as const, action: "created" as const, record: person });
      } catch (createError) {
        const raced = await prisma.person.findUnique({ where: { id } });
        if (!raced || !personIdentityKeys(raced).includes(stableKey)) {
          results.push({ index, success: false as const, error: "Record could not be created or matched safely." });
          continue;
        }
        const person = await prisma.person.update({ where: { id }, data: record as never });
        keys.forEach((key) => addIdentity(key, id));
        results.push({ index, success: true as const, action: "updated" as const, record: person });
      }
      } catch {
        results.push({ index, success: false as const, error: "Record could not be created or updated." });
      }
    }
    return results;
  },
  update: (id: string, data: Partial<PersonInput>) =>
    prisma.person.update({ where: { id }, data }),
  delete: (id: string) => prisma.person.delete({ where: { id } }),
};
