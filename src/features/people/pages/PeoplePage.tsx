"use client";
import Link from "next/link";
import { usePeople } from "../services/people.queries";
import PeopleTable from "../components/PeopleTable";
export default function PeoplePage() {
  const query = usePeople();
  return <section><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm text-muted-foreground">Potential contacts and decision makers</p><h1 className="mt-1 text-3xl font-semibold">People</h1></div><Link href="/people/create" target="_blank" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Add person</Link></div>
    {query.isPending && <p className="mt-6 text-sm text-muted-foreground">Loading people…</p>}{query.isError && <p role="alert" className="mt-4 rounded-lg border p-4 text-sm text-destructive">{query.error.message}</p>}{query.data && <PeopleTable data={query.data}/>}</section>;
}
