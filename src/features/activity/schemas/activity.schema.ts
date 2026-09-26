import { z } from "zod";
export const activitySchema = z.object({ type: z.string().trim().min(1).max(80), title: z.string().trim().min(1).max(200), description: z.string().trim().max(4000).optional(), sourceUrl: z.string().url().optional(), leadId: z.string().optional(), organizationId: z.string().optional(), personId: z.string().optional() });
export type ActivityInput = z.infer<typeof activitySchema>;
