import { NextResponse } from "next/server";
import { isApiAdmin } from "@/lib/auth/api-session";
import { personRepository } from "@/features/people/repositories/person.repository";
import { personSchema } from "@/features/people/schemas";
type Context = { params: Promise<{ id: string }> };
export async function GET(_request: Request, { params }: Context) {
  if (!await isApiAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await personRepository.findById((await params).id);
  return data ? NextResponse.json({ data }) : NextResponse.json({ error: "Person not found." }, { status: 404 });
}
export async function PATCH(request: Request, { params }: Context) {
  if (!await isApiAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = personSchema.partial().safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid person details.", issues: parsed.error.flatten() }, { status: 400 });
  try { return NextResponse.json({ data: await personRepository.update((await params).id, parsed.data) }); }
  catch { return NextResponse.json({ error: "Person not found." }, { status: 404 }); }
}
