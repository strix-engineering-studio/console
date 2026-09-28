import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { authenticateOAuthAccessToken, type OAuthScope } from "./oauth";
import { mcpRepository } from "./repository";

export const hashMcpKey = (key: string) =>
  createHash("sha256").update(key).digest("hex");

export type McpAuthentication =
  | {
      kind: "api-key";
      keyId: string;
      integrationName: string;
      scopes: OAuthScope[];
    }
  | { kind: "oauth"; adminId: string; clientId: string; scopes: string[] };

export async function authenticateMcpRequest(
  request: Request,
  resource?: string,
): Promise<McpAuthentication | null> {
  const apiKey = request.headers.get("x-mcp-api-key");
  if (apiKey !== null) {
    if (!/^[A-Za-z0-9_-]{32,}$/.test(apiKey)) return null;
    try {
      const key = await mcpRepository.findActiveKey(hashMcpKey(apiKey));
      if (!key) return null;
      void mcpRepository.touchKey(key.id).catch(() => undefined);
      return {
        kind: "api-key",
        keyId: key.id,
        integrationName: key.name,
        // Existing keys created before scopes were introduced remain read-only.
        scopes: (key.scopes ?? "strix:read")
          .split(/\s+/)
          .filter(
            (scope): scope is OAuthScope =>
              scope === "strix:read" || scope === "strix:write",
          ),
      };
    } catch {
      return null;
    }
  }

  const authorization = request.headers.get("authorization");
  const match = authorization?.match(/^Bearer ([A-Za-z0-9_-]{32,})$/);
  if (!match || !resource) return null;
  const oauth = await authenticateOAuthAccessToken(match[1], resource);
  return oauth
    ? {
        kind: "oauth",
        adminId: oauth.adminId,
        clientId: oauth.clientId,
        scopes: oauth.scopes,
      }
    : null;
}

export async function generateMcpKey(
  name: string,
  scopes: OAuthScope[],
  expiresAt?: Date,
) {
  const secret = `strix_mcp_live_${randomBytes(32).toString("base64url")}`;
  const record = await mcpRepository.createKey({
    name,
    keyHash: hashMcpKey(secret),
    keyPrefix: secret.slice(0, 19),
    scopes: scopes.join(" "),
    ...(expiresAt ? { expiresAt } : {}),
  });
  return {
    id: record.id,
    name: record.name,
    key: secret,
    keyPrefix: record.keyPrefix,
    scopes,
    expiresAt: record.expiresAt,
  };
}
