import "server-only";

import { createHash } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { leadsMcpService } from "@/features/leads/services/leads.mcp.service";
import { organizationsMcpService } from "@/features/organizations/services/organizations.mcp.service";
import { peopleMcpService } from "@/features/people/services/people.mcp.service";
import { activityMcpService } from "@/features/activity/services/activity.mcp.service";
import { mailMcpService } from "@/features/mail/services/mail.mcp.service";

import type { McpAuthentication } from "./auth";
import { mcpRepository } from "./repository";

import { leadSchema } from "@/features/leads";
import { organizationSchema } from "@/features/organizations";
import { personSchema } from "@/features/people";
const emailSchema = z.object({
  email: z.string().email(),
});

export { organizationSchema, leadSchema }; // Assuming you export these from index.ts

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type Entity = "lead" | "organization" | "person" | "research" | "email" | "email_lead";

/**
 * Every MCP input schema is a complete ZodObject.
 *
 * Feature schemas should be defined as Zod objects and reused here.
 * MCP-specific fields such as id and idempotencyKey are derived with
 * .extend() rather than creating duplicate schemas.
 */
type McpInputSchema = z.ZodObject<any>;

/* -------------------------------------------------------------------------- */
/* Common schemas                                                             */
/* -------------------------------------------------------------------------- */

const idSchema = z.object({
  id: z.string().min(1).max(200),
});

const searchSchema = z.object({
  q: z.string().max(200).optional(),
});

const keySchema = z.object({
  idempotencyKey: z.string().min(1).max(200).optional(),
});

const emptySchema = z.object({});

/* -------------------------------------------------------------------------- */
/* Response helpers                                                           */
/* -------------------------------------------------------------------------- */

function toResult(value: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(value),
      },
    ],
  };
}

function toError() {
  return {
    isError: true,
    content: [
      {
        type: "text" as const,
        text: "The requested operation could not be completed.",
      },
    ],
  };
}

/* -------------------------------------------------------------------------- */
/* MCP tool registration                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Application code works with complete ZodObject schemas.
 *
 * The MCP SDK receives the raw shape through `inputSchema.shape`.
 *
 * This keeps:
 *
 * feature schema
 *       ↓
 * ZodObject
 *       ↓
 * MCP-specific .extend()
 *       ↓
 * register()
 *       ↓
 * MCP SDK shape
 */
function register(
  server: McpServer,
  name: string,
  description: string,
  inputSchema: McpInputSchema,
  requiredScope: "strix:read" | "strix:write",
  authentication: McpAuthentication,
  resourceMetadataUrl: string,
  handler: (input: Record<string, unknown>) => Promise<unknown>,
) {
  server.registerTool(
    name,
    {
      description,

      /**
       * @modelcontextprotocol/sdk expects the schema shape here.
       *
       * We intentionally keep the complete ZodObject at the application
       * boundary and only unwrap it at the MCP transport boundary.
       */
      inputSchema: inputSchema.shape,
    },

    async (input: Record<string, unknown>) => {
      if (!authentication.scopes.includes(requiredScope)) {
        return {
          isError: true,

          content: [
            {
              type: "text" as const,
              text: `This action requires the ${requiredScope} permission. Add that permission to the API key or OAuth grant.`,
            },
          ],

          ...(resourceMetadataUrl
            ? {
                _meta: {
                  "mcp/www_authenticate": [
                    `Bearer resource_metadata="${resourceMetadataUrl}", error="insufficient_scope", error_description="The ${requiredScope} permission is required."`,
                  ],
                },
              }
            : {}),
        };
      }

      try {
        const result = await handler(input as Record<string, unknown>);

        return toResult(result);
      } catch {
        return toError();
      }
    },
  );
}

/* -------------------------------------------------------------------------- */
/* Audit                                                                      */
/* -------------------------------------------------------------------------- */

