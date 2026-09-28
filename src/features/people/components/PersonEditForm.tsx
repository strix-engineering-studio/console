"use client";

import { useFormContext } from "react-hook-form";

import { FormWrapper } from "@/components/forms/FormWrapper";
import { useOrganizations } from "@/features/organizations";

import { personSchema, type PersonInput } from "../schemas";

import { useUpdatePerson } from "../services/people.queries";
import type { Person } from "../types";

function Fields() {
  const {
    register,
    formState: { errors },
  } = useFormContext<PersonInput>();

  const organizations = useOrganizations().data ?? [];

  return (
    <>
      {/* =====================================================
          IDENTITY
      ===================================================== */}

      <label className="text-sm">
        Name
        <input
          {...register("name")}
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        />
        {errors.name && (
          <span className="text-destructive">{errors.name.message}</span>
        )}
      </label>

      <label className="text-sm">
        First name
        <input
          {...register("firstName")}
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        />
      </label>

      <label className="text-sm">
        Last name
        <input
          {...register("lastName")}
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        />
      </label>

      <label className="text-sm">
        Middle name
        <input
          {...register("middleName")}
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        />
      </label>

      {/* =====================================================
          CONTACT
      ===================================================== */}

      <label className="text-sm">
        Email
        <input
          type="email"
          {...register("email")}
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        />
        {errors.email && (
          <span className="text-destructive">{errors.email.message}</span>
        )}
      </label>

      <label className="text-sm">
        Personal email
        <input
          type="email"
          {...register("personalEmail")}
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        />
      </label>

      <label className="text-sm">
        Phone
        <input
          type="tel"
          {...register("phone")}
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        />
      </label>

      <label className="text-sm">
        Alternate phone
        <input
          type="tel"
          {...register("alternatePhone")}
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        />
      </label>

      {/* =====================================================
          PROFESSIONAL
      ===================================================== */}

      <label className="text-sm">
        Title
        <input
          {...register("title")}
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        />
      </label>

      <label className="text-sm">
        Department
        <input
          {...register("department")}
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        />
      </label>

      <label className="text-sm">
        Seniority
        <select
          {...register("seniority")}
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        >
          <option value="">Unknown</option>
          <option value="INTERN">Intern</option>
          <option value="ENTRY">Entry</option>
          <option value="MID">Mid</option>
          <option value="SENIOR">Senior</option>
          <option value="LEAD">Lead</option>
          <option value="MANAGER">Manager</option>
          <option value="DIRECTOR">Director</option>
          <option value="VP">VP</option>
          <option value="C_LEVEL">C-Level</option>
          <option value="FOUNDER">Founder</option>
          <option value="OWNER">Owner</option>
          <option value="PARTNER">Partner</option>
          <option value="UNKNOWN">Unknown</option>
        </select>
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register("isDecisionMaker")} />
        Decision maker
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register("isInfluencer")} />
        Influencer
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register("isTechnical")} />
        Technical
      </label>

      {/* =====================================================
          SOCIAL
      ===================================================== */}

      <label className="text-sm">
        LinkedIn URL
        <input
          type="url"
          {...register("linkedinUrl")}
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        />
      </label>

      <label className="text-sm">
        Twitter / X URL
        <input
          type="url"
          {...register("twitterUrl")}
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        />
      </label>

      <label className="text-sm">
        GitHub URL
        <input
          type="url"
          {...register("githubUrl")}
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        />
      </label>

      <label className="text-sm">
        Website
        <input
          type="url"
          {...register("websiteUrl")}
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        />
      </label>

      {/* =====================================================
          LOCATION
      ===================================================== */}

      <label className="text-sm sm:col-span-2">
        Address
        <input
          {...register("address")}
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        />
      </label>

      <label className="text-sm">
        City
        <input
          {...register("city")}
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        />
      </label>

      <label className="text-sm">
        State
        <input
          {...register("state")}
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        />
      </label>

      <label className="text-sm">
        Country
        <input
          {...register("country")}
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        />
      </label>

      <label className="text-sm">
        Postal code
        <input
          {...register("postalCode")}
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        />
      </label>

      <label className="text-sm">
        Timezone
        <input
          {...register("timezone")}
          placeholder="Asia/Kolkata"
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        />
      </label>

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <label className="text-sm sm:col-span-2">
        Bio
        <textarea
          {...register("bio")}
          rows={4}
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        />
      </label>

      {/* =====================================================
          BUYING / INFLUENCE
      ===================================================== */}

      <label className="text-sm">
        Buying role
        <select
          {...register("buyingRole")}
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        >
          <option value="">Unknown</option>
          <option value="DECISION_MAKER">Decision Maker</option>
          <option value="CHAMPION">Champion</option>
          <option value="INFLUENCER">Influencer</option>
          <option value="USER">User</option>
          <option value="GATEKEEPER">Gatekeeper</option>
          <option value="PROCUREMENT">Procurement</option>
          <option value="UNKNOWN">Unknown</option>
        </select>
      </label>

      <label className="text-sm">
        Decision influence
        <select
          {...register("decisionInfluence")}
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        >
          <option value="">None</option>
          <option value="NONE">None</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="FINAL_DECISION">Final Decision</option>
        </select>
      </label>

      {/* =====================================================
          CONTACTABILITY
      ===================================================== */}

      <label className="text-sm">
        Preferred contact method
        <select
          {...register("preferredContactMethod")}
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
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register("doNotContact")} />
        Do not contact
      </label>

      {/* =====================================================
          DISCOVERY
      ===================================================== */}

      <label className="text-sm">
        Discovery source
        <select
          {...register("discoverySource")}
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        >
          <option value="">None</option>
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
      </label>

      <label className="text-sm">
        Discovery URL
        <input
          type="url"
          {...register("discoveryUrl")}
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        />
      </label>

      {/* =====================================================
          ORGANIZATION
      ===================================================== */}

      <label className="text-sm sm:col-span-2">
        Organization
        <select
          {...register("organizationId")}
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        >
          <option value="">None</option>

          {organizations.map((organization) => (
            <option key={organization.id} value={organization.id}>
              {organization.name}
            </option>
          ))}
        </select>
      </label>

      {/* =====================================================
          METADATA
      ===================================================== */}

      <label className="text-sm sm:col-span-2">
        Tags
        <input
          {...register("tags.0")}
          placeholder="Primary tag"
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        />
      </label>

      <label className="text-sm sm:col-span-2">
        Notes
        <textarea
          {...register("notes")}
          rows={4}
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        />
      </label>
    </>
  );
}

