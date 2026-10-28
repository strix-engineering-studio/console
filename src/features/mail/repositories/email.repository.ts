import "server-only";

import nodemailer from "nodemailer";
import type { EmailInput, SendEmailInput } from "@/features/mail/schemas";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface EmailSendResult {
  messageId: string;
  accepted: string[];
  rejected: string[];
  response?: string;
}

export interface EmailRepository {
  /**
   * Send an email using SMTP/Nodemailer.
   */
  send: (email: SendEmailInput) => Promise<EmailSendResult>;

  /**
   * Check whether an email address is syntactically valid.
   */
  isValidEmail: (email: string) => boolean;

  /**
   * Retrieve sent emails for a recipient.
   */
  getByRecipient: (recipient: string) => Promise<Record<string, EmailInput>>;

  /**
   * List email contacts.
   */
  list: (q?: string) => Promise<
    {
      id: string;
      name: string;
      email: string;
    }[]
  >;

  /**
   * Get an email contact.
   */
  get: (id: string) => Promise<EmailInput | null>;

  /**
   * Create an email contact.
   */
  create: (data: {
    id?: string;
    name: string;
    email: string;
  }) => Promise<string>;

  /**
   * Update an email contact.
   */
  update: (id: string, data: Partial<EmailInput>) => Promise<boolean>;

  /**
   * Delete an email contact.
   */
  delete: (id: string) => Promise<boolean>;
}

/* -------------------------------------------------------------------------- */
/* SMTP Configuration                                                         */
/* -------------------------------------------------------------------------- */

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getSmtpPort(): number {
  const value = process.env.SMTP_PORT ?? "587";
  const port = Number(value);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error(`Invalid SMTP_PORT: ${value}`);
  }

  return port;
}

function getSmtpSecure(): boolean {
  return process.env.SMTP_SECURE === "true";
}

/* -------------------------------------------------------------------------- */
/* Nodemailer Transport                                                       */
/* -------------------------------------------------------------------------- */

