import { NextResponse } from "next/server";
import { z } from "zod";
import { isApiAdmin } from "@/lib/auth/api-session";
import { dashboardRepository } from "@/features/dashboard/repositories/dashboard.repository";
import { activityType } from "@/features/activity/schemas";
import { leadSource, leadStatus } from "@/features/leads/schemas";
import { organizationBusinessType } from "@/features/organizations/schemas";

const dateFilter = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
});

const filtersSchema = z.object({
  from: dateFilter.optional(),
  to: dateFilter.optional(),
  industry: z.string().trim().min(1).max(120).optional(),
  city: z.string().trim().min(1).max(120).optional(),
  organizationType: organizationBusinessType.optional(),
  leadStage: leadStatus.optional(),
  researchStatus: z.enum(["PENDING", "RUNNING", "COMPLETE", "FAILED"]).optional(),
  source: leadSource.optional(),
  activityType: activityType.optional(),
  activityLimit: z.coerce.number().int().min(1).max(50).optional(),
}).refine((filters) => !filters.from || !filters.to || filters.from <= filters.to, {
  message: "The start date must be on or before the end date.",
});

export async function GET(request: Request) {
  if (!await isApiAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const search = new URL(request.url).searchParams;
  const parsed = filtersSchema.safeParse(Object.fromEntries(search));
  if (!parsed.success) return NextResponse.json({ error: "Invalid dashboard filters." }, { status: 400 });
  try { return NextResponse.json({ data: await dashboardRepository.summary(parsed.data) }); }
  catch { return NextResponse.json({ error: "Dashboard data is unavailable." }, { status: 503 }); }
}
