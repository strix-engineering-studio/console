import { NextResponse } from "next/server";
import { isApiAdmin } from "@/lib/auth/api-session";
import { organizationRepository } from "@/features/organizations/repositories/organization.repository";
import { organizationSchema } from "@/features/organizations/schemas";
type Context = { params: Promise<{ id: string }> };
export async function GET(_request: Request, { params }: Context) {
  if (!await isApiAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await organizationRepository.findById((await params).id);
  return data ? NextResponse.json({ data }) : NextResponse.json({ error: "Organization not found." }, { status: 404 });
}
export async function PATCH(request: Request, { params }: Context) {
  if (!await isApiAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = organizationSchema.partial().safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid organization details.", issues: parsed.error.flatten() }, { status: 400 });
  try { return NextResponse.json({ data: await organizationRepository.update((await params).id, parsed.data) }); }
  catch { return NextResponse.json({ error: "Organization not found." }, { status: 404 }); }
}
