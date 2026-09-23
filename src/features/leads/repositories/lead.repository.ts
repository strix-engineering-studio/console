import { Prisma, type Lead as PrismaLead } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type {
  CreateLeadInput,
  LeadListQuery,
  LeadListResult,
  LeadRecord,
  UpdateLeadInput,
} from "../types";

const DEFAULT_WORKSPACE = {
  name: "Default Workspace",
  slug: "default-workspace",
};

const ensureDefaultWorkspace = () =>
  prisma.workspace.upsert({
    where: { slug: DEFAULT_WORKSPACE.slug },
    update: {},
    create: DEFAULT_WORKSPACE,
  });

const serializeDate = (value: Date | null): string | null =>
  value?.toISOString() ?? null;

const normalizeLead = (lead: PrismaLead): LeadRecord => ({
  id: lead.id,
  organizationLeadId: lead.organizationLeadId,
  personalLeadId: lead.personalLeadId,
  companyName: lead.companyName,
  domain: lead.domain,
  industry: lead.industry,
  location: lead.location,
  employeeCount: lead.employeeCount,
  status: lead.status,
  priority: lead.priority,
  source: lead.source,
  opportunityScore: lead.opportunityScore,
  researchStatus: lead.researchStatus,
  contactCount: lead.contactCount,
  notes: lead.notes,
  lastContactedAt: serializeDate(lead.lastContactedAt),
  createdAt: lead.createdAt.toISOString(),
  updatedAt: lead.updatedAt.toISOString(),
});

const toCreateData = (
  input: CreateLeadInput,
  workspaceId: string,
): Prisma.LeadCreateInput => ({
  organizationLeadId: input.organizationLeadId,
  personalLeadId: input.personalLeadId,
  companyName: input.companyName,
  domain: input.domain,
  industry: input.industry,
  location: input.location,
  employeeCount: input.employeeCount,
  status: input.status,
  priority: input.priority,
  source: input.source,
  opportunityScore: input.opportunityScore,
  notes: input.notes,
  workspace: { connect: { id: workspaceId } },
});

export const leadRepository = {
  async list(query: LeadListQuery): Promise<LeadListResult> {
    const workspace = await ensureDefaultWorkspace();
    const where: Prisma.LeadWhereInput = {
      workspaceId: workspace.id,
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.priority ? { priority: query.priority } : {}),
      ...(query.search
        ? {
            OR: [
              { companyName: { contains: query.search, mode: "insensitive" } },
              { domain: { contains: query.search, mode: "insensitive" } },
              { organizationLeadId: { contains: query.search, mode: "insensitive" } },
              { personalLeadId: { contains: query.search, mode: "insensitive" } },
              { industry: { contains: query.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [items, total] = await prisma.$transaction([
      prisma.lead.findMany({
        where,
        orderBy: { [query.sortBy]: query.sortOrder },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.lead.count({ where }),
    ]);

    return {
      items: items.map(normalizeLead),
      total,
      page: query.page,
      pageSize: query.pageSize,
      totalPages: Math.ceil(total / query.pageSize),
    };
  },

  async findById(id: string): Promise<LeadRecord | null> {
    const workspace = await ensureDefaultWorkspace();
    const lead = await prisma.lead.findFirst({
      where: { id, workspaceId: workspace.id, deletedAt: null },
    });
    return lead ? normalizeLead(lead) : null;
  },

  async create(input: CreateLeadInput): Promise<LeadRecord> {
    const workspace = await ensureDefaultWorkspace();
    const lead = await prisma.lead.create({
      data: toCreateData(input, workspace.id),
    });
    return normalizeLead(lead);
  },

  async update(id: string, input: UpdateLeadInput): Promise<LeadRecord | null> {
    const workspace = await ensureDefaultWorkspace();
    const existing = await prisma.lead.findFirst({
      where: { id, workspaceId: workspace.id, deletedAt: null },
    });
    if (!existing) return null;

    const lead = await prisma.lead.update({
      where: { id },
      data: {
        ...input,
        lastContactedAt:
          input.lastContactedAt === undefined
            ? undefined
            : input.lastContactedAt
              ? new Date(input.lastContactedAt)
              : null,
      },
    });
    return normalizeLead(lead);
  },

  async archive(id: string): Promise<boolean> {
    const workspace = await ensureDefaultWorkspace();
    const result = await prisma.lead.updateMany({
      where: { id, workspaceId: workspace.id, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    return result.count > 0;
  },
};
