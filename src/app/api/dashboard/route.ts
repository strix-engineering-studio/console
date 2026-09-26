import { NextResponse } from "next/server";
import { isApiAdmin } from "@/lib/auth/api-session";
import { dashboardRepository } from "@/features/dashboard/repositories/dashboard.repository";
export async function GET() {
  if (!await isApiAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try { return NextResponse.json({ data: await dashboardRepository.summary() }); }
  catch { return NextResponse.json({ error: "Dashboard data is unavailable." }, { status: 503 }); }
}
