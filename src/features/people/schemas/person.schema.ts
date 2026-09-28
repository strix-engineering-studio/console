import { z } from "zod";

/* =========================================================
   ENUMS
   ========================================================= */

export const personSeniority = z.enum([
  "INTERN",
  "ENTRY",
  "MID",
  "SENIOR",
  "LEAD",
  "MANAGER",
  "DIRECTOR",
  "VP",
  "C_LEVEL",
  "FOUNDER",
  "OWNER",
  "PARTNER",
  "UNKNOWN",
]);

export const buyingRole = z.enum([
  "DECISION_MAKER",
  "CHAMPION",
  "INFLUENCER",
  "USER",
  "GATEKEEPER",
  "PROCUREMENT",
  "UNKNOWN",
]);

export const decisionInfluence = z.enum([
  "NONE",
  "LOW",
  "MEDIUM",
  "HIGH",
  "FINAL_DECISION",
]);

export const contactMethod = z.enum([
  "EMAIL",
  "PHONE",
  "LINKEDIN",
  "WHATSAPP",
  "WEBSITE",
  "OTHER",
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

/* =========================================================
   HELPERS
   ========================================================= */

const optionalString = (max: number) =>
  z.string().trim().max(max).optional().nullable();

const optionalUrl = () =>
  z
    .union([z.string().url(), z.literal("")])
    .optional()
    .nullable();

const stringArray = (maxItems = 100, itemMax = 500) =>
  z.array(z.string().trim().min(1).max(itemMax)).max(maxItems).optional();

/* =========================================================
   PERSON
   ========================================================= */

export const personSchema = z.object({
  // -------------------------------------------------------
  // Identity
  // -------------------------------------------------------

  name: z.string().trim().min(1).max(200),

  firstName: optionalString(100),

  lastName: optionalString(100),

  middleName: optionalString(100),

  // -------------------------------------------------------
  // Contact
  // -------------------------------------------------------

  email: z
    .union([z.string().email(), z.literal("")])
    .optional()
    .nullable(),

  personalEmail: z
    .union([z.string().email(), z.literal("")])
    .optional()
    .nullable(),

  phone: optionalString(50),

  alternatePhone: optionalString(50),

  // -------------------------------------------------------
  // Professional
  // -------------------------------------------------------

  title: optionalString(160),

  department: optionalString(160),

  seniority: personSeniority.optional().nullable(),

  isDecisionMaker: z.boolean().optional(),

  isInfluencer: z.boolean().optional(),

  isTechnical: z.boolean().optional(),

  // -------------------------------------------------------
  // Social / Professional
  // -------------------------------------------------------

  linkedinUrl: optionalUrl(),

  twitterUrl: optionalUrl(),

  githubUrl: optionalUrl(),

  websiteUrl: optionalUrl(),

  // -------------------------------------------------------
  // Location
  // -------------------------------------------------------

  address: optionalString(500),

  city: optionalString(120),

  state: optionalString(120),

  country: optionalString(120),

  postalCode: optionalString(30),

  timezone: optionalString(100),

  // -------------------------------------------------------
  // Professional Background
  // -------------------------------------------------------

  bio: optionalString(10000),

  previousCompanies: stringArray(50, 200),

  skills: stringArray(100, 100),

  interests: stringArray(100, 200),

  // -------------------------------------------------------
  // Buying / Influence
  // -------------------------------------------------------

  buyingRole: buyingRole.optional().nullable(),

  decisionInfluence: decisionInfluence.optional().nullable(),

  painPoints: stringArray(100, 1000),

  interestsSignals: stringArray(100, 1000),

  opportunitySignals: stringArray(100, 1000),

  // -------------------------------------------------------
  // Contactability
  // -------------------------------------------------------

  emailVerified: z.boolean().optional().nullable(),

  phoneVerified: z.boolean().optional().nullable(),

  preferredContactMethod: contactMethod.optional().nullable(),

  doNotContact: z.boolean().optional(),

  lastContactedAt: z.string().datetime().optional().nullable(),

  lastRespondedAt: z.string().datetime().optional().nullable(),

  // -------------------------------------------------------
  // Discovery
  // -------------------------------------------------------

  discoverySource: leadSource.optional().nullable(),

  discoveryUrl: optionalUrl(),

  discoveredAt: z.string().datetime().optional().nullable(),

  // -------------------------------------------------------
  // Organization
  // -------------------------------------------------------

  organizationId: z.string().trim().min(1).optional().nullable(),

  // -------------------------------------------------------
  // Metadata
  // -------------------------------------------------------

  tags: stringArray(50, 100),

  notes: optionalString(10000),
});

/* =========================================================
   TYPES
   ========================================================= */

export type PersonInput = z.infer<typeof personSchema>;

export type PersonSeniority = z.infer<typeof personSeniority>;

export type BuyingRole = z.infer<typeof buyingRole>;

export type DecisionInfluence = z.infer<typeof decisionInfluence>;

export type ContactMethod = z.infer<typeof contactMethod>;

export type LeadSource = z.infer<typeof leadSource>;
