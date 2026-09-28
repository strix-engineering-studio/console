"use client";

import { useFormContext } from "react-hook-form";

import { FormWrapper } from "@/components/forms/FormWrapper";

import { organizationSchema, type OrganizationInput } from "../schemas";
import {
  OrganizationArrayFields,
  OrganizationDateField,
} from "./OrganizationArrayFields";

import { useUpdateOrganization } from "../services/organizations.queries";

import type { Organization } from "../types";

function Fields() {
  const {
    register,
    formState: { errors },
  } = useFormContext<OrganizationInput>();

  return (
    <>
      {/* =====================================================
          IDENTITY
          ===================================================== */}

      <label className="text-sm">
        Organization name
        <input
          {...register("name")}
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        />
        {errors.name && (
          <span className="mt-1 block text-sm text-destructive">
            {errors.name.message}
          </span>
        )}
      </label>

      <label className="text-sm">
        Legal name
        <input
          {...register("legalName")}
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        />
        {errors.legalName && (
          <span className="mt-1 block text-sm text-destructive">
            {errors.legalName.message}
          </span>
        )}
      </label>

      {/* =====================================================
          WEB / SOCIAL
          ===================================================== */}

      <label className="text-sm">
        Website
        <input
          type="url"
          {...register("website")}
          placeholder="https://example.com"
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        />
        {errors.website && (
          <span className="mt-1 block text-sm text-destructive">
            {errors.website.message}
          </span>
        )}
      </label>

      <label className="text-sm">
        LinkedIn URL
        <input
          type="url"
          {...register("linkedinUrl")}
          placeholder="https://linkedin.com/company/..."
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        />
        {errors.linkedinUrl && (
          <span className="mt-1 block text-sm text-destructive">
            {errors.linkedinUrl.message}
          </span>
        )}
      </label>

      <label className="text-sm">
        Twitter / X URL
        <input
          type="url"
          {...register("twitterUrl")}
          placeholder="https://x.com/..."
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        />
        {errors.twitterUrl && (
          <span className="mt-1 block text-sm text-destructive">
            {errors.twitterUrl.message}
          </span>
        )}
      </label>

      <label className="text-sm">
        GitHub URL
        <input
          type="url"
          {...register("githubUrl")}
          placeholder="https://github.com/..."
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        />
        {errors.githubUrl && (
          <span className="mt-1 block text-sm text-destructive">
            {errors.githubUrl.message}
          </span>
        )}
      </label>

      <label className="text-sm">
        Crunchbase URL
        <input
          type="url"
          {...register("crunchbaseUrl")}
          placeholder="https://crunchbase.com/organization/..."
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        />
        {errors.crunchbaseUrl && (
          <span className="mt-1 block text-sm text-destructive">
            {errors.crunchbaseUrl.message}
          </span>
        )}
      </label>

      {/* =====================================================
          CLASSIFICATION
          ===================================================== */}

      <label className="text-sm">
        Industry
        <input
          {...register("industry")}
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        />
        {errors.industry && (
          <span className="mt-1 block text-sm text-destructive">
            {errors.industry.message}
          </span>
        )}
      </label>

      <label className="text-sm">
        Sub-industry
        <input
          {...register("subIndustry")}
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        />
        {errors.subIndustry && (
          <span className="mt-1 block text-sm text-destructive">
            {errors.subIndustry.message}
          </span>
        )}
      </label>

      <label className="text-sm">
        Business type
        <select
          {...register("businessType", {
            setValueAs: (value) => value || null,
          })}
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        >
          <option value="">Select type</option>
          <option value="STARTUP">Startup</option>
          <option value="SMB">SMB</option>
          <option value="MID_MARKET">Mid Market</option>
          <option value="ENTERPRISE">Enterprise</option>
          <option value="AGENCY">Agency</option>
          <option value="CONSULTING">Consulting</option>
          <option value="NON_PROFIT">Non-profit</option>
          <option value="GOVERNMENT">Government</option>
          <option value="INDIVIDUAL">Individual</option>
          <option value="OTHER">Other</option>
        </select>
        {errors.businessType && (
          <span className="mt-1 block text-sm text-destructive">
            {errors.businessType.message}
          </span>
        )}
      </label>

      <label className="text-sm">
        Business model
        <input
          {...register("businessModel")}
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        />
        {errors.businessModel && (
          <span className="mt-1 block text-sm text-destructive">
            {errors.businessModel.message}
          </span>
        )}
      </label>

      <label className="text-sm">
        Company stage
        <select
          {...register("companyStage", {
            setValueAs: (value) => value || null,
          })}
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        >
          <option value="">Select stage</option>
          <option value="IDEA">Idea</option>
          <option value="PRE_SEED">Pre-seed</option>
          <option value="SEED">Seed</option>
          <option value="SERIES_A">Series A</option>
          <option value="SERIES_B">Series B</option>
          <option value="SERIES_C">Series C</option>
          <option value="GROWTH">Growth</option>
          <option value="MATURE">Mature</option>
          <option value="PUBLIC">Public</option>
          <option value="BOOTSTRAPPED">Bootstrapped</option>
          <option value="UNKNOWN">Unknown</option>
        </select>
        {errors.companyStage && (
          <span className="mt-1 block text-sm text-destructive">
            {errors.companyStage.message}
          </span>
        )}
      </label>

      <label className="text-sm">
        Founded year
        <input
          type="number"
          {...register("foundedYear", {
            setValueAs: (value) => (value === "" ? null : Number(value)),
          })}
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        />
        {errors.foundedYear && (
          <span className="mt-1 block text-sm text-destructive">
            {errors.foundedYear.message}
          </span>
        )}
      </label>

      {/* =====================================================
          COMPANY SIZE
          ===================================================== */}

      <label className="text-sm">
        Employee count
        <input
          type="number"
          min={0}
          {...register("employeeCount", {
            setValueAs: (value) => (value === "" ? null : Number(value)),
          })}
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        />
        {errors.employeeCount && (
          <span className="mt-1 block text-sm text-destructive">
            {errors.employeeCount.message}
          </span>
        )}
      </label>

      <label className="text-sm">
        Minimum employees
        <input
          type="number"
          min={0}
          {...register("employeeCountMin", {
            setValueAs: (value) => (value === "" ? null : Number(value)),
          })}
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        />
        {errors.employeeCountMin && (
          <span className="mt-1 block text-sm text-destructive">
            {errors.employeeCountMin.message}
          </span>
        )}
      </label>

      <label className="text-sm">
        Maximum employees
        <input
          type="number"
          min={0}
          {...register("employeeCountMax", {
            setValueAs: (value) => (value === "" ? null : Number(value)),
          })}
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        />
        {errors.employeeCountMax && (
          <span className="mt-1 block text-sm text-destructive">
            {errors.employeeCountMax.message}
          </span>
        )}
      </label>

      {/* =====================================================
          GEOGRAPHY
          ===================================================== */}

      <label className="text-sm sm:col-span-2">
        Address
        <input
          {...register("address")}
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        />
        {errors.address && (
          <span className="mt-1 block text-sm text-destructive">
            {errors.address.message}
          </span>
        )}
      </label>

      <label className="text-sm">
        City
        <input
          {...register("city")}
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        />
        {errors.city && (
          <span className="mt-1 block text-sm text-destructive">
            {errors.city.message}
          </span>
        )}
      </label>

      <label className="text-sm">
        State
        <input
          {...register("state")}
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        />
        {errors.state && (
          <span className="mt-1 block text-sm text-destructive">
            {errors.state.message}
          </span>
        )}
      </label>

      <label className="text-sm">
        Country
        <input
          {...register("country")}
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        />
        {errors.country && (
          <span className="mt-1 block text-sm text-destructive">
            {errors.country.message}
          </span>
        )}
      </label>

      <label className="text-sm">
        Postal code
        <input
          {...register("postalCode")}
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        />
        {errors.postalCode && (
          <span className="mt-1 block text-sm text-destructive">
            {errors.postalCode.message}
          </span>
        )}
      </label>

      <label className="text-sm">
        Timezone
        <input
          {...register("timezone")}
          placeholder="Asia/Kolkata"
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        />
        {errors.timezone && (
          <span className="mt-1 block text-sm text-destructive">
            {errors.timezone.message}
          </span>
        )}
      </label>

      {/* =====================================================
          BUSINESS / FINANCIAL
          ===================================================== */}

      <label className="text-sm">
        Revenue range
        <input
          {...register("revenueRange")}
          placeholder="e.g. $1M-$5M"
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        />
        {errors.revenueRange && (
          <span className="mt-1 block text-sm text-destructive">
            {errors.revenueRange.message}
          </span>
        )}
      </label>

      <label className="text-sm">
        Funding stage
        <input
          {...register("fundingStage")}
          placeholder="e.g. Seed"
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        />
        {errors.fundingStage && (
          <span className="mt-1 block text-sm text-destructive">
            {errors.fundingStage.message}
          </span>
        )}
      </label>

      <label className="text-sm">
        Total funding
        <input
          {...register("totalFunding")}
          placeholder="e.g. $2M"
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        />
        {errors.totalFunding && (
          <span className="mt-1 block text-sm text-destructive">
            {errors.totalFunding.message}
          </span>
        )}
      </label>

      <OrganizationDateField name="lastFundingDate" label="Last funding date" />

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          {...register("isBootstrapped")}
          className="size-4 rounded border"
        />
        Bootstrapped
      </label>

      {/* =====================================================
          RELATIONSHIP
          ===================================================== */}

      <label className="text-sm">
        Relationship stage
        <select
          {...register("relationshipStage", {
            setValueAs: (value) => value || null,
          })}
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        >
          <option value="">Unknown</option>
          <option value="PROSPECT">Prospect</option>
          <option value="RESEARCHING">Researching</option>
          <option value="CONTACTED">Contacted</option>
          <option value="ENGAGED">Engaged</option>
          <option value="QUALIFIED">Qualified</option>
          <option value="CLIENT">Client</option>
          <option value="PARTNER">Partner</option>
          <option value="FORMER_CLIENT">Former Client</option>
          <option value="NOT_A_FIT">Not a Fit</option>
        </select>
        {errors.relationshipStage && (
          <span className="mt-1 block text-sm text-destructive">
            {errors.relationshipStage.message}
          </span>
        )}
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          {...register("isTargetAccount")}
          className="size-4 rounded border"
        />
        Target account
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          {...register("isClient")}
          className="size-4 rounded border"
        />
        Existing client
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          {...register("isPartner")}
          className="size-4 rounded border"
        />
        Partner
      </label>

      {/* =====================================================
          DISCOVERY
          ===================================================== */}

      <label className="text-sm">
        Discovery source
        <select
          {...register("discoverySource", {
            setValueAs: (value) => value || null,
          })}
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        >
          <option value="">Select source</option>
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
        {errors.discoverySource && (
          <span className="mt-1 block text-sm text-destructive">
            {errors.discoverySource.message}
          </span>
        )}
      </label>

      <label className="text-sm">
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

      <OrganizationDateField name="discoveredAt" label="Discovered at" />

      {/* =====================================================
          DESCRIPTION / NOTES
          ===================================================== */}

      <OrganizationArrayFields />

      <label className="text-sm sm:col-span-2">
        Description
        <textarea
          {...register("description")}
          rows={4}
          className="mt-1 w-full rounded-lg border bg-background px-3 py-2"
        />
        {errors.description && (
          <span className="mt-1 block text-sm text-destructive">
            {errors.description.message}
          </span>
        )}
      </label>

      <label className="text-sm sm:col-span-2">
        Notes
        <textarea
          {...register("notes")}
          rows={5}
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

export default function OrganizationEditForm({
  organization,
}: {
  organization: Organization;
}) {
  const update = useUpdateOrganization();

  return (
    <FormWrapper
      schema={organizationSchema}
      defaultValues={{
        name: organization.name ?? "",
        legalName: organization.legalName ?? "",
        aliases: organization.aliases ?? [],

        description: organization.description ?? "",

        website: organization.website ?? "",
        linkedinUrl: organization.linkedinUrl ?? "",
        twitterUrl: organization.twitterUrl ?? "",
        githubUrl: organization.githubUrl ?? "",
        crunchbaseUrl: organization.crunchbaseUrl ?? "",

        industry: organization.industry ?? "",
        subIndustry: organization.subIndustry ?? "",
        businessType: organization.businessType ?? undefined,
        businessModel: organization.businessModel ?? "",

        employeeCountMin: organization.employeeCountMin ?? null,
        employeeCountMax: organization.employeeCountMax ?? null,
        employeeCount: organization.employeeCount ?? null,

        companyStage: organization.companyStage ?? undefined,

        foundedYear: organization.foundedYear ?? null,

        address: organization.address ?? "",
        city: organization.city ?? "",
        state: organization.state ?? "",
        country: organization.country ?? "",
        postalCode: organization.postalCode ?? "",
        timezone: organization.timezone ?? "",

        products: organization.products ?? [],
        services: organization.services ?? [],
        technologies: organization.technologies ?? [],
        targetMarkets: organization.targetMarkets ?? [],

        revenueRange: organization.revenueRange ?? "",
        fundingStage: organization.fundingStage ?? "",
        totalFunding: organization.totalFunding ?? "",

        lastFundingDate: organization.lastFundingDate ?? null,

        isBootstrapped: organization.isBootstrapped ?? null,

        hiring: organization.hiring ?? null,

        hiringSignals: organization.hiringSignals ?? [],

        growthSignals: organization.growthSignals ?? [],

        technologySignals: organization.technologySignals ?? [],

        painPoints: organization.painPoints ?? [],

        opportunitySignals: organization.opportunitySignals ?? [],

        relationshipStage: organization.relationshipStage ?? "UNKNOWN",

        isTargetAccount: organization.isTargetAccount ?? false,

        isClient: organization.isClient ?? false,

        isPartner: organization.isPartner ?? false,

        discoverySource: organization.discoverySource ?? "MANUAL",

        discoveryUrl: organization.discoveryUrl ?? "",

        discoveredAt: organization.discoveredAt ?? null,

        tags: organization.tags ?? [],

        notes: organization.notes ?? "",
      }}
      onSubmit={async (input) => {
        await update.mutateAsync({
          id: organization.id,
          input,
        });
      }}
      className="mt-6 grid gap-4 rounded-xl border bg-card p-5 sm:grid-cols-2"
    >
      <Fields />

      <button
        type="submit"
        disabled={update.isPending}
        className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-2"
      >
        {update.isPending ? "Saving…" : "Save organization"}
      </button>

      {update.isError && (
        <p role="alert" className="text-sm text-destructive sm:col-span-2">
          {update.error instanceof Error
            ? update.error.message
            : "Failed to update organization."}
        </p>
      )}

      {update.isSuccess && (
        <p
          role="status"
          className="text-sm text-muted-foreground sm:col-span-2"
        >
          Organization updated.
        </p>
      )}
    </FormWrapper>
  );
}
