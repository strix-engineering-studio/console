import { NextResponse } from "next/server";
import { createSessionToken, sessionCookieOptions } from "@/lib/auth/session";
import { authRepository } from "@/features/auth/repositories/auth.repository";
import { loginSchema } from "@/features/auth/schemas";

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { error: "Enter a valid email and password." },
      { status: 400 },
    );
  const admin = await authRepository.authenticate(parsed.data.email, parsed.data.password);
  if (!admin) {
    return NextResponse.json(
      { error: "Email or password is incorrect." },
      { status: 401 },
    );
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(
    "strix_lead_session",
    createSessionToken(admin.id),
    sessionCookieOptions,
  );
  return response;
}