async function audit(
  tool: string,
  action: string,
  entity: Entity,
  result: unknown,
  authentication: McpAuthentication,
) {
  const row = result as {
    id?: string;
    leadId?: string | null;
    organizationId?: string | null;
    personId?: string | null;
  };

  if (!row?.id) {
    return;
  }

  const relation =
    entity === "lead"
      ? {
          leadId: row.id,
        }
      : entity === "organization"
        ? {
            organizationId: row.id,
          }
        : entity === "person"
          ? {
              personId: row.id,
            }
          : {
              ...(row.leadId
                ? {
                    leadId: row.leadId,
                  }
                : {}),

              ...(row.organizationId
                ? {
                    organizationId: row.organizationId,
                  }
                : {}),

              ...(row.personId
                ? {
                    personId: row.personId,
                  }
                : {}),
            };

  const identity =
    authentication.kind === "api-key"
      ? `authenticationType=api-key; apiKeyId=${authentication.keyId}; integration=${authentication.integrationName}`
      : authentication.kind === "oauth"
        ? `authenticationType=oauth; oauthClientId=${authentication.clientId}`
        : "authenticationType=bypass; MCP_AUTH_REQUIRED=false";

  await activityMcpService.audit({
    title: `MCP ${action}: ${entity} ${row.id}`,

    description:
      `${identity}; ` +
      `tool=${tool}; ` +
      `action=${action}; ` +
      `entity=${entity}; ` +
      `entityId=${row.id}; ` +
      `timestamp=${new Date().toISOString()}`,

    ...relation,
  });
}

/* -------------------------------------------------------------------------- */
/* Idempotent creation                                                        */
/* -------------------------------------------------------------------------- */

async function createIdempotently(
  tool: string,
  key: string | undefined,
  input: unknown,
  create: () => Promise<unknown>,
  entity: Entity,
  authentication: McpAuthentication,
) {
  /**
   * No idempotency key means normal creation.
   */
  if (!key) {
    const result = await create();

    await audit(tool, "create", entity, result, authentication);

    return result;
  }

  /**
   * Hash the actual request body.
   *
   * This prevents the same idempotency key from being reused
   * with different request data.
   */
  const requestHash = createHash("sha256")
    .update(JSON.stringify(input))
    .digest("hex");

  let reservation;

  try {
    reservation = await mcpRepository.reserveIdempotency(
      tool,
      key,
      requestHash,
    );
  } catch {
    /**
     * Existing idempotency record.
     */
    const existing = await mcpRepository.findIdempotency(tool, key);

    if (!existing || existing.requestHash !== requestHash) {
      throw new Error("Idempotency conflict");
    }

    /**
     * Previous request already completed.
     */
    if (existing.resultJson) {
      return JSON.parse(existing.resultJson) as unknown;
    }

    /**
     * Previous request is still running.
     */
    for (let attempt = 0; attempt < 20; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 50));

      const pending = await mcpRepository.findIdempotency(tool, key);

      if (pending?.resultJson) {
        return JSON.parse(pending.resultJson) as unknown;
      }
    }

    throw new Error("Idempotent request is in progress");
  }

  let result: unknown;

  try {
    result = await create();
  } catch (error) {
    await mcpRepository
      .releaseIdempotency(reservation.id)
      .catch(() => undefined);

    throw error;
  }

  await mcpRepository.completeIdempotency(
    reservation.id,
    JSON.stringify(result),
  );

  await audit(tool, "create", entity, result, authentication);

  return result;
}

/* -------------------------------------------------------------------------- */
/* MCP server                                                                 */
/* -------------------------------------------------------------------------- */

