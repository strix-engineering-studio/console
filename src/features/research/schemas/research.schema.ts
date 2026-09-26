import { z } from "zod";
export const researchSubjectSchema = z.object({ leadId: z.string().optional(), organizationId: z.string().optional(), personId: z.string().optional() }).refine(value => value.leadId || value.organizationId || value.personId, "Choose a lead, organization, or person to research.");
export type ResearchSubject = z.infer<typeof researchSubjectSchema>;
