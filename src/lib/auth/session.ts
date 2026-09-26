import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const SESSION_COOKIE = "strix_lead_session";
const SESSION_SECONDS = 60 * 60 * 24 * 7;

function signature(value: string) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET must be configured.");
  return createHmac("sha256", secret).update(value).digest("base64url");
}

export function createSessionToken(adminId: string) {
  const payload = Buffer.from(JSON.stringify({
    sub: adminId,
    exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS,
  })).toString("base64url");
  return `${payload}.${signature(payload)}`;
}

export function verifySessionToken(token?: string | null): { adminId: string } | null {
  if (!token) return null;
  const [payload, supplied] = token.split(".");
  if (!payload || !supplied) return null;
  const expected = signature(payload);
  const a = Buffer.from(supplied);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const value = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { sub?: string; exp?: number };
    if (!value.sub || !value.exp || value.exp <= Date.now() / 1000) return null;
    return { adminId: value.sub };
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const jar = await cookies();
  return verifySessionToken(jar.get(SESSION_COOKIE)?.value);
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect("/auth/login");
  return session;
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_SECONDS,
};
