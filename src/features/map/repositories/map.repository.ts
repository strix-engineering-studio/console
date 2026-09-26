import "server-only";
import { prisma } from "@/lib/prisma";
export const mapRepository = { places: () => prisma.organization.findMany({ where: { OR: [{ city: { not: null } }, { location: { not: null } }] }, select: { id: true, name: true, city: true, country: true, location: true }, orderBy: { name: "asc" } }) };
