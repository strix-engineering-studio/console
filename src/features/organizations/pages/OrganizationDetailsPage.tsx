"use client";

import Link from "next/link";
import { useOrganization } from "../services/organizations.queries";
import {
  CompanyStage,
  LeadSource,
  Organization,
  OrganizationBusinessType,
  OrganizationRelationshipStage,
} from "../types";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatLabel(value?: string | null) {
  if (!value) return "—";

  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatNumber(value?: number | null) {
  if (value === null || value === undefined) return "—";

  return new Intl.NumberFormat("en-IN").format(value);
}

function getEmployeeRange(organization: Organization) {
  if (organization.employeeCount) {
    return formatNumber(organization.employeeCount);
  }

  if (
    organization.employeeCountMin !== null &&
    organization.employeeCountMin !== undefined &&
    organization.employeeCountMax !== null &&
    organization.employeeCountMax !== undefined
  ) {
    return `${formatNumber(
      organization.employeeCountMin,
    )} – ${formatNumber(organization.employeeCountMax)}`;
  }

  if (
    organization.employeeCountMin !== null &&
    organization.employeeCountMin !== undefined
  ) {
    return `${formatNumber(organization.employeeCountMin)}+`;
  }

  if (
    organization.employeeCountMax !== null &&
    organization.employeeCountMax !== undefined
  ) {
    return `Up to ${formatNumber(organization.employeeCountMax)}`;
  }

  return "—";
}

function getLocation(organization: Organization) {
  const parts = [
    organization.city,
    organization.state,
    organization.country,
  ].filter(Boolean);

  return parts.length ? parts.join(", ") : organization.address || "—";
}

function normalizeUrl(url?: string | null) {
  if (!url) return null;

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `https://${url}`;
}

/* -------------------------------------------------------------------------- */
/* Small UI Components                                                        */
/* -------------------------------------------------------------------------- */

function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "primary";
}) {
  const styles = {
    default: "border-border bg-muted text-muted-foreground",
    success:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400",
    warning:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-400",
    danger:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400",
    primary: "border-primary/20 bg-primary/10 text-primary",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${styles[variant]}`}
    >
      {children}
    </span>
  );
}

function Section({
  title,
  description,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-xl border bg-background ${className}`}>
      <div className="border-b px-5 py-4">
        <h2 className="font-semibold">{title}</h2>

        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      <div className="p-5">{children}</div>
    </section>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value?: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>

      <dd className="mt-1 text-sm">
        {value || <span className="text-muted-foreground">—</span>}
      </dd>
    </div>
  );
}

function TagList({
  items,
  emptyText = "None recorded.",
}: {
  items?: string[];
  emptyText?: string;
}) {
  if (!items?.length) {
    return <p className="text-sm text-muted-foreground">{emptyText}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Badge key={item}>{item}</Badge>
      ))}
    </div>
  );
}

