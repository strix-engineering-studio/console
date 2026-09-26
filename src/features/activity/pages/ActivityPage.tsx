"use client";
import { useActivities } from "../services/activity.queries";
import ActivityTable from "../components/ActivityTable";
export default function ActivityPage() {
  const query = useActivities();
  return <section><p className="text-sm text-muted-foreground">A shared timeline of lead research and changes</p><h1 className="mt-1 text-3xl font-semibold">Activity</h1>{query.isPending && <p className="mt-6 text-sm text-muted-foreground">Loading activities…</p>}{query.isError && <p role="alert" className="mt-5 text-sm text-destructive">{query.error.message}</p>}{query.data && <ActivityTable data={query.data}/>}</section>;
}
