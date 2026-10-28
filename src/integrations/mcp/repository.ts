import "server-only";
import { prisma } from "@/lib/prisma";

export const mcpRepository = {
  findIdempotency: (tool: string, key: string) =>
    prisma.mcpIdempotency.findUnique({ where: { tool_key: { tool, key } } }),
  reserveIdempotency: (tool: string, key: string, requestHash: string) =>
    prisma.mcpIdempotency.create({ data: { tool, key, requestHash } }),
  completeIdempotency: (id: string, resultJson: string) =>
    prisma.mcpIdempotency.update({ where: { id }, data: { resultJson } }),
  releaseIdempotency: (id: string) =>
    prisma.mcpIdempotency.delete({ where: { id } }),
};
