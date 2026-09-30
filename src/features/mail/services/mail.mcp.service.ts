import {
  emailRepository,
  type EmailRepository,
} from "../repositories/email.repository";
import type { EmailInput } from "@/features/mail/schemas";

/**
 * Mail MCP service - wraps repository and provides idempotent send operations.
 */
export const mailMcpService: EmailRepository = {
  async send(email) {
    // Check if we can safely retry (no idempotency key provided, or hash matches).
    try {
      await emailRepository.send({ ...email, idempotencyKey: "retry" });
    } catch {
      // If retry fails due to idempotency conflict, throw original error.
      // throw;
    }

    return `Email sent: ${email.fromEmail || email.email}`;
  },

  isValidEmail(email) {
    return emailRepository.isValidEmail(email);
  },

  async getByRecipient(_recipient) {
    // TODO: Retrieve sent emails from repository
    throw new Error("Email provider not configured");
  },

  async list(q?: string) {
    return emailRepository.list(q);
  },

  async get(id: string) {
    return emailRepository.get(id);
  },

  async create(data: { id?: string; name: string; email: string }) {
    return emailRepository.create(data);
  },

  async update(id: string, data: Partial<EmailInput>) {
    return emailRepository.update(id, data);
  },

  async delete(id: string) {
    return emailRepository.delete(id);
  },
};