function SignalList({
  items,
  emptyText = "No signals recorded.",
}: {
  items?: string[];
  emptyText?: string;
}) {
  if (!items?.length) {
    return <p className="text-sm text-muted-foreground">{emptyText}</p>;
  }

  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li
          key={`${item}-${index}`}
          className="rounded-lg border bg-muted/30 px-3 py-2 text-sm"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Page                                                                  */
/* -------------------------------------------------------------------------- */

export default function OrganizationDetailsPage({ id }: { id: string }) {
  const query = useOrganization(id);

  const organization = query.data as unknown as Organization | undefined;

  /* ------------------------------------------------------------------------ */
  /* Loading                                                                  */
  /* ------------------------------------------------------------------------ */

  if (query.isPending) {
    return (
      <section className="space-y-6">
        <div className="h-5 w-32 animate-pulse rounded bg-muted" />

        <div className="space-y-3">
          <div className="h-4 w-48 animate-pulse rounded bg-muted" />
          <div className="h-10 w-80 animate-pulse rounded bg-muted" />
          <div className="h-5 w-full max-w-2xl animate-pulse rounded bg-muted" />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-xl border bg-muted/30"
            />
          ))}
        </div>
      </section>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Error                                                                    */
  /* ------------------------------------------------------------------------ */

  if (query.isError || !organization) {
    return (
      <section>
        <Link
          href="/organizations"
          className="text-sm text-primary hover:underline"
        >
          ← Organizations
        </Link>

        <div
          role="alert"
          className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 p-5"
        >
          <h1 className="font-semibold text-destructive">
            Organization not found
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            {query.error?.message ||
              "The requested organization could not be loaded."}
          </p>
        </div>
      </section>
    );
  }

  const websiteUrl = normalizeUrl(organization.website);
  const linkedinUrl = normalizeUrl(organization.linkedinUrl);
  const twitterUrl = normalizeUrl(organization.twitterUrl);
  const githubUrl = normalizeUrl(organization.githubUrl);
  const crunchbaseUrl = normalizeUrl(organization.crunchbaseUrl);

  const people = organization.people ?? [];
  const leads = organization.leads ?? [];
  const research = organization.research ?? [];
  const activities = organization.activities ?? [];

  /* ------------------------------------------------------------------------ */
  /* Derived values                                                           */
  /* ------------------------------------------------------------------------ */

  const relationshipStage = organization.relationshipStage || "UNKNOWN";

  const companyStage = organization.companyStage || "UNKNOWN";

  const businessType = organization.businessType || null;

  const discoverySource = organization.discoverySource || null;

  const researchConfidence =
    organization.researchConfidence !== null &&
    organization.researchConfidence !== undefined
      ? Math.round(organization.researchConfidence * 100)
      : null;

  return (
    <section className="space-y-6 pb-10">
      {/* ------------------------------------------------------------------ */}
      {/* Breadcrumb / Actions                                               */}
      {/* ------------------------------------------------------------------ */}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/organizations"
          className="text-sm text-primary hover:underline"
        >
          ← Organizations
        </Link>

        <Link
          href={`/organizations/${id}/edit`}
          target="_blank"
          className="rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-muted"
        >
          Edit organization
        </Link>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Hero                                                               */}
      {/* ------------------------------------------------------------------ */}

      <div className="rounded-2xl border bg-background p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {organization.isTargetAccount && (
                <Badge variant="primary">Target Account</Badge>
              )}

              {organization.isClient && <Badge variant="success">Client</Badge>}

              {organization.isPartner && (
                <Badge variant="success">Partner</Badge>
              )}

              {organization.hiring && <Badge variant="warning">Hiring</Badge>}

              <Badge>{formatLabel(relationshipStage)}</Badge>
            </div>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight">
              {organization.name}
            </h1>

            {organization.legalName &&
              organization.legalName !== organization.name && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Legal name: {organization.legalName}
                </p>
              )}

            <p className="mt-3 text-sm text-muted-foreground">
              {[
                organization.industry,
                organization.subIndustry,
                getLocation(organization) !== "—"
                  ? getLocation(organization)
                  : null,
              ]
                .filter(Boolean)
                .join(" · ") || "Organization information"}
            </p>

            {organization.description && (
              <p className="mt-5 max-w-4xl text-sm leading-6">
                {organization.description}
              </p>
            )}

            <div className="mt-5 flex flex-wrap gap-3">
              {websiteUrl && (
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                  Website ↗
                </a>
              )}

              {linkedinUrl && (
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                  LinkedIn ↗
                </a>
              )}

              {twitterUrl && (
                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                  X / Twitter ↗
                </a>
              )}

              {githubUrl && (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                  GitHub ↗
                </a>
              )}

              {crunchbaseUrl && (
                <a
                  href={crunchbaseUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                  Crunchbase ↗
                </a>
              )}
            </div>
          </div>

          {/* Hero stats */}

          <div className="grid min-w-[280px] grid-cols-2 gap-3">
            <div className="rounded-xl border bg-muted/20 p-4">
              <p className="text-xs text-muted-foreground">People</p>
              <p className="mt-1 text-2xl font-semibold">
                {organization._count?.people ?? people.length}
              </p>
            </div>

            <div className="rounded-xl border bg-muted/20 p-4">
              <p className="text-xs text-muted-foreground">Leads</p>
              <p className="mt-1 text-2xl font-semibold">
                {organization._count?.leads ?? leads.length}
              </p>
            </div>

            <div className="rounded-xl border bg-muted/20 p-4">
              <p className="text-xs text-muted-foreground">Research</p>
              <p className="mt-1 text-2xl font-semibold">
                {organization._count?.research ?? research.length}
              </p>
            </div>

            <div className="rounded-xl border bg-muted/20 p-4">
              <p className="text-xs text-muted-foreground">Activities</p>
              <p className="mt-1 text-2xl font-semibold">
                {organization._count?.activities ?? activities.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Company Overview                                                   */}
      {/* ------------------------------------------------------------------ */}

      <Section
        title="Company overview"
        description="Core organization profile and classification."
      >
        <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          <InfoItem
            label="Business type"
            value={formatLabel(businessType as OrganizationBusinessType | null)}
          />

          <InfoItem label="Business model" value={organization.businessModel} />

          <InfoItem label="Industry" value={organization.industry} />

          <InfoItem label="Sub-industry" value={organization.subIndustry} />

          <InfoItem
            label="Company stage"
            value={formatLabel(companyStage as CompanyStage)}
          />

          <InfoItem label="Founded" value={organization.foundedYear} />

          <InfoItem label="Employees" value={getEmployeeRange(organization)} />

          <InfoItem label="Timezone" value={organization.timezone} />
        </dl>
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* Geography + Commercial                                             */}
      {/* ------------------------------------------------------------------ */}

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Geography" description="Known location information.">
          <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
            <InfoItem label="Address" value={organization.address} />

            <InfoItem label="City" value={organization.city} />

            <InfoItem label="State" value={organization.state} />

            <InfoItem label="Country" value={organization.country} />

            <InfoItem label="Postal code" value={organization.postalCode} />

            <InfoItem label="Timezone" value={organization.timezone} />
          </dl>
        </Section>

        <Section
          title="Commercial & funding"
          description="Financial and funding intelligence."
        >
          <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
            <InfoItem label="Revenue range" value={organization.revenueRange} />

            <InfoItem label="Funding stage" value={organization.fundingStage} />

            <InfoItem label="Total funding" value={organization.totalFunding} />

            <InfoItem
              label="Last funding"
              value={formatDate(organization.lastFundingDate)}
            />

            <InfoItem
              label="Bootstrapped"
              value={
                organization.isBootstrapped === null ||
                organization.isBootstrapped === undefined
                  ? "—"
                  : organization.isBootstrapped
                    ? "Yes"
                    : "No"
              }
            />

            <InfoItem
              label="Hiring"
              value={
                organization.hiring === null ||
                organization.hiring === undefined
                  ? "—"
                  : organization.hiring
                    ? "Yes"
                    : "No"
              }
            />
          </dl>
        </Section>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Business Profile                                                   */}
      {/* ------------------------------------------------------------------ */}

      <div className="grid gap-4 lg:grid-cols-2">
        <Section
          title="Products & services"
          description="What the organization sells or provides."
        >
          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-sm font-medium">Products</h3>

              <TagList
                items={organization.products}
                emptyText="No products recorded."
              />
            </div>

            <div>
              <h3 className="mb-3 text-sm font-medium">Services</h3>

              <TagList
                items={organization.services}
                emptyText="No services recorded."
              />
            </div>
          </div>
        </Section>

        <Section
          title="Technology & markets"
          description="Technology footprint and target markets."
        >
          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-sm font-medium">Technologies</h3>

              <TagList
                items={organization.technologies}
                emptyText="No technologies recorded."
              />
            </div>

            <div>
              <h3 className="mb-3 text-sm font-medium">Target markets</h3>

              <TagList
                items={organization.targetMarkets}
                emptyText="No target markets recorded."
              />
            </div>
          </div>
        </Section>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Opportunity Intelligence                                          */}
      {/* ------------------------------------------------------------------ */}

      <Section
        title="Opportunity intelligence"
        description="Signals that may indicate potential demand for technology, AI, product, or engineering services."
      >
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Hiring signals</h3>

              {organization.hiring && <Badge variant="warning">Hiring</Badge>}
            </div>

            <SignalList items={organization.hiringSignals} />
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Growth signals</h3>

            <SignalList items={organization.growthSignals} />
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Technology signals</h3>

            <SignalList items={organization.technologySignals} />
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Pain points</h3>

            <SignalList items={organization.painPoints} />
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Opportunity signals</h3>

            <SignalList items={organization.opportunitySignals} />
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">
              Account qualification
            </h3>

            <div className="flex flex-wrap gap-2">
              <Badge
                variant={organization.isTargetAccount ? "success" : "default"}
              >
                {organization.isTargetAccount ? "Target account" : "Not target"}
              </Badge>

              <Badge variant={organization.isClient ? "success" : "default"}>
                {organization.isClient ? "Existing client" : "Not client"}
              </Badge>

              <Badge variant={organization.isPartner ? "success" : "default"}>
                {organization.isPartner ? "Partner" : "Not partner"}
              </Badge>
            </div>
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* Research                                                           */}
      {/* ------------------------------------------------------------------ */}

      <Section
        title="Research intelligence"
        description="Latest research state and evidence collected about this organization."
      >
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <div>
            <h3 className="text-sm font-semibold">Research summary</h3>

            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
              {organization.researchSummary || "No research summary recorded."}
            </p>
          </div>

          <div className="rounded-xl border bg-muted/20 p-4">
            <dl className="space-y-4">
              <InfoItem
                label="Last research"
                value={formatDateTime(organization.lastResearchAt)}
              />

              <InfoItem
                label="Confidence"
                value={
                  researchConfidence !== null ? `${researchConfidence}%` : "—"
                }
              />

              <InfoItem
                label="Research runs"
                value={organization._count?.research ?? research.length}
              />
            </dl>
          </div>
        </div>

        {research.length > 0 && (
          <div className="mt-6 border-t pt-5">
            <h3 className="text-sm font-semibold">Research history</h3>

            <div className="mt-3 divide-y rounded-lg border">
              {research.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {formatLabel(
                        String(
                          (item as { status?: string }).status ?? "UNKNOWN",
                        ),
                      )}
                    </p>

                    {"summary" in item && typeof item.summary === "string" && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.summary}
                      </p>
                    )}
                  </div>

                  {"createdAt" in item && (
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatDateTime(item.createdAt?.toString() ?? "")}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* People + Leads                                                     */}
      {/* ------------------------------------------------------------------ */}

      <div className="grid gap-4 lg:grid-cols-2">
        <Section
          title="People"
          description="People associated with this organization."
        >
          {people.length ? (
            <div className="divide-y rounded-lg border">
              {people.map((person) => (
                <div
                  key={person.id}
                  className="flex items-center justify-between gap-4 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {person.name}
                    </p>

                    {person.title && (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {person.title}
                      </p>
                    )}
                  </div>

                  <Link
                    href={`/people/${person.id}`}
                    className="shrink-0 text-xs text-primary hover:underline"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No people linked.</p>
          )}
        </Section>

        <Section
          title="Leads"
          description="Leads associated with this organization."
        >
          {leads.length ? (
            <div className="divide-y rounded-lg border">
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between gap-4 px-4 py-3"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/leads/${lead.id}`}
                      className="truncate text-sm font-medium hover:underline"
                    >
                      {lead.name}
                    </Link>

                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatLabel(lead.status)}
                    </p>
                  </div>

                  <Badge>{formatLabel(lead.status)}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No leads linked.</p>
          )}
        </Section>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Discovery + Metadata                                               */}
      {/* ------------------------------------------------------------------ */}

      <div className="grid gap-4 lg:grid-cols-2">
        <Section
          title="Discovery"
          description="How this organization entered the system."
        >
          <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
            <InfoItem
              label="Source"
              value={formatLabel(discoverySource as LeadSource | null)}
            />

            <InfoItem
              label="Discovered"
              value={formatDate(organization.discoveredAt)}
            />

            <InfoItem
              label="Relationship"
              value={formatLabel(
                relationshipStage as OrganizationRelationshipStage,
              )}
            />

            <InfoItem
              label="Target account"
              value={organization.isTargetAccount ? "Yes" : "No"}
            />
          </dl>

          {organization.discoveryUrl && (
            <a
              href={normalizeUrl(organization.discoveryUrl) ?? "#"}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-block text-sm text-primary hover:underline"
            >
              View discovery source ↗
            </a>
          )}
        </Section>

        <Section
          title="Tags & notes"
          description="Internal organization metadata."
        >
          <div>
            <h3 className="mb-3 text-sm font-medium">Tags</h3>

            <TagList items={organization.tags} emptyText="No tags." />
          </div>

          {organization.notes && (
            <div className="mt-6 border-t pt-5">
              <h3 className="text-sm font-medium">Notes</h3>

              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                {organization.notes}
              </p>
            </div>
          )}
        </Section>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Recent Activities                                                  */}
      {/* ------------------------------------------------------------------ */}

      <Section
        title="Recent activities"
        description="Latest recorded activity associated with the organization."
      >
        {activities.length ? (
          <div className="divide-y rounded-lg border">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <p className="text-sm">{activity.title}</p>

                <span className="text-xs text-muted-foreground">
                  {formatDateTime(activity.createdAt.toString())}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No recent activities.</p>
        )}
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* System Metadata                                                    */}
      {/* ------------------------------------------------------------------ */}

      <div className="flex flex-wrap gap-x-6 gap-y-2 border-t pt-5 text-xs text-muted-foreground">
        <span>Created {formatDateTime(organization.createdAt)}</span>

        <span>Updated {formatDateTime(organization.updatedAt)}</span>

        <span className="font-mono">ID: {organization.id}</span>
      </div>
    </section>
  );
}

