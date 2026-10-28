import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { allowMcpRequest } from "@/integrations/mcp/context";
import { createMcpServer } from "@/integrations/mcp/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handle(request: Request) {
  // Global request rate limit
  if (!allowMcpRequest(request)) {
    return Response.json(
      { error: "Too many requests." },
      {
        status: 429,
        headers: {
          "Retry-After": "60",
          "Cache-Control": "no-store",
        },
      },
    );
  }

  const server = createMcpServer();

  const transport = new WebStandardStreamableHTTPServerTransport({
    enableJsonResponse: true,
  });

  try {
    await server.connect(transport);
    const response = await transport.handleRequest(request);

    const headers = new Headers(response.headers);
    headers.set("Cache-Control", "no-store");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch (error) {
    console.error("[MCP] Request failed:", error);

    await server.close().catch((closeError) => {
      console.error("[MCP] Failed to close server:", closeError);
    });

    return Response.json(
      {
        error: "MCP request failed.",
        message: error instanceof Error ? error.message : String(error),
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}

export const GET = handle;
export const POST = handle;
export const DELETE = handle;
