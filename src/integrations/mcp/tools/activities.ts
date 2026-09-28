import { activityMcpService } from "@/features/activity/services/activity.mcp.service";

import type { McpToolContext, RegisterTool } from "./types";

import { emptySchema, idSchema } from "./common";

export function registerActivityTools(
  register: RegisterTool,
  context: McpToolContext,
) {
  register(
    context,
    "list_activities",
    "List recent activities from the Strix Lead activity timeline.",
    emptySchema,
    "strix:read",
    async () => {
      return activityMcpService.list();
    },
  );

  register(
    context,
    "get_activity",
    "Get an activity by ID.",
    idSchema,
    "strix:read",
    async ({ id }) => {
      const result = await activityMcpService.get(String(id));

      if (!result) {
        throw new Error("Activity not found");
      }

      return result;
    },
  );
}
