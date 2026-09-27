import { allowMcpRequest } from "@/integrations/mcp/context";
import { revokeOAuthToken } from "@/integrations/mcp/oauth";
import { mcpRepository } from "@/integrations/mcp/repository";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const headers = { "Cache-Control": "no-store", Pragma: "no-cache" };
  if (!allowMcpRequest(request, 120, "oauth-revoke"))
    return Response.json({ error: "temporarily_unavailable" }, { status: 429, headers: { ...headers, "Retry-After": "60" } });
  try {
    const form = new URLSearchParams(await request.text());
    const token = form.get("token");
    const clientId = form.get("client_id");
    if (token && clientId && await mcpRepository.findOAuthClient(clientId))
      await revokeOAuthToken(token, clientId);
  } catch {
    // Revocation follows RFC 7009: an unknown token still receives a successful response.
  }
  return new Response(null, { status: 200, headers });
}