// "use client";
// import Link from "next/link";
// import { useOrganization } from "../services/organizations.queries";
// type Detail = { id: string; name: string; website: string | null; industry: string | null; description: string | null; location: string | null; city: string | null; country: string | null; linkedinUrl: string | null; people: { id: string; name: string; title: string | null }[]; leads: { id: string; name: string; status: string }[]; research: { id: string; status: string; summary: string | null }[]; activities: { id: string; title: string; createdAt: string }[] };
// export default function OrganizationDetailsPage({ id }: { id: string }) {
//   const query = useOrganization(id);
//   const organization = query.data as unknown as Detail | undefined;
//   if (query.isPending) return <p className="text-sm text-muted-foreground">Loading organization…</p>;
//   if (query.isError || !organization) return <p role="alert" className="text-sm text-destructive">{query.error?.message || "Organization not found."}</p>;
//   return <section><Link href="/organizations" className="text-sm text-primary hover:underline">← Organizations</Link><p className="mt-5 text-sm text-muted-foreground">{organization.industry || "Organization"} · {[organization.city, organization.country].filter(Boolean).join(", ") || organization.location || "Location not provided"}</p><div className="flex flex-wrap items-center justify-between gap-3"><h1 className="mt-1 text-3xl font-semibold">{organization.name}</h1><Link href={`/organizations/${id}/edit`} target="_blank" className="rounded-lg border px-3 py-2 text-sm">Edit organization</Link></div>{organization.description && <p className="mt-4 max-w-3xl text-sm leading-6">{organization.description}</p>}
//     <div className="mt-5 flex flex-wrap gap-4 text-sm">{organization.website && <a className="text-primary hover:underline" href={organization.website} target="_blank" rel="noreferrer">Website ↗</a>}{organization.linkedinUrl && <a className="text-primary hover:underline" href={organization.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn ↗</a>}</div>
//     <div className="mt-6 grid gap-4 lg:grid-cols-2"><div className="rounded-xl border p-5"><h2 className="font-semibold">People</h2>{organization.people.length ? organization.people.map(p => <p key={p.id} className="mt-3 text-sm">{p.name} <span className="text-muted-foreground">{p.title || ""}</span></p>) : <p className="mt-3 text-sm text-muted-foreground">No people linked.</p>}</div><div className="rounded-xl border p-5"><h2 className="font-semibold">Leads</h2>{organization.leads.length ? organization.leads.map(l => <p key={l.id} className="mt-3 text-sm"><Link className="hover:underline" href={`/leads/${l.id}`}>{l.name}</Link> <span className="text-muted-foreground">· {l.status}</span></p>) : <p className="mt-3 text-sm text-muted-foreground">No leads linked.</p>}</div><div className="rounded-xl border p-5"><h2 className="font-semibold">Research</h2>{organization.research.length ? organization.research.map(r => <p key={r.id} className="mt-3 text-sm">{r.status} · {r.summary || "No summary recorded"}</p>) : <p className="mt-3 text-sm text-muted-foreground">No research runs.</p>}</div><div className="rounded-xl border p-5"><h2 className="font-semibold">Recent activities</h2>{organization.activities.length ? organization.activities.map(a => <p key={a.id} className="mt-3 text-sm">{a.title} · {new Date(a.createdAt).toLocaleDateString()}</p>) : <p className="mt-3 text-sm text-muted-foreground">No recent activities.</p>}</div></div>
//   </section>;
// }
