import { Person, Lead, ResearchRun, Activity } from "@prisma/client";

export type Organization = {
  // =========================================================
  // Identity
  // =========================================================

  id: string;
  name: string;
  legalName?: string | null;
  aliases: string[];
  description?: string | null;

  // =========================================================
  // Web / Social
  // =========================================================

  website?: string | null;
  linkedinUrl?: string | null;
  twitterUrl?: string | null;
  githubUrl?: string | null;
  crunchbaseUrl?: string | null;

  // =========================================================
  // Classification
  // =========================================================

  industry?: string | null;
  subIndustry?: string | null;
  businessType?: OrganizationBusinessType | null;
  businessModel?: string | null;

  // =========================================================
  // Company Size
  // =========================================================

  employeeCountMin?: number | null;
  employeeCountMax?: number | null;
  employeeCount?: number | null;

  companyStage?: CompanyStage | null;
  foundedYear?: number | null;

  // =========================================================
  // Geography
  // =========================================================

  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
  timezone?: string | null;

  // =========================================================
  // Business Information
  // =========================================================

  products: string[];
  services: string[];
  technologies: string[];
  targetMarkets: string[];

  // =========================================================
  // Commercial / Financial
  // =========================================================

  revenueRange?: string | null;
  fundingStage?: string | null;
  totalFunding?: string | null;
  lastFundingDate?: string | null;
  isBootstrapped?: boolean | null;

  // =========================================================
  // Buying / Opportunity Signals
  // =========================================================

  hiring?: boolean | null;
  hiringSignals: string[];
  growthSignals: string[];
  technologySignals: string[];
  painPoints: string[];
  opportunitySignals: string[];

  // =========================================================
  // Relationship
  // =========================================================

  relationshipStage?: OrganizationRelationshipStage | null;
  isTargetAccount: boolean;
  isClient: boolean;
  isPartner: boolean;

  // =========================================================
  // Discovery
  // =========================================================

  discoverySource?: LeadSource | null;
  discoveryUrl?: string | null;
  discoveredAt?: string | null;

  // =========================================================
  // Research
  // =========================================================

  lastResearchAt?: string | null;
  researchSummary?: string | null;
  researchConfidence?: number | null;

  // =========================================================
  // Metadata
  // =========================================================

  tags: string[];
  notes?: string | null;

  // =========================================================
  // Relations
  // =========================================================

  people?: Person[];
  leads?: Lead[];

  research?: ResearchRun[];
  activities?: Activity[];

  _count?: {
    people: number;
    leads: number;
    research?: number;
    activities?: number;
  };

  // =========================================================
  // Timestamps
  // =========================================================

  createdAt: string;
  updatedAt: string;
};

/* =========================================================
   ENUMS
   ========================================================= */

export type OrganizationBusinessType =
  | "STARTUP"
  | "SMB"
  | "MID_MARKET"
  | "ENTERPRISE"
  | "AGENCY"
  | "CONSULTING"
  | "NON_PROFIT"
  | "GOVERNMENT"
  | "INDIVIDUAL"
  | "OTHER";

export type CompanyStage =
  | "IDEA"
  | "PRE_SEED"
  | "SEED"
  | "SERIES_A"
  | "SERIES_B"
  | "SERIES_C"
  | "GROWTH"
  | "MATURE"
  | "PUBLIC"
  | "BOOTSTRAPPED"
  | "UNKNOWN";

export type OrganizationRelationshipStage =
  | "UNKNOWN"
  | "PROSPECT"
  | "RESEARCHING"
  | "CONTACTED"
  | "ENGAGED"
  | "QUALIFIED"
  | "CLIENT"
  | "PARTNER"
  | "FORMER_CLIENT"
  | "NOT_A_FIT";

export type LeadSource =
  | "MANUAL"
  | "RESEARCH"
  | "REFERRAL"
  | "WEBSITE"
  | "LINKEDIN"
  | "COLD_OUTREACH"
  | "MCP"
  | "IMPORT"
  | "OTHER";
