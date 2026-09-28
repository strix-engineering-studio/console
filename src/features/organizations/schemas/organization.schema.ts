import { z } from "zod";

/* =========================================================
   ENUMS
   ========================================================= */

export const organizationBusinessType = z.enum([
  "STARTUP",
  "SMB",
  "MID_MARKET",
  "ENTERPRISE",
  "AGENCY",
  "CONSULTING",
  "NON_PROFIT",
  "GOVERNMENT",
  "INDIVIDUAL",
  "OTHER",
]);

export const companyStage = z.enum([
  "IDEA",
  "PRE_SEED",
  "SEED",
  "SERIES_A",
  "SERIES_B",
  "SERIES_C",
  "GROWTH",
  "MATURE",
  "PUBLIC",
  "BOOTSTRAPPED",
  "UNKNOWN",
]);

export const organizationRelationshipStage = z.enum([
  "UNKNOWN",
  "PROSPECT",
  "RESEARCHING",
  "CONTACTED",
  "ENGAGED",
  "QUALIFIED",
  "CLIENT",
  "PARTNER",
  "FORMER_CLIENT",
  "NOT_A_FIT",
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

const optionalUrl = () =>
  z
    .union([z.string().url(), z.literal("")])
    .optional()
    .nullable();

const optionalString = (max: number) =>
  z.string().trim().max(max).optional().nullable();

const stringArray = (maxItems = 100, itemMax = 500) =>
  z.array(z.string().trim().min(1).max(itemMax)).max(maxItems).optional();

/* =========================================================
   ORGANIZATION
   ========================================================= */

export const organizationSchema = z.object({
  // -------------------------------------------------------
  // Identity
  // -------------------------------------------------------

  name: z.string().trim().min(1).max(200),

  legalName: optionalString(200),

  aliases: stringArray(50, 200),

  description: optionalString(10000),

  // -------------------------------------------------------
  // Web / Social
  // -------------------------------------------------------

  website: optionalUrl(),

  linkedinUrl: optionalUrl(),

  twitterUrl: optionalUrl(),

  githubUrl: optionalUrl(),

  crunchbaseUrl: optionalUrl(),

  // -------------------------------------------------------
  // Classification
  // -------------------------------------------------------

  industry: optionalString(120),

  subIndustry: optionalString(120),

  businessType: organizationBusinessType.optional().nullable(),

  businessModel: optionalString(200),

  // -------------------------------------------------------
  // Company Size
  // -------------------------------------------------------

  employeeCountMin: z.number().int().nonnegative().optional().nullable(),

  employeeCountMax: z.number().int().nonnegative().optional().nullable(),

  employeeCount: z.number().int().nonnegative().optional().nullable(),

  companyStage: companyStage.optional().nullable(),

  foundedYear: z
    .number()
    .int()
    .min(1000)
    .max(new Date().getFullYear())
    .optional()
    .nullable(),

  // -------------------------------------------------------
  // Geography
  // -------------------------------------------------------

  address: optionalString(500),

  city: optionalString(120),

  state: optionalString(120),

  country: optionalString(120),

  postalCode: optionalString(30),

  timezone: optionalString(100),

  // -------------------------------------------------------
  // Business Information
  // -------------------------------------------------------

  products: stringArray(100, 500),

  services: stringArray(100, 500),

  technologies: stringArray(100, 200),

  targetMarkets: stringArray(100, 200),

  // -------------------------------------------------------
  // Commercial / Financial
  // -------------------------------------------------------

  revenueRange: optionalString(120),

  fundingStage: optionalString(120),

  totalFunding: optionalString(120),

  lastFundingDate: z.string().datetime().optional().nullable(),

  isBootstrapped: z.boolean().optional().nullable(),

  // -------------------------------------------------------
  // Opportunity Signals
  // -------------------------------------------------------

  hiring: z.boolean().optional().nullable(),

  hiringSignals: stringArray(100, 1000),

  growthSignals: stringArray(100, 1000),

  technologySignals: stringArray(100, 1000),

  painPoints: stringArray(100, 1000),

  opportunitySignals: stringArray(100, 1000),

  // -------------------------------------------------------
  // Relationship
  // -------------------------------------------------------

  relationshipStage: organizationRelationshipStage.optional().nullable(),

  isTargetAccount: z.boolean().optional(),

  isClient: z.boolean().optional(),

  isPartner: z.boolean().optional(),

  // -------------------------------------------------------
  // Discovery
  // -------------------------------------------------------

  discoverySource: leadSource.optional().nullable(),

  discoveryUrl: optionalUrl(),

  discoveredAt: z.string().datetime().optional().nullable(),

  // -------------------------------------------------------
  // Metadata
  // -------------------------------------------------------

  tags: stringArray(50, 100),

  notes: optionalString(10000),
});

/* =========================================================
   TYPES
   ========================================================= */

export type OrganizationInput = z.infer<typeof organizationSchema>;

export type OrganizationBusinessType = z.infer<typeof organizationBusinessType>;

export type CompanyStage = z.infer<typeof companyStage>;

export type OrganizationRelationshipStage = z.infer<
  typeof organizationRelationshipStage
>;

export type LeadSource = z.infer<typeof leadSource>;
