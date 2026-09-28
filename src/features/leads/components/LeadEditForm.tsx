"use client";

import { Controller, useFormContext } from "react-hook-form";

import { FormWrapper } from "@/components/forms/FormWrapper";
import { useOrganizations } from "@/features/organizations";
import { usePeople } from "@/features/people";
import { leadSchema, type LeadInput } from "../schemas";
import { useUpdateLead } from "../services/leads.queries";
import type { Lead } from "../types";

const inputClass = "mt-1 w-full rounded-lg border bg-background px-3 py-2";

function toLocalDateTime(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function toIsoDateTime(value: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function DateField({
  name,
  label,
}: {
  name: "expectedStartDate" | "expectedCloseDate" | "nextFollowUpAt";
  label: string;
}) {
  const { control } = useFormContext<LeadInput>();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <label className="text-sm">
          {label}
          <input
            type="datetime-local"
            value={toLocalDateTime(field.value)}
            onChange={(event) =>
              field.onChange(toIsoDateTime(event.target.value))
            }
            onBlur={field.onBlur}
            ref={field.ref}
            className={inputClass}
          />
        </label>
      )}
    />
  );
}

function ArrayField({
  name,
  label,
}: {
  name: "painPoints" | "requirements" | "requestedServices" | "tags";
  label: string;
}) {
  const { control } = useFormContext<LeadInput>();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <label className="text-sm sm:col-span-2">
          {label}
          <textarea
            value={(field.value ?? []).join(", ")}
            onChange={(event) =>
              field.onChange(
                event.target.value
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean),
              )
            }
            onBlur={field.onBlur}
            ref={field.ref}
            rows={2}
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
  } = useFormContext<LeadInput>();
  const organizations = useOrganizations().data ?? [];
  const people = usePeople().data ?? [];

  return (
    <>
      <label className="text-sm">
        Lead name
        <input {...register("name")} className={inputClass} />
        {errors.name && (
          <span className="text-destructive">{errors.name.message}</span>
        )}
      </label>
      <label className="text-sm">
        Priority
        <select {...register("priority")} className={inputClass}>
          {[
            ["LOW", "Low"],
            ["MEDIUM", "Medium"],
            ["HIGH", "High"],
            ["URGENT", "Urgent"],
          ].map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        Status
        <select {...register("status")} className={inputClass}>
          {[
            ["NEW", "New"],
            ["RESEARCHING", "Researching"],
            ["CONTACTED", "Contacted"],
            ["ENGAGED", "Engaged"],
            ["QUALIFIED", "Qualified"],
            ["PROPOSAL", "Proposal"],
            ["NEGOTIATION", "Negotiation"],
            ["WON", "Won"],
            ["LOST", "Lost"],
            ["DISQUALIFIED", "Disqualified"],
          ].map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        Source
        <select {...register("source")} className={inputClass}>
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
        Organization
        <select
          {...register("organizationId", {
            setValueAs: (value) => value || null,
          })}
          className={inputClass}
        >
          <option value="">None</option>
          {organizations.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        Person
        <select
          {...register("personId", { setValueAs: (value) => value || null })}
          className={inputClass}
        >
          <option value="">None</option>
          {people.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm sm:col-span-2">
        Description
        <textarea
          {...register("description")}
          rows={3}
          className={inputClass}
        />
      </label>
      <label className="text-sm sm:col-span-2">
        Problem / need
        <textarea
          {...register("problemStatement")}
          rows={3}
          className={inputClass}
        />
      </label>
      <ArrayField name="painPoints" label="Pain points" />
      <ArrayField name="requirements" label="Requirements" />
      <ArrayField name="requestedServices" label="Requested services" />
      <label className="text-sm">
        Qualification
        <select
          {...register("qualificationStatus", {
            setValueAs: (value) => value || null,
          })}
          className={inputClass}
        >
          <option value="">Unspecified</option>
          {[
            ["UNQUALIFIED", "Unqualified"],
            ["PARTIALLY_QUALIFIED", "Partially qualified"],
            ["QUALIFIED", "Qualified"],
            ["DISQUALIFIED", "Disqualified"],
          ].map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        Timeline
        <select
          {...register("timeline", { setValueAs: (value) => value || null })}
          className={inputClass}
        >
          <option value="">Unspecified</option>
          {[
            ["IMMEDIATE", "Immediate"],
            ["WITHIN_30_DAYS", "Within 30 days"],
            ["ONE_TO_THREE_MONTHS", "1–3 months"],
            ["THREE_TO_SIX_MONTHS", "3–6 months"],
            ["SIX_PLUS_MONTHS", "6+ months"],
            ["UNKNOWN", "Unknown"],
          ].map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        Fit score
        <input
          type="number"
          min={0}
          max={100}
          {...register("fitScore", {
            setValueAs: (value) => (value === "" ? null : Number(value)),
          })}
          className={inputClass}
        />
      </label>
      <label className="text-sm">
        Intent score
        <input
          type="number"
          min={0}
          max={100}
          {...register("intentScore", {
            setValueAs: (value) => (value === "" ? null : Number(value)),
          })}
          className={inputClass}
        />
      </label>
      <label className="text-sm">
        Engagement score
        <input
          type="number"
          min={0}
          max={100}
          {...register("engagementScore", {
            setValueAs: (value) => (value === "" ? null : Number(value)),
          })}
          className={inputClass}
        />
      </label>
      <label className="text-sm">
        Overall score
        <input
          type="number"
          min={0}
          max={100}
          {...register("overallScore", {
            setValueAs: (value) => (value === "" ? null : Number(value)),
          })}
          className={inputClass}
        />
      </label>
      <label className="text-sm">
        Engagement level
        <select {...register("engagementLevel")} className={inputClass}>
          {[
            ["NONE", "None"],
            ["LOW", "Low"],
            ["MEDIUM", "Medium"],
            ["HIGH", "High"],
            ["VERY_HIGH", "Very high"],
          ].map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        Outreach channel
        <select
          {...register("outreachChannel", {
            setValueAs: (value) => value || null,
          })}
          className={inputClass}
        >
          <option value="">None</option>
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
        Minimum budget
        <input
          type="number"
          min={0}
          step="any"
          {...register("budgetMin", {
            setValueAs: (value) => (value === "" ? null : Number(value)),
          })}
          className={inputClass}
        />
      </label>
      <label className="text-sm">
        Maximum budget
        <input
          type="number"
          min={0}
          step="any"
          {...register("budgetMax", {
            setValueAs: (value) => (value === "" ? null : Number(value)),
          })}
          className={inputClass}
        />
      </label>
      <label className="text-sm">
        Currency
        <input
          maxLength={3}
          {...register("currency")}
          className={`${inputClass} uppercase`}
          placeholder="INR"
        />
      </label>
      <label className="text-sm">
        Estimated value
        <input
          type="number"
          min={0}
          step="any"
          {...register("estimatedValue", {
            setValueAs: (value) => (value === "" ? null : Number(value)),
          })}
          className={inputClass}
        />
      </label>
      <DateField name="expectedStartDate" label="Expected start date" />
      <DateField name="expectedCloseDate" label="Expected close date" />
      <DateField name="nextFollowUpAt" label="Next follow-up" />
      <label className="text-sm">
        Discovery URL
        <input
          type="url"
          {...register("discoveryUrl")}
          className={inputClass}
        />
      </label>
      <label className="text-sm sm:col-span-2">
        Qualification notes
        <textarea
          {...register("qualificationNotes")}
          rows={3}
          className={inputClass}
        />
      </label>
      <ArrayField name="tags" label="Tags" />
      <label className="text-sm sm:col-span-2">
        Notes
        <textarea {...register("notes")} rows={4} className={inputClass} />
      </label>
    </>
  );
}

export default function LeadEditForm({ lead }: { lead: Lead }) {
  const update = useUpdateLead();
  return (
    <FormWrapper
      schema={leadSchema}
      defaultValues={{
        name: lead.name,
        description: lead.description ?? "",
        status: lead.status,
        source: lead.source,
        priority: lead.priority,
        organizationId: lead.organizationId ?? "",
        personId: lead.personId ?? "",
        qualificationStatus: lead.qualificationStatus ?? undefined,
        fitScore: lead.fitScore ?? null,
        intentScore: lead.intentScore ?? null,
        engagementScore: lead.engagementScore ?? null,
        overallScore: lead.overallScore ?? null,
        qualificationNotes: lead.qualificationNotes ?? "",
        problemStatement: lead.problemStatement ?? "",
        painPoints: lead.painPoints ?? [],
        requirements: lead.requirements ?? [],
        requestedServices: lead.requestedServices ?? [],
        budgetMin: lead.budgetMin ?? null,
        budgetMax: lead.budgetMax ?? null,
        currency: lead.currency ?? "INR",
        estimatedValue: lead.estimatedValue ?? null,
        expectedStartDate: lead.expectedStartDate ?? null,
        expectedCloseDate: lead.expectedCloseDate ?? null,
        timeline: lead.timeline ?? undefined,
        engagementLevel: lead.engagementLevel,
        outreachChannel: lead.outreachChannel ?? undefined,
        nextFollowUpAt: lead.nextFollowUpAt ?? null,
        discoveryUrl: lead.discoveryUrl ?? "",
        tags: lead.tags ?? [],
        notes: lead.notes ?? "",
      }}
      onSubmit={(input) =>
        update
          .mutateAsync({
            id: lead.id,
            input: {
              ...input,
              organizationId: input.organizationId || null,
              personId: input.personId || null,
              description: input.description || null,
              problemStatement: input.problemStatement || null,
              qualificationNotes: input.qualificationNotes || null,
              discoveryUrl: input.discoveryUrl || null,
            },
          })
          .then(() => undefined)
      }
      className="mt-6 grid gap-4 rounded-xl border bg-card p-5 sm:grid-cols-2"
    >
      <Fields />
      <button
        disabled={update.isPending}
        className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground sm:col-span-2"
      >
        {update.isPending ? "Saving…" : "Save lead"}
      </button>
      {update.isError && (
        <p role="alert" className="text-sm text-destructive sm:col-span-2">
          {update.error.message}
        </p>
      )}
      {update.isSuccess && (
        <p
          role="status"
          className="text-sm text-muted-foreground sm:col-span-2"
        >
          Lead updated.
        </p>
      )}
    </FormWrapper>
  );
}
