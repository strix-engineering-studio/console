"use client";
import Link from "next/link";
import { useState } from "react";
import { useLeads } from "../services/leads.queries";
import LeadTable from "../components/LeadTable";

export default function LeadsPage() {
  const [query, setQuery] = useState("");
  const leads = useLeads(query);
  return <section>
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm text-muted-foreground">Potential clients and their current status</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Leads</h1></div><Link href="/leads/create" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground" target="_blank">Create lead</Link></div>
    <div className="mt-5 flex items-center gap-3"><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search leads" aria-label="Search leads" className="w-full max-w-sm rounded-lg border bg-background px-3 py-2"/><span className="text-sm text-muted-foreground">{leads.data?.length ?? 0} leads</span></div>
    {leads.isPending && <p className="mt-6 text-sm text-muted-foreground">Loading leads…</p>}
    {leads.isError && <p role="alert" className="mt-4 rounded-lg border border-destructive/30 p-3 text-sm text-destructive">{leads.error.message}</p>}
    {leads.data && <LeadTable data={leads.data}/>}
  </section>;
}
