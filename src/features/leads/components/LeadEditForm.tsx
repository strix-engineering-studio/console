"use client";
import { useFormContext } from "react-hook-form";
import { FormWrapper } from "@/components/forms/FormWrapper";
import { leadSchema, type LeadInput } from "../schemas";
import { useUpdateLead } from "../services/leads.queries";
import { useOrganizations } from "@/features/organizations";
import { usePeople } from "@/features/people";
import type { Lead } from "../types";
function Fields() {
  const { register, formState: { errors } } = useFormContext<LeadInput>();
  const organizations = useOrganizations().data ?? [];
  const people = usePeople().data ?? [];
  return <><label className="text-sm">Name<input {...register("name")} className="mt-1 w-full rounded-lg border bg-background px-3 py-2"/>{errors.name && <span className="text-destructive">{errors.name.message}</span>}</label><label className="text-sm">Status<select {...register("status")} className="mt-1 w-full rounded-lg border bg-background px-3 py-2">{["NEW", "RESEARCHING", "ENGAGED", "CONTACTED", "QUALIFIED", "DISQUALIFIED"].map(s => <option key={s}>{s}</option>)}</select></label><label className="text-sm">Source<select {...register("source")} className="mt-1 w-full rounded-lg border bg-background px-3 py-2">{["MANUAL", "RESEARCH", "REFERRAL", "WEBSITE", "LINKEDIN", "OTHER"].map(s => <option key={s}>{s}</option>)}</select></label><label className="text-sm">Organization<select {...register("organizationId")} className="mt-1 w-full rounded-lg border bg-background px-3 py-2"><option value="">None</option>{organizations.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}</select></label><label className="text-sm">Person<select {...register("personId")} className="mt-1 w-full rounded-lg border bg-background px-3 py-2"><option value="">None</option>{people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label><label className="text-sm sm:col-span-2">Notes<textarea {...register("notes")} rows={4} className="mt-1 w-full rounded-lg border bg-background px-3 py-2"/></label></>;
}
export default function LeadEditForm({ lead }: { lead: Lead & { notes?: string | null; organizationId?: string | null; personId?: string | null } }) {
  const update = useUpdateLead();
  return <FormWrapper schema={leadSchema} defaultValues={{ name: lead.name, status: lead.status as never, source: lead.source as never, notes: lead.notes || "", organizationId: lead.organizationId || "", personId: lead.personId || "" }} onSubmit={input => update.mutateAsync({ id: lead.id, input: { ...input, organizationId: input.organizationId || null, personId: input.personId || null } }).then(() => undefined)} className="mt-6 grid gap-4 rounded-xl border bg-card p-5 sm:grid-cols-2"><Fields/><button disabled={update.isPending} className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground sm:col-span-2">{update.isPending ? "Saving…" : "Save lead"}</button>{update.isError && <p role="alert" className="text-sm text-destructive sm:col-span-2">{update.error.message}</p>}{update.isSuccess && <p role="status" className="text-sm text-muted-foreground sm:col-span-2">Lead updated.</p>}</FormWrapper>;
}
