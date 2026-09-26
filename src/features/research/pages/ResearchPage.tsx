"use client";
import { useResearchRuns } from "../services/research.queries";
import ResearchTable from "../components/ResearchTable";
export default function ResearchPage() {
  const query = useResearchRuns();
  return <section><p className="text-sm text-muted-foreground">Research history for your lead records</p><h1 className="mt-1 text-3xl font-semibold">Research</h1><div className="mt-5 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">Research requests are unavailable until a real AI and search provider adapter is connected. No placeholder runs are created.</div>{query.isPending && <p className="mt-5 text-sm text-muted-foreground">Loading research history…</p>}{query.isError && <p role="alert" className="mt-5 text-sm text-destructive">{query.error.message}</p>}{query.data && <ResearchTable data={query.data}/>}</section>;
}
