import { z } from "zod";

/* =========================================================
   ENUMS
   ========================================================= */

export const activityType = z.enum([
  "NOTE",
  "EMAIL_SENT",
  "EMAIL_RECEIVED",
  "CALL",
  "MEETING",
  "LINKEDIN_MESSAGE",
  "WHATSAPP_MESSAGE",
  "WEBSITE_VISIT",
  "RESEARCH",
  "COMPANY_UPDATE",
  "PERSON_UPDATE",
  "LEAD_CREATED",
  "LEAD_UPDATED",
  "STATUS_CHANGED",
  "FOLLOW_UP",
  "PROPOSAL_SENT",
  "PROPOSAL_RECEIVED",
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

/* =========================================================
   ACTIVITY
   ========================================================= */

export const activitySchema = z.object({
  // Activity
  type: activityType,

  title: z.string().trim().min(1).max(200),

  description: optionalString(4000),

  sourceUrl: optionalUrl(),

  metadata: z.record(z.string(), z.unknown()).optional().nullable(),

  // Relations
  leadId: z.string().trim().min(1).optional().nullable(),

  organizationId: z.string().trim().min(1).optional().nullable(),

  personId: z.string().trim().min(1).optional().nullable(),

  adminId: z.string().trim().min(1).optional().nullable(),
});

export type ActivityInput = z.infer<typeof activitySchema>;
