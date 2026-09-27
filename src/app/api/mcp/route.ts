import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { allowMcpRequest } from "@/integrations/mcp/context";
import { authenticateMcpRequest } from "@/integrations/mcp/auth";
import { getOAuthUrls } from "@/integrations/mcp/oauth";
import { addOAuthSecuritySchemes, createMcpServer } from "@/integrations/mcp/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handle(request: Request) {
  if (!allowMcpRequest(request)) return Response.json({ error: "Too many requests." }, { status: 429, headers: { "Retry-After": "60" } });
  let urls: ReturnType<typeof getOAuthUrls>;
  try {
    urls = getOAuthUrls(request.url);
  } catch {
    return Response.json({ error: "OAuth is not configured." }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
  const authentication = await authenticateMcpRequest(request, urls.resource);
  if (!authentication) return Response.json({ error: "Unauthorized." }, { status: 401, headers: { "WWW-Authenticate": `Bearer resource_metadata="${urls.resourceMetadata}", scope="strix:read strix:write"`, "Cache-Control": "no-store" } });
  const server = createMcpServer(authentication, urls.resourceMetadata);
  const transport = new WebStandardStreamableHTTPServerTransport({ enableJsonResponse: true });
  try {
    await server.connect(transport);
    const message = request.method === "POST" ? await request.clone().json().catch(() => null) : null;
    const response = await transport.handleRequest(request);
    if (message && typeof message === "object" && "method" in message && message.method === "tools/list" &&
        response.headers.get("content-type")?.includes("application/json")) {
      const body = addOAuthSecuritySchemes(await response.json());
      const responseHeaders = new Headers(response.headers);
      responseHeaders.delete("Content-Length");
      responseHeaders.delete("Content-Encoding");
      responseHeaders.delete("ETag");
      responseHeaders.set("Cache-Control", "no-store");
      return new Response(JSON.stringify(body), { status: response.status, statusText: response.statusText, headers: responseHeaders });
    }
    const headers = new Headers(response.headers);
    headers.set("Cache-Control", "no-store");
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  } catch {
    await server.close().catch(() => undefined);
    return Response.json({ error: "MCP request failed." }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}

export const GET = handle;
export const POST = handle;
export const DELETE = handle;
