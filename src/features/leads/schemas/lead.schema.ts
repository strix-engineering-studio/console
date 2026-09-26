import { z } from "zod";

export const leadStatus = z.enum(["NEW", "RESEARCHING", "ENGAGED", "CONTACTED", "QUALIFIED", "DISQUALIFIED"]);
export const leadSource = z.enum(["MANUAL", "RESEARCH", "REFERRAL", "WEBSITE", "LINKEDIN", "OTHER"]);
export const leadSchema = z.object({ name: z.string().trim().min(1).max(200), status: leadStatus.optional(), source: leadSource.optional(), notes: z.string().trim().max(5000).optional().nullable(), organizationId: z.string().optional().nullable(), personId: z.string().optional().nullable() });
export const leadStatusSchema = z.object({ status: leadStatus });
export type LeadInput = z.infer<typeof leadSchema>;
