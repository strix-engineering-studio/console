import { z } from "zod";

export const idSchema = z.object({
  id: z.string().min(1).max(200),
});

export const searchSchema = z.object({
  q: z.string().max(200).optional(),
});

export const emptySchema = z.object({});

export const idempotencySchema = z.object({
  idempotencyKey: z.string().min(1).max(200).optional(),
});
