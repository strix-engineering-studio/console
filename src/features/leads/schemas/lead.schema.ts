import { z } from "zod";

/* =========================================================
   ENUMS
   ========================================================= */

export const leadStatus = z.enum([
  "NEW",
  "RESEARCHING",
  "CONTACTED",
  "ENGAGED",
  "QUALIFIED",
  "PROPOSAL",
  "NEGOTIATION",
  "WON",
  "LOST",
  "DISQUALIFIED",
]);

export const leadSource = z.enum([
  "MANUAL",
  "RESEARCH",
  "REFERRAL",
  "WEBSITE",
  "LINKEDIN",
  "COLD_OUTREACH",
  "MCP",
  "IMPORT",
  "OTHER",
]);

export const leadPriority = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);

export const qualificationStatus = z.enum([
  "UNQUALIFIED",
  "PARTIALLY_QUALIFIED",
  "QUALIFIED",
  "DISQUALIFIED",
]);

export const leadTimeline = z.enum([
  "IMMEDIATE",
  "WITHIN_30_DAYS",
  "ONE_TO_THREE_MONTHS",
  "THREE_TO_SIX_MONTHS",
  "SIX_PLUS_MONTHS",
  "UNKNOWN",
]);

export const engagementLevel = z.enum([
  "NONE",
  "LOW",
  "MEDIUM",
  "HIGH",
  "VERY_HIGH",
]);

export const contactMethod = z.enum([
  "EMAIL",
  "PHONE",
  "LINKEDIN",
  "WHATSAPP",
  "WEBSITE",
  "OTHER",
]);

/* =========================================================
   HELPERS
   ========================================================= */

const optionalString = (max: number) =>
  z.string().trim().max(max).optional().nullable();

const optionalUrl = () =>
  z
    .union([z.string().url().max(2000), z.literal("")])
    .optional()
    .nullable();

const stringArray = (maxItems: number, itemMax: number) =>
  z.array(z.string().trim().min(1).max(itemMax)).max(maxItems).optional();

/* =========================================================
   LEAD CREATE SCHEMA
   =========================================================
   Fields that can be supplied when creating a lead.
   System-controlled lifecycle counters/dates are excluded.
   ========================================================= */

export const leadSchema = z.object({
  /* -------------------------
     Identity
     ------------------------- */

  name: z.string().trim().min(1).max(200),

  description: optionalString(10000),

  /* -------------------------
     Pipeline
     ------------------------- */

  status: leadStatus.optional(),

  source: leadSource.optional(),

  priority: leadPriority.optional(),

  /* -------------------------
     Ownership
     ------------------------- */

  ownerId: z.string().trim().min(1).optional().nullable(),

  /* -------------------------
     Organization / Person
     ------------------------- */

  organizationId: z.string().trim().min(1).optional().nullable(),

  personId: z.string().trim().min(1).optional().nullable(),

  /* -------------------------
     Qualification
     ------------------------- */

  qualificationStatus: qualificationStatus.optional().nullable(),

  fitScore: z.number().min(0).max(100).optional().nullable(),

  intentScore: z.number().min(0).max(100).optional().nullable(),

  engagementScore: z.number().min(0).max(100).optional().nullable(),

  overallScore: z.number().min(0).max(100).optional().nullable(),

  qualificationNotes: optionalString(10000),

  /* -------------------------
     Need / Problem
     ------------------------- */

  problemStatement: optionalString(10000),

  painPoints: stringArray(50, 500),

  requirements: stringArray(100, 1000),

  requestedServices: stringArray(50, 500),

  /* -------------------------
     Commercial
     ------------------------- */

  budgetMin: z.number().nonnegative().optional().nullable(),

  budgetMax: z.number().nonnegative().optional().nullable(),

  currency: z
    .string()
    .trim()
    .length(3)
    .transform((value) => value.toUpperCase())
    .optional()
    .nullable(),

  estimatedValue: z.number().nonnegative().optional().nullable(),

  /* -------------------------
     Timeline
     ------------------------- */

  expectedStartDate: z.string().datetime().optional().nullable(),

  expectedCloseDate: z.string().datetime().optional().nullable(),

  timeline: leadTimeline.optional().nullable(),

  /* -------------------------
     Engagement
     ------------------------- */

  engagementLevel: engagementLevel.optional(),

  /* -------------------------
     Outreach
     ------------------------- */

  outreachChannel: contactMethod.optional().nullable(),

  nextFollowUpAt: z.string().datetime().optional().nullable(),

  /* -------------------------
     Discovery
     ------------------------- */

  discoveryUrl: optionalUrl(),

  /* -------------------------
     Metadata
     ------------------------- */

  tags: stringArray(50, 100),

  notes: optionalString(10000),
});

/* =========================================================
   STATUS UPDATE
   ========================================================= */

export const leadStatusSchema = z.object({
  status: leadStatus,
});

/* =========================================================
   QUALIFICATION
   ========================================================= */

export const leadQualificationSchema = z.object({
  qualificationStatus: qualificationStatus,

  fitScore: z.number().min(0).max(100).optional().nullable(),

  intentScore: z.number().min(0).max(100).optional().nullable(),

  engagementScore: z.number().min(0).max(100).optional().nullable(),

  qualificationNotes: optionalString(10000),
});

/* =========================================================
   CONTACT / OUTREACH
   ========================================================= */

export const leadContactSchema = z.object({
  outreachChannel: contactMethod.optional().nullable(),

  description: optionalString(4000),
});

/* =========================================================
   FOLLOW-UP
   ========================================================= */

export const leadFollowUpSchema = z.object({
  nextFollowUpAt: z.string().datetime().nullable(),

  notes: optionalString(5000),
});

/* =========================================================
   CONVERSION
   ========================================================= */

export const leadConvertSchema = z.object({
  notes: optionalString(5000),
});

/* =========================================================
   DISQUALIFICATION
   ========================================================= */

export const leadDisqualifySchema = z.object({
  reason: z.string().trim().min(1).max(5000),
});

/* =========================================================
   PATCH / UPDATE
   =========================================================
   Only user-editable fields.
   System lifecycle fields are intentionally excluded.
   ========================================================= */

export const leadUpdateSchema = leadSchema.partial();

/* =========================================================
   TYPES
   ========================================================= */

export type LeadInput = z.infer<typeof leadSchema>;

export type LeadUpdateInput = z.infer<typeof leadUpdateSchema>;

export type LeadStatus = z.infer<typeof leadStatus>;

export type LeadSource = z.infer<typeof leadSource>;

export type LeadPriority = z.infer<typeof leadPriority>;

export type QualificationStatus = z.infer<typeof qualificationStatus>;

export type LeadTimeline = z.infer<typeof leadTimeline>;

export type EngagementLevel = z.infer<typeof engagementLevel>;

export type ContactMethod = z.infer<typeof contactMethod>;

export type LeadQualificationInput = z.infer<typeof leadQualificationSchema>;

export type LeadContactInput = z.infer<typeof leadContactSchema>;

export type LeadFollowUpInput = z.infer<typeof leadFollowUpSchema>;

export type LeadConvertInput = z.infer<typeof leadConvertSchema>;

export type LeadDisqualifyInput = z.infer<typeof leadDisqualifySchema>;
