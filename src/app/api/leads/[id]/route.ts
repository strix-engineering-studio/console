import { NextResponse } from "next/server";

import { leadRepository } from "@/features/leads/repositories/lead.repository";
import { updateLeadSchema } from "@/features/leads/schemas";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_: Request, context: RouteContext) {
  const { id } = await context.params;
  const lead = await leadRepository.findById(id);

  if (!lead) {
    return NextResponse.json(
      {
        success: false,
        code: "LEAD_NOT_FOUND",
        message: "Lead not found.",
        data: null,
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    code: "LEAD_FETCHED",
    message: "Lead fetched successfully.",
    data: lead,
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const parsed = updateLeadSchema.safeParse(
    await request.json().catch(() => null),
  );

  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        code: "VALIDATION_ERROR",
        message: "Lead validation failed.",
        data: null,
        errors: parsed.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 },
    );
  }

  try {
    const lead = await leadRepository.update(id, parsed.data);
    if (!lead) {
      return NextResponse.json(
        {
          success: false,
          code: "LEAD_NOT_FOUND",
          message: "Lead not found.",
          data: null,
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      code: "LEAD_UPDATED",
      message: "Lead updated successfully.",
      data: lead,
    });
  } catch (error) {
    console.error("[Leads API] update failed", error);
    return NextResponse.json(
      {
        success: false,
        code: "LEAD_UPDATE_ERROR",
        message: "Unable to update lead.",
        data: null,
      },
      { status: 500 },
    );
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  const { id } = await context.params;
  const archived = await leadRepository.archive(id);

  if (!archived) {
    return NextResponse.json(
      {
        success: false,
        code: "LEAD_NOT_FOUND",
        message: "Lead not found.",
        data: null,
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    code: "LEAD_ARCHIVED",
    message: "Lead archived successfully.",
    data: null,
  });
}
