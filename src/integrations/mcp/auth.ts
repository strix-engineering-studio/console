import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { authenticateOAuthAccessToken, type OAuthScope } from "./oauth";
import { mcpRepository } from "./repository";

export const hashMcpKey = (key: string) => createHash("sha256").update(key).digest("hex");

export type McpAuthentication =
  | { kind: "api-key"; scopes: OAuthScope[] }
  | { kind: "oauth"; adminId: string; clientId: string; scopes: string[] };

export async function authenticateMcpRequest(request: Request, resource: string): Promise<McpAuthentication | null> {
  const authorization = request.headers.get("authorization");
  const match = authorization?.match(/^Bearer ([A-Za-z0-9_-]{32,})$/);
  if (!match) return null;
  try {
    if (await mcpRepository.findActiveKey(hashMcpKey(match[1])))
      return { kind: "api-key", scopes: ["strix:read", "strix:write"] };
  } catch {
    return null;
  }
  const oauth = await authenticateOAuthAccessToken(match[1], resource);
  return oauth ? { kind: "oauth", adminId: oauth.adminId, clientId: oauth.clientId, scopes: oauth.scopes } : null;
}

export async function generateMcpKey(name: string, expiresAt?: Date) {
  const secret = `strix_mcp_${randomBytes(32).toString("base64url")}`;
  const record = await mcpRepository.createKey({ name, keyHash: hashMcpKey(secret), ...(expiresAt ? { expiresAt } : {}) });
  return { id: record.id, name: record.name, key: secret, expiresAt: record.expiresAt };
}
