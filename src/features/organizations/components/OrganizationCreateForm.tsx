"use client";
import { useFormContext } from "react-hook-form";
import { useRouter } from "next/navigation";
import { FormWrapper } from "@/components/forms/FormWrapper";
import { organizationSchema, type OrganizationInput } from "../schemas";
import { useCreateOrganization } from "../services/organizations.queries";

function Fields() {
  const { register, formState: { errors } } = useFormContext<OrganizationInput>();
  return <>{(["name", "website", "industry", "city", "country", "location", "linkedinUrl"] as const).map(field => <label key={field} className="text-sm capitalize">{field === "linkedinUrl" ? "LinkedIn URL" : field}<input type={field === "website" || field === "linkedinUrl" ? "url" : "text"} {...register(field)} className="mt-1 w-full rounded-lg border bg-background px-3 py-2" />{errors[field] && <span className="text-destructive">{errors[field]?.message}</span>}</label>)}<label className="text-sm sm:col-span-2">Description<textarea {...register("description")} rows={4} className="mt-1 w-full rounded-lg border bg-background px-3 py-2" /></label></>;
}
export default function OrganizationCreateForm() {
  const create = useCreateOrganization();
  const router = useRouter();
  return <FormWrapper schema={organizationSchema} defaultValues={{ name: "", website: "", industry: "", city: "", country: "", location: "", linkedinUrl: "", description: "" }} onSubmit={async data => { const organization = await create.mutateAsync(data); router.push(`/organizations/${organization.id}`); }} className="mt-6 grid gap-4 rounded-xl border bg-card p-5 sm:grid-cols-2"><Fields/><button disabled={create.isPending} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground sm:col-span-2">{create.isPending ? "Saving…" : "Create organization"}</button>{create.isError && <p role="alert" className="text-sm text-destructive sm:col-span-2">{create.error.message}</p>}</FormWrapper>;
}
