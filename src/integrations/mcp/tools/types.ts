import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { z } from "zod";

import type { McpAuthentication } from "../auth";

export type McpInputSchema = z.ZodObject<any>;

export type McpToolContext = {
  server: McpServer;
  authentication: McpAuthentication;
  resourceMetadataUrl: string;
};

export type RegisterTool = (
  context: McpToolContext,
  name: string,
  description: string,
  inputSchema: McpInputSchema,
  requiredScope: "strix:read" | "strix:write",
  handler: (input: Record<string, unknown>) => Promise<unknown>,
) => void;