export default function PersonEditForm({ person }: { person: Person }) {
  const update = useUpdatePerson();

  return (
    <FormWrapper
      schema={personSchema}
      defaultValues={{
        name: person.name ?? "",

        firstName: person.firstName ?? "",
        lastName: person.lastName ?? "",
        middleName: person.middleName ?? "",

        email: person.email ?? "",
        personalEmail: person.personalEmail ?? "",
        phone: person.phone ?? "",
        alternatePhone: person.alternatePhone ?? "",

        title: person.title ?? "",
        department: person.department ?? "",
        seniority: person.seniority ?? "ENTRY",

        isDecisionMaker: person.isDecisionMaker ?? false,
        isInfluencer: person.isInfluencer ?? false,
        isTechnical: person.isTechnical ?? false,

        linkedinUrl: person.linkedinUrl ?? "",
        twitterUrl: person.twitterUrl ?? "",
        githubUrl: person.githubUrl ?? "",
        websiteUrl: person.websiteUrl ?? "",

        address: person.address ?? "",
        city: person.city ?? "",
        state: person.state ?? "",
        country: person.country ?? "",
        postalCode: person.postalCode ?? "",
        timezone: person.timezone ?? "",

        bio: person.bio ?? "",

        previousCompanies: person.previousCompanies ?? [],
        skills: person.skills ?? [],
        interests: person.interests ?? [],

        buyingRole: person.buyingRole ?? "UNKNOWN",
        decisionInfluence: person.decisionInfluence ?? "NONE",

        painPoints: person.painPoints ?? [],
        interestsSignals: person.interestsSignals ?? [],
        opportunitySignals: person.opportunitySignals ?? [],

        emailVerified: person.emailVerified ?? null,
        phoneVerified: person.phoneVerified ?? null,

        preferredContactMethod: person.preferredContactMethod ?? "OTHER",

        doNotContact: person.doNotContact ?? false,

        lastContactedAt: person.lastContactedAt ?? null,
        lastRespondedAt: person.lastRespondedAt ?? null,

        discoverySource: person.discoverySource ?? "OTHER",
        discoveryUrl: person.discoveryUrl ?? "",
        discoveredAt: person.discoveredAt ?? null,

        organizationId: person.organizationId ?? "",

        tags: person.tags ?? [],
        notes: person.notes ?? "",
      }}
      onSubmit={(input) =>
        update
          .mutateAsync({
            id: person.id,
            input: {
              ...input,
              organizationId: input.organizationId || null,
            },
          })
          .then(() => undefined)
      }
      className="mt-6 grid gap-4 rounded-xl border bg-card p-5 sm:grid-cols-2"
    >
      <Fields />

      <button
        type="submit"
        disabled={update.isPending}
        className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground sm:col-span-2"
      >
        {update.isPending ? "Saving…" : "Save person"}
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
          Person updated.
        </p>
      )}
    </FormWrapper>
  );
}
