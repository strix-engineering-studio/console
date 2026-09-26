import { NextResponse } from "next/server";
import { isApiAdmin } from "@/lib/auth/api-session";
import { personRepository } from "@/features/people/repositories/person.repository";
import { personSchema } from "@/features/people/schemas";
export async function GET(request: Request) {
  if (!await isApiAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const q = new URL(request.url).searchParams.get("q")?.trim();
  const data = await personRepository.list(q);
  return NextResponse.json({ data });
}
export async function POST(request: Request) {
  if (!await isApiAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = personSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid person details." }, { status: 400 });
  if (parsed.data.email) {
    const duplicate = await personRepository.findByEmail(parsed.data.email);
    if (duplicate) return NextResponse.json({ error: "A person with that email already exists." }, { status: 409 });
  }
  const data = await personRepository.create(parsed.data);
  return NextResponse.json({ data }, { status: 201 });
}
