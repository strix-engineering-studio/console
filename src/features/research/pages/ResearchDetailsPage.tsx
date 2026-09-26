"use client";
import Link from "next/link";
import { useResearchRun } from "../services/research.queries";
type Detail = { id: string; status: string; provider: string | null; summary: string | null; startedAt: string; completedAt: string | null; lead?: { name: string } | null; organization?: { name: string } | null; person?: { name: string } | null };
export default function ResearchDetailsPage({ id }: { id: string }) {
  const query = useResearchRun(id);
  const run = query.data as unknown as Detail | undefined;
  if (query.isPending) return <p className="text-sm text-muted-foreground">Loading research run…</p>;
  if (query.isError || !run) return <p role="alert" className="text-sm text-destructive">{query.error?.message || "Research run not found."}</p>;
  const name = run.lead?.name || run.organization?.name || run.person?.name || "Research run";
  return <section><Link href="/research" className="text-sm text-primary hover:underline">← Research</Link><p className="mt-5 text-sm text-muted-foreground">{run.status} · {run.provider || "No provider"}</p><h1 className="mt-1 text-3xl font-semibold">{name}</h1><div className="mt-6 max-w-3xl rounded-xl border p-5"><h2 className="font-semibold">Research summary</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-6">{run.summary || "No research summary has been recorded."}</p><p className="mt-4 text-xs text-muted-foreground">Started {new Date(run.startedAt).toLocaleString()}{run.completedAt ? ` · Completed ${new Date(run.completedAt).toLocaleString()}` : ""}</p></div></section>;
}
