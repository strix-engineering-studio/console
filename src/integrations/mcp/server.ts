import "server-only";
import { createHash } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { leadSchema } from "@/features/leads/schemas";
import { leadsMcpService } from "@/features/leads/services/leads.mcp.service";
import { organizationSchema } from "@/features/organizations/schemas";
import { organizationsMcpService } from "@/features/organizations/services/organizations.mcp.service";
import { personSchema } from "@/features/people/schemas";
import { peopleMcpService } from "@/features/people/services/people.mcp.service";
import { researchSchema } from "@/features/research/schemas";
import { researchMcpService } from "@/features/research/services/research.mcp.service";
import { activityMcpService } from "@/features/activity/services/activity.mcp.service";
import type { McpAuthentication } from "./auth";
import { mcpRepository } from "./repository";

type Entity = "lead" | "organization" | "person" | "research";
const idSchema = { id: z.string().min(1).max(200) };
const searchSchema = { q: z.string().max(200).optional() };
const keySchema = { idempotencyKey: z.string().min(1).max(200).optional() };
const service = { lead: leadsMcpService, organization: organizationsMcpService, person: peopleMcpService, research: researchMcpService };

function toResult(value: unknown) { return { content: [{ type: "text" as const, text: JSON.stringify(value) }] }; }
function toError() { return { isError: true, content: [{ type: "text" as const, text: "The requested operation could not be completed." }] }; }
function register(server: McpServer, name: string, description: string, inputSchema: Record<string, z.ZodType>, requiredScope: "strix:read" | "strix:write", authentication: McpAuthentication, resourceMetadataUrl: string, handler: (input: Record<string, unknown>) => Promise<unknown>) {
  server.registerTool(name, { description, inputSchema }, async (input) => {
    if (authentication.kind === "oauth" && !authentication.scopes.includes(requiredScope))
      return {
        isError: true,
        content: [{ type: "text" as const, text: `This action requires the ${requiredScope} permission. Reconnect Strix Lead and approve that permission.` }],
        _meta: { "mcp/www_authenticate": [`Bearer resource_metadata="${resourceMetadataUrl}", error="insufficient_scope", error_description="The ${requiredScope} permission is required."`] },
      };
    try { return toResult(await handler(input as Record<string, unknown>)); } catch { return toError(); }
  });
}

async function audit(tool: string, action: string, entity: Entity, result: unknown) {
  const row = result as { id?: string; leadId?: string | null; organizationId?: string | null; personId?: string | null };
  if (!row?.id) return;
  const relation = entity === "lead" ? { leadId: row.id } : entity === "organization" ? { organizationId: row.id } : entity === "person" ? { personId: row.id } : { ...(row.leadId ? { leadId: row.leadId } : {}), ...(row.organizationId ? { organizationId: row.organizationId } : {}), ...(row.personId ? { personId: row.personId } : {}) };
  await activityMcpService.audit({ title: `MCP ${action}: ${entity} ${row.id}`, description: `tool=${tool}; action=${action}; entity=${entity}; entityId=${row.id}; timestamp=${new Date().toISOString()}`, ...relation });
}

async function createIdempotently(tool: string, key: string | undefined, input: unknown, create: () => Promise<unknown>, entity: Entity) {
  if (!key) { const result = await create(); await audit(tool, "create", entity, result); return result; }
  const requestHash = createHash("sha256").update(JSON.stringify(input)).digest("hex");
  let reservation;
  try { reservation = await mcpRepository.reserveIdempotency(tool, key, requestHash); }
  catch {
    const existing = await mcpRepository.findIdempotency(tool, key);
    if (!existing || existing.requestHash !== requestHash) throw new Error("Idempotency conflict");
    if (existing.resultJson) return JSON.parse(existing.resultJson) as unknown;
    for (let attempt = 0; attempt < 20; attempt += 1) {
      await new Promise(resolve => setTimeout(resolve, 50));
      const pending = await mcpRepository.findIdempotency(tool, key);
      if (pending?.resultJson) return JSON.parse(pending.resultJson) as unknown;
    }
    throw new Error("Idempotent request is in progress");
  }
  let result: unknown;
  try { result = await create(); }
  catch (error) {
    await mcpRepository.releaseIdempotency(reservation.id).catch(() => undefined);
    throw error;
  }
  await mcpRepository.completeIdempotency(reservation.id, JSON.stringify(result));
  await audit(tool, "create", entity, result);
  return result;
}

