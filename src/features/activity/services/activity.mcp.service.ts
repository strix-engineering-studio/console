import "server-only";
import { activityRepository } from "../repositories/activity.repository";
export const activityMcpService = {
  list: () => activityRepository.list(),
  get: (id: string) => activityRepository.findById(id),
  audit: (input: {
    title: string;
    description: string;
    leadId?: string;
    organizationId?: string;
    personId?: string;
  }) => activityRepository.create({ type: "NOTE", ...input }),
};
