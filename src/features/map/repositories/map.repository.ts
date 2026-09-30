import "server-only";

import { prisma } from "@/lib/prisma";

export const mapRepository = {
  places: () =>
    prisma.organization.findMany({
      where: {
        city: {
          not: null,
        },
      },
      select: {
        id: true,
        name: true,
        city: true,
        country: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
};
