import { allowMcpRequest } from "@/integrations/mcp/context";
import { OAuthError, registerOAuthClient } from "@/integrations/mcp/oauth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!allowMcpRequest(request, 20, "oauth-register"))
    return Response.json({ error: "temporarily_unavailable", error_description: "Please retry later." }, { status: 429, headers: { "Retry-After": "60", "Cache-Control": "no-store" } });
  try {
    const body = await request.text();
    if (body.length > 16_384)
      return Response.json({ error: "invalid_client_metadata", error_description: "The registration request is too large." }, { status: 413, headers: { "Cache-Control": "no-store" } });
    let input: unknown = null;
    try { input = JSON.parse(body) as unknown; } catch { /* Invalid JSON is handled as invalid metadata. */ }
    const result = await registerOAuthClient(input);
    return Response.json(result, { status: 201, headers: { "Cache-Control": "no-store", Pragma: "no-cache" } });
  } catch (error) {
    if (error instanceof OAuthError)
      return Response.json({ error: error.code, error_description: error.message }, { status: error.status, headers: { "Cache-Control": "no-store" } });
    return Response.json({ error: "server_error", error_description: "Client registration could not be completed." }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
