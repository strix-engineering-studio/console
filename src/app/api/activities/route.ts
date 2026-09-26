import { NextResponse } from "next/server";
import { isApiAdmin } from "@/lib/auth/api-session";
import { activityRepository } from "@/features/activity/repositories/activity.repository";
import { activitySchema } from "@/features/activity/schemas";
export async function GET() {
  if (!await isApiAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await activityRepository.list();
  return NextResponse.json({ data });
}
export async function POST(request: Request) {
  if (!await isApiAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = activitySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid activity details." }, { status: 400 });
  const data = await activityRepository.create(parsed.data);
  return NextResponse.json({ data }, { status: 201 });
}
