"use client";
import { useFormContext } from "react-hook-form";
import { FormWrapper } from "@/components/forms/FormWrapper";
import { organizationSchema, type OrganizationInput } from "../schemas";
import { useUpdateOrganization } from "../services/organizations.queries";
import type { Organization } from "../types";

function Fields() {
  const { register, formState: { errors } } = useFormContext<OrganizationInput>();
  return <>{(["name", "website", "industry", "city", "country", "location", "linkedinUrl"] as const).map(field => <label key={field} className="text-sm capitalize">{field === "linkedinUrl" ? "LinkedIn URL" : field}<input type={field === "website" || field === "linkedinUrl" ? "url" : "text"} {...register(field)} className="mt-1 w-full rounded-lg border bg-background px-3 py-2"/>{errors[field] && <span className="text-destructive">{errors[field]?.message}</span>}</label>)}<label className="text-sm sm:col-span-2">Description<textarea {...register("description")} rows={4} className="mt-1 w-full rounded-lg border bg-background px-3 py-2"/></label></>;
}
export default function OrganizationEditForm({ organization }: { organization: Organization & { description?: string | null } }) {
  const update = useUpdateOrganization();
  return <FormWrapper schema={organizationSchema} defaultValues={{ name: organization.name, website: organization.website || "", industry: organization.industry || "", city: organization.city || "", country: organization.country || "", location: organization.location || "", linkedinUrl: organization.linkedinUrl || "", description: organization.description || "" }} onSubmit={input => update.mutateAsync({ id: organization.id, input }).then(() => undefined)} className="mt-6 grid gap-4 rounded-xl border bg-card p-5 sm:grid-cols-2"><Fields/><button disabled={update.isPending} className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground sm:col-span-2">{update.isPending ? "Saving…" : "Save organization"}</button>{update.isError && <p role="alert" className="text-sm text-destructive sm:col-span-2">{update.error.message}</p>}{update.isSuccess && <p role="status" className="text-sm text-muted-foreground sm:col-span-2">Organization updated.</p>}</FormWrapper>;
}
