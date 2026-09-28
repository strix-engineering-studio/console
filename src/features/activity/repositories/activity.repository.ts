import "server-only";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

import type { ActivityInput } from "../schemas";

export const activityRepository = {
  list: () =>
    prisma.activity.findMany({
      include: {
        lead: true,
        organization: true,
        person: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 200,
    }),

  findById: (id: string) =>
    prisma.activity.findUnique({
      where: {
        id,
      },
      include: {
        lead: true,
        organization: true,
        person: true,
      },
    }),

  create: (data: ActivityInput) => {
    const createData: Prisma.ActivityUncheckedCreateInput = {
      type: data.type,
      title: data.title,
      description: data.description,
      sourceUrl: data.sourceUrl,

      leadId: data.leadId ?? null,
      organizationId: data.organizationId ?? null,
      personId: data.personId ?? null,
      adminId: data.adminId ?? null,
    };

    return prisma.activity.create({
      data: createData,
    });
  },
};
