import { getOAuthUrls, OAUTH_SCOPES } from "@/integrations/mcp/oauth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const urls = getOAuthUrls(request.url);
    return Response.json({
      issuer: urls.issuer,
      authorization_endpoint: urls.authorization,
      token_endpoint: urls.token,
      registration_endpoint: urls.registration,
      revocation_endpoint: urls.revocation,
      response_types_supported: ["code"],
      grant_types_supported: ["authorization_code", "refresh_token"],
      token_endpoint_auth_methods_supported: ["none"],
      revocation_endpoint_auth_methods_supported: ["none"],
      code_challenge_methods_supported: ["S256"],
      scopes_supported: [...OAUTH_SCOPES],
      client_id_metadata_document_supported: false,
      authorization_response_iss_parameter_supported: true,
    }, { headers: { "Cache-Control": "public, max-age=300" } });
  } catch {
    return Response.json({ error: "OAuth is not configured." }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
