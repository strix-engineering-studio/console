import { z } from "zod";

import { leadSchema } from "@/features/leads";
import { leadsMcpService } from "@/features/leads/services/leads.mcp.service";

import type { McpToolContext, RegisterTool } from "./types";
import { idSchema, searchSchema } from "./common";

type Audit = (
  tool: string,
  action: string,
  entity: "lead",
  result: unknown,
  authentication: McpToolContext["authentication"],
) => Promise<void>;

type CreateIdempotently = (
  tool: string,
  key: string | undefined,
  input: unknown,
  create: () => Promise<unknown>,
  entity: "lead",
  authentication: McpToolContext["authentication"],
) => Promise<unknown>;

export function registerLeadTools(
  register: RegisterTool,
  audit: Audit,
  createIdempotently: CreateIdempotently,
  context: McpToolContext,
) {
  register(
    context,
    "search_leads",
    "Search leads by name or relevant lead information.",
    searchSchema,
    "strix:read",
    async ({ q }) => {
      return leadsMcpService.list(typeof q === "string" ? q : "");
    },
  );

  register(
    context,
    "get_lead",
    "Get a lead by ID.",
    idSchema,
    "strix:read",
    async ({ id }) => {
      const result = await leadsMcpService.get(String(id));

      if (!result) {
        throw new Error("Lead not found");
      }

      return result;
    },
  );

  const createLeadSchema = leadSchema.extend({
    idempotencyKey: z.string().min(1).max(200).optional(),
  });

  register(
    context,
    "create_lead",
    "Create a new lead. Supports an optional idempotencyKey for safe retries.",
    createLeadSchema,
    "strix:write",
    async (input) => {
      const { idempotencyKey, ...data } = input;

      return createIdempotently(
        "create_lead",
        typeof idempotencyKey === "string" ? idempotencyKey : undefined,
        data,
        () => leadsMcpService.create(data as never),
        "lead",
        context.authentication,
      );
    },
  );

  const updateLeadSchema = leadSchema.extend({
    id: z.string().min(1).max(200),
  });

  register(
    context,
    "update_lead",
    "Update an existing lead by ID.",
    updateLeadSchema,
    "strix:write",
    async ({ id, ...data }) => {
      const result = await leadsMcpService.update(String(id), data as never);

      await audit(
        "update_lead",
        "update",
        "lead",
        result,
        context.authentication,
      );

      return result;
    },
  );

  register(
    context,
    "delete_lead",
    "Delete a lead by ID.",
    idSchema,
    "strix:write",
    async ({ id }) => {
      const result = await leadsMcpService.delete(String(id));

      await audit(
        "delete_lead",
        "delete",
        "lead",
        result,
        context.authentication,
      );

      return {
        deleted: true,
        id: String(id),
      };
    },
  );
}
