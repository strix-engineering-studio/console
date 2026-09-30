import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { mcpRepository } from "./repository";

export const OAUTH_SCOPES = ["strix:read", "strix:write"] as const;
export type OAuthScope = (typeof OAUTH_SCOPES)[number];

const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
const REFRESH_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60;
const AUTHORIZATION_REQUEST_TTL_MS = 10 * 60 * 1000;
const AUTHORIZATION_CODE_TTL_MS = 5 * 60 * 1000;

export function logOAuthTransition(event: string, details: Record<string, unknown>) {
  console.info(JSON.stringify({ component: "mcp-oauth", event, ...details }));
}

export const authorizationRequestExpiresAt = (now = new Date()) =>
  new Date(now.getTime() + AUTHORIZATION_REQUEST_TTL_MS);

export class OAuthError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status = 400,
  ) {
    super(message);
  }
}

export function getOAuthUrls(requestUrl: string) {
  const configured = process.env.MCP_PUBLIC_URL?.trim();
  if (process.env.NODE_ENV === "production" && !configured)
    throw new Error("MCP_PUBLIC_URL must be configured with the canonical public /api/mcp URL.");

  const resource = new URL(
    configured || new URL("/api/mcp", requestUrl).toString(),
  );

  if (
    resource.username ||
    resource.password ||
    resource.pathname !== "/api/mcp" ||
    resource.search ||
    resource.hash
  ) {
    throw new Error(
      `MCP_PUBLIC_URL must be the public /api/mcp URL. Received: ${resource.toString()}`,
    );
  }

  if (resource.protocol !== "http:" && resource.protocol !== "https:") {
    throw new Error("MCP_PUBLIC_URL must use HTTP or HTTPS.");
  }

  if (process.env.NODE_ENV === "production" && resource.protocol !== "https:") {
    throw new Error("MCP_PUBLIC_URL must use HTTPS in production.");
  }

  const issuer = resource.origin;

  return {
    resource: resource.toString(),
    issuer,
    authorization: new URL("/oauth/authorize", issuer).toString(),
    token: new URL("/oauth/token", issuer).toString(),
    registration: new URL("/oauth/register", issuer).toString(),
    revocation: new URL("/oauth/revoke", issuer).toString(),
    resourceMetadata: new URL(
      "/.well-known/oauth-protected-resource/api/mcp",
      issuer,
    ).toString(),
  };
}

export function parseScopes(value?: string | null) {
  const requested = value?.split(/\s+/).filter(Boolean) ?? [];
  const scopes = requested.length
    ? [...new Set(requested)]
    : ["strix:read", "strix:write"];
  if (
    !scopes.length ||
    scopes.some((scope) => !OAUTH_SCOPES.includes(scope as OAuthScope))
  )
    throw new OAuthError(
      "invalid_scope",
      "The requested scope is not supported.",
    );
  return scopes;
}

export function isAllowedRedirectUri(value: string) {
  let uri: URL;
  try {
    uri = new URL(value);
  } catch {
    return false;
  }
  if (
    uri.username ||
    uri.password ||
    value.includes("#") ||
    value.includes("*") ||
    /%2a/i.test(value)
  )
    return false;
  if (uri.protocol === "https:") return true;
  return process.env.NODE_ENV !== "production" &&
    uri.protocol === "http:" &&
    ["localhost", "127.0.0.1", "[::1]", "::1"].includes(uri.hostname) &&
    Boolean(uri.port);
}

export async function createAdminOAuthClient(input: {
  name: string;
  redirectUris: string[];
  scopes: OAuthScope[];
}) {
  const name = input.name.trim();
  if (!name || name.length > 120)
    throw new OAuthError("invalid_client_metadata", "The client name must be between 1 and 120 characters.");
  if (
    !input.redirectUris.length ||
    input.redirectUris.length > 10 ||
    input.redirectUris.some((uri) => !isAllowedRedirectUri(uri))
  )
    throw new OAuthError("invalid_redirect_uri", "Provide up to 10 exact HTTPS redirect URIs. Loopback HTTP is allowed only in development.");
  if (!input.scopes.length || input.scopes.some((scope) => !OAUTH_SCOPES.includes(scope)))
    throw new OAuthError("invalid_scope", "Select at least one supported Strix scope.");
  const created = await mcpRepository.createOAuthClient({
    clientId: `strix_client_${randomBytes(32).toString("base64url")}`,
    clientName: name,
    redirectUris: [...new Set(input.redirectUris)],
    grantTypes: ["authorization_code", "refresh_token"],
    responseTypes: ["code"],
    tokenEndpointAuthMethod: "none",
    scopes: [...new Set(input.scopes)].join(" "),
  });
  return created;
}

