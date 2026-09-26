import { NextResponse } from "next/server";
import { isApiAdmin } from "@/lib/auth/api-session";
import { leadRepository } from "@/features/leads/repositories/lead.repository";
import { leadSchema } from "@/features/leads/schemas";

type Context = { params: Promise<{ id: string }> };
export async function GET(_request: Request, { params }: Context) {
  if (!await isApiAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const data = await leadRepository.findById(id);
  return data ? NextResponse.json({ data }) : NextResponse.json({ error: "Lead not found." }, { status: 404 });
}
export async function PATCH(request: Request, { params }: Context) {
  if (!await isApiAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = leadSchema.partial().safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid lead details.", issues: parsed.error.flatten() }, { status: 400 });
  try { return NextResponse.json({ data: await leadRepository.update((await params).id, parsed.data) }); }
  catch { return NextResponse.json({ error: "Lead not found." }, { status: 404 }); }
}
