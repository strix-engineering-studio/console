import "server-only";
import { prisma } from "@/lib/prisma";

export const mcpRepository = {
  findActiveKey: async (keyHash: string, now = new Date()) => {
    const key = await prisma.mcpApiKey.findFirst({
      where: { keyHash },
    });

    if (!key) return null;
    if (key.revokedAt) return null;
    if (key.expiresAt && key.expiresAt <= now) return null;

    return key;
  },
  createKey: (data: {
    name: string;
    keyHash: string;
    keyPrefix: string;
    scopes: string;
    expiresAt?: Date;
  }) => prisma.mcpApiKey.create({ data }),
  touchKey: (id: string) =>
    prisma.mcpApiKey.updateMany({
      where: { id, revokedAt: null },
      data: { lastUsedAt: new Date() },
    }),
  listKeys: () =>
    prisma.mcpApiKey.findMany({
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        scopes: true,
        expiresAt: true,
        revokedAt: true,
        lastUsedAt: true,
        createdAt: true,
        updatedAt: true,
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
  listOAuthClients: () =>
    prisma.mcpOAuthClient.findMany({ orderBy: { createdAt: "desc" } }),
  createOAuthClient: (data: {
    clientId: string;
    clientName: string;
    redirectUris: string[];
    grantTypes: string[];
    responseTypes: string[];
    tokenEndpointAuthMethod?: string;
    scopes?: string;
  }) => prisma.mcpOAuthClient.create({ data }),
  revokeOAuthClient: async (id: string) => {
    const client = await prisma.mcpOAuthClient.findUnique({
      where: { id },
      select: { clientId: true },
    });
    if (!client) return { count: 0 };
    const result = await prisma.mcpOAuthClient.updateMany({
      where: { id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    if (result.count)
      await prisma.mcpOAuthToken.updateMany({
        where: { clientId: client.clientId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    return result;
  },
  createOAuthRequest: (data: {
    adminId: string;
    clientId: string;
    redirectUri: string;
    state?: string;
    codeChallenge: string;
    codeChallengeMethod: string;
    scopes: string;
    resource: string;
    expiresAt: Date;
  }) => prisma.mcpOAuthRequest.create({ data }),
  deleteExpiredOAuthData: async (now = new Date()) => {
    await Promise.all([
      prisma.mcpOAuthRequest.deleteMany({ where: { expiresAt: { lte: now } } }),
      prisma.mcpOAuthAuthorizationCode.deleteMany({
        where: { expiresAt: { lte: now } },
      }),
      prisma.mcpOAuthToken.deleteMany({ where: { expiresAt: { lte: now } } }),
    ]);
  },
  findOAuthRequest: (id: string, adminId: string, now = new Date()) =>
    prisma.mcpOAuthRequest.findFirst({
      where: { id, adminId, usedAt: null, expiresAt: { gt: now } },
    }),
  inspectOAuthRequest: (id: string) =>
    prisma.mcpOAuthRequest.findUnique({ where: { id } }),
  consumeOAuthRequest: (id: string, adminId: string, now = new Date()) =>
    prisma.mcpOAuthRequest.updateMany({
      where: { id, adminId, usedAt: null, expiresAt: { gt: now } },
      data: { usedAt: now },
    }),
  createOAuthCode: (data: {
    codeHash: string;
    adminId: string;
    clientId: string;
    redirectUri: string;
    codeChallenge: string;
    codeChallengeMethod: string;
    scopes: string;
    resource: string;
    requestId?: string;
    expiresAt: Date;
  }) => prisma.mcpOAuthAuthorizationCode.create({ data }),
  findOAuthCode: (codeHash: string, now = new Date()) =>
    prisma.mcpOAuthAuthorizationCode.findFirst({
      where: { codeHash, expiresAt: { gt: now } },
    }),
  inspectOAuthCode: (codeHash: string) =>
    prisma.mcpOAuthAuthorizationCode.findUnique({ where: { codeHash } }),
  consumeOAuthCode: (id: string, now = new Date()) =>
    prisma.mcpOAuthAuthorizationCode.updateMany({
      where: { id, usedAt: null, expiresAt: { gt: now } },
      data: { usedAt: now },
    }),
  createOAuthToken: (data: {
    tokenHash: string;
    tokenType: string;
    adminId: string;
    clientId: string;
    scopes: string;
    resource: string;
    expiresAt: Date;
  }) => prisma.mcpOAuthToken.create({ data }),
  findActiveOAuthToken: (
    tokenHash: string,
    tokenType: string,
    resource: string,
    now = new Date(),
  ) =>
    prisma.mcpOAuthToken.findFirst({
      where: {
        tokenHash,
        tokenType,
        resource,
        revokedAt: null,
        expiresAt: { gt: now },
      },
    }),
  revokeOAuthToken: (
    tokenHash: string,
    tokenType?: string,
    clientId?: string,
  ) =>
    prisma.mcpOAuthToken.updateMany({
      where: {
        tokenHash,
        ...(tokenType ? { tokenType } : {}),
        ...(clientId ? { clientId } : {}),
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    }),
};
