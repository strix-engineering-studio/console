import { allowMcpRequest } from "@/integrations/mcp/context";
import { exchangeAuthorizationCode, exchangeRefreshToken, getOAuthUrls, logOAuthTransition, OAuthError } from "@/integrations/mcp/oauth";
import { mcpRepository } from "@/integrations/mcp/repository";

export const dynamic = "force-dynamic";

async function parseForm(request: Request) {
  const contentType = request.headers.get("content-type")?.split(";")[0].trim();
  if (contentType === "application/x-www-form-urlencoded") {
    const form = new URLSearchParams(await request.text());
    return Object.fromEntries(form.entries());
  }
  return null;
}

export async function POST(request: Request) {
  const headers = { "Cache-Control": "no-store", Pragma: "no-cache" };
  if (!allowMcpRequest(request, 120, "oauth-token"))
    return Response.json({ error: "temporarily_unavailable", error_description: "Please retry later." }, { status: 429, headers: { ...headers, "Retry-After": "60" } });
  try {
    const form = await parseForm(request);
    if (!form || typeof form.client_id !== "string")
      throw new OAuthError("invalid_request", "A form-encoded OAuth token request is required.");
    logOAuthTransition("token.request_received", {
      grantType: form.grant_type ?? null,
      clientId: form.client_id,
      redirectUri: form.redirect_uri ?? null,
      codePresent: Boolean(form.code),
      codeVerifierPresent: Boolean(form.code_verifier),
      now: new Date().toISOString(),
    });
    const client = await mcpRepository.findOAuthClient(form.client_id);
    if (!client || client.revokedAt) throw new OAuthError("invalid_client", "The OAuth client is not registered.", 401);
    if ((client.tokenEndpointAuthMethod ?? "none") !== "none")
      throw new OAuthError("unauthorized_client", "This OAuth client is not a public PKCE client.");
    if (form.client_secret) throw new OAuthError("invalid_client", "This public OAuth client must not send a client secret.", 401);
    const urls = getOAuthUrls(request.url);
    if (form.resource !== urls.resource)
      throw new OAuthError("invalid_target", "The token resource does not match this MCP server.");

    let result;
    if (form.grant_type === "authorization_code") {
      if (!client.grantTypes.includes("authorization_code"))
        throw new OAuthError("unauthorized_client", "The client is not registered for authorization-code grants.");
      if (!form.code || !form.redirect_uri || !form.code_verifier)
        throw new OAuthError("invalid_request", "The code, redirect_uri, and code_verifier are required.");
      result = await exchangeAuthorizationCode({
        code: form.code,
        clientId: client.clientId,
        redirectUri: form.redirect_uri,
        codeVerifier: form.code_verifier,
        resource: form.resource,
        issueRefreshToken: client.grantTypes.includes("refresh_token"),
      });
    } else if (form.grant_type === "refresh_token") {
      if (!client.grantTypes.includes("refresh_token"))
        throw new OAuthError("unauthorized_client", "The client is not registered for refresh-token grants.");
      if (!form.refresh_token)
        throw new OAuthError("invalid_request", "The refresh_token is required.");
      result = await exchangeRefreshToken({
        refreshToken: form.refresh_token,
        clientId: client.clientId,
        ...(form.scope ? { scope: form.scope } : {}),
        resource: form.resource,
        issueRefreshToken: true,
      });
    } else {
      throw new OAuthError("unsupported_grant_type", "Only authorization_code and refresh_token grants are supported.");
    }
    return Response.json(result, { headers });
  } catch (error) {
    if (error instanceof OAuthError)
      return Response.json({ error: error.code, error_description: error.message }, { status: error.status, headers });
    return Response.json({ error: "server_error", error_description: "The token request could not be completed." }, { status: 500, headers });
  }
}
