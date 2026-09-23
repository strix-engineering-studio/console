import type { LeadPriority, LeadStatus, ResearchStatus } from "@prisma/client";

export type { LeadPriority, LeadStatus, ResearchStatus };

export interface LeadRecord {
  id: string;
  organizationLeadId: string;
  personalLeadId: string;
  companyName: string;
  domain: string | null;
  industry: string | null;
  location: string | null;
  employeeCount: number | null;
  status: LeadStatus;
  priority: LeadPriority;
  source: string | null;
  opportunityScore: number | null;
  researchStatus: ResearchStatus;
  contactCount: number;
  notes: string | null;
  lastContactedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeadInput {
  organizationLeadId?: string;
  personalLeadId?: string;
  companyName: string;
  domain?: string;
  industry?: string;
  location?: string;
  employeeCount?: number;
  status?: LeadStatus;
  priority?: LeadPriority;
  source?: string;
  opportunityScore?: number;
  notes?: string;
}

export type UpdateLeadInput = Partial<CreateLeadInput> & {
  researchStatus?: ResearchStatus;
  contactCount?: number;
  lastContactedAt?: string | null;
};

export interface LeadListQuery {
  page: number;
  pageSize: number;
  search?: string;
  status?: LeadStatus;
  priority?: LeadPriority;
  sortBy: "createdAt" | "updatedAt" | "companyName" | "status" | "priority";
  sortOrder: "asc" | "desc";
}

export interface LeadListResult {
  items: LeadRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