export async function registerOAuthClient(input: unknown) {
  if (!input || typeof input !== "object")
    throw new OAuthError(
      "invalid_client_metadata",
      "A JSON client registration is required.",
    );
  const body = input as Record<string, unknown>;
  const redirectUris = body.redirect_uris;
  if (
    !Array.isArray(redirectUris) ||
    redirectUris.length < 1 ||
    redirectUris.length > 10 ||
    redirectUris.some(
      (uri) => typeof uri !== "string" || !isAllowedRedirectUri(uri),
    )
  )
    throw new OAuthError(
      "invalid_redirect_uri",
      "Only HTTPS redirect URIs and loopback development callbacks are allowed.",
    );

  const grantTypes = Array.isArray(body.grant_types)
    ? body.grant_types
    : ["authorization_code", "refresh_token"];
  const responseTypes = Array.isArray(body.response_types)
    ? body.response_types
    : ["code"];
  if (
    !grantTypes.includes("authorization_code") ||
    grantTypes.some(
      (grant) =>
        !["authorization_code", "refresh_token"].includes(String(grant)),
    ) ||
    !responseTypes.includes("code") ||
    responseTypes.some((type) => type !== "code")
  )
    throw new OAuthError(
      "invalid_client_metadata",
      "Only authorization-code and refresh-token grants are supported.",
    );
  if (
    body.token_endpoint_auth_method &&
    body.token_endpoint_auth_method !== "none"
  )
    throw new OAuthError(
      "invalid_client_metadata",
      "Public clients must use token_endpoint_auth_method=none.",
    );

  const scopes = typeof body.scope === "string" ? parseScopes(body.scope) : [...OAUTH_SCOPES];
  const clientName =
    typeof body.client_name === "string" && body.client_name.trim()
      ? body.client_name.trim().slice(0, 120)
      : "MCP client";
  const created = await mcpRepository.createOAuthClient({
    clientId: `strix_client_${randomBytes(32).toString("base64url")}`,
    clientName,
    redirectUris: [...new Set(redirectUris as string[])],
    grantTypes: [...new Set(grantTypes.map(String))],
    responseTypes: [...new Set(responseTypes.map(String))],
    tokenEndpointAuthMethod: "none",
    scopes: scopes.join(" "),
  });
  return {
    client_id: created.clientId,
    client_id_issued_at: Math.floor(created.createdAt.getTime() / 1000),
    client_name: created.clientName,
    redirect_uris: created.redirectUris,
    grant_types: created.grantTypes,
    response_types: created.responseTypes,
    token_endpoint_auth_method: created.tokenEndpointAuthMethod,
    scope: created.scopes,
  };
}

const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
const secret = (prefix: string) =>
  `${prefix}${randomBytes(32).toString("base64url")}`;

async function issueTokenPair(input: {
  adminId: string;
  clientId: string;
  scopes: string[];
  resource: string;
  issueRefreshToken: boolean;
}) {
  const { issueRefreshToken, ...tokenInput } = input;
  const accessToken = secret("strix_at_");
  const now = Date.now();
  const accessExpiresAt = new Date(now + ACCESS_TOKEN_TTL_SECONDS * 1000);
  await mcpRepository.createOAuthToken({
    tokenHash: hash(accessToken),
    tokenType: "access",
    ...tokenInput,
    scopes: input.scopes.join(" "),
    expiresAt: accessExpiresAt,
  });
  const response = {
    access_token: accessToken,
    token_type: "Bearer",
    expires_in: ACCESS_TOKEN_TTL_SECONDS,
    scope: input.scopes.join(" "),
  };
  if (issueRefreshToken) {
    const refreshToken = secret("strix_rt_");
    await mcpRepository.createOAuthToken({
      tokenHash: hash(refreshToken),
      tokenType: "refresh",
      ...tokenInput,
      scopes: input.scopes.join(" "),
      expiresAt: new Date(now + REFRESH_TOKEN_TTL_SECONDS * 1000),
    });
    return { ...response, refresh_token: refreshToken };
  }
  return response;
}

