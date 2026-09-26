import { NextResponse } from "next/server";
import { isApiAdmin } from "@/lib/auth/api-session";
import { requestResearch, ResearchUnavailableError } from "@/features/research/services/research-provider.service";
import { researchRepository } from "@/features/research/repositories/research.repository";
import { researchSubjectSchema } from "@/features/research/schemas";

export async function GET() {
  if (!await isApiAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await researchRepository.list();
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  if (!await isApiAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = researchSubjectSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Choose a lead, organization, or person to research." }, { status: 400 });
  try { return NextResponse.json({ data: await requestResearch(parsed.data) }); }
  catch (error) {
    if (error instanceof ResearchUnavailableError) return NextResponse.json({ error: error.message }, { status: 503 });
    return NextResponse.json({ error: "Research could not be completed." }, { status: 500 });
  }
}
