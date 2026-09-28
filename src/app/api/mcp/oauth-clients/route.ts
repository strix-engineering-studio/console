import { NextResponse } from "next/server";
import { z } from "zod";
import { isApiAdmin } from "@/lib/auth/api-session";
import {
  createAdminOAuthClient,
  OAUTH_SCOPES,
  OAuthError,
} from "@/integrations/mcp/oauth";
import { mcpRepository } from "@/integrations/mcp/repository";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  name: z.string().trim().min(1).max(120),
  redirectUris: z.array(z.string().min(1).max(2048)).min(1).max(10),
  scopes: z.array(z.enum(OAUTH_SCOPES)).min(1).max(OAUTH_SCOPES.length),
}).strict();

export async function GET() {
  if (!(await isApiAdmin()))
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const clients = await mcpRepository.listOAuthClients();
    return NextResponse.json({ data: clients.map((client) => ({
      id: client.id,
      clientId: client.clientId,
      name: client.clientName,
      redirectUris: client.redirectUris,
      scopes: (client.scopes ?? OAUTH_SCOPES.join(" ")).split(/\s+/).filter(Boolean),
      status: client.revokedAt ? "revoked" : "active",
      revokedAt: client.revokedAt,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
      tokenEndpointAuthMethod: client.tokenEndpointAuthMethod ?? "none",
      grantTypes: client.grantTypes,
      responseTypes: client.responseTypes,
    })) }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "The request could not be completed." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isApiAdmin()))
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Provide a valid name, exact redirect URI(s), and at least one supported scope." }, { status: 400 });
  try {
    const client = await createAdminOAuthClient(parsed.data);
    return NextResponse.json({ data: {
      id: client.id,
      clientId: client.clientId,
      name: client.clientName,
      redirectUris: client.redirectUris,
      scopes: (client.scopes ?? OAUTH_SCOPES.join(" ")).split(/\s+/).filter(Boolean),
      status: "active",
      revokedAt: client.revokedAt,
      createdAt: client.createdAt,
    } }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const status = error instanceof OAuthError ? 400 : 500;
    return NextResponse.json({ error: error instanceof OAuthError ? error.message : "The request could not be completed." }, { status, headers: { "Cache-Control": "no-store" } });
  }
}
