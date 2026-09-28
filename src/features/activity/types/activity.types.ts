export type Activity = {
  id: string;

  // Activity
  type: ActivityType;
  title: string;
  description?: string | null;

  sourceUrl?: string | null;
  metadata?: Record<string, unknown> | null;

  // Relations
  leadId?: string | null;
  lead?: {
    id: string;
    name: string;
  } | null;

  organizationId?: string | null;
  organization?: {
    id: string;
    name: string;
  } | null;

  personId?: string | null;
  person?: {
    id: string;
    name: string;
  } | null;

  adminId?: string | null;
  admin?: {
    id: string;
    email: string;
  } | null;

  // Timestamps
  createdAt: string;
};

/* =========================================================
   ACTIVITY TYPE
   ========================================================= */

export type ActivityType =
  | "NOTE"
  | "EMAIL_SENT"
  | "EMAIL_RECEIVED"
  | "CALL"
  | "MEETING"
  | "LINKEDIN_MESSAGE"
  | "WHATSAPP_MESSAGE"
  | "WEBSITE_VISIT"
  | "RESEARCH"
  | "COMPANY_UPDATE"
  | "PERSON_UPDATE"
  | "LEAD_CREATED"
  | "LEAD_UPDATED"
  | "STATUS_CHANGED"
  | "FOLLOW_UP"
  | "PROPOSAL_SENT"
  | "PROPOSAL_RECEIVED"
  | "OTHER";
