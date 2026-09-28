import { z } from "zod";

import { personSchema } from "@/features/people";
import { peopleMcpService } from "@/features/people/services/people.mcp.service";

import type { McpToolContext, RegisterTool } from "./types";

import { idSchema, searchSchema } from "./common";

type Audit = (
  tool: string,
  action: string,
  entity: "person",
  result: unknown,
  authentication: McpToolContext["authentication"],
) => Promise<void>;

type CreateIdempotently = (
  tool: string,
  key: string | undefined,
  input: unknown,
  create: () => Promise<unknown>,
  entity: "person",
  authentication: McpToolContext["authentication"],
) => Promise<unknown>;

export function registerPeopleTools(
  register: RegisterTool,
  audit: Audit,
  createIdempotently: CreateIdempotently,
  context: McpToolContext,
) {
  register(
    context,
    "search_people",
    "Search people by name or relevant person information.",
    searchSchema,
    "strix:read",
    async ({ q }) => {
      return peopleMcpService.list(typeof q === "string" ? q : "");
    },
  );

  register(
    context,
    "get_person",
    "Get a person by ID.",
    idSchema,
    "strix:read",
    async ({ id }) => {
      const result = await peopleMcpService.get(String(id));

      if (!result) {
        throw new Error("Person not found");
      }

      return result;
    },
  );

  const createPersonSchema = personSchema.extend({
    idempotencyKey: z.string().min(1).max(200).optional(),
  });

  register(
    context,
    "create_person",
    "Create a new person. Supports an optional idempotencyKey for safe retries.",
    createPersonSchema,
    "strix:write",
    async (input) => {
      const { idempotencyKey, ...data } = input;

      return createIdempotently(
        "create_person",
        typeof idempotencyKey === "string" ? idempotencyKey : undefined,
        data,
        () => peopleMcpService.create(data as never),
        "person",
        context.authentication,
      );
    },
  );

  const updatePersonSchema = personSchema.extend({
    id: z.string().min(1).max(200),
  });

  register(
    context,
    "update_person",
    "Update an existing person by ID.",
    updatePersonSchema,
    "strix:write",
    async ({ id, ...data }) => {
      const result = await peopleMcpService.update(String(id), data as never);

      await audit(
        "update_person",
        "update",
        "person",
        result,
        context.authentication,
      );

      return result;
    },
  );

  register(
    context,
    "delete_person",
    "Delete a person by ID.",
    idSchema,
    "strix:write",
    async ({ id }) => {
      const result = await peopleMcpService.delete(String(id));

      await audit(
        "delete_person",
        "delete",
        "person",
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
