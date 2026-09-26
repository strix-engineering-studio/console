"use client";
import Link from "next/link";
import { useLead } from "../services/leads.queries";
import LeadEditForm from "../components/LeadEditForm";
import type { Lead } from "../types";
export default function LeadEditPage({ id }: { id: string }) {
  const query = useLead(id);
  if (query.isPending) return <p className="text-sm text-muted-foreground">Loading lead…</p>;
  if (query.isError || !query.data) return <p role="alert" className="text-sm text-destructive">{query.error?.message || "Lead not found."}</p>;
  return <section className="mx-auto max-w-3xl"><Link href={`/leads/${id}`} className="text-sm text-primary hover:underline">← Lead</Link><h1 className="mt-4 text-3xl font-semibold">Edit lead</h1><LeadEditForm lead={query.data as Lead & { notes?: string | null; organizationId?: string | null; personId?: string | null }}/></section>;
}
