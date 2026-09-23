import { z } from "zod";

export const leadStatusSchema = z.enum([
  "NEW",
  "RESEARCHING",
  "QUALIFIED",
  "CONTACTED",
]);

export const leadPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);

export const createLeadSchema = z.object({
  organizationLeadId: z.string().trim().min(1).max(100).optional(),
  personalLeadId: z.string().trim().min(1).max(100).optional(),
  companyName: z.string().trim().min(1).max(200),
  domain: z.string().trim().max(255).optional(),
  industry: z.string().trim().max(100).optional(),
  location: z.string().trim().max(200).optional(),
  employeeCount: z.coerce.number().int().nonnegative().optional(),
  status: leadStatusSchema.optional(),
  priority: leadPrioritySchema.optional(),
  source: z.string().trim().max(100).optional(),
  opportunityScore: z.coerce.number().int().min(0).max(100).optional(),
  notes: z.string().trim().max(5000).optional(),
});

export const updateLeadSchema = createLeadSchema.partial().extend({
  researchStatus: z.enum(["COMPLETE", "PENDING"]).optional(),
  contactCount: z.coerce.number().int().nonnegative().optional(),
  lastContactedAt: z.string().datetime().nullable().optional(),
});

export type CreateLeadPayload = z.infer<typeof createLeadSchema>;
export type UpdateLeadPayload = z.infer<typeof updateLeadSchema>;
