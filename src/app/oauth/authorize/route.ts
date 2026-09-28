import { getAdminSession } from "@/lib/auth/session";
import {
  authorizationCodeExpiresAt,
  getOAuthUrls,
  hashAuthorizationCode,
  isAllowedRedirectUri,
  makeAuthorizationCode,
  OAuthError,
  OAUTH_SCOPES,
  parseScopes,
} from "@/integrations/mcp/oauth";
import { allowMcpRequest } from "@/integrations/mcp/context";
import { mcpRepository } from "@/integrations/mcp/repository";

export const dynamic = "force-dynamic";

const noStore = {
  "Cache-Control": "no-store",
  "Content-Security-Policy":
    "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
};

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ]!,
  );
}

function errorPage(message: string, status = 400) {
  return new Response(
    `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Strix Lead authorization</title><body style="font:16px system-ui;max-width:36rem;margin:10vh auto;padding:1.5rem"><h1>Could not connect Strix Lead</h1><p>${escapeHtml(message)}</p><p>Return to the client and try connecting again.</p></body></html>`,
    {
      status,
      headers: { "Content-Type": "text/html; charset=utf-8", ...noStore },
    },
  );
}

function redirectError(
  redirectUri: string,
  state: string | null,
  error: string,
  description: string,
  issuer: string,
) {
  const target = new URL(redirectUri);
  target.searchParams.set("error", error);
  target.searchParams.set("error_description", description);
  if (state !== null) target.searchParams.set("state", state);
  target.searchParams.set("iss", issuer);
  return Response.redirect(target, 303);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  let callback: string | null = null;
  let state: string | null = null;
  let issuer = "";
  let trustedCallback = false;
  try {
    const responseType = url.searchParams.get("response_type");
    const clientId = url.searchParams.get("client_id");
    callback = url.searchParams.get("redirect_uri");
    state = url.searchParams.get("state");
    const codeChallenge = url.searchParams.get("code_challenge") ?? "";
    const urls = getOAuthUrls(request.url);
    issuer = urls.issuer;
    if (!allowMcpRequest(request, 60, "oauth-authorize"))
      return errorPage(
        "Too many connection attempts. Wait a moment, then retry.",
        429,
      );
    if (
      responseType !== "code" ||
      !clientId ||
      !callback ||
      url.searchParams.get("code_challenge_method") !== "S256" ||
      !/^[A-Za-z0-9_-]{43}$/.test(codeChallenge) ||
      (state && state.length > 1024)
    )
      throw new OAuthError(
        "invalid_request",
        "A valid authorization-code request with S256 PKCE is required.",
      );

    const client = await mcpRepository.findOAuthClient(clientId);
    if (
      !client ||
      client.revokedAt ||
      !client.grantTypes.includes("authorization_code")
    )
      throw new OAuthError(
        "unauthorized_client",
        "The OAuth client is not registered for authorization-code grants.",
      );
    trustedCallback =
      isAllowedRedirectUri(callback) && client.redirectUris.includes(callback);
    if (!trustedCallback)
      throw new OAuthError(
        "invalid_request",
        "The redirect URI is not registered for this client.",
      );
    if (url.searchParams.get("resource") !== urls.resource)
      return redirectError(
        callback,
        state,
        "invalid_target",
        "The requested resource does not match Strix Lead.",
        urls.issuer,
      );
    const allowedScopes = (client.scopes ?? OAUTH_SCOPES.join(" "))
      .split(/\s+/)
      .filter(Boolean);
    const scopes = parseScopes(
      url.searchParams.get("scope") ?? allowedScopes.join(" "),
    );
    if (scopes.some((scope) => !allowedScopes.includes(scope)))
      throw new OAuthError("invalid_scope", "The client is not registered for the requested scope.");
    const session = await getAdminSession();
    if (!session) {
      const login = new URL("/auth/login", urls.issuer);
      login.searchParams.set("returnTo", `${url.pathname}${url.search}`);
      return Response.redirect(login, 303);
    }

    await mcpRepository.deleteExpiredOAuthData();
    const pending = await mcpRepository.createOAuthRequest({
      adminId: session.adminId,
      clientId,
      redirectUri: callback,
      ...(state !== null ? { state } : {}),
      codeChallenge,
      scopes: scopes.join(" "),
      resource: urls.resource,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });
    const scopeItems = scopes
      .map((scope) =>
        scope === "strix:read"
          ? "Search and view leads, organizations, people, research runs, and activity."
          : "Create, update, and delete Strix Lead records.",
      )
      .map((text) => `<li>${escapeHtml(text)}</li>`)
      .join("");
    const name = escapeHtml(client.clientName);
    const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Connect Strix Lead</title><body style="font:16px system-ui;max-width:38rem;margin:8vh auto;padding:1.5rem;color:#18181b"><main style="border:1px solid #ddd;border-radius:16px;padding:2rem"><p style="font-size:12px;text-transform:uppercase;letter-spacing:.18em;color:#555">Strix Lead</p><h1>Allow ${name} to connect?</h1><p>This client will access the CRM using your administrator account. Data is shared across this Strix Lead workspace.</p><h2 style="font-size:1rem">Requested access</h2><ul>${scopeItems}</ul><p>Every change made through MCP is recorded in Strix Lead activity.</p><form method="post" action="/oauth/authorize"><input type="hidden" name="request_id" value="${escapeHtml(pending.id)}"><div style="display:flex;gap:.75rem;margin-top:2rem"><button name="decision" value="approve" style="padding:.7rem 1rem">Approve access</button><button name="decision" value="deny" formnovalidate style="padding:.7rem 1rem">Cancel</button></div></form></main></body></html>`;
    return new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8", ...noStore },
    });
  } catch (error) {
    if (error instanceof OAuthError && callback && trustedCallback && issuer)
      return redirectError(callback, state, error.code, error.message, issuer);
    return errorPage(
      error instanceof OAuthError
        ? error.message
        : "The authorization request could not be completed.",
    );
  }
}

export async function POST(request: Request) {
  if (!allowMcpRequest(request, 60, "oauth-authorize"))
    return errorPage(
      "Too many connection attempts. Wait a moment, then retry.",
      429,
    );
  const session = await getAdminSession();
  if (!session)
    return errorPage(
      "Your Strix Lead administrator session has expired. Return to the MCP client and reconnect.",
      401,
    );
  try {
    const form = await request.formData();
    const requestId = form.get("request_id");
    const decision = form.get("decision");
    if (
      typeof requestId !== "string" ||
      (decision !== "approve" && decision !== "deny")
    )
      return errorPage("The authorization decision is invalid.");
    const pending = await mcpRepository.findOAuthRequest(
      requestId,
      session.adminId,
    );
    if (!pending)
      return errorPage(
        "This authorization request expired. Return to the MCP client and reconnect.",
      );
    const consumed = await mcpRepository.consumeOAuthRequest(
      requestId,
      session.adminId,
    );
    if (!consumed.count)
      return errorPage("This authorization request has already been handled.");
    if (decision === "deny")
      return redirectError(
        pending.redirectUri,
        pending.state,
        "access_denied",
        "The Strix Lead connection was declined.",
        getOAuthUrls(request.url).issuer,
      );

    const client = await mcpRepository.findOAuthClient(pending.clientId);
    if (
      !client ||
      client.revokedAt ||
      !client.redirectUris.includes(pending.redirectUri) ||
      !isAllowedRedirectUri(pending.redirectUri)
    )
      return errorPage(
        "The registered client changed. Return to the MCP client and reconnect.",
      );
    const code = makeAuthorizationCode();
    await mcpRepository.createOAuthCode({
      codeHash: hashAuthorizationCode(code),
      adminId: session.adminId,
      clientId: pending.clientId,
      redirectUri: pending.redirectUri,
      codeChallenge: pending.codeChallenge,
      scopes: pending.scopes,
      resource: pending.resource,
      expiresAt: authorizationCodeExpiresAt(),
    });
    const target = new URL(pending.redirectUri);
    target.searchParams.set("code", code);
    if (pending.state !== null) target.searchParams.set("state", pending.state);
    target.searchParams.set("iss", getOAuthUrls(request.url).issuer);
    return Response.redirect(target, 303);
  } catch {
    return errorPage("The authorization decision could not be completed.", 500);
  }
}
