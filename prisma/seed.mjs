import "dotenv/config";
import { randomBytes, scryptSync } from "node:crypto";
import { PrismaClient } from "@prisma/client";

const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD before seeding.");
if (ADMIN_PASSWORD.length < 8) throw new Error("ADMIN_PASSWORD must contain at least 12 characters.");

const prisma = new PrismaClient();
try {
  const email = ADMIN_EMAIL.trim().toLowerCase();
  const existing = await prisma.admin.findUnique({ where: { email } });
  if (!existing) {
    const salt = randomBytes(16).toString("hex");
    const hash = scryptSync(ADMIN_PASSWORD, salt, 64).toString("hex");
    await prisma.admin.create({ data: { email, passwordHash: `${salt}:${hash}` } });
    console.log(`Created admin account for ${email}.`);
  } else {
    console.log(`Admin account ${email} already exists; left unchanged.`);
  }
} finally {
  await prisma.$disconnect();
}
