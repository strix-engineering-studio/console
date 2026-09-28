import { Lead, ResearchRun, Activity } from "@prisma/client";

export type Person = {
  // =========================================================
  // Identity
  // =========================================================

  id: string;

  name: string;

  firstName?: string | null;
  lastName?: string | null;
  middleName?: string | null;

  // =========================================================
  // Contact
  // =========================================================

  email?: string | null;
  personalEmail?: string | null;

  phone?: string | null;
  alternatePhone?: string | null;

  // =========================================================
  // Professional
  // =========================================================

  title?: string | null;
  department?: string | null;
  seniority?: PersonSeniority | null;

  isDecisionMaker: boolean;
  isInfluencer: boolean;
  isTechnical: boolean;

  // =========================================================
  // Social / Professional
  // =========================================================

  linkedinUrl?: string | null;
  twitterUrl?: string | null;
  githubUrl?: string | null;
  websiteUrl?: string | null;

  // =========================================================
  // Location
  // =========================================================

  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
  timezone?: string | null;

  // =========================================================
  // Professional Background
  // =========================================================

  bio?: string | null;

  previousCompanies: string[];
  skills: string[];
  interests: string[];

  // =========================================================
  // Buying / Influence
  // =========================================================

  buyingRole?: BuyingRole | null;
  decisionInfluence?: DecisionInfluence | null;

  painPoints: string[];
  interestsSignals: string[];
  opportunitySignals: string[];

  // =========================================================
  // Contactability
  // =========================================================

  emailVerified?: boolean | null;
  phoneVerified?: boolean | null;

  preferredContactMethod?: ContactMethod | null;

  doNotContact: boolean;

  lastContactedAt?: string | null;
  lastRespondedAt?: string | null;

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
  // Organization
  // =========================================================

  organizationId?: string | null;

  organization?: {
    id?: string;
    name: string;
    website?: string | null;
    industry?: string | null;
  } | null;

  // =========================================================
  // Relations
  // =========================================================

  leads?: Lead[];
  research?: ResearchRun[];
  activities?: Activity[];

  _count?: {
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

export type PersonSeniority =
  | "INTERN"
  | "ENTRY"
  | "MID"
  | "SENIOR"
  | "LEAD"
  | "MANAGER"
  | "DIRECTOR"
  | "VP"
  | "C_LEVEL"
  | "FOUNDER"
  | "OWNER"
  | "PARTNER"
  | "UNKNOWN";

export type BuyingRole =
  | "DECISION_MAKER"
  | "CHAMPION"
  | "INFLUENCER"
  | "USER"
  | "GATEKEEPER"
  | "PROCUREMENT"
  | "UNKNOWN";

export type DecisionInfluence =
  "NONE" | "LOW" | "MEDIUM" | "HIGH" | "FINAL_DECISION";

export type ContactMethod =
  "EMAIL" | "PHONE" | "LINKEDIN" | "WHATSAPP" | "WEBSITE" | "OTHER";

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
