import "server-only";
import { scryptSync, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";
function passwordMatches(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const expected = Buffer.from(hash, "hex");
  const actual = scryptSync(password, salt, expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
export const authRepository = {
  authenticate: async (email: string, password: string) => {
    const admin = await prisma.admin.findUnique({ where: { email: email.toLowerCase() } });
    return admin && passwordMatches(password, admin.passwordHash) ? admin : null;
  },
};
