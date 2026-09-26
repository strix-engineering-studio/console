"use client";
import Link from "next/link";
import { usePerson } from "../services/people.queries";
import PersonEditForm from "../components/PersonEditForm";
import type { Person } from "../types";
export default function PersonEditPage({ id }: { id: string }) {
  const query = usePerson(id);
  if (query.isPending) return <p className="text-sm text-muted-foreground">Loading person…</p>;
  if (query.isError || !query.data) return <p role="alert" className="text-sm text-destructive">{query.error?.message || "Person not found."}</p>;
  return <section className="mx-auto max-w-3xl"><Link href={`/people/${id}`} className="text-sm text-primary hover:underline">← Person</Link><h1 className="mt-4 text-3xl font-semibold">Edit person</h1><PersonEditForm person={query.data as Person & { phone?: string | null; location?: string | null; linkedinUrl?: string | null; organizationId?: string | null }}/></section>;
}
