"use client";
import { useFormContext } from "react-hook-form";
import { useRouter } from "next/navigation";
import { FormWrapper } from "@/components/forms/FormWrapper";
import { useOrganizations } from "@/features/organizations";
import { personSchema, type PersonInput } from "../schemas";
import { useCreatePerson } from "../services/people.queries";

function Fields() {
  const { register, formState: { errors } } = useFormContext<PersonInput>();
  const organizations = useOrganizations().data ?? [];
  return <><label className="text-sm">Name<input {...register("name")} className="mt-1 w-full rounded-lg border bg-background px-3 py-2"/>{errors.name && <span className="text-destructive">{errors.name.message}</span>}</label>
    <label className="text-sm">Email<input type="email" {...register("email")} className="mt-1 w-full rounded-lg border bg-background px-3 py-2"/>{errors.email && <span className="text-destructive">{errors.email.message}</span>}</label>
    <label className="text-sm">Title<input {...register("title")} className="mt-1 w-full rounded-lg border bg-background px-3 py-2"/></label>
    <label className="text-sm">Organization<select {...register("organizationId")} className="mt-1 w-full rounded-lg border bg-background px-3 py-2"><option value="">None</option>{organizations.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}</select></label></>;
}
export default function PersonCreateForm() {
  const create = useCreatePerson();
  const router = useRouter();
  return <FormWrapper schema={personSchema} defaultValues={{ name: "", email: "", title: "", organizationId: "" }} onSubmit={async data => { const person = await create.mutateAsync({ ...data, organizationId: data.organizationId || null }); router.push(`/people/${person.id}`); }} className="mt-6 grid gap-4 rounded-xl border bg-card p-5 sm:grid-cols-2"><Fields/><button disabled={create.isPending} className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground sm:col-span-2">{create.isPending ? "Saving…" : "Create person"}</button>{create.isError && <p role="alert" className="text-sm text-destructive sm:col-span-2">{create.error.message}</p>}</FormWrapper>;
}
