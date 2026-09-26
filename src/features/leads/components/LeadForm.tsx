"use client";
import { useFormContext } from "react-hook-form";
import { useRouter } from "next/navigation";
import { FormWrapper } from "@/components/forms/FormWrapper";
import { leadSchema, type LeadInput } from "../schemas";
import { useCreateLead } from "../services/leads.queries";
import { useOrganizations } from "@/features/organizations";
import { usePeople } from "@/features/people";

function Fields() {
  const { register, formState: { errors } } = useFormContext<LeadInput>();
  const organizations = useOrganizations().data ?? [];
  const people = usePeople().data ?? [];
  return <><label className="text-sm">Lead name<input {...register("name")} className="mt-1 w-full rounded-lg border bg-background px-3 py-2" />{errors.name && <span className="text-destructive">{errors.name.message}</span>}</label>
    <label className="text-sm">Source<select {...register("source")} className="mt-1 w-full rounded-lg border bg-background px-3 py-2"><option value="MANUAL">Manual</option><option value="RESEARCH">Research</option><option value="REFERRAL">Referral</option><option value="WEBSITE">Website</option><option value="LINKEDIN">LinkedIn</option><option value="OTHER">Other</option></select></label>
    <label className="text-sm">Organization<select {...register("organizationId")} className="mt-1 w-full rounded-lg border bg-background px-3 py-2"><option value="">None</option>{organizations.map(org => <option key={org.id} value={org.id}>{org.name}</option>)}</select></label>
    <label className="text-sm">Person<select {...register("personId")} className="mt-1 w-full rounded-lg border bg-background px-3 py-2"><option value="">None</option>{people.map(person => <option key={person.id} value={person.id}>{person.name}</option>)}</select></label>
    <label className="text-sm sm:col-span-2">Notes<textarea {...register("notes")} rows={4} className="mt-1 w-full rounded-lg border bg-background px-3 py-2" /></label></>;
}

export default function LeadForm() {
  const create = useCreateLead();
  const router = useRouter();
  return <FormWrapper schema={leadSchema} defaultValues={{ name: "", source: "MANUAL", notes: "", organizationId: null, personId: null }} onSubmit={async data => { const lead = await create.mutateAsync({ ...data, organizationId: data.organizationId || null, personId: data.personId || null }); router.push(`/leads/${lead.id}`); }} className="mt-6 grid gap-4 rounded-xl border bg-card p-5 sm:grid-cols-2">
    <Fields/><button disabled={create.isPending} className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground sm:col-span-2">{create.isPending ? "Saving…" : "Create lead"}</button>{create.isError && <p role="alert" className="text-sm text-destructive sm:col-span-2">{create.error.message}</p>}
  </FormWrapper>;
}
