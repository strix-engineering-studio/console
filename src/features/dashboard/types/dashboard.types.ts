import type { ActivityType } from "@/features/activity/types";
import type { LeadSource, LeadStatus } from "@/features/leads/types";
import type { OrganizationBusinessType } from "@/features/organizations/types";

export type DashboardFilters = {
  from?: string;
  to?: string;
  industry?: string;
  city?: string;
  organizationType?: OrganizationBusinessType;
  leadStage?: LeadStatus;
  researchStatus?: "PENDING" | "RUNNING" | "COMPLETE" | "FAILED";
  source?: LeadSource;
  activityType?: ActivityType;
  activityLimit?: number;
};

export type DashboardSummary = {
  filters: DashboardFilters;
  options: { industries: string[]; cities: string[] };
  overview: {
    organizations: number;
    people: number;
    leads: number;
    qualifiedLeads: number;
    activeOpportunities: null;
    businessSignals: number;
    previous: { organizations: number | null; people: number | null; leads: number | null };
  };
  actions: {
    dueToday: number;
    overdue: number;
    newQualified: number;
    awaitingResponse: number;
    organizationsToEnrich: number;
    incompleteResearch: number;
  };
  sales: {
    byStage: { name: string; count: number }[];
    bySource: { name: string; count: number }[];
    trend: { name: string; count: number }[];
    won: number;
    lost: number;
  };
  signals: {
    id: string;
    name: string;
    city: string | null;
    industry: string | null;
    type: string;
    summary: string;
    sourceUrl: string;
    date: string | null;
    confidence: number | null;
  }[];
  research: { total: number; completed: number; failed: number; pending: number; organizationsEnriched: number; peopleDiscovered: number; bySource: { name: string; count: number }[] };
  market: { industries: { name: string; count: number }[]; cities: { name: string; count: number }[]; geography: { name: string; organizations: number; leads: number; qualifiedLeads: number }[]; technologies: { name: string; count: number }[]; fundingProfiles: number };
  quality: { duplicateOrganizations: number; incompleteOrganizations: number; peopleMissingContact: number; unverifiedContacts: number; missingIndustry: number; missingProvenance: number; staleResearch: number };
  sources: { name: string; organizations: number; leads: number; people: number }[];
  activity: { id: string; type: ActivityType; title: string; createdAt: string; leadId: string | null; leadName: string | null; organizationId: string | null; organizationName: string | null; personId: string | null; personName: string | null; sourceUrl: string | null }[];
  activityTotal: number;
};
