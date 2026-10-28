import { z } from "zod";

/* -------------------------------------------------------------------------- */
/* Email Contact                                                              */
/* -------------------------------------------------------------------------- */

export const emailSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  status: z.enum(["NEW", "ENGAGED", "RESEARCHING"]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Email = z.infer<typeof emailSchema>;

export const emailContactInputSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
});

export type EmailInput = z.infer<typeof emailContactInputSchema>;

/* -------------------------------------------------------------------------- */
/* Email Address                                                              */
/* -------------------------------------------------------------------------- */

const emailAddressSchema = z.union([
  z.string().email(),
  z.object({
    name: z.string().optional(),
    address: z.string().email(),
  }),
]);

/* -------------------------------------------------------------------------- */
/* Attachment                                                                 */
/* -------------------------------------------------------------------------- */

export const emailAttachmentSchema = z.object({
  filename: z.string().min(1),

  /**
   * Base64 encoded file content.
   *
   * Example:
   * {
   *   filename: "invoice.pdf",
   *   contentBase64: "JVBERi0xLjQ..."
   * }
   */
  contentBase64: z.string().optional(),

  /**
   * Optional content type.
   *
   * Example:
   * application/pdf
   */
  contentType: z.string().optional(),

  /**
   * Optional CID for inline images.
   */
  cid: z.string().optional(),
});

export type EmailAttachment = z.infer<typeof emailAttachmentSchema>;

/* -------------------------------------------------------------------------- */
/* Send Email                                                                 */
/* -------------------------------------------------------------------------- */

export const sendEmailSchema = z
  .object({
    from: emailAddressSchema.optional(),

    to: z
      .array(emailAddressSchema)
      .min(1, "At least one recipient is required"),

    cc: z.array(emailAddressSchema).optional(),

    bcc: z.array(emailAddressSchema).optional(),

    replyTo: emailAddressSchema.optional(),

    subject: z.string().min(1, "Subject is required").max(998),

    text: z.string().optional(),

    html: z.string().optional(),

    attachments: z.array(emailAttachmentSchema).optional(),

    headers: z.record(z.string(), z.string()).optional(),

    /**
     * Optional idempotency key.
     */
    idempotencyKey: z.string().min(1).max(200).optional(),
  })
  .refine((data) => Boolean(data.text || data.html), {
    message: "Either text or html content is required",
    path: ["text"],
  });

export type SendEmailInput = z.infer<typeof sendEmailSchema>;
