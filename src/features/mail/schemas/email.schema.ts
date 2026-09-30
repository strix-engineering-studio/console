import { z } from "zod";

export const emailSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  status: z.enum(["NEW", "ENGAGED", "RESEARCHING"]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Email = z.infer<typeof emailSchema>;
export type EmailInput = { name: string; email: string };