function createTransporter() {
  return nodemailer.createTransport({
    host: getRequiredEnv("SMTP_HOST"),

    port: getSmtpPort(),

    secure: getSmtpSecure(),

    auth: {
      user: getRequiredEnv("SMTP_USER"),
      pass: getRequiredEnv("SMTP_PASSWORD"),
    },

    connectionTimeout: 10_000,

    greetingTimeout: 10_000,

    socketTimeout: 30_000,
  });
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function normalizeAddress(
  address:
    | string
    | {
        name?: string;
        address: string;
      },
) {
  if (typeof address === "string") {
    return address;
  }

  return {
    name: address.name,
    address: address.address,
  };
}

/* -------------------------------------------------------------------------- */
/* Email Signature                                                            */
/* -------------------------------------------------------------------------- */

const STRIX_TEAM_NAME = "Strix Team";
const STRIX_COMPANY_NAME = "Strix Engineering Studio";
const STRIX_WEBSITE = "https://strix.website";

const createStrixFromAddress = (email: string) =>
  `"${STRIX_TEAM_NAME}" <${email}>`;

/* -------------------------------------------------------------------------- */
/* HTML Helpers                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Escape user-provided text before putting it into HTML.
 *
 * This is important because email.text can contain characters such as:
 * < > & " '
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Convert plain text email content into a simple HTML body.
 */
function textToHtml(text: string): string {
  return `
    <div
      style="
        font-family: Arial, sans-serif;
        font-size: 14px;
        line-height: 1.6;
        color: #111827;
        white-space: normal;
      "
    >
      ${escapeHtml(text).replace(/\r?\n/g, "<br />")}
    </div>
  `;
}

/* -------------------------------------------------------------------------- */
/* Strix HTML Signature                                                       */
/* -------------------------------------------------------------------------- */

const STRIX_HTML_SIGNATURE = `
  <div
    style="
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
      font-family: Arial, sans-serif;
      color: #6b7280;
      font-size: 13px;
      line-height: 1.6;
    "
  >
    <div style="color: #111827; font-weight: 600;">
      ${STRIX_COMPANY_NAME}
    </div>

    <div>
      Building software, AI systems, and digital products.
    </div>

    <div style="margin-top: 4px;">
      <a
        href="${STRIX_WEBSITE}"
        target="_blank"
        rel="noopener noreferrer"
        style="
          color: #111827;
          text-decoration: none;
        "
      >
        ${STRIX_WEBSITE.replace("https://", "")}
      </a>
    </div>
  </div>
`;

/* -------------------------------------------------------------------------- */
/* Strix Text Signature                                                       */
/* -------------------------------------------------------------------------- */

const STRIX_TEXT_SIGNATURE = `

--
${STRIX_COMPANY_NAME}
Building software, AI systems, and digital products.
${STRIX_WEBSITE}
`;

/* -------------------------------------------------------------------------- */
/* Email Body Builder                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Builds both text and HTML representations of the email.
 *
 * Cases:
 *
 * 1. text + html
 *    -> preserve both
 *
 * 2. text only
 *    -> use text as text body
 *    -> convert text to HTML
 *
 * 3. html only
 *    -> use HTML
 *    -> generate a basic text fallback
 *
 * 4. neither
 *    -> send signature only
 */
function buildEmailBodies({ text, html }: { text?: string; html?: string }) {
  const normalizedText = text?.trim();
  const normalizedHtml = html?.trim();

  /* ------------------------------------------------------------------------ */
  /* Text only                                                                */
  /* ------------------------------------------------------------------------ */

  if (normalizedText && !normalizedHtml) {
    return {
      text: `${normalizedText}${STRIX_TEXT_SIGNATURE}`,

      html: `
        ${textToHtml(normalizedText)}

        ${STRIX_HTML_SIGNATURE}
      `,
    };
  }

  /* ------------------------------------------------------------------------ */
  /* HTML only                                                                */
  /* ------------------------------------------------------------------------ */

  if (!normalizedText && normalizedHtml) {
    return {
      text: `Please view this email in an HTML-compatible email client.

${STRIX_TEXT_SIGNATURE.trim()}`,

      html: `
        ${normalizedHtml}

        ${STRIX_HTML_SIGNATURE}
      `,
    };
  }

  /* ------------------------------------------------------------------------ */
  /* Both text and HTML                                                       */
  /* ------------------------------------------------------------------------ */

  if (normalizedText && normalizedHtml) {
    return {
      text: `${normalizedText}${STRIX_TEXT_SIGNATURE}`,

      html: `
        ${normalizedHtml}

        ${STRIX_HTML_SIGNATURE}
      `,
    };
  }

  /* ------------------------------------------------------------------------ */
  /* Empty body                                                               */
  /* ------------------------------------------------------------------------ */

  return {
    text: STRIX_TEXT_SIGNATURE.trim(),

    html: STRIX_HTML_SIGNATURE,
  };
}

/* -------------------------------------------------------------------------- */
/* Repository                                                                 */
/* -------------------------------------------------------------------------- */

export const emailRepository: EmailRepository = {
  /* ------------------------------------------------------------------------ */
  /* Send                                                                     */
  /* ------------------------------------------------------------------------ */

  async send(email) {
    const transporter = createTransporter();

    const smtpFrom = getRequiredEnv("SMTP_FROM");

    const { text, html } = buildEmailBodies({
      text: email.text,
      html: email.html,
    });

    const info = await transporter.sendMail({
      /*
       * Always send as:
       *
       * Strix Team <team@strix.website>
       */
      from: createStrixFromAddress(smtpFrom),

      /*
       * Recipients
       */
      to: email.to.map(normalizeAddress),

      cc: email.cc?.map(normalizeAddress),

      bcc: email.bcc?.map(normalizeAddress),

      /*
       * Reply-To can still be customized.
       */
      replyTo: email.replyTo ? normalizeAddress(email.replyTo) : undefined,

      /*
       * Subject
       */
      subject: email.subject,

      /*
       * Both representations are intentionally provided.
       *
       * Gmail and other clients can use the HTML version,
       * while text-only clients can use the text version.
       */
      text,

      html,

      /*
       * Attachments
       */
      attachments: email.attachments?.map((attachment) => ({
        filename: attachment.filename,

        content: attachment.contentBase64
          ? Buffer.from(attachment.contentBase64, "base64")
          : undefined,

        contentType: attachment.contentType,

        cid: attachment.cid,
      })),

      /*
       * Custom headers
       */
      headers: email.headers,
    });

    return {
      messageId: info.messageId,

      accepted: info.accepted.map(String),

      rejected: info.rejected.map(String),

      response: info.response,
    };
  },

  /* ------------------------------------------------------------------------ */
  /* Validation                                                               */
  /* ------------------------------------------------------------------------ */

  isValidEmail(email) {
    const value = email.trim();

    if (!value) {
      return false;
    }

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  },

  /* ------------------------------------------------------------------------ */
  /* Contact queries                                                          */
  /* ------------------------------------------------------------------------ */

  async getByRecipient(_recipient) {
    // TODO:
    // Implement once sent-email persistence is added.
    return {};
  },

  async list(_q?: string) {
    // TODO:
    // Replace with Prisma contact query.
    return [];
  },

  async get(_id: string) {
    // TODO:
    // Replace with Prisma contact query.
    return null;
  },

  async create(_data) {
    // TODO:
    // Replace with Prisma contact creation.
    throw new Error("Email contact repository not implemented");
  },

  async update(_id, _data) {
    // TODO:
    // Replace with Prisma contact update.
    return false;
  },

  async delete(_id) {
    // TODO:
    // Replace with Prisma contact deletion.
    return false;
  },
};
