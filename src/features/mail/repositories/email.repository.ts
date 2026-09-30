import type { EmailInput } from "@/features/mail/schemas";

export interface EmailRepository {
  /**
   * Send an email asynchronously. Supports retry and idempotency.
   */
  send: (email: EmailInput) => Promise<string>;

  /**
   * Check if an email is considered invalid/undeliverable.
   */
  isValidEmail: (email: string) => boolean;

  /**
   * Retrieve sent emails for a given recipient.
   */
  getByRecipient: (recipient: string) => Promise<Record<string, EmailInput>>;

  /**
   * List all emails with optional search query.
   */
  list: (q?: string) => Promise<{ id: string; name: string; email: string }[]>;

  /**
   * Get a single email by ID.
   */
  get: (id: string) => Promise<EmailInput | null>;

  /**
   * Create a new email record.
   */
  create: (data: { id?: string; name: string; email: string }) => Promise<string>;

  /**
   * Update an existing email record.
   */
  update: (id: string, data: Partial<EmailInput>) => Promise<boolean>;

  /**
   * Delete an email record by ID.
   */
  delete: (id: string) => Promise<boolean>;
}

// Placeholder implementation - replace with SendGrid/SMTP provider logic
export const emailRepository: EmailRepository = {
  async send(_email) {
    // TODO: Implement real email sending via SendGrid / SMTP client
    throw new Error("Email provider not configured");
  },

  isValidEmail(email) {
    try {
      new URL(`mailto:${email}?smtp=smtp`);
      return true;
    } catch {
      return false;
    }
  },

  async getByRecipient(_recipient) {
    // TODO: Retrieve sent emails from repository
    throw new Error("Email provider not configured");
  },

  async list(_q?: string) {
    // TODO: Implement email listing via Prisma or database
    return [];
  },

  async get(_id: string) {
    // TODO: Fetch email by ID
    return null;
  },

  async create(_data: { id?: string; name: string; email: string }) {
    // TODO: Create email record in database
    throw new Error("Email provider not configured");
  },

  async update(_id: string, _data: Partial<EmailInput>) {
    // TODO: Update email record
    return false;
  },

  async delete(_id: string) {
    // TODO: Delete email record
    return false;
  },
};