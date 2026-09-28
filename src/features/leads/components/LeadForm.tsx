"use client";

import { useFormContext } from "react-hook-form";
import { useRouter } from "next/navigation";

import { FormWrapper } from "@/components/forms/FormWrapper";
import { leadSchema, type LeadInput } from "../schemas";

import { useCreateLead } from "../services/leads.queries";
import { useOrganizations } from "@/features/organizations";
import { usePeople } from "@/features/people";

/* =========================================================
   HELPERS
   ========================================================= */

function toIsoDateTime(value?: string | null) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

/* =========================================================
   FIELDS
   ========================================================= */

function Fields() {
  const {
    register,
    formState: { errors },
  } = useFormContext<LeadInput>();

  const organizations = useOrganizations().data ?? [];
  const people = usePeople().data ?? [];

  return (
    <>
      {/* =====================================================
          BASIC INFORMATION
          ===================================================== */}

      <label className="text-sm">
        Lead name
        <input
          {...register("name")}
          placeholder="e.g. AI product development opportunity"
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        />
        {errors.name && (
          <span className="mt-1 block text-sm text-destructive">
            {errors.name.message}
          </span>
        )}
      </label>

      <label className="text-sm">
        Priority
        <select
          {...register("priority")}
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        >
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>
        {errors.priority && (
          <span className="mt-1 block text-sm text-destructive">
            {errors.priority.message}
          </span>
        )}
      </label>

      <label className="text-sm">
        Source
        <select
          {...register("source")}
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        >
          <option value="MANUAL">Manual</option>
          <option value="RESEARCH">Research</option>
          <option value="REFERRAL">Referral</option>
          <option value="WEBSITE">Website</option>
          <option value="LINKEDIN">LinkedIn</option>
          <option value="COLD_OUTREACH">Cold Outreach</option>
          <option value="MCP">MCP</option>
          <option value="IMPORT">Import</option>
          <option value="OTHER">Other</option>
        </select>
        {errors.source && (
          <span className="mt-1 block text-sm text-destructive">
            {errors.source.message}
          </span>
        )}
      </label>

      {/* =====================================================
          ORGANIZATION / PERSON
          ===================================================== */}

      <label className="text-sm">
        Organization
        <select
          {...register("organizationId", {
            setValueAs: (value) => value || null,
          })}
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        >
          <option value="">None</option>

          {organizations.map((organization) => (
            <option key={organization.id} value={organization.id}>
              {organization.name}
            </option>
          ))}
        </select>
        {errors.organizationId && (
          <span className="mt-1 block text-sm text-destructive">
            {errors.organizationId.message}
          </span>
        )}
      </label>

      <label className="text-sm">
        Person
        <select
          {...register("personId", { setValueAs: (value) => value || null })}
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        >
          <option value="">None</option>

          {people.map((person) => (
            <option key={person.id} value={person.id}>
              {person.name}
            </option>
          ))}
        </select>
        {errors.personId && (
          <span className="mt-1 block text-sm text-destructive">
            {errors.personId.message}
          </span>
        )}
      </label>

      {/* =====================================================
          OPPORTUNITY
          ===================================================== */}

      <label className="text-sm sm:col-span-2">
        Description
        <textarea
          {...register("description")}
          rows={3}
          placeholder="What is this potential opportunity?"
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        />
        {errors.description && (
          <span className="mt-1 block text-sm text-destructive">
            {errors.description.message}
          </span>
        )}
      </label>

      <label className="text-sm sm:col-span-2">
        Problem / Need
        <textarea
          {...register("problemStatement")}
          rows={3}
          placeholder="What problem does the prospect appear to have?"
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        />
        {errors.problemStatement && (
          <span className="mt-1 block text-sm text-destructive">
            {errors.problemStatement.message}
          </span>
        )}
      </label>

      <label className="text-sm sm:col-span-2">
        Requested services
        <input
          {...register("requestedServices.0")}
          placeholder="e.g. AI development, MVP development, mobile app"
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        />
        {errors.requestedServices && (
          <span className="mt-1 block text-sm text-destructive">
            {errors.requestedServices.message}
          </span>
        )}
      </label>

      {/* =====================================================
          QUALIFICATION
          ===================================================== */}

      <label className="text-sm">
        Qualification
        <select
          {...register("qualificationStatus")}
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        >
          <option value="UNQUALIFIED">Unqualified</option>
          <option value="PARTIALLY_QUALIFIED">Partially Qualified</option>
          <option value="QUALIFIED">Qualified</option>
          <option value="DISQUALIFIED">Disqualified</option>
        </select>
        {errors.qualificationStatus && (
          <span className="mt-1 block text-sm text-destructive">
            {errors.qualificationStatus.message}
          </span>
        )}
      </label>

      <label className="text-sm">
        Timeline
        <select
          {...register("timeline")}
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        >
          <option value="UNKNOWN">Unknown</option>
          <option value="IMMEDIATE">Immediate</option>
          <option value="WITHIN_30_DAYS">Within 30 Days</option>
          <option value="ONE_TO_THREE_MONTHS">1–3 Months</option>
          <option value="THREE_TO_SIX_MONTHS">3–6 Months</option>
          <option value="SIX_PLUS_MONTHS">6+ Months</option>
        </select>
        {errors.timeline && (
          <span className="mt-1 block text-sm text-destructive">
            {errors.timeline.message}
          </span>
        )}
      </label>

      <label className="text-sm">
        Engagement level
        <select
          {...register("engagementLevel")}
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        >
          <option value="NONE">None</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="VERY_HIGH">Very High</option>
        </select>
        {errors.engagementLevel && (
          <span className="mt-1 block text-sm text-destructive">
            {errors.engagementLevel.message}
          </span>
        )}
      </label>

      <label className="text-sm">
        Outreach channel
        <select
          {...register("outreachChannel", {
            setValueAs: (value) => value || null,
          })}
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        >
          <option value="">None</option>
          <option value="EMAIL">Email</option>
          <option value="PHONE">Phone</option>
          <option value="LINKEDIN">LinkedIn</option>
          <option value="WHATSAPP">WhatsApp</option>
          <option value="WEBSITE">Website</option>
          <option value="OTHER">Other</option>
        </select>
        {errors.outreachChannel && (
          <span className="mt-1 block text-sm text-destructive">
            {errors.outreachChannel.message}
          </span>
        )}
      </label>

      {/* =====================================================
          COMMERCIAL
          ===================================================== */}

      <label className="text-sm">
        Minimum budget
        <input
          type="number"
          min={0}
          step="any"
          {...register("budgetMin", {
            setValueAs: (value) => (value === "" ? undefined : Number(value)),
          })}
          placeholder="0"
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        />
        {errors.budgetMin && (
          <span className="mt-1 block text-sm text-destructive">
            {errors.budgetMin.message}
          </span>
        )}
      </label>

      <label className="text-sm">
        Maximum budget
        <input
          type="number"
          min={0}
          step="any"
          {...register("budgetMax", {
            setValueAs: (value) => (value === "" ? undefined : Number(value)),
          })}
          placeholder="0"
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        />
        {errors.budgetMax && (
          <span className="mt-1 block text-sm text-destructive">
            {errors.budgetMax.message}
          </span>
        )}
      </label>

      <label className="text-sm">
        Currency
        <input
          {...register("currency")}
          maxLength={3}
          placeholder="INR"
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2 uppercase"
        />
        {errors.currency && (
          <span className="mt-1 block text-sm text-destructive">
            {errors.currency.message}
          </span>
        )}
      </label>

      <label className="text-sm">
        Estimated value
        <input
          type="number"
          min={0}
          step="any"
          {...register("estimatedValue", {
            setValueAs: (value) => (value === "" ? undefined : Number(value)),
          })}
          placeholder="0"
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        />
        {errors.estimatedValue && (
          <span className="mt-1 block text-sm text-destructive">
            {errors.estimatedValue.message}
          </span>
        )}
      </label>

      <label className="text-sm">
        Expected start date
        <input
          type="datetime-local"
          {...register("expectedStartDate", {
            setValueAs: toIsoDateTime,
          })}
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        />
        {errors.expectedStartDate && (
          <span className="mt-1 block text-sm text-destructive">
            {errors.expectedStartDate.message}
          </span>
        )}
      </label>

      <label className="text-sm">
        Expected close date
        <input
          type="datetime-local"
          {...register("expectedCloseDate", {
            setValueAs: toIsoDateTime,
          })}
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        />
        {errors.expectedCloseDate && (
          <span className="mt-1 block text-sm text-destructive">
            {errors.expectedCloseDate.message}
          </span>
        )}
      </label>

      {/* =====================================================
          DISCOVERY
          ===================================================== */}

      <label className="text-sm sm:col-span-2">
        Discovery URL
        <input
          type="url"
          {...register("discoveryUrl")}
          placeholder="https://..."
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        />
        {errors.discoveryUrl && (
          <span className="mt-1 block text-sm text-destructive">
            {errors.discoveryUrl.message}
          </span>
        )}
      </label>

      {/* =====================================================
          NOTES
          ===================================================== */}

      <label className="text-sm sm:col-span-2">
        Notes
        <textarea
          {...register("notes")}
          rows={5}
          placeholder="Additional context about this lead..."
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        />
        {errors.notes && (
          <span className="mt-1 block text-sm text-destructive">
            {errors.notes.message}
          </span>
        )}
      </label>
    </>
  );
}

/* =========================================================
   FORM
   ========================================================= */

export default function LeadForm() {
  const create = useCreateLead();
  const router = useRouter();

  return (
    <FormWrapper
      schema={leadSchema}
      defaultValues={{
        name: "",
        description: "",

        status: "NEW",
        source: "MANUAL",
        priority: "MEDIUM",

        ownerId: null,

        organizationId: null,
        personId: null,

        qualificationStatus: "UNQUALIFIED",

        fitScore: null,
        intentScore: null,
        engagementScore: null,
        overallScore: null,

        qualificationNotes: "",

        problemStatement: "",

        painPoints: [],
        requirements: [],
        requestedServices: [],

        budgetMin: null,
        budgetMax: null,
        currency: "INR",
        estimatedValue: null,

        expectedStartDate: null,
        expectedCloseDate: null,
        timeline: "UNKNOWN",

        engagementLevel: "NONE",

        outreachChannel: null,
        nextFollowUpAt: null,

        discoveryUrl: null,

        tags: [],

        notes: "",
      }}
      onSubmit={async (data) => {
        const lead = await create.mutateAsync({
          ...data,

          organizationId: data.organizationId || null,

          personId: data.personId || null,

          ownerId: data.ownerId || null,

          description: data.description || null,

          problemStatement: data.problemStatement || null,

          qualificationNotes: data.qualificationNotes || null,

          expectedStartDate: data.expectedStartDate || null,

          expectedCloseDate: data.expectedCloseDate || null,

          discoveryUrl: data.discoveryUrl || null,

          notes: data.notes || null,
        });

        router.push(`/leads/${lead.id}`);
      }}
      className="mt-6 grid gap-4 rounded-xl border bg-card p-5 sm:grid-cols-2"
    >
      <Fields />

      <button
        type="submit"
        disabled={create.isPending}
        className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-2"
      >
        {create.isPending ? "Saving…" : "Create lead"}
      </button>

      {create.isError && (
        <p role="alert" className="text-sm text-destructive sm:col-span-2">
          {create.error instanceof Error
            ? create.error.message
            : "Failed to create lead."}
        </p>
      )}
    </FormWrapper>
  );
}
