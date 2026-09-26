"use client";
import Link from "next/link";
import { useOrganizations } from "../services/organizations.queries";
import OrganizationTable from "../components/OrganizationTable";
export default function OrganizationsPage() {
  const query = useOrganizations();
  return <section><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm text-muted-foreground">Companies connected to your potential clients</p><h1 className="mt-1 text-3xl font-semibold">Organizations</h1></div><Link href="/organizations/create" target="_blank" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Add organization</Link></div>
    {query.isPending && <p className="mt-6 text-sm text-muted-foreground">Loading organizations…</p>}{query.isError && <p role="alert" className="mt-4 rounded-lg border p-4 text-sm text-destructive">{query.error.message}</p>}{query.data && <OrganizationTable data={query.data}/>}</section>;
}
