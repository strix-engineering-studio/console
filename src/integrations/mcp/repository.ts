import "server-only";
import { prisma } from "@/lib/prisma";

export const mcpRepository = {
  findActiveKey: (keyHash: string, now = new Date()) =>
    prisma.mcpApiKey.findFirst({
      where: {
        keyHash,
        revokedAt: null,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
    }),
  createKey: (data: { name: string; keyHash: string; expiresAt?: Date }) =>
    prisma.mcpApiKey.create({ data }),
  listKeys: () =>
    prisma.mcpApiKey.findMany({
      select: {
        id: true,
        name: true,
        expiresAt: true,
        revokedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  revokeKey: (id: string) =>
    prisma.mcpApiKey.updateMany({
      where: { id, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  findIdempotency: (tool: string, key: string) =>
    prisma.mcpIdempotency.findUnique({ where: { tool_key: { tool, key } } }),
  reserveIdempotency: (tool: string, key: string, requestHash: string) =>
    prisma.mcpIdempotency.create({ data: { tool, key, requestHash } }),
  completeIdempotency: (id: string, resultJson: string) =>
    prisma.mcpIdempotency.update({ where: { id }, data: { resultJson } }),
  releaseIdempotency: (id: string) =>
    prisma.mcpIdempotency.delete({ where: { id } }),
  findOAuthClient: (clientId: string) =>
    prisma.mcpOAuthClient.findUnique({ where: { clientId } }),
  createOAuthClient: (data: { clientId: string; clientName: string; redirectUris: string[]; grantTypes: string[]; responseTypes: string[] }) =>
    prisma.mcpOAuthClient.create({ data }),
  createOAuthRequest: (data: { adminId: string; clientId: string; redirectUri: string; state?: string; codeChallenge: string; scopes: string; resource: string; expiresAt: Date }) =>
    prisma.mcpOAuthRequest.create({ data }),
  deleteExpiredOAuthData: async (now = new Date()) => {
    await Promise.all([
      prisma.mcpOAuthRequest.deleteMany({ where: { expiresAt: { lte: now } } }),
      prisma.mcpOAuthAuthorizationCode.deleteMany({ where: { expiresAt: { lte: now } } }),
      prisma.mcpOAuthToken.deleteMany({ where: { expiresAt: { lte: now } } }),
    ]);
  },
  findOAuthRequest: (id: string, adminId: string, now = new Date()) =>
    prisma.mcpOAuthRequest.findFirst({ where: { id, adminId, expiresAt: { gt: now } } }),
  consumeOAuthRequest: (id: string, adminId: string, now = new Date()) =>
    prisma.mcpOAuthRequest.deleteMany({ where: { id, adminId, expiresAt: { gt: now } } }),
  createOAuthCode: (data: { codeHash: string; adminId: string; clientId: string; redirectUri: string; codeChallenge: string; scopes: string; resource: string; expiresAt: Date }) =>
    prisma.mcpOAuthAuthorizationCode.create({ data }),
  findOAuthCode: (codeHash: string, now = new Date()) =>
    prisma.mcpOAuthAuthorizationCode.findFirst({ where: { codeHash, expiresAt: { gt: now } } }),
  consumeOAuthCode: (id: string, now = new Date()) =>
    prisma.mcpOAuthAuthorizationCode.deleteMany({ where: { id, expiresAt: { gt: now } } }),
  createOAuthToken: (data: { tokenHash: string; tokenType: string; adminId: string; clientId: string; scopes: string; resource: string; expiresAt: Date }) =>
    prisma.mcpOAuthToken.create({ data }),
  findActiveOAuthToken: (tokenHash: string, tokenType: string, resource: string, now = new Date()) =>
    prisma.mcpOAuthToken.findFirst({ where: { tokenHash, tokenType, resource, revokedAt: null, expiresAt: { gt: now } } }),
  revokeOAuthToken: (tokenHash: string, tokenType?: string, clientId?: string) =>
    prisma.mcpOAuthToken.updateMany({
      where: { tokenHash, ...(tokenType ? { tokenType } : {}), ...(clientId ? { clientId } : {}), revokedAt: null },
      data: { revokedAt: new Date() },
    }),
};