export function createMcpServer(
  authentication: McpAuthentication,
  resourceMetadataUrl: string,
) {
  const server = new McpServer({
    name: "strix-lead",
    version: "1.0.0",
  });

  /**
   * Feature definitions.
   *
   * IMPORTANT:
   *
   * These schemas come directly from the feature.
   *
   * There is NO:
   *
   * mcpLeadSchema
   * mcpOrganizationSchema
   * mcpPersonSchema
   *
   * MCP consumes the feature schemas directly.
   */
  const definitions = [
    {
      entity: "lead" as const,
      singular: "lead",
      plural: "leads",
      schema: leadSchema,
      api: leadsMcpService,
    },

    {
      entity: "organization" as const,
      singular: "organization",
      plural: "organizations",
      schema: organizationSchema,
      api: organizationsMcpService,
    },

    {
      entity: "person" as const,
      singular: "person",
      plural: "people",
      schema: personSchema,
      api: peopleMcpService,
    },

    {
      entity: "email" as const,
      singular: "email",
      plural: "emails",
      schema: emailSchema,
      api: mailMcpService,
    },

    {
      entity: "email_lead" as const,
      singular: "email_lead",
      plural: "email_leads",
      schema: leadSchema,
      api: mailMcpService,
    },
  ];

  /* ---------------------------------------------------------------------- */
  /* CRUD tools                                                             */
  /* ---------------------------------------------------------------------- */

  for (const { entity, singular, plural, schema, api } of definitions) {
    const searchName = `search_${plural}`;
    const getName = `get_${singular}`;
    const createName = `create_${singular}`;
    const updateName = `update_${singular}`;
    const deleteName = `delete_${singular}`;

    /* -------------------------------------------------------------------- */
    /* Search                                                               */
    /* -------------------------------------------------------------------- */

    register(
      server,
      searchName,
      `Search ${plural}.`,
      searchSchema,
      "strix:read",
      authentication,
      resourceMetadataUrl,

      async ({ q }) => {
        return api.list(typeof q === "string" ? q : "");
      },
    );

    /* -------------------------------------------------------------------- */
    /* Get                                                                   */
    /* -------------------------------------------------------------------- */

    register(
      server,
      getName,
      `Get ${singular} by ID.`,
      idSchema,
      "strix:read",
      authentication,
      resourceMetadataUrl,

      async ({ id }) => {
        const result = await api.get(String(id));

        if (!result) {
          throw new Error(`${singular} not found`);
        }

        return result;
      },
    );

    /* -------------------------------------------------------------------- */
    /* Create                                                                */
    /* -------------------------------------------------------------------- */

    const createSchema = schema.extend({
      idempotencyKey: keySchema.shape.idempotencyKey,
    });

    register(
      server,
      createName,
      `Create ${singular}. Supports an optional idempotencyKey for safe retries.`,
      createSchema,
      "strix:write",
      authentication,
      resourceMetadataUrl,

      async (input) => {
        const { idempotencyKey, ...data } = input;

        return createIdempotently(
          createName,

          typeof idempotencyKey === "string" ? idempotencyKey : undefined,

          data,

          () => api.create(data as never),

          entity,
          authentication,
        );
      },
    );

    /* -------------------------------------------------------------------- */
    /* Update                                                                */
    /* -------------------------------------------------------------------- */

    const updateSchema = schema.extend({
      id: idSchema.shape.id,
    });

    register(
      server,
      updateName,
      `Update ${singular} by ID.`,
      updateSchema,
      "strix:write",
      authentication,
      resourceMetadataUrl,

      async ({ id, ...data }) => {
        const result = await api.update(String(id), data as never);

        await audit(updateName, "update", entity, result, authentication);

        return result;
      },
    );

    /* -------------------------------------------------------------------- */
    /* Delete                                                                */
    /* -------------------------------------------------------------------- */

    register(
      server,
      deleteName,
      `Delete ${singular} by ID.`,
      idSchema,
      "strix:write",
      authentication,
      resourceMetadataUrl,

      async ({ id }) => {
        const result = await api.delete(String(id));

        await audit(deleteName, "delete", entity, result, authentication);

        return {
          deleted: true,
          id: String(id),
        };
      },
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Activity tools                                                         */
  /* ---------------------------------------------------------------------- */

  register(
    server,
    "list_activities",
    "List recent activities.",
    emptySchema,
    "strix:read",
    authentication,
    resourceMetadataUrl,

    async () => {
      return activityMcpService.list();
    },
  );

  register(
    server,
    "get_activity",
    "Get an activity by ID.",
    idSchema,
    "strix:read",
    authentication,
    resourceMetadataUrl,

    async ({ id }) => {
      const result = await activityMcpService.get(String(id));

      if (!result) {
        throw new Error("Activity not found");
      }

      return result;
    },
  );

  return server;
}

/* -------------------------------------------------------------------------- */
/* OAuth security metadata                                                    */
/* -------------------------------------------------------------------------- */

export function addOAuthSecuritySchemes(result: unknown) {
  if (!result || typeof result !== "object") {
    return result;
  }

  const value = result as {
    result?: {
      tools?: Array<Record<string, unknown>>;
    };
  };

  if (!Array.isArray(value.result?.tools)) {
    return result;
  }

  return {
    ...value,

    result: {
      ...value.result,

      tools: value.result.tools.map((tool) => ({
        ...tool,

        securitySchemes: [
          {
            type: "oauth2",

            scopes:
              String(tool.name).startsWith("create_") ||
              String(tool.name).startsWith("update_") ||
              String(tool.name).startsWith("delete_")
                ? ["strix:write"]
                : ["strix:read"],
          },
        ],
      })),
    },
  };
}
