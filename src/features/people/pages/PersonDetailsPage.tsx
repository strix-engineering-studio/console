"use client";

import Link from "next/link";
import { usePerson } from "../services/people.queries";

import type {
  Person,
  PersonSeniority,
  BuyingRole,
  DecisionInfluence,
  ContactMethod,
  LeadSource,
} from "../types";
import { ActivityType } from "@/features/activity/types";
import { ResearchStatus, ResearchTrigger } from "@prisma/client";

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

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeUrl(value?: string | null) {
  if (!value) return null;

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return `https://${value}`;
}

/* -------------------------------------------------------------------------- */
/* UI Components                                                              */
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
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border bg-background">
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
          className="rounded-lg border bg-muted/20 px-3 py-2 text-sm"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function PersonDetailsPage({ id }: { id: string }) {
  const query = usePerson(id);

  const person = query.data as unknown as Person | undefined;

  /* ------------------------------------------------------------------------ */
  /* Loading                                                                  */
  /* ------------------------------------------------------------------------ */

  if (query.isPending) {
    return (
      <section className="space-y-6">
        <div className="h-5 w-28 animate-pulse rounded bg-muted" />

        <div className="rounded-2xl border p-6">
          <div className="h-5 w-48 animate-pulse rounded bg-muted" />
          <div className="mt-3 h-10 w-80 animate-pulse rounded bg-muted" />
          <div className="mt-3 h-4 w-64 animate-pulse rounded bg-muted" />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-48 animate-pulse rounded-xl border bg-muted/30" />
          <div className="h-48 animate-pulse rounded-xl border bg-muted/30" />
        </div>
      </section>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Error                                                                    */
  /* ------------------------------------------------------------------------ */

  if (query.isError || !person) {
    return (
      <section>
        <Link href="/people" className="text-sm text-primary hover:underline">
          ← People
        </Link>

        <div
          role="alert"
          className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 p-5"
        >
          <h1 className="font-semibold text-destructive">Person not found</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            {query.error?.message ||
              "The requested person could not be loaded."}
          </p>
        </div>
      </section>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Derived values                                                           */
  /* ------------------------------------------------------------------------ */

  const websiteUrl = normalizeUrl(person.websiteUrl);
  const linkedinUrl = normalizeUrl(person.linkedinUrl);
  const twitterUrl = normalizeUrl(person.twitterUrl);
  const githubUrl = normalizeUrl(person.githubUrl);
  const discoveryUrl = normalizeUrl(person.discoveryUrl);

  const researchConfidence =
    person.researchConfidence !== null &&
    person.researchConfidence !== undefined
      ? Math.round(person.researchConfidence * 100)
      : null;

  const leads = person.leads ?? [];
  const research = person.research ?? [];
  const activities = person.activities ?? [];

  const location = [person.city, person.state, person.country]
    .filter(Boolean)
    .join(", ");

  const isTargetable =
    !person.doNotContact &&
    (person.isDecisionMaker ||
      person.isInfluencer ||
      person.buyingRole === "CHAMPION");

  return (
    <section className="space-y-6 pb-10">
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                             */}
      {/* ------------------------------------------------------------------ */}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/people" className="text-sm text-primary hover:underline">
          ← People
        </Link>

        <Link
          href={`/people/${id}/edit`}
          target="_blank"
          className="rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-muted"
        >
          Edit person
        </Link>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Profile Hero                                                       */}
      {/* ------------------------------------------------------------------ */}

      <div className="rounded-2xl border bg-background p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            {/* Status badges */}

            <div className="flex flex-wrap gap-2">
              {person.isDecisionMaker && (
                <Badge variant="primary">Decision Maker</Badge>
              )}

              {person.isInfluencer && (
                <Badge variant="primary">Influencer</Badge>
              )}

              {person.isTechnical && <Badge>Technical</Badge>}

              {person.isDecisionMaker ||
              person.isInfluencer ||
              person.isTechnical ? null : (
                <Badge>Contact</Badge>
              )}

              {person.doNotContact && (
                <Badge variant="danger">Do Not Contact</Badge>
              )}

              {!person.doNotContact && isTargetable && (
                <Badge variant="success">Targetable</Badge>
              )}
            </div>

            {/* Name */}

            <h1 className="mt-3 text-3xl font-semibold tracking-tight">
              {person.name}
            </h1>

            {/* Professional title */}

            <p className="mt-1 text-base text-muted-foreground">
              {[person.title, person.department, person.organization?.name]
                .filter(Boolean)
                .join(" · ") || "Professional contact"}
            </p>

            {/* Organization */}

            {person.organization && (
              <div className="mt-4">
                <Link
                  href={`/organizations/${person.organization.id}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {person.organization.name}
                </Link>

                {person.organization.industry && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    · {person.organization.industry}
                  </span>
                )}
              </div>
            )}

            {/* Location */}

            {location && (
              <p className="mt-2 text-sm text-muted-foreground">{location}</p>
            )}

            {/* Bio */}

            {person.bio && (
              <p className="mt-5 max-w-3xl text-sm leading-6">{person.bio}</p>
            )}

            {/* Social links */}

            <div className="mt-5 flex flex-wrap gap-3">
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
            </div>
          </div>

          {/* Qualification summary */}

          <div className="grid min-w-[280px] grid-cols-2 gap-3">
            <div className="rounded-xl border bg-muted/20 p-4">
              <p className="text-xs text-muted-foreground">Leads</p>

              <p className="mt-1 text-2xl font-semibold">
                {person._count?.leads ?? leads.length}
              </p>
            </div>

            <div className="rounded-xl border bg-muted/20 p-4">
              <p className="text-xs text-muted-foreground">Research</p>

              <p className="mt-1 text-2xl font-semibold">
                {person._count?.research ?? research.length}
              </p>
            </div>

            <div className="rounded-xl border bg-muted/20 p-4">
              <p className="text-xs text-muted-foreground">Confidence</p>

              <p className="mt-1 text-2xl font-semibold">
                {researchConfidence !== null ? `${researchConfidence}%` : "—"}
              </p>
            </div>

            <div className="rounded-xl border bg-muted/20 p-4">
              <p className="text-xs text-muted-foreground">Activities</p>

              <p className="mt-1 text-2xl font-semibold">
                {person._count?.activities ?? activities.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Professional Profile                                               */}
      {/* ------------------------------------------------------------------ */}

      <Section
        title="Professional profile"
        description="Role, seniority, authority, and professional background."
      >
        <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          <InfoItem label="First name" value={person.firstName} />

          <InfoItem label="Last name" value={person.lastName} />

          <InfoItem label="Title" value={person.title} />

          <InfoItem label="Department" value={person.department} />

          <InfoItem
            label="Seniority"
            value={formatLabel(person.seniority as PersonSeniority | null)}
          />

          <InfoItem
            label="Buying role"
            value={formatLabel(person.buyingRole as BuyingRole | null)}
          />

          <InfoItem
            label="Decision influence"
            value={formatLabel(
              person.decisionInfluence as DecisionInfluence | null,
            )}
          />

          <InfoItem
            label="Technical"
            value={person.isTechnical ? "Yes" : "No"}
          />

          <InfoItem
            label="Decision maker"
            value={person.isDecisionMaker ? "Yes" : "No"}
          />

          <InfoItem
            label="Influencer"
            value={person.isInfluencer ? "Yes" : "No"}
          />
        </dl>
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* Contact + Location                                                 */}
      {/* ------------------------------------------------------------------ */}

      <div className="grid gap-4 lg:grid-cols-2">
        <Section
          title="Contact information"
          description="Available contact methods and verification state."
        >
          <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
            <InfoItem
              label="Work email"
              value={
                person.email ? (
                  <a
                    href={`mailto:${person.email}`}
                    className="text-primary hover:underline"
                  >
                    {person.email}
                  </a>
                ) : undefined
              }
            />

            <InfoItem label="Personal email" value={person.personalEmail} />

            <InfoItem
              label="Phone"
              value={
                person.phone ? (
                  <a
                    href={`tel:${person.phone}`}
                    className="text-primary hover:underline"
                  >
                    {person.phone}
                  </a>
                ) : undefined
              }
            />

            <InfoItem label="Alternate phone" value={person.alternatePhone} />

            <InfoItem
              label="Email verified"
              value={
                person.emailVerified === null ||
                person.emailVerified === undefined
                  ? "—"
                  : person.emailVerified
                    ? "Yes"
                    : "No"
              }
            />

            <InfoItem
              label="Phone verified"
              value={
                person.phoneVerified === null ||
                person.phoneVerified === undefined
                  ? "—"
                  : person.phoneVerified
                    ? "Yes"
                    : "No"
              }
            />

            <InfoItem
              label="Preferred contact"
              value={formatLabel(
                person.preferredContactMethod as ContactMethod | null,
              )}
            />

            <InfoItem
              label="Do not contact"
              value={person.doNotContact ? "Yes" : "No"}
            />
          </dl>
        </Section>

        <Section title="Location" description="Known geographical information.">
          <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
            <InfoItem label="Address" value={person.address} />

            <InfoItem label="City" value={person.city} />

            <InfoItem label="State" value={person.state} />

            <InfoItem label="Country" value={person.country} />

            <InfoItem label="Postal code" value={person.postalCode} />

            <InfoItem label="Timezone" value={person.timezone} />
          </dl>
        </Section>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Buying Intelligence                                                */}
      {/* ------------------------------------------------------------------ */}

      <Section
        title="Buying & opportunity intelligence"
        description="Signals that help determine whether and how this person should be approached."
      >
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <div>
            <h3 className="mb-3 text-sm font-semibold">Buying role</h3>

            <div className="flex flex-wrap gap-2">
              {person.buyingRole && (
                <Badge variant="primary">
                  {formatLabel(person.buyingRole)}
                </Badge>
              )}

              {person.decisionInfluence && (
                <Badge>{formatLabel(person.decisionInfluence)}</Badge>
              )}

              {person.isDecisionMaker && (
                <Badge variant="success">Decision maker</Badge>
              )}

              {person.isInfluencer && <Badge>Influencer</Badge>}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Pain points</h3>

            <SignalList items={person.painPoints} />
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Interest signals</h3>

            <SignalList items={person.interestsSignals} />
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Opportunity signals</h3>

            <SignalList items={person.opportunitySignals} />
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Interests</h3>

            <TagList
              items={person.interests}
              emptyText="No interests recorded."
            />
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Skills</h3>

            <TagList items={person.skills} emptyText="No skills recorded." />
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* Professional Background                                            */}
      {/* ------------------------------------------------------------------ */}

      <div className="grid gap-4 lg:grid-cols-2">
        <Section
          title="Previous companies"
          description="Known professional history."
        >
          <TagList
            items={person.previousCompanies}
            emptyText="No previous companies recorded."
          />
        </Section>

        <Section
          title="Organization"
          description="Current organization relationship."
        >
          {person.organization ? (
            <div className="rounded-lg border p-4">
              <Link
                href={`/organizations/${person.organization.id}`}
                className="font-medium text-primary hover:underline"
              >
                {person.organization.name}
              </Link>

              {person.organization.industry && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {person.organization.industry}
                </p>
              )}

              {person.organization.website && (
                <a
                  href={normalizeUrl(person.organization.website) ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block text-sm text-primary hover:underline"
                >
                  Company website ↗
                </a>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No organization linked.
            </p>
          )}
        </Section>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Research                                                           */}
      {/* ------------------------------------------------------------------ */}

      <Section
        title="Research intelligence"
        description="Evidence and research collected about this person."
      >
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <div>
            <h3 className="text-sm font-semibold">Research summary</h3>

            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
              {person.researchSummary || "No research summary recorded."}
            </p>
          </div>

          <div className="rounded-xl border bg-muted/20 p-4">
            <dl className="space-y-4">
              <InfoItem
                label="Last research"
                value={formatDateTime(person.lastResearchAt)}
              />

              <InfoItem
                label="Confidence"
                value={
                  researchConfidence !== null ? `${researchConfidence}%` : "—"
                }
              />

              <InfoItem
                label="Research runs"
                value={person._count?.research ?? research.length}
              />
            </dl>
          </div>
        </div>

        {research.length > 0 && (
          <div className="mt-6 border-t pt-5">
            <h3 className="text-sm font-semibold">Research history</h3>

            <div className="mt-3 divide-y rounded-lg border">
              {research.map((item) => {
                const researchItem = item as {
                  id: string;
                  status: ResearchStatus;
                  summary: string | null;
                  provider: string | null;
                  data: null;
                  trigger: ResearchTrigger | null;
                  leadId: string | null;
                  organizationId: string | null;
                  personId: string | null;
                  startedAt: Date;
                  completedAt: Date | null;
                  createdAt: Date;
                  adminId: string | null;
                };

                return (
                  <div
                    key={researchItem.id}
                    className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {formatLabel(researchItem.status)}
                      </p>

                      {researchItem.summary && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {researchItem.summary}
                        </p>
                      )}
                    </div>

                    {researchItem.createdAt && (
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatDateTime(researchItem.createdAt.toString())}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* Contact History                                                    */}
      {/* ------------------------------------------------------------------ */}

      <Section
        title="Contact history"
        description="Recent outreach and response information."
      >
        <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-3">
          <InfoItem
            label="Last contacted"
            value={formatDateTime(person.lastContactedAt)}
          />

          <InfoItem
            label="Last responded"
            value={formatDateTime(person.lastRespondedAt)}
          />

          <InfoItem
            label="Preferred method"
            value={formatLabel(
              person.preferredContactMethod as ContactMethod | null,
            )}
          />
        </dl>
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* Discovery                                                          */}
      {/* ------------------------------------------------------------------ */}

      <Section
        title="Discovery"
        description="How this person was discovered and verified."
      >
        <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          <InfoItem
            label="Discovery source"
            value={formatLabel(person.discoverySource as LeadSource | null)}
          />

          <InfoItem
            label="Discovered"
            value={formatDate(person.discoveredAt)}
          />

          <InfoItem label="Organization" value={person.organization?.name} />

          <InfoItem label="Organization ID" value={person.organizationId} />
        </dl>

        {discoveryUrl && (
          <a
            href={discoveryUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-block text-sm text-primary hover:underline"
          >
            View discovery source ↗
          </a>
        )}
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* Leads                                                              */}
      {/* ------------------------------------------------------------------ */}

      <Section title="Leads" description="Leads associated with this person.">
        {leads.length ? (
          <div className="divide-y rounded-lg border">
            {leads.map((lead) => {
              const leadItem = lead as {
                id: string;
                name?: string;
                status?: string;
              };

              return (
                <div
                  key={leadItem.id}
                  className="flex items-center justify-between gap-4 px-4 py-3"
                >
                  <div>
                    <Link
                      href={`/leads/${leadItem.id}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {leadItem.name || "Unnamed lead"}
                    </Link>

                    {leadItem.status && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatLabel(leadItem.status)}
                      </p>
                    )}
                  </div>

                  {leadItem.status && (
                    <Badge>{formatLabel(leadItem.status)}</Badge>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No leads linked.</p>
        )}
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* Tags & Notes                                                       */}
      {/* ------------------------------------------------------------------ */}

      <Section
        title="Tags & notes"
        description="Internal information for lead qualification."
      >
        <div>
          <h3 className="mb-3 text-sm font-medium">Tags</h3>

          <TagList items={person.tags} emptyText="No tags." />
        </div>

        {person.notes && (
          <div className="mt-6 border-t pt-5">
            <h3 className="text-sm font-medium">Notes</h3>

            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
              {person.notes}
            </p>
          </div>
        )}
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* Activities                                                         */}
      {/* ------------------------------------------------------------------ */}

      <Section
        title="Recent activities"
        description="Latest activity associated with this person."
      >
        {activities.length ? (
          <div className="divide-y rounded-lg border">
            {activities.map((activity) => {
              const activityItem = activity as {
                id: string;
                leadId: string | null;
                organizationId: string | null;
                personId: string | null;

                adminId: string | null;
                title: string;
                description: string | null;
                type: ActivityType;
                sourceUrl: string | null;
                metadata: any;
                createdAt?: Date;
              };

              return (
                <div
                  key={activityItem.id}
                  className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <p className="text-sm">{activityItem.title || "Activity"}</p>

                  {activityItem.createdAt && (
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(activityItem.createdAt.toString())}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No recent activities.</p>
        )}
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* Metadata                                                           */}
      {/* ------------------------------------------------------------------ */}

      <div className="flex flex-wrap gap-x-6 gap-y-2 border-t pt-5 text-xs text-muted-foreground">
        <span>Created {formatDateTime(person.createdAt)}</span>

        <span>Updated {formatDateTime(person.updatedAt)}</span>

        <span className="font-mono">ID: {person.id}</span>
      </div>
    </section>
  );
}
