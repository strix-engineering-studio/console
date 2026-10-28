
import "server-only";

import { prisma } from "@/lib/prisma";

export const mapRepository = {
  places: () =>
    prisma.organization.findMany({
      where: {
        website: {
          not: null,
        },
      },
      select: {
        id: true,
        name: true,
        website: true,
        address: true,
        city: true,
        state: true,
        country: true,
        postalCode: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
};
