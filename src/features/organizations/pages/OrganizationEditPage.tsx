"use client";
import Link from "next/link";
import { useOrganization } from "../services/organizations.queries";
import OrganizationEditForm from "../components/OrganizationEditForm";
import type { Organization } from "../types";
export default function OrganizationEditPage({ id }: { id: string }) {
  const query = useOrganization(id);
  if (query.isPending) return <p className="text-sm text-muted-foreground">Loading organization…</p>;
  if (query.isError || !query.data) return <p role="alert" className="text-sm text-destructive">{query.error?.message || "Organization not found."}</p>;
  return <section className="mx-auto max-w-3xl"><Link href={`/organizations/${id}`} className="text-sm text-primary hover:underline">← Organization</Link><h1 className="mt-4 text-3xl font-semibold">Edit organization</h1><OrganizationEditForm organization={query.data as Organization & { description?: string | null }}/></section>;
}
