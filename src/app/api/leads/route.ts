import { NextResponse } from "next/server";

import { leadRepository } from "@/features/leads/repositories/lead.repository";
import {
  createLeadSchema,
  leadPrioritySchema,
  leadStatusSchema,
} from "@/features/leads/schemas";
import type { LeadListQuery } from "@/features/leads/types";

const jsonError = (
  message: string,
  code: string,
  status: number,
  errors?: Array<{ field?: string; message: string }>,
) =>
  NextResponse.json(
    {
      success: false,
      code,
      message,
      data: null,
      errors,
      meta: { timestamp: new Date().toISOString(), version: "v1" },
    },
    { status },
  );

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(Number(searchParams.get("page") ?? 1), 1);
  const pageSize = Math.min(
    Math.max(Number(searchParams.get("pageSize") ?? 25), 1),
    100,
  );
  const status = searchParams.get("status") ?? undefined;
  const priority = searchParams.get("priority") ?? undefined;
  const sortBy = searchParams.get("sortBy") ?? "createdAt";
  const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

  if (status && !leadStatusSchema.safeParse(status).success) {
    return jsonError("Invalid lead status.", "VALIDATION_ERROR", 400);
  }
  if (priority && !leadPrioritySchema.safeParse(priority).success) {
    return jsonError("Invalid lead priority.", "VALIDATION_ERROR", 400);
  }
  if (
    !["createdAt", "updatedAt", "companyName", "status", "priority"].includes(
      sortBy,
    )
  ) {
    return jsonError("Invalid sort field.", "VALIDATION_ERROR", 400);
  }

  try {
    const result = await leadRepository.list({
      page,
      pageSize,
      search: searchParams.get("search")?.trim() || undefined,
      status: status as LeadListQuery["status"],
      priority: priority as LeadListQuery["priority"],
      sortBy: sortBy as LeadListQuery["sortBy"],
      sortOrder,
    });

    return NextResponse.json({
      success: true,
      code: "LEADS_FETCHED",
      message: "Leads fetched successfully.",
      data: result,
      meta: { timestamp: new Date().toISOString(), version: "v1" },
      pagination: {
        page: result.page,
        page_size: result.pageSize,
        total: result.total,
        total_pages: result.totalPages,
        has_next: result.page < result.totalPages,
        has_previous: result.page > 1,
      },
    });
  } catch (error) {
    console.error("[Leads API] list failed", error);
    return jsonError("Unable to fetch leads.", "LEADS_FETCH_ERROR", 500);
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = createLeadSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError(
      "Lead validation failed.",
      "VALIDATION_ERROR",
      400,
      parsed.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    );
  }

  try {
    const lead = await leadRepository.create(parsed.data);
    return NextResponse.json(
      {
        success: true,
        code: "LEAD_CREATED",
        message: "Lead created successfully.",
        data: lead,
        meta: { timestamp: new Date().toISOString(), version: "v1" },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[Leads API] create failed", error);
    return jsonError(
      "A lead with one of these identifiers already exists.",
      "LEAD_CONFLICT",
      409,
    );
  }
}
