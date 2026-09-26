"use client";
import Link from "next/link";
import { useDashboardSummary } from "../services/dashboard.queries";
export default function DashboardPage() {
  const query = useDashboardSummary();
  const value = query.data;
  if (query.isPending) return <p className="text-sm text-muted-foreground">Loading dashboard…</p>;
  if (query.isError || !value) return <div className="rounded-xl border p-6"><h1 className="text-2xl font-semibold">Dashboard</h1><p className="mt-2 text-sm text-muted-foreground">{query.error?.message ?? "Lead data is unavailable."}</p></div>;
  const cards = [["Total leads", value.total], ["New", value.fresh], ["Researching", value.researching], ["Engaged", value.engaged]] as const;
  return <section><p className="text-sm text-muted-foreground">A current view of your lead operation</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Dashboard</h1>
    <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label, count]) => <div key={label} className="rounded-xl border bg-card p-5"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-semibold">{count}</p></div>)}</div>
    <div className="mt-6 grid gap-5 lg:grid-cols-[1.5fr_1fr]"><div className="rounded-xl border bg-card"><div className="flex items-center justify-between border-b p-4"><h2 className="font-semibold">Recently updated</h2><Link href="/leads" className="text-sm text-primary hover:underline">All leads</Link></div>{value.leads.length ? <ul>{value.leads.map(lead => <li key={lead.id} className="flex items-center justify-between gap-3 border-b px-4 py-3 last:border-0"><Link href={`/leads/${lead.id}`} className="font-medium hover:underline">{lead.name}</Link><span className="text-xs text-muted-foreground">{lead.status} · {new Date(lead.updatedAt).toLocaleDateString()}</span></li>)}</ul> : <p className="p-8 text-center text-sm text-muted-foreground">No leads yet. <Link href="/leads/create" className="text-primary hover:underline">Add your first lead</Link>.</p>}</div>
    <div className="rounded-xl border bg-card p-5"><h2 className="font-semibold">Research and activity</h2><p className="mt-2 text-sm text-muted-foreground">{value.activityCount} recorded activities across your leads and organizations.</p><div className="mt-4 flex gap-3"><Link href="/research" className="text-sm text-primary hover:underline">Research runs</Link><Link href="/activity" className="text-sm text-primary hover:underline">Activity timeline</Link></div></div></div>
  </section>;
}
