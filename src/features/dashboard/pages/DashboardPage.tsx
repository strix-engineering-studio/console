"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Activity, Building2, CheckCircle2, Database, RefreshCw, Users, UserRoundSearch } from "lucide-react";
import { useDashboardSummary } from "../services/dashboard.queries";
import type { DashboardFilters } from "../types/dashboard.types";
import { DashboardBarChart, DashboardSection } from "../components/DashboardCharts";

type DatePreset = "today" | "7d" | "30d" | "90d" | "year" | "custom";

function toDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function presetDates(preset: Exclude<DatePreset, "custom">) {
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const from = new Date(today);
  if (preset === "7d") from.setUTCDate(from.getUTCDate() - 6);
  if (preset === "30d") from.setUTCDate(from.getUTCDate() - 29);
  if (preset === "90d") from.setUTCDate(from.getUTCDate() - 89);
  if (preset === "year") from.setUTCMonth(0, 1);
  return { from: toDateInput(from), to: toDateInput(today) };
}

function dateLabel(value: string | null) {
  return value ? new Date(value).toLocaleDateString() : "—";
}

function formatName(value: string) {
  return value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function percentChange(current: number, previous: number | null) {
  if (previous === null || previous === 0) return previous === 0 && current > 0 ? "New in period" : "No prior baseline";
  const change = Math.round(((current - previous) / previous) * 100);
  return `${change > 0 ? "+" : ""}${change}% vs prior period`;
}

function MetricCard({ title, value, detail, href, icon: Icon }: {
  title: string;
  value: number | null;
  detail: string;
  href?: string;
  icon: typeof Building2;
}) {
  const content = (
    <div className="rounded-xl border bg-card p-4 transition-colors hover:border-primary/40">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{title}</p>
        <Icon className="size-4 text-primary" />
      </div>
      <p className="mt-3 text-2xl font-semibold tabular-nums">{value === null ? "Not configured" : value.toLocaleString()}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
  return href ? <Link href={href} className="block">{content}</Link> : content;
}

function SmallStat({ label, value, href }: { label: string; value: number; href?: string }) {
  const body = <div className="rounded-lg border bg-background/60 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-xl font-semibold tabular-nums">{value.toLocaleString()}</p></div>;
  return href ? <Link href={href} className="block rounded-lg hover:border-primary/40">{body}</Link> : body;
}

export default function DashboardPage() {
  const [preset, setPreset] = useState<DatePreset>("30d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [industry, setIndustry] = useState("");
  const [city, setCity] = useState("");
  const [organizationType, setOrganizationType] = useState("");
  const [leadStage, setLeadStage] = useState("");
  const [researchStatus, setResearchStatus] = useState("");
  const [source, setSource] = useState("");
  const [activityType, setActivityType] = useState("");
  const [activityLimit, setActivityLimit] = useState(10);

  const filters = useMemo<DashboardFilters>(() => {
    const dates = preset === "custom" ? { from: customFrom || undefined, to: customTo || undefined } : presetDates(preset);
    return {
      ...dates,
      industry: industry || undefined,
      city: city || undefined,
      organizationType: (organizationType || undefined) as DashboardFilters["organizationType"],
      leadStage: (leadStage || undefined) as DashboardFilters["leadStage"],
      researchStatus: (researchStatus || undefined) as DashboardFilters["researchStatus"],
      source: (source || undefined) as DashboardFilters["source"],
      activityType: (activityType || undefined) as DashboardFilters["activityType"],
      activityLimit,
    };
  }, [preset, customFrom, customTo, industry, city, organizationType, leadStage, researchStatus, source, activityType, activityLimit]);

  const query = useDashboardSummary(filters);
  const data = query.data;

  if (query.isPending && !data) return <div className="space-y-4"><div className="h-9 w-72 animate-pulse rounded bg-muted"/><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <div key={index} className="h-28 animate-pulse rounded-xl border bg-card"/>)}</div><div className="h-72 animate-pulse rounded-xl border bg-card"/></div>;
  if (query.isError || !data) return <div className="rounded-xl border p-6"><h1 className="text-2xl font-semibold">Business Intelligence</h1><p className="mt-2 text-sm text-muted-foreground">{query.error?.message ?? "Dashboard data is unavailable."}</p><button className="mt-4 rounded-md border px-3 py-2 text-sm" onClick={() => void query.refetch()}>Try again</button></div>;

  const filtersChanged = Boolean(industry || city || organizationType || leadStage || researchStatus || source || activityType);
  const sources = data.sources.map((item) => item.name);
  const activityTypes = ["NOTE", "EMAIL_SENT", "EMAIL_RECEIVED", "CALL", "MEETING", "LINKEDIN_MESSAGE", "WHATSAPP_MESSAGE", "WEBSITE_VISIT", "RESEARCH", "COMPANY_UPDATE", "PERSON_UPDATE", "LEAD_CREATED", "LEAD_UPDATED", "STATUS_CHANGED", "FOLLOW_UP", "PROPOSAL_SENT", "PROPOSAL_RECEIVED", "MCP_MUTATION", "OTHER"];

  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-sm text-muted-foreground">Sales, research and market signals from your CRM data</p><h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Business Intelligence</h1></div>
        <button onClick={() => void query.refetch()} className="inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm hover:bg-muted" aria-label="Refresh dashboard"><RefreshCw className={`size-4 ${query.isFetching ? "animate-spin" : ""}`}/>Refresh</button>
      </header>

      <div className="rounded-xl border bg-card p-3">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
          <label className="text-xs text-muted-foreground">Date range<select value={preset} onChange={(event) => setPreset(event.target.value as DatePreset)} className="mt-1 block h-9 w-full rounded-md border bg-background px-2 text-sm text-foreground"><option value="today">Today</option><option value="7d">Last 7 days</option><option value="30d">Last 30 days</option><option value="90d">Last 90 days</option><option value="year">This year</option><option value="custom">Custom range</option></select></label>
          <label className="text-xs text-muted-foreground">Industry<input list="dashboard-industries" value={industry} onChange={(event) => setIndustry(event.target.value)} placeholder="All industries" className="mt-1 block h-9 w-full rounded-md border bg-background px-2 text-sm text-foreground"/><datalist id="dashboard-industries">{data.options.industries.map((item) => <option key={item} value={item}/>)}</datalist></label>
          <label className="text-xs text-muted-foreground">City<input list="dashboard-cities" value={city} onChange={(event) => setCity(event.target.value)} placeholder="All cities" className="mt-1 block h-9 w-full rounded-md border bg-background px-2 text-sm text-foreground"/><datalist id="dashboard-cities">{data.options.cities.map((item) => <option key={item} value={item}/>)}</datalist></label>
          <FilterSelect label="Organization type" value={organizationType} onChange={setOrganizationType} options={["STARTUP", "SMB", "MID_MARKET", "ENTERPRISE", "AGENCY", "CONSULTING", "NON_PROFIT", "GOVERNMENT", "INDIVIDUAL", "OTHER"]}/>
          <FilterSelect label="Lead stage" value={leadStage} onChange={setLeadStage} options={data.sales.byStage.map((item) => item.name)}/>
          <FilterSelect label="Research status" value={researchStatus} onChange={setResearchStatus} options={["PENDING", "RUNNING", "COMPLETE", "FAILED"]}/>
          <FilterSelect label="Source" value={source} onChange={setSource} options={sources}/>
          <FilterSelect label="Activity type" value={activityType} onChange={setActivityType} options={activityTypes}/>
        </div>
        {preset === "custom" && <div className="mt-3 flex flex-wrap gap-3"><label className="text-xs text-muted-foreground">From<input type="date" value={customFrom} onChange={(event) => setCustomFrom(event.target.value)} className="mt-1 block h-9 rounded-md border bg-background px-2 text-sm text-foreground"/></label><label className="text-xs text-muted-foreground">Through<input type="date" value={customTo} onChange={(event) => setCustomTo(event.target.value)} className="mt-1 block h-9 rounded-md border bg-background px-2 text-sm text-foreground"/></label></div>}
        {query.isFetching && <p className="mt-2 text-xs text-muted-foreground">Updating dashboard…</p>}
      </div>

      <section aria-label="Executive overview">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          <MetricCard title="Total organizations" value={data.overview.organizations} detail={percentChange(data.overview.organizations, data.overview.previous.organizations)} href="/organizations" icon={Building2}/>
          <MetricCard title="Total people" value={data.overview.people} detail={percentChange(data.overview.people, data.overview.previous.people)} href="/people" icon={Users}/>
          <MetricCard title="Total leads" value={data.overview.leads} detail={percentChange(data.overview.leads, data.overview.previous.leads)} href="/leads" icon={UserRoundSearch}/>
          <MetricCard title="Qualified leads" value={data.overview.qualifiedLeads} detail="Lead lifecycle stage: Qualified" href="/leads?status=QUALIFIED" icon={CheckCircle2}/>
          <MetricCard title="Active opportunities" value={data.overview.activeOpportunities} detail="No separate opportunity records are configured" icon={Database}/>
          <MetricCard title="Business signals" value={data.overview.businessSignals} detail="Organizations with source-backed signals" href="/organizations" icon={Activity}/>
        </div>
      </section>

      <DashboardSection title="Today's action center" action={<Link href="/leads" className="text-xs text-primary hover:underline">Open leads</Link>}>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <SmallStat label="Follow-ups due today" value={data.actions.dueToday} href="/leads"/>
          <SmallStat label="Overdue follow-ups" value={data.actions.overdue} href="/leads"/>
          <SmallStat label="New qualified leads" value={data.actions.newQualified} href="/leads?status=QUALIFIED"/>
          <SmallStat label="Contacted, awaiting response" value={data.actions.awaitingResponse} href="/leads?status=CONTACTED"/>
          <SmallStat label="Organizations to enrich" value={data.actions.organizationsToEnrich} href="/organizations"/>
          <SmallStat label="Research pending or running" value={data.actions.incompleteResearch} href="/research"/>
        </div>
      </DashboardSection>

      <div className="grid gap-4 xl:grid-cols-2">
        <DashboardSection title="Sales intelligence" action={<Link href="/leads" className="text-xs text-primary hover:underline">All leads</Link>}>
          <div className="grid gap-4 lg:grid-cols-2"><div><p className="mb-2 text-xs text-muted-foreground">Lead lifecycle stage</p><DashboardBarChart data={data.sales.byStage} label="Leads" horizontal/></div><div><p className="mb-2 text-xs text-muted-foreground">New lead trend</p><DashboardBarChart data={data.sales.trend.slice(-14)} label="New leads"/></div></div>
          {data.sales.bySource.length > 0 && <div className="mt-4"><p className="mb-2 text-xs text-muted-foreground">Lead acquisition source</p><DashboardBarChart data={data.sales.bySource.slice(0, 6)} label="Leads" horizontal/></div>}
          <div className="mt-4 flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-muted px-2.5 py-1">New: {data.sales.byStage.find((item) => item.name === "NEW")?.count ?? 0}</span><span className="rounded-full bg-muted px-2.5 py-1">Qualified: {data.overview.qualifiedLeads}</span><span className="rounded-full bg-muted px-2.5 py-1">Contacted: {data.sales.byStage.find((item) => item.name === "CONTACTED")?.count ?? 0}</span><span className="rounded-full bg-muted px-2.5 py-1">Engaged: {data.sales.byStage.find((item) => item.name === "ENGAGED")?.count ?? 0}</span><span className="rounded-full bg-muted px-2.5 py-1">Won: {data.sales.won}</span><span className="rounded-full bg-muted px-2.5 py-1">Lost: {data.sales.lost}</span></div>
        </DashboardSection>

        <DashboardSection title="Business opportunity signals" action={<Link href="/organizations" className="text-xs text-primary hover:underline">Organizations</Link>}>
          {data.signals.length ? <ul className="divide-y">{data.signals.map((signal) => <li key={signal.id} className="flex flex-wrap items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"><div className="min-w-0"><Link href={`/organizations/${signal.id}`} className="font-medium hover:underline">{signal.name}</Link><p className="mt-0.5 text-xs text-muted-foreground">{signal.type}{signal.industry ? ` · ${signal.industry}` : ""}{signal.city ? ` · ${signal.city}` : ""}</p><p className="mt-1 text-sm">{signal.summary}</p></div><div className="text-right text-xs text-muted-foreground"><p>{dateLabel(signal.date)}</p>{signal.confidence !== null && <p>{Math.round(signal.confidence * 100)}% confidence</p>}<a href={signal.sourceUrl} target="_blank" rel="noreferrer" className="mt-1 inline-block text-primary hover:underline">Evidence</a></div></li>)}</ul> : <p className="text-sm text-muted-foreground">No source-backed organization signals match these filters. The dashboard does not infer signals from descriptions alone.</p>}
        </DashboardSection>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <DashboardSection title="Research intelligence" action={<Link href="/research" className="text-xs text-primary hover:underline">Research runs</Link>}>
          <div className="grid gap-3 sm:grid-cols-3"><SmallStat label="Research runs" value={data.research.total} href="/research"/><SmallStat label="Completed in period" value={data.research.completed} href="/research"/><SmallStat label="Successful runs" value={data.research.total - data.research.failed - data.research.pending} href="/research"/><SmallStat label="Failed runs" value={data.research.failed} href="/research"/><SmallStat label="Organizations enriched" value={data.research.organizationsEnriched} href="/organizations"/><SmallStat label="People discovered" value={data.research.peopleDiscovered} href="/people"/></div>
          {data.research.bySource.length > 0 && <div className="mt-4"><p className="mb-2 text-xs text-muted-foreground">Research provider / trigger</p><DashboardBarChart data={data.research.bySource.slice(0, 6)} label="Research runs" horizontal/></div>}
        </DashboardSection>

        <DashboardSection title="Market and geographic intelligence" action={<Link href="/map" className="text-xs text-primary hover:underline">Open map</Link>}>
          <div className="grid gap-4 lg:grid-cols-2"><div><p className="mb-2 text-xs text-muted-foreground">Organizations by industry</p><DashboardBarChart data={data.market.industries} label="Organizations" horizontal/></div><div><p className="mb-2 text-xs text-muted-foreground">Organizations by city</p><DashboardBarChart data={data.market.cities} label="Organizations" horizontal/></div></div>
          {data.market.geography.length > 0 && <div className="mt-3 overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr className="border-b text-muted-foreground"><th className="py-2 pr-3 font-medium">City</th><th className="px-2 py-2 text-right font-medium">Organizations</th><th className="px-2 py-2 text-right font-medium">Leads</th><th className="px-2 py-2 text-right font-medium">Qualified</th></tr></thead><tbody>{data.market.geography.map((cityRow) => <tr key={cityRow.name} className="border-b last:border-0"><td className="py-2 pr-3">{cityRow.name}</td><td className="px-2 py-2 text-right tabular-nums">{cityRow.organizations}</td><td className="px-2 py-2 text-right tabular-nums">{cityRow.leads}</td><td className="px-2 py-2 text-right tabular-nums">{cityRow.qualifiedLeads}</td></tr>)}</tbody></table></div>}
          <div className="mt-4 grid gap-3 sm:grid-cols-2"><div><p className="mb-2 text-xs text-muted-foreground">Technology records</p>{data.market.technologies.length ? <div className="flex flex-wrap gap-2">{data.market.technologies.slice(0, 8).map((item) => <span key={item.name} className="rounded-full border px-2.5 py-1 text-xs">{item.name} <span className="text-muted-foreground">{item.count}</span></span>)}</div> : <p className="text-sm text-muted-foreground">No technology data recorded.</p>}</div><SmallStat label="Organizations with funding data" value={data.market.fundingProfiles} href="/organizations"/></div>
          <p className="mt-3 text-xs text-muted-foreground">City-level counts only; no contact locations or street addresses are shown. Counts describe the selected records, not market growth.</p>
        </DashboardSection>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <DashboardSection title="Data quality and database health" action={<Link href="/organizations" className="text-xs text-primary hover:underline">Review records</Link>}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><SmallStat label="Duplicate organization candidates (name + address)" value={data.quality.duplicateOrganizations}/><SmallStat label="Organizations with incomplete profiles" value={data.quality.incompleteOrganizations}/><SmallStat label="People missing email and phone" value={data.quality.peopleMissingContact}/><SmallStat label="Contacts with unverified details" value={data.quality.unverifiedContacts}/><SmallStat label="Organizations missing industry" value={data.quality.missingIndustry}/><SmallStat label="Organization / people without source" value={data.quality.missingProvenance}/><SmallStat label="Research older than 90 days" value={data.quality.staleResearch}/></div>
        </DashboardSection>

        <DashboardSection title="Source performance" action={<Link href="/organizations" className="text-xs text-primary hover:underline">Source records</Link>}>
          {data.sources.length ? <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b text-xs text-muted-foreground"><th className="py-2 pr-3 font-medium">Source</th><th className="px-2 py-2 text-right font-medium">Organizations</th><th className="px-2 py-2 text-right font-medium">Leads</th><th className="px-2 py-2 text-right font-medium">People</th></tr></thead><tbody>{data.sources.map((item) => <tr key={item.name} className="border-b last:border-0"><td className="py-2 pr-3">{formatName(item.name)}</td><td className="px-2 py-2 text-right tabular-nums">{item.organizations}</td><td className="px-2 py-2 text-right tabular-nums">{item.leads}</td><td className="px-2 py-2 text-right tabular-nums">{item.people}</td></tr>)}</tbody></table></div> : <p className="text-sm text-muted-foreground">No source attribution is recorded for this filter set.</p>}
          <p className="mt-3 text-xs text-muted-foreground">Source verification quality is not tracked yet, so it is not scored here.</p>
        </DashboardSection>
      </div>

      <DashboardSection title="Recent activity" action={<Link href="/activity" className="text-xs text-primary hover:underline">Full activity timeline</Link>}>
        {data.activity.length ? <><ul className="divide-y">{data.activity.map((item) => {
          const href = item.leadId ? `/leads/${item.leadId}` : item.organizationId ? `/organizations/${item.organizationId}` : item.personId ? `/people/${item.personId}` : "/activity";
          const relatedName = item.leadName ?? item.organizationName ?? item.personName;
          return <li key={item.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"><div className="min-w-0"><Link href={href} className="font-medium hover:underline">{item.title}</Link>{relatedName && <p className="mt-0.5 truncate text-xs text-muted-foreground">{formatName(item.type)} · {relatedName}</p>}</div><time className="shrink-0 text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</time></li>;
        })}</ul>{data.activity.length < data.activityTotal && <button className="mt-3 rounded-md border px-3 py-1.5 text-sm hover:bg-muted" onClick={() => setActivityLimit((limit) => Math.min(50, limit + 10))}>Load more activity</button>}</> : <div className="py-5 text-center"><Activity className="mx-auto size-5 text-muted-foreground"/><p className="mt-2 text-sm text-muted-foreground">No activity matches this filter.</p><Link href="/activity" className="mt-2 inline-block text-sm text-primary hover:underline">Open activity timeline</Link></div>}
      </DashboardSection>
      {filtersChanged && <button className="text-xs text-muted-foreground underline" onClick={() => { setIndustry(""); setCity(""); setOrganizationType(""); setLeadStage(""); setResearchStatus(""); setSource(""); setActivityType(""); }}>Clear non-date filters</button>}
    </section>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return <label className="text-xs text-muted-foreground">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 block h-9 w-full rounded-md border bg-background px-2 text-sm text-foreground"><option value="">All</option>{options.map((option) => <option key={option} value={option}>{formatName(option)}</option>)}</select></label>;
}
