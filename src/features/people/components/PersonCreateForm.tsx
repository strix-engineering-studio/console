"use client";

import { Controller, useFormContext } from "react-hook-form";
import { useRouter } from "next/navigation";

import { FormWrapper } from "@/components/forms/FormWrapper";
import { useOrganizations } from "@/features/organizations";
import { personSchema, type PersonInput } from "../schemas";
import { useCreatePerson } from "../services/people.queries";

const inputClass = "mt-1 w-full rounded-lg border bg-background px-3 py-2";

function ArrayField({
  name,
  label,
  wide = false,
}: {
  name:
    | "previousCompanies"
    | "skills"
    | "interests"
    | "painPoints"
    | "interestsSignals"
    | "opportunitySignals"
    | "tags";
  label: string;
  wide?: boolean;
}) {
  const { control } = useFormContext<PersonInput>();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <label className={`text-sm ${wide ? "sm:col-span-2" : ""}`}>
          {label}
          <textarea
            value={(field.value ?? []).join(", ")}
            onChange={(event) =>
              field.onChange(
                event.target.value
                  .split(",")
                  .map((value) => value.trim())
                  .filter(Boolean),
              )
            }
            onBlur={field.onBlur}
            ref={field.ref}
            rows={wide ? 3 : 2}
            placeholder="Separate items with commas"
            className={inputClass}
          />
        </label>
      )}
    />
  );
}

