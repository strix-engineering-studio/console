import { getOAuthUrls, OAUTH_SCOPES } from "@/integrations/mcp/oauth";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ resource: string[] }> },
) {
  try {
    const { resource } = await params;

    if (resource.join("/") !== "api/mcp") {
      return Response.json(
        { error: "Not found." },
        {
          status: 404,
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

    const urls = getOAuthUrls(request.url);

    return Response.json(
      {
        resource: urls.resource,
        authorization_servers: [urls.issuer],
        scopes_supported: [...OAUTH_SCOPES],
        bearer_methods_supported: ["header"],
        resource_name: "Strix Lead",
      },
      {
        headers: {
          "Cache-Control": "public, max-age=300",
        },
      },
    );
  } catch (error) {
    console.error("[MCP Protected Resource Metadata]", error);

    return Response.json(
      {
        error: "OAuth is not configured.",
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
