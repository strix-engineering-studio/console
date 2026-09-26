import { NextResponse } from "next/server";
import { isApiAdmin } from "@/lib/auth/api-session";
import { leadRepository } from "@/features/leads/repositories/lead.repository";
import { leadSchema, leadStatus } from "@/features/leads/schemas";

export async function GET(request: Request) {
  if (!await isApiAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const search = new URL(request.url).searchParams;
  const q = search.get("q")?.trim();
  const rawStatus = search.get("status");
  const status = leadStatus.safeParse(rawStatus).success ? rawStatus ?? undefined : undefined;
  const leads = await leadRepository.list(q, status);
  return NextResponse.json({ data: leads });
}

export async function POST(request: Request) {
  if (!await isApiAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = leadSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid lead details.", issues: parsed.error.flatten() }, { status: 400 });
  const lead = await leadRepository.create(parsed.data);
  return NextResponse.json({ data: lead }, { status: 201 });
}
