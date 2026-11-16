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
  recordEmailSent: (input: {
    subject: string;
    recipients: string[];
    messageId: string;
    leadId?: string;
    organizationId?: string;
    personId?: string;
  }) => activityRepository.create({
    type: "EMAIL_SENT",
    title: `Email sent: ${input.subject}`,
    description: `To: ${input.recipients.join(", ")} · Message ID: ${input.messageId}`,
    leadId: input.leadId,
    organizationId: input.organizationId,
    personId: input.personId,
  }),
};
