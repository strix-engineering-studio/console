import "server-only";
import { cookies } from "next/headers";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth/session";

export async function isApiAdmin() {
  const jar = await cookies();
  return Boolean(verifySessionToken(jar.get(SESSION_COOKIE)?.value));
}
