import z from "zod";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type Entity = "lead" | "organization" | "person" | "research" | "email";

/**
 * Every MCP input schema is a complete ZodObject.
 *
 * Feature schemas should be defined as Zod objects and reused here.
 * MCP-specific fields such as id and idempotencyKey are derived with
 * .extend() / .safeExtend() where required.
 */
export type McpInputSchema = z.ZodObject<any>;

/* -------------------------------------------------------------------------- */
/* Common schemas                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Used by list_* tools.
 *
 * Supports:
 * - id    → retrieve one specific record
 * - query → search/filter records
 * - limit → limit the number of returned records
 *
 * Examples:
 *
 * { id: "lead-id" }
 *
 * { query: "fintech" }
 *
 * { query: "Pune", limit: 10 }
 */
export const listSchema = z.object({
  id: z.string().min(1).max(200).optional(),

  query: z.string().max(200).optional(),

  limit: z.number().int().min(1).max(50).default(20),
});

/**
 * Used when an operation requires only an ID.
 *
 * Currently useful for operations where we don't use listSchema,
 * but can also be reused by future MCP tools.
 */
export const idSchema = z.object({
  id: z.string().min(1).max(200),
});

/**
 * Used by create_* tools for safe retries.
 */
export const keySchema = z.object({
  idempotencyKey: z.string().min(1).max(200).optional(),
});

/**
 * Used by tools that don't require any input.
 */
export const emptySchema = z.object({});
