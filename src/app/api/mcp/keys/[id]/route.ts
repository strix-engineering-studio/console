import { NextResponse } from "next/server";
import { isApiAdmin } from "@/lib/auth/api-session";
import { mcpRepository } from "@/integrations/mcp/repository";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isApiAdmin()))
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const { id } = await params;
    const result = await mcpRepository.revokeKey(id);
    return result.count
      ? NextResponse.json({ revoked: true })
      : NextResponse.json({ error: "Key not found." }, { status: 404 });
  } catch {
    return NextResponse.json(
      { error: "The request could not be completed." },
      { status: 500 },
    );
  }
}
