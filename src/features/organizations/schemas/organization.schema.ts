import { z } from "zod";
export const organizationSchema = z.object({ name: z.string().trim().min(1).max(200), website: z.union([z.string().url(), z.literal("")]).optional(), industry: z.string().max(120).optional(), description: z.string().max(4000).optional(), location: z.string().max(200).optional(), country: z.string().max(120).optional(), city: z.string().max(120).optional(), linkedinUrl: z.union([z.string().url(), z.literal("")]).optional() });
export type OrganizationInput = z.infer<typeof organizationSchema>;
