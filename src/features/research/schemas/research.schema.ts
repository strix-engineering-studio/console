import { z } from "zod";
export const researchSubjectSchema = z.object({ leadId: z.string().optional(), organizationId: z.string().optional(), personId: z.string().optional() }).refine(value => value.leadId || value.organizationId || value.personId, "Choose a lead, organization, or person to research.");
export type ResearchSubject = z.infer<typeof researchSubjectSchema>;
export const researchSchema = z.object({ status: z.enum(["PENDING", "RUNNING", "COMPLETE", "FAILED"]).optional(), summary: z.string().max(10000).optional().nullable(), provider: z.string().max(120).optional().nullable(), leadId: z.string().optional().nullable(), organizationId: z.string().optional().nullable(), personId: z.string().optional().nullable(), completedAt: z.coerce.date().optional().nullable() });
export type ResearchInput = z.infer<typeof researchSchema>;