function Fields() {
  const {
    register,
    formState: { errors },
  } = useFormContext<PersonInput>();
  const organizations = useOrganizations().data ?? [];

  return (
    <>
      <label className="text-sm">
        Full name
        <input {...register("name")} className={inputClass} />
        {errors.name && (
          <span className="text-destructive">{errors.name.message}</span>
        )}
      </label>
      <label className="text-sm">
        First name
        <input {...register("firstName")} className={inputClass} />
      </label>
      <label className="text-sm">
        Middle name
        <input {...register("middleName")} className={inputClass} />
      </label>
      <label className="text-sm">
        Last name
        <input {...register("lastName")} className={inputClass} />
      </label>
      <label className="text-sm">
        Work email
        <input type="email" {...register("email")} className={inputClass} />
        {errors.email && (
          <span className="text-destructive">{errors.email.message}</span>
        )}
      </label>
      <label className="text-sm">
        Personal email
        <input
          type="email"
          {...register("personalEmail")}
          className={inputClass}
        />
      </label>
      <label className="text-sm">
        Phone
        <input type="tel" {...register("phone")} className={inputClass} />
      </label>
      <label className="text-sm">
        Alternate phone
        <input
          type="tel"
          {...register("alternatePhone")}
          className={inputClass}
        />
      </label>
      <label className="text-sm">
        Job title
        <input {...register("title")} className={inputClass} />
      </label>
      <label className="text-sm">
        Department
        <input {...register("department")} className={inputClass} />
      </label>
      <label className="text-sm">
        Seniority
        <select
          {...register("seniority", { setValueAs: (value) => value || null })}
          className={inputClass}
        >
          <option value="">Select seniority</option>
          {[
            ["INTERN", "Intern"],
            ["ENTRY", "Entry"],
            ["MID", "Mid"],
            ["SENIOR", "Senior"],
            ["LEAD", "Lead"],
            ["MANAGER", "Manager"],
            ["DIRECTOR", "Director"],
            ["VP", "VP"],
            ["C_LEVEL", "C-level"],
            ["FOUNDER", "Founder"],
            ["OWNER", "Owner"],
            ["PARTNER", "Partner"],
            ["UNKNOWN", "Unknown"],
          ].map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        Buying role
        <select
          {...register("buyingRole", { setValueAs: (value) => value || null })}
          className={inputClass}
        >
          <option value="">Select role</option>
          {[
            ["DECISION_MAKER", "Decision maker"],
            ["CHAMPION", "Champion"],
            ["INFLUENCER", "Influencer"],
            ["USER", "User"],
            ["GATEKEEPER", "Gatekeeper"],
            ["PROCUREMENT", "Procurement"],
            ["UNKNOWN", "Unknown"],
          ].map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        Decision influence
        <select
          {...register("decisionInfluence", {
            setValueAs: (value) => value || null,
          })}
          className={inputClass}
        >
          <option value="">Select influence</option>
          {[
            ["NONE", "None"],
            ["LOW", "Low"],
            ["MEDIUM", "Medium"],
            ["HIGH", "High"],
            ["FINAL_DECISION", "Final decision"],
          ].map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register("isDecisionMaker")} /> Decision
        maker
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register("isInfluencer")} /> Influencer
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register("isTechnical")} /> Technical contact
      </label>
      <label className="text-sm">
        Preferred contact method
        <select
          {...register("preferredContactMethod", {
            setValueAs: (value) => value || null,
          })}
          className={inputClass}
        >
          <option value="">No preference</option>
          {[
            ["EMAIL", "Email"],
            ["PHONE", "Phone"],
            ["LINKEDIN", "LinkedIn"],
            ["WHATSAPP", "WhatsApp"],
            ["WEBSITE", "Website"],
            ["OTHER", "Other"],
          ].map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        Organization
        <select
          {...register("organizationId", {
            setValueAs: (value) => value || null,
          })}
          className={inputClass}
        >
          <option value="">None</option>
          {organizations.map((organization) => (
            <option key={organization.id} value={organization.id}>
              {organization.name}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        LinkedIn URL
        <input type="url" {...register("linkedinUrl")} className={inputClass} />
      </label>
      <label className="text-sm">
        Twitter / X URL
        <input type="url" {...register("twitterUrl")} className={inputClass} />
      </label>
      <label className="text-sm">
        GitHub URL
        <input type="url" {...register("githubUrl")} className={inputClass} />
      </label>
      <label className="text-sm">
        Website
        <input type="url" {...register("websiteUrl")} className={inputClass} />
      </label>
      <label className="text-sm">
        <input type="checkbox" {...register("doNotContact")} className="mr-2" />
        Do not contact
      </label>
      <label className="text-sm">
        Discovery source
        <select
          {...register("discoverySource", {
            setValueAs: (value) => value || null,
          })}
          className={inputClass}
        >
          <option value="">Select source</option>
          {[
            ["MANUAL", "Manual"],
            ["RESEARCH", "Research"],
            ["REFERRAL", "Referral"],
            ["WEBSITE", "Website"],
            ["LINKEDIN", "LinkedIn"],
            ["COLD_OUTREACH", "Cold outreach"],
            ["MCP", "MCP"],
            ["IMPORT", "Import"],
            ["OTHER", "Other"],
          ].map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        Discovery URL
        <input
          type="url"
          {...register("discoveryUrl")}
          className={inputClass}
        />
      </label>
      <label className="text-sm">
        City
        <input {...register("city")} className={inputClass} />
      </label>
      <label className="text-sm">
        State / region
        <input {...register("state")} className={inputClass} />
      </label>
      <label className="text-sm">
        Country
        <input {...register("country")} className={inputClass} />
      </label>
      <label className="text-sm">
        Postal code
        <input {...register("postalCode")} className={inputClass} />
      </label>
      <label className="text-sm">
        Timezone
        <input {...register("timezone")} className={inputClass} />
      </label>
      <label className="text-sm sm:col-span-2">
        Address
        <input {...register("address")} className={inputClass} />
      </label>
      <ArrayField name="previousCompanies" label="Previous companies" />
      <ArrayField name="skills" label="Skills" />
      <ArrayField name="interests" label="Interests" />
      <ArrayField name="painPoints" label="Pain points" wide />
      <ArrayField name="interestsSignals" label="Interest signals" wide />
      <ArrayField name="opportunitySignals" label="Opportunity signals" wide />
      <ArrayField name="tags" label="Tags" />
      <label className="text-sm sm:col-span-2">
        Bio
        <textarea {...register("bio")} rows={4} className={inputClass} />
      </label>
      <label className="text-sm sm:col-span-2">
        Notes
        <textarea {...register("notes")} rows={4} className={inputClass} />
      </label>
    </>
  );
}

export default function PersonCreateForm() {
  const create = useCreatePerson();
  const router = useRouter();

  return (
    <FormWrapper
      schema={personSchema}
      defaultValues={{
        name: "",
        organizationId: "",
        doNotContact: false,
        isDecisionMaker: false,
        isInfluencer: false,
        isTechnical: false,
        previousCompanies: [],
        skills: [],
        interests: [],
        painPoints: [],
        interestsSignals: [],
        opportunitySignals: [],
        tags: [],
      }}
      onSubmit={async (data) => {
        const person = await create.mutateAsync({
          ...data,
          organizationId: data.organizationId || null,
        });
        router.push(`/people/${person.id}`);
      }}
      className="mt-6 grid gap-4 rounded-xl border bg-card p-5 sm:grid-cols-2"
    >
      <Fields />
      <button
        disabled={create.isPending}
        className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground sm:col-span-2"
      >
        {create.isPending ? "Saving…" : "Create person"}
      </button>
      {create.isError && (
        <p role="alert" className="text-sm text-destructive sm:col-span-2">
          {create.error.message}
        </p>
      )}
    </FormWrapper>
  );
}
