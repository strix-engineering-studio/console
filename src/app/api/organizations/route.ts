import { NextResponse } from "next/server";
import { isApiAdmin } from "@/lib/auth/api-session";
import { organizationRepository } from "@/features/organizations/repositories/organization.repository";
import { organizationSchema } from "@/features/organizations/schemas";
export async function GET(request: Request) {
  if (!await isApiAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const q = new URL(request.url).searchParams.get("q")?.trim();
  const data = await organizationRepository.list(q);
  return NextResponse.json({ data });
}
export async function POST(request: Request) {
  if (!await isApiAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = organizationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid organization details." }, { status: 400 });
  const duplicate = await organizationRepository.findByName(parsed.data.name);
  if (duplicate) return NextResponse.json({ error: "An organization with that name already exists." }, { status: 409 });
  const data = await organizationRepository.create(parsed.data);
  return NextResponse.json({ data }, { status: 201 });
}
