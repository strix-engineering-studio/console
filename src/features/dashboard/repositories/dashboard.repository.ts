import "server-only";
import { prisma } from "@/lib/prisma";
import type { DashboardFilters, DashboardSummary } from "../types/dashboard.types";

const leadStages = ["NEW", "RESEARCHING", "CONTACTED", "ENGAGED", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST", "DISQUALIFIED"] as const;

function dateRange(from?: string, to?: string) {
  const gte = from ? new Date(`${from}T00:00:00.000Z`) : undefined;
  const lt = to ? addDays(new Date(`${to}T00:00:00.000Z`), 1) : undefined;
  return gte || lt ? { ...(gte ? { gte } : {}), ...(lt ? { lt } : {}) } : undefined;
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function normalized(value: string) {
  return value.normalize("NFKD").toLocaleLowerCase("en").replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}

function countBy<T>(items: T[], getName: (item: T) => string | null | undefined) {
  const counts = new Map<string, number>();
  for (const item of items) {
    const name = getName(item)?.trim();
    if (name) counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return [...counts].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
}

export const dashboardRepository = {
  summary: async (filters: DashboardFilters = {}): Promise<DashboardSummary> => {
    const createdAt = dateRange(filters.from, filters.to);
    const orgWhere = {
      ...(createdAt ? { createdAt } : {}),
      ...(filters.industry ? { industry: { equals: filters.industry, mode: "insensitive" } } : {}),
      ...(filters.city ? { city: { equals: filters.city, mode: "insensitive" } } : {}),
      ...(filters.organizationType ? { businessType: filters.organizationType } : {}),
      ...(filters.source ? { discoverySource: filters.source } : {}),
    } as Record<string, unknown>;
    const relatedOrgFilter = {
      ...(filters.industry ? { industry: { equals: filters.industry, mode: "insensitive" } } : {}),
      ...(filters.city ? { city: { equals: filters.city, mode: "insensitive" } } : {}),
      ...(filters.organizationType ? { businessType: filters.organizationType } : {}),
    };
    const leadWhere = {
      ...(createdAt ? { createdAt } : {}),
      ...(filters.leadStage ? { status: filters.leadStage } : {}),
      ...(filters.source ? { source: filters.source } : {}),
      ...(Object.keys(relatedOrgFilter).length ? { organization: { is: relatedOrgFilter } } : {}),
    } as Record<string, unknown>;
    const personWhere = {
      ...(createdAt ? { createdAt } : {}),
      ...(filters.source ? { discoverySource: filters.source } : {}),
      ...(Object.keys(relatedOrgFilter).length ? { organization: { is: relatedOrgFilter } } : {}),
    } as Record<string, unknown>;
    const researchWhere = {
      ...(createdAt ? { createdAt } : {}),
      ...(filters.researchStatus ? { status: filters.researchStatus } : {}),
      ...(Object.keys(relatedOrgFilter).length ? { organization: { is: relatedOrgFilter } } : {}),
    } as Record<string, unknown>;
    const activityWhere = {
      ...(createdAt ? { createdAt } : {}),
      ...(filters.activityType ? { type: filters.activityType } : {}),
      ...(Object.keys(relatedOrgFilter).length ? { organization: { is: relatedOrgFilter } } : {}),
    } as Record<string, unknown>;

    const [organizations, people, leads, researchRuns, activity, activityTotal, previousCounts] = await Promise.all([
      prisma.organization.findMany({ where: orgWhere as never, select: { id: true, name: true, industry: true, subIndustry: true, city: true, businessType: true, discoverySource: true, discoveryUrl: true, discoveredAt: true, lastResearchAt: true, researchConfidence: true, website: true, hiringSignals: true, growthSignals: true, technologySignals: true, opportunitySignals: true, painPoints: true, technologies: true, fundingStage: true, totalFunding: true, address: true } }),
      prisma.person.findMany({ where: personWhere as never, select: { id: true, email: true, phone: true, emailVerified: true, phoneVerified: true, discoverySource: true } }),
      prisma.lead.findMany({ where: leadWhere as never, select: { id: true, name: true, status: true, source: true, createdAt: true, updatedAt: true, nextFollowUpAt: true, lastRespondedAt: true, responseCount: true, organizationId: true, personId: true, organization: { select: { city: true } } } }),
      prisma.researchRun.findMany({ where: researchWhere as never, select: { id: true, status: true, provider: true, trigger: true, createdAt: true, completedAt: true, organizationId: true, personId: true } }),
      prisma.activity.findMany({ where: activityWhere as never, include: { lead: { select: { id: true, name: true } }, organization: { select: { id: true, name: true } }, person: { select: { id: true, name: true } } }, orderBy: { createdAt: "desc" }, take: Math.min(Math.max(filters.activityLimit ?? 10, 1), 50) }),
      prisma.activity.count({ where: activityWhere as never }),
      (async () => {
        if (!filters.from || !filters.to) return { organizations: null, people: null, leads: null };
        const fromDate = new Date(`${filters.from}T00:00:00.000Z`);
        const toDate = new Date(`${filters.to}T00:00:00.000Z`);
        const duration = Math.max(1, addDays(toDate, 1).getTime() - fromDate.getTime());
        const previousFrom = new Date(fromDate.getTime() - duration);
        const previousTo = fromDate;
        const previousRange = { gte: previousFrom, lt: previousTo };
        const [organizations, people, leads] = await Promise.all([
          prisma.organization.count({ where: { ...orgWhere, createdAt: previousRange } as never }),
          prisma.person.count({ where: { ...personWhere, createdAt: previousRange } as never }),
          prisma.lead.count({ where: { ...leadWhere, createdAt: previousRange } as never }),
        ]);
        return { organizations, people, leads };
      })(),
    ]);

    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const tomorrow = addDays(today, 1);
    const openLeadWhere = {
      ...(filters.leadStage ? { status: filters.leadStage } : { status: { notIn: ["WON", "LOST", "DISQUALIFIED"] } }),
      ...(filters.source ? { source: filters.source } : {}),
      ...(Object.keys(relatedOrgFilter).length ? { organization: { is: relatedOrgFilter } } : {}),
    } as Record<string, unknown>;
    const [dueToday, overdue, awaitingResponse, completedInPeriod] = await Promise.all([
      prisma.lead.count({ where: { ...openLeadWhere, nextFollowUpAt: { gte: today, lt: tomorrow } } as never }),
      prisma.lead.count({ where: { ...openLeadWhere, nextFollowUpAt: { lt: today } } as never }),
      prisma.lead.count({ where: { ...leadWhere, status: "CONTACTED", responseCount: 0 } as never }),
      prisma.researchRun.count({ where: { ...researchWhere, status: "COMPLETE", ...(createdAt ? { completedAt: createdAt } : {}) } as never }),
    ]);

    const qualifiedLeads = leads.filter((lead) => lead.status === "QUALIFIED").length;
    const businessSignals = organizations.filter((org) => Boolean(org.discoveryUrl) && [org.hiringSignals, org.growthSignals, org.technologySignals, org.opportunitySignals, org.painPoints].some((signals) => signals.length > 0));
    const sourcedSignals = organizations.flatMap((org) => {
      if (!org.discoveryUrl) return [];
      const signal = [org.hiringSignals, org.growthSignals, org.technologySignals, org.opportunitySignals, org.painPoints].flat()[0];
      if (!signal) return [];
      const type = org.hiringSignals.length ? "Hiring" : org.growthSignals.length ? "Growth" : org.technologySignals.length ? "Technology" : org.opportunitySignals.length ? "Opportunity" : "Pain point";
      return [{ id: org.id, name: org.name, city: org.city, industry: org.industry, type, summary: signal, sourceUrl: org.discoveryUrl, date: org.discoveredAt?.toISOString() ?? null, confidence: org.researchConfidence }];
    }).slice(0, 8);
    const stageCounts = leadStages.map((stage) => ({ name: stage, count: leads.filter((lead) => lead.status === stage).length }));
    const trend = new Map<string, number>();
    for (const lead of leads) {
      const day = lead.createdAt.toISOString().slice(0, 10);
      trend.set(day, (trend.get(day) ?? 0) + 1);
    }
    const trendRows = [...trend].sort(([a], [b]) => a.localeCompare(b)).map(([name, count]) => ({ name, count }));
    const organizationBySource = countBy(organizations, (org) => org.discoverySource);
    const leadBySource = countBy(leads, (lead) => lead.source);
    const peopleBySource = countBy(people, (person) => person.discoverySource);
    const geography = new Map<string, { name: string; organizations: number; leads: number; qualifiedLeads: number }>();
    for (const org of organizations) {
      if (!org.city?.trim()) continue;
      const key = org.city.trim();
      const current = geography.get(key) ?? { name: key, organizations: 0, leads: 0, qualifiedLeads: 0 };
      current.organizations += 1;
      geography.set(key, current);
    }
    for (const lead of leads) {
      const key = lead.organization?.city?.trim();
      if (!key) continue;
      const current = geography.get(key) ?? { name: key, organizations: 0, leads: 0, qualifiedLeads: 0 };
      current.leads += 1;
      if (lead.status === "QUALIFIED") current.qualifiedLeads += 1;
      geography.set(key, current);
    }
    const sourceNames = new Set([...organizationBySource, ...leadBySource, ...peopleBySource].map((item) => item.name));
    const sources = [...sourceNames].map((name) => ({
      name,
      organizations: organizationBySource.find((item) => item.name === name)?.count ?? 0,
      leads: leadBySource.find((item) => item.name === name)?.count ?? 0,
      people: peopleBySource.find((item) => item.name === name)?.count ?? 0,
    })).sort((a, b) => b.organizations + b.leads + b.people - (a.organizations + a.leads + a.people));
    const duplicateGroups = new Set<string>();
    const orgKeys = new Map<string, number>();
    for (const org of organizations) {
      if (!org.address?.trim()) continue;
      const key = `${normalized(org.name)}|${normalized(org.address)}`;
      orgKeys.set(key, (orgKeys.get(key) ?? 0) + 1);
    }
    for (const [key, count] of orgKeys) if (count > 1) duplicateGroups.add(key);
    const staleDate = addDays(today, -90);
    const activityRows = activity.map((row) => ({
      id: row.id, type: row.type, title: row.title, createdAt: row.createdAt.toISOString(),
      leadId: row.lead?.id ?? null, leadName: row.lead?.name ?? null,
      organizationId: row.organization?.id ?? null, organizationName: row.organization?.name ?? null,
      personId: row.person?.id ?? null, personName: row.person?.name ?? null, sourceUrl: row.sourceUrl,
    }));

    return {
      filters,
      options: { industries: countBy(organizations, (org) => org.industry).map((row) => row.name), cities: countBy(organizations, (org) => org.city).map((row) => row.name) },
      overview: {
        organizations: organizations.length,
        people: people.length,
        leads: leads.length,
        qualifiedLeads,
        activeOpportunities: null,
        businessSignals: businessSignals.length,
        previous: previousCounts,
      },
      actions: {
        dueToday,
        overdue,
        newQualified: leads.filter((lead) => lead.status === "QUALIFIED").length,
        awaitingResponse,
        organizationsToEnrich: organizations.filter((org) => !org.website || !org.industry).length,
        incompleteResearch: researchRuns.filter((run) => run.status === "PENDING" || run.status === "RUNNING").length,
      },
      sales: {
        byStage: stageCounts,
        bySource: leadBySource,
        trend: trendRows,
        won: leads.filter((lead) => lead.status === "WON").length,
        lost: leads.filter((lead) => lead.status === "LOST").length,
      },
      signals: sourcedSignals,
      research: {
        total: researchRuns.length,
        completed: completedInPeriod,
        failed: researchRuns.filter((run) => run.status === "FAILED").length,
        pending: researchRuns.filter((run) => run.status === "PENDING" || run.status === "RUNNING").length,
        organizationsEnriched: new Set(researchRuns.filter((run) => run.status === "COMPLETE" && run.organizationId).map((run) => run.organizationId)).size,
        peopleDiscovered: new Set(researchRuns.filter((run) => run.status === "COMPLETE" && run.personId).map((run) => run.personId)).size,
        bySource: countBy(researchRuns, (run) => run.provider ?? run.trigger),
      },
      market: {
        industries: countBy(organizations, (org) => org.industry).slice(0, 8),
        cities: countBy(organizations, (org) => org.city).slice(0, 8),
        geography: [...geography.values()].sort((a, b) => b.organizations + b.leads - (a.organizations + a.leads)).slice(0, 8),
        technologies: countBy(organizations.flatMap((org) => org.technologies), (technology) => technology).slice(0, 8),
        fundingProfiles: organizations.filter((org) => Boolean(org.fundingStage || org.totalFunding)).length,
      },
      quality: {
        duplicateOrganizations: duplicateGroups.size,
        incompleteOrganizations: organizations.filter((org) => !org.website || !org.industry).length,
        peopleMissingContact: people.filter((person) => !person.email && !person.phone).length,
        unverifiedContacts: people.filter((person) => (person.email && person.emailVerified !== true) || (person.phone && person.phoneVerified !== true)).length,
        missingIndustry: organizations.filter((org) => !org.industry).length,
        missingProvenance: organizations.filter((org) => !org.discoverySource).length + people.filter((person) => !person.discoverySource).length,
        staleResearch: organizations.filter((org) => org.lastResearchAt && org.lastResearchAt < staleDate).length,
      },
      sources,
      activity: activityRows,
      activityTotal,
    };
  },
};
