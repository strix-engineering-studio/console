import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { allowMcpIdentity, allowMcpRequest } from "@/integrations/mcp/context";
import { authenticateMcpRequest, MCP_AUTH_REQUIRED } from "@/integrations/mcp/auth";
import { getOAuthUrls } from "@/integrations/mcp/oauth";
import {
  addOAuthSecuritySchemes,
  createMcpServer,
} from "@/integrations/mcp/server";

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

  let authentication: Awaited<
    ReturnType<typeof authenticateMcpRequest>
  > | null = null;

  let resourceMetadata: string | undefined;

  if (!MCP_AUTH_REQUIRED) {
    const authentication = {
      kind: "bypass" as const,
      scopes: ["strix:read", "strix:write"] as ("strix:read" | "strix:write")[],
    };
    return handleAuthenticatedRequest(request, authentication, "");
  }

  const apiKey = request.headers.get("x-mcp-api-key");
  const authorization = request.headers.get("authorization");

  /*
   * ---------------------------------------------------------
   * 1. API KEY AUTHENTICATION
   * ---------------------------------------------------------
   *
   * API keys use:
   *
   *   X-MCP-API-Key: <api-key>
   *
   * They must NOT require OAuth configuration.
   */
  if (apiKey) {
    authentication = await authenticateMcpRequest(request);
  }

  /*
   * ---------------------------------------------------------
   * 2. OAUTH AUTHENTICATION
   * ---------------------------------------------------------
   *
   * OAuth uses:
   *
   *   Authorization: Bearer <access-token>
   *
   * OAuth metadata is resolved only for OAuth requests.
   */
  if (
    !authentication &&
    !apiKey &&
    authorization?.match(/^Bearer [A-Za-z0-9_-]{32,}$/)
  ) {
    try {
      const urls = getOAuthUrls(request.url);

      resourceMetadata = urls.resourceMetadata;

      authentication = await authenticateMcpRequest(request, urls.resource);
    } catch {
      // OAuth configuration/token validation failure.
      authentication = null;
    }
  }

  /*
   * ---------------------------------------------------------
   * 3. AUTHENTICATION FAILURE
   * ---------------------------------------------------------
   */
  if (!authentication) {
    const headers = new Headers({
      "Cache-Control": "no-store",
    });

    // Only advertise OAuth metadata for OAuth requests.
    if (!apiKey && authorization) {
      try {
        const urls = getOAuthUrls(request.url);

        headers.set(
          "WWW-Authenticate",
          `Bearer resource_metadata="${urls.resourceMetadata}", scope="strix:read strix:write"`,
        );
      } catch {
        // OAuth is not configured.
      }
    }

    return Response.json(
      { error: "Unauthorized." },
      {
        status: 401,
        headers,
      },
    );
  }

  /*
   * ---------------------------------------------------------
   * 4. PER-IDENTITY RATE LIMIT
   * ---------------------------------------------------------
   */
  const identity = authentication.kind === "api-key"
    ? `key:${authentication.keyId}`
    : authentication.kind === "oauth"
      ? `oauth:${authentication.clientId}`
      : "auth-disabled";

  if (!allowMcpIdentity(identity)) {
    return Response.json(
      {
        error: "Too many requests for this integration.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": "60",
          "Cache-Control": "no-store",
        },
      },
    );
  }

  /*
   * ---------------------------------------------------------
   * 5. CREATE MCP SERVER
   * ---------------------------------------------------------
   */
  return handleAuthenticatedRequest(request, authentication, resourceMetadata ?? "");
}

async function handleAuthenticatedRequest(
  request: Request,
  authentication: NonNullable<Awaited<ReturnType<typeof authenticateMcpRequest>>> | { kind: "bypass"; scopes: ("strix:read" | "strix:write")[] },
  resourceMetadata: string,
) {
  const server = createMcpServer(authentication, resourceMetadata);

  const transport = new WebStandardStreamableHTTPServerTransport({
    enableJsonResponse: true,
  });

  try {
    await server.connect(transport);

    const message =
      request.method === "POST"
        ? await request
            .clone()
            .json()
            .catch(() => null)
        : null;

    const response = await transport.handleRequest(request);

    /*
     * OAuth clients receive OAuth security metadata.
     * API-key clients don't need it.
     */
    if (
      authentication.kind === "oauth" &&
      message &&
      typeof message === "object" &&
      "method" in message &&
      message.method === "tools/list" &&
      response.headers.get("content-type")?.includes("application/json")
    ) {
      const body = addOAuthSecuritySchemes(await response.json());

      const responseHeaders = new Headers(response.headers);

      responseHeaders.delete("Content-Length");
      responseHeaders.delete("Content-Encoding");
      responseHeaders.delete("ETag");

      responseHeaders.set("Cache-Control", "no-store");

      return new Response(JSON.stringify(body), {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    }

    const headers = new Headers(response.headers);

    headers.set("Cache-Control", "no-store");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch {
    await server.close().catch(() => undefined);

    return Response.json(
      { error: "MCP request failed." },
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
