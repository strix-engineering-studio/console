"use client";
import { useFormContext } from "react-hook-form";
import { FormWrapper } from "@/components/forms/FormWrapper";
import { useOrganizations } from "@/features/organizations";
import { personSchema, type PersonInput } from "../schemas";
import { useUpdatePerson } from "../services/people.queries";
import type { Person } from "../types";
function Fields() {
  const { register, formState: { errors } } = useFormContext<PersonInput>();
  const organizations = useOrganizations().data ?? [];
  return <><label className="text-sm">Name<input {...register("name")} className="mt-1 w-full rounded-lg border bg-background px-3 py-2"/>{errors.name && <span className="text-destructive">{errors.name.message}</span>}</label><label className="text-sm">Email<input type="email" {...register("email")} className="mt-1 w-full rounded-lg border bg-background px-3 py-2"/></label><label className="text-sm">Phone<input {...register("phone")} className="mt-1 w-full rounded-lg border bg-background px-3 py-2"/></label><label className="text-sm">Title<input {...register("title")} className="mt-1 w-full rounded-lg border bg-background px-3 py-2"/></label><label className="text-sm">Location<input {...register("location")} className="mt-1 w-full rounded-lg border bg-background px-3 py-2"/></label><label className="text-sm">LinkedIn URL<input type="url" {...register("linkedinUrl")} className="mt-1 w-full rounded-lg border bg-background px-3 py-2"/></label><label className="text-sm sm:col-span-2">Organization<select {...register("organizationId")} className="mt-1 w-full rounded-lg border bg-background px-3 py-2"><option value="">None</option>{organizations.map(org => <option key={org.id} value={org.id}>{org.name}</option>)}</select></label></>;
}
export default function PersonEditForm({ person }: { person: Person & { phone?: string | null; location?: string | null; linkedinUrl?: string | null; organizationId?: string | null } }) {
  const update = useUpdatePerson();
  return <FormWrapper schema={personSchema} defaultValues={{ name: person.name, email: person.email || "", phone: person.phone || "", title: person.title || "", location: person.location || "", linkedinUrl: person.linkedinUrl || "", organizationId: person.organizationId || "" }} onSubmit={input => update.mutateAsync({ id: person.id, input: { ...input, organizationId: input.organizationId || null } }).then(() => undefined)} className="mt-6 grid gap-4 rounded-xl border bg-card p-5 sm:grid-cols-2"><Fields/><button disabled={update.isPending} className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground sm:col-span-2">{update.isPending ? "Saving…" : "Save person"}</button>{update.isError && <p role="alert" className="text-sm text-destructive sm:col-span-2">{update.error.message}</p>}{update.isSuccess && <p role="status" className="text-sm text-muted-foreground sm:col-span-2">Person updated.</p>}</FormWrapper>;
}
