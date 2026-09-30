import { z } from "zod";
import { emailSchema } from "./email.schema";

export type Email = z.infer<typeof emailSchema>;
export type EmailInput = { name: string; email: string; idempotencyKey?: string; fromEmail?: string };