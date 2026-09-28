import { ResearchRun, Activity } from "@prisma/client";

export type Lead = {
  id: string;

  // =========================================================
  // Opportunity Identity
  // =========================================================

  name: string;
  description?: string | null;

  status: LeadStatus;
  source: LeadSource;
  priority: LeadPriority;

  // =========================================================
  // Ownership
  // =========================================================

  ownerId?: string | null;

  owner?: {
    id: string;
    email: string;
  } | null;

  // =========================================================
  // Organization / Person
  // =========================================================

  organizationId?: string | null;

  organization?: {
    id: string;
    name: string;
    industry?: string | null;
    website?: string | null;
    city?: string | null;
    country?: string | null;
  } | null;

  personId?: string | null;

  person?: {
    id: string;
    name: string;
    title?: string | null;
    email?: string | null;
    phone?: string | null;
    linkedinUrl?: string | null;
    isDecisionMaker: boolean;
  } | null;

  // =========================================================
  // Qualification
  // =========================================================

  qualificationStatus?: QualificationStatus | null;

  fitScore?: number | null;
  intentScore?: number | null;
  engagementScore?: number | null;
  overallScore?: number | null;

  qualificationNotes?: string | null;

  // =========================================================
  // Need / Problem
  // =========================================================

  problemStatement?: string | null;

  painPoints: string[];

  requirements: string[];

  requestedServices: string[];

  // =========================================================
  // Commercial
  // =========================================================

  budgetMin?: number | null;

  budgetMax?: number | null;

  currency?: string | null;

  estimatedValue?: number | null;

  // =========================================================
  // Timeline
  // =========================================================

  expectedStartDate?: string | null;

  expectedCloseDate?: string | null;

  timeline?: LeadTimeline | null;

  // =========================================================
  // Engagement
  // =========================================================

  engagementLevel: EngagementLevel;

  firstContactedAt?: string | null;

  lastContactedAt?: string | null;

  lastRespondedAt?: string | null;

  responseCount: number;

  // =========================================================
  // Outreach
  // =========================================================

  outreachChannel?: ContactMethod | null;

  outreachCount: number;

  lastOutreachAt?: string | null;

  nextFollowUpAt?: string | null;

  // =========================================================
  // Pipeline
  // =========================================================

  qualifiedAt?: string | null;

  contactedAt?: string | null;

  engagedAt?: string | null;

  closedAt?: string | null;

  // =========================================================
  // Lost / Disqualified
  // =========================================================

  disqualificationReason?: string | null;

  lostReason?: string | null;

  // =========================================================
  // Conversion
  // =========================================================

  convertedToClient: boolean;

  convertedAt?: string | null;

  // =========================================================
  // Discovery
  // =========================================================

  discoveryUrl?: string | null;

  // =========================================================
  // Metadata
  // =========================================================

  tags: string[];

  notes?: string | null;

  // =========================================================
  // Relations
  // =========================================================

  research?: ResearchRun[];

  activities?: Activity[];

  // =========================================================
  // Timestamps
  // =========================================================

  createdAt: string;

  updatedAt: string;
};

/* =========================================================
   ENUMS
   ========================================================= */

export type LeadStatus =
  | "NEW"
  | "RESEARCHING"
  | "CONTACTED"
  | "ENGAGED"
  | "QUALIFIED"
  | "PROPOSAL"
  | "NEGOTIATION"
  | "WON"
  | "LOST"
  | "DISQUALIFIED";

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

export type LeadPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type QualificationStatus =
  "UNQUALIFIED" | "PARTIALLY_QUALIFIED" | "QUALIFIED" | "DISQUALIFIED";

export type LeadTimeline =
  | "IMMEDIATE"
  | "WITHIN_30_DAYS"
  | "ONE_TO_THREE_MONTHS"
  | "THREE_TO_SIX_MONTHS"
  | "SIX_PLUS_MONTHS"
  | "UNKNOWN";

export type EngagementLevel = "NONE" | "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";

export type ContactMethod =
  "EMAIL" | "PHONE" | "LINKEDIN" | "WHATSAPP" | "WEBSITE" | "OTHER";
