import { z } from "zod";
export const personSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.union([z.string().email(), z.literal("")]).optional(),
  phone: z.string().max(50).optional(),
  title: z.string().max(160).optional(),
  linkedinUrl: z.union([z.string().url(), z.literal("")]).optional(),
  location: z.string().max(200).optional(),
  organizationId: z.string().optional().nullable(),
});
export type PersonInput = z.infer<typeof personSchema>;