export async function exchangeAuthorizationCode(input: {
  code: string;
  clientId: string;
  redirectUri: string;
  codeVerifier: string;
  resource: string;
  issueRefreshToken: boolean;
}) {
  const now = new Date();
  logOAuthTransition("token.request", {
    grantType: "authorization_code",
    clientId: input.clientId,
    redirectUri: input.redirectUri,
    codePresent: Boolean(input.code),
    codeVerifierPresent: Boolean(input.codeVerifier),
    now: now.toISOString(),
  });
  const row = await mcpRepository.findOAuthCode(hash(input.code));
  if (!row) {
    const inspected = await mcpRepository.inspectOAuthCode(hash(input.code));
    logOAuthTransition("token.code_lookup", {
      found: Boolean(inspected),
      expiresAt: inspected?.expiresAt.toISOString() ?? null,
      now: now.toISOString(),
      expired: inspected ? inspected.expiresAt.getTime() <= now.getTime() : null,
      alreadyUsed: inspected ? inspected.usedAt !== null : null,
    });
    throw new OAuthError(
      "invalid_grant",
      "The authorization code is invalid or expired.",
    );
  }
  logOAuthTransition("token.code_lookup", {
    found: true,
    expiresAt: row.expiresAt.toISOString(),
    now: now.toISOString(),
    expired: row.expiresAt.getTime() <= now.getTime(),
    alreadyUsed: row.usedAt !== null,
  });
  const client = await mcpRepository.findOAuthClient(input.clientId);
  if (!client || client.revokedAt)
    throw new OAuthError("invalid_grant", "The authorization code is invalid or expired.");

  const verifierValid = /^[A-Za-z0-9._~-]{43,128}$/.test(input.codeVerifier);
  const expectedChallenge = createHash("sha256")
    .update(input.codeVerifier)
    .digest("base64url");
  const challengeMatches =
    Buffer.byteLength(expectedChallenge) ===
      Buffer.byteLength(row.codeChallenge) &&
    timingSafeEqual(
      Buffer.from(expectedChallenge),
      Buffer.from(row.codeChallenge),
    );
  if (
    row.clientId !== input.clientId ||
    row.redirectUri !== input.redirectUri ||
    row.resource !== input.resource ||
    row.codeChallengeMethod !== "S256" ||
    !verifierValid ||
    !challengeMatches
  )
    throw new OAuthError(
      "invalid_grant",
      "The authorization code is invalid for this request.",
    );

  // Validate first, then consume with one atomic database update. Concurrent
  // exchanges can both read the row, but only one can change usedAt from null.
  const consumed = await mcpRepository.consumeOAuthCode(row.id, now);
  if (!consumed.count)
    throw new OAuthError(
      "invalid_grant",
      "The authorization code is invalid, expired, or already used.",
    );

  return issueTokenPair({
    adminId: row.adminId,
    clientId: row.clientId,
    scopes: row.scopes.split(" ").filter(Boolean),
    resource: row.resource,
    issueRefreshToken: input.issueRefreshToken,
  });
}

export async function exchangeRefreshToken(input: {
  refreshToken: string;
  clientId: string;
  scope?: string;
  resource: string;
  issueRefreshToken: boolean;
}) {
  const row = await mcpRepository.findActiveOAuthToken(
    hash(input.refreshToken),
    "refresh",
    input.resource,
  );
  if (!row || row.clientId !== input.clientId)
    throw new OAuthError(
      "invalid_grant",
      "The refresh token is invalid or expired.",
    );
  const client = await mcpRepository.findOAuthClient(input.clientId);
  if (!client || client.revokedAt)
    throw new OAuthError("invalid_grant", "The refresh token is invalid or expired.");
  const grantedScopes = row.scopes.split(" ").filter(Boolean);
  const scopes = input.scope ? parseScopes(input.scope) : grantedScopes;
  if (scopes.some((scope) => !grantedScopes.includes(scope)))
    throw new OAuthError(
      "invalid_scope",
      "A refresh token cannot grant additional scopes.",
    );
  const revoked = await mcpRepository.revokeOAuthToken(
    hash(input.refreshToken),
    "refresh",
    input.clientId,
  );
  if (!revoked.count)
    throw new OAuthError(
      "invalid_grant",
      "The refresh token has already been used.",
    );
  return issueTokenPair({
    adminId: row.adminId,
    clientId: row.clientId,
    scopes,
    resource: row.resource,
    issueRefreshToken: input.issueRefreshToken,
  });
}

export async function authenticateOAuthAccessToken(
  token: string,
  resource: string,
) {
  try {
    const record = await mcpRepository.findActiveOAuthToken(
      hash(token),
      "access",
      resource,
    );
    if (!record) return null;
    const client = await mcpRepository.findOAuthClient(record.clientId);
    if (!client || client.revokedAt) return null;
    return {
      adminId: record.adminId,
      clientId: record.clientId,
      scopes: record.scopes.split(" ").filter(Boolean),
      resource: record.resource,
      expiresAt: record.expiresAt,
    };
  } catch {
    return null;
  }
}

export async function revokeOAuthToken(token: string, clientId: string) {
  await mcpRepository.revokeOAuthToken(hash(token), undefined, clientId);
}

export function makeAuthorizationCode() {
  return secret("strix_ac_");
}

export function hashAuthorizationCode(code: string) {
  return hash(code);
}

export const authorizationCodeExpiresAt = () =>
  new Date(Date.now() + AUTHORIZATION_CODE_TTL_MS);