export function createMcpServer(authentication: McpAuthentication, resourceMetadataUrl: string) {
  const server = new McpServer({ name: "strix-lead", version: "1.0.0" });
  const definitions: Array<{ entity: Entity; singular: string; plural: string; schema: typeof leadSchema | typeof organizationSchema | typeof personSchema | typeof researchSchema }> = [
    { entity: "lead", singular: "lead", plural: "leads", schema: leadSchema },
    { entity: "organization", singular: "organization", plural: "organizations", schema: organizationSchema },
    { entity: "person", singular: "person", plural: "people", schema: personSchema },
    { entity: "research", singular: "research", plural: "research", schema: researchSchema },
  ];
  for (const { entity, singular, plural, schema } of definitions) {
    const api = service[entity];
    const searchName = `search_${plural}`;
    const getName = `get_${singular}`;
    const createName = `create_${singular}`;
    const updateName = `update_${singular}`;
    const deleteName = `delete_${singular}`;
    register(server, searchName, `Search ${plural}.`, searchSchema, "strix:read", authentication, resourceMetadataUrl, async ({ q }) => api.list(typeof q === "string" ? q : ""));
    register(server, getName, `Get ${singular} by ID.`, idSchema, "strix:read", authentication, resourceMetadataUrl, async ({ id }) => {
      const value = await api.get(String(id)); if (!value) throw new Error("Not found"); return value;
    });
    register(server, createName, `Create ${singular}. Supports an optional idempotencyKey for safe retries.`, { ...schema.shape, ...keySchema }, "strix:write", authentication, resourceMetadataUrl, async (input) => {
      const { idempotencyKey, ...data } = input;
      const parsed = schema.safeParse(data); if (!parsed.success) throw new Error("Invalid input");
      return createIdempotently(`create_${singular}`, typeof idempotencyKey === "string" ? idempotencyKey : undefined, parsed.data, () => api.create(parsed.data as never), entity);
    });
    register(server, updateName, `Update ${singular} by ID.`, { ...idSchema, ...schema.partial().shape }, "strix:write", authentication, resourceMetadataUrl, async ({ id, ...input }) => {
      const parsed = schema.partial().safeParse(input); if (!parsed.success) throw new Error("Invalid input");
      const result = await api.update(String(id), parsed.data as never); await audit(`update_${singular}`, "update", entity, result); return result;
    });
    register(server, deleteName, `Delete ${singular} by ID.`, idSchema, "strix:write", authentication, resourceMetadataUrl, async ({ id }) => {
      const result = await api.delete(String(id)); await audit(`delete_${singular}`, "delete", entity, result); return { deleted: true, id: String(id) };
    });
  }
  register(server, "list_activities", "List recent activities.", {}, "strix:read", authentication, resourceMetadataUrl, async () => activityMcpService.list());
  register(server, "get_activity", "Get an activity by ID.", idSchema, "strix:read", authentication, resourceMetadataUrl, async ({ id }) => {
    const result = await activityMcpService.get(String(id)); if (!result) throw new Error("Not found"); return result;
  });
  return server;
}

export function addOAuthSecuritySchemes(result: unknown) {
  if (!result || typeof result !== "object") return result;
  const value = result as { result?: { tools?: Array<Record<string, unknown>> } };
  if (!Array.isArray(value.result?.tools)) return result;
  return {
    ...value,
    result: {
      ...value.result,
      tools: value.result.tools.map((tool) => ({
        ...tool,
        securitySchemes: [{ type: "oauth2", scopes: [
          String(tool.name).startsWith("create_") || String(tool.name).startsWith("update_") || String(tool.name).startsWith("delete_")
            ? "strix:write"
            : "strix:read",
        ] }],
      })),
    },
  };
}
