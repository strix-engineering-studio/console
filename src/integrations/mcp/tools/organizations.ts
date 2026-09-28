import { z } from "zod";

import { organizationSchema } from "@/features/organizations";
import { organizationsMcpService } from "@/features/organizations/services/organizations.mcp.service";

import type { McpToolContext, RegisterTool } from "./types";

import { idSchema, searchSchema } from "./common";

type Audit = (
  tool: string,
  action: string,
  entity: "organization",
  result: unknown,
  authentication: McpToolContext["authentication"],
) => Promise<void>;

type CreateIdempotently = (
  tool: string,
  key: string | undefined,
  input: unknown,
  create: () => Promise<unknown>,
  entity: "organization",
  authentication: McpToolContext["authentication"],
) => Promise<unknown>;

export function registerOrganizationTools(
  register: RegisterTool,
  audit: Audit,
  createIdempotently: CreateIdempotently,
  context: McpToolContext,
) {
  register(
    context,
    "search_organizations",
    "Search organizations by name or relevant organization information.",
    searchSchema,
    "strix:read",
    async ({ q }) => {
      return organizationsMcpService.list(typeof q === "string" ? q : "");
    },
  );

  register(
    context,
    "get_organization",
    "Get an organization by ID.",
    idSchema,
    "strix:read",
    async ({ id }) => {
      const result = await organizationsMcpService.get(String(id));

      if (!result) {
        throw new Error("Organization not found");
      }

      return result;
    },
  );

  const createOrganizationSchema = organizationSchema.extend({
    idempotencyKey: z.string().min(1).max(200).optional(),
  });

  register(
    context,
    "create_organization",
    "Create a new organization. Supports an optional idempotencyKey for safe retries.",
    createOrganizationSchema,
    "strix:write",
    async (input) => {
      const { idempotencyKey, ...data } = input;

      return createIdempotently(
        "create_organization",
        typeof idempotencyKey === "string" ? idempotencyKey : undefined,
        data,
        () => organizationsMcpService.create(data as never),
        "organization",
        context.authentication,
      );
    },
  );

  const updateOrganizationSchema = organizationSchema.extend({
    id: z.string().min(1).max(200),
  });

  register(
    context,
    "update_organization",
    "Update an existing organization by ID.",
    updateOrganizationSchema,
    "strix:write",
    async ({ id, ...data }) => {
      const result = await organizationsMcpService.update(
        String(id),
        data as never,
      );

      await audit(
        "update_organization",
        "update",
        "organization",
        result,
        context.authentication,
      );

      return result;
    },
  );

  register(
    context,
    "delete_organization",
    "Delete an organization by ID.",
    idSchema,
    "strix:write",
    async ({ id }) => {
      const result = await organizationsMcpService.delete(String(id));

      await audit(
        "delete_organization",
        "delete",
        "organization",
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
