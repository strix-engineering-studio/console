import {
  emailRepository,
  type EmailRepository,
} from "../repositories/email.repository";

import type { EmailInput, SendEmailInput } from "@/features/mail/schemas";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface MailMcpService extends Omit<EmailRepository, "send"> {
  send: (email: SendEmailInput) => ReturnType<EmailRepository["send"]>;
}

/* -------------------------------------------------------------------------- */
/* Service                                                                    */
/* -------------------------------------------------------------------------- */

export const mailMcpService: MailMcpService = {
  async send(email) {
    /**
     * IMPORTANT:
     *
     * Do not swallow SMTP/Nodemailer errors.
     *
     * MCP must receive the actual failure so the caller knows
     * that the email was not successfully sent.
     */
    return emailRepository.send(email);
  },

  isValidEmail(email) {
    return emailRepository.isValidEmail(email);
  },

  async getByRecipient(recipient) {
    return emailRepository.getByRecipient(recipient);
  },

  async list(q) {
    return emailRepository.list(q);
  },

  async get(id) {
    return emailRepository.get(id);
  },

  async create(data) {
    return emailRepository.create(data);
  },

  async update(id, data: Partial<EmailInput>) {
    return emailRepository.update(id, data);
  },

  async delete(id) {
    return emailRepository.delete(id);
  },
};
