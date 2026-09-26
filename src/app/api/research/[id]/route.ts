import { NextResponse } from "next/server";
import { isApiAdmin } from "@/lib/auth/api-session";
import { researchRepository } from "@/features/research/repositories/research.repository";
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await isApiAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await researchRepository.findById((await params).id);
  return data ? NextResponse.json({ data }) : NextResponse.json({ error: "Research run not found." }, { status: 404 });
}
