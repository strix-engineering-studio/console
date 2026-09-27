import { NextResponse } from "next/server";
import { isApiAdmin } from "@/lib/auth/api-session";
import { generateMcpKey } from "@/integrations/mcp/auth";
import { mcpRepository } from "@/integrations/mcp/repository";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  expiresAt: z.coerce.date().optional(),
});

export async function GET() {
  if (!(await isApiAdmin()))
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    return NextResponse.json({ data: await mcpRepository.listKeys() });
  } catch {
    return NextResponse.json(
      { error: "The request could not be completed." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  if (!(await isApiAdmin()))
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (
    !parsed.success ||
    (parsed.data.expiresAt && parsed.data.expiresAt <= new Date())
  )
    return NextResponse.json(
      { error: "Provide a valid name and future expiration date." },
      { status: 400 },
    );
  try {
    return NextResponse.json(
      { data: await generateMcpKey(parsed.data.name, parsed.data.expiresAt) },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "The request could not be completed." },
      { status: 500 },
    );
  }
}
