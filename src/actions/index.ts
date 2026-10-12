import { ActionError, defineAction } from "astro:actions";
import { Resend } from "resend";
import {
  contactSchema,
  getProjectTypeLabel,
} from "@/components/contact/contact.schema";
import { EmailTemplate } from "@/components/contact/email-template";
import { renderToString } from "react-dom/server";
import React from "react";

const DEFAULT_TO_ADDRESSES = ["sistemas@shower-walls.net"];

function parseEmailList(value: string | undefined, fallback: string[]): string[] {
  if (!value) return fallback;

  const addresses = value
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean);

  return addresses.length > 0 ? addresses : fallback;
}

export const server = {
  send: defineAction({
    accept: "json",
    input: contactSchema,
    handler: async (data) => {
      // Honeypot check for bots: silently pretend success without sending
      if (data.company && data.company.trim().length > 0) {
        return { success: true, id: "honeypot" };
      }

      const apiKey = import.meta.env.RESEND_API_KEY;
      if (!apiKey) {
        console.error("[actions.send] RESEND_API_KEY is missing in environment variables.");
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Email service is not configured on the server.",
        });
      }

      const resend = new Resend(apiKey);

      const FROM_ADDRESS =
        import.meta.env.RESEND_FROM ??
        import.meta.env.CONTACT_FROM_EMAIL ??
        "Shower Walls <onboarding@resend.dev>";

      const TO_ADDRESSES = parseEmailList(
        import.meta.env.RESEND_TO ?? import.meta.env.CONTACT_TO_EMAIL,
        DEFAULT_TO_ADDRESSES,
      );

      const projectTypeLabel = getProjectTypeLabel(data.projectType);

      const html = renderToString(
        React.createElement(EmailTemplate, {
          data,
          projectTypeLabel,
        }),
      );

      const subject = `New Inquiry (${projectTypeLabel}) — ${data.firstName} ${data.lastName} | Shower Walls`;

      const { data: resendData, error } = await resend.emails.send({
        from: FROM_ADDRESS,
        to: TO_ADDRESSES,
        replyTo: data.email,
        subject,
        html,
      });

      if (error) {
        console.error("[actions.send] Resend delivery error:", error);
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to deliver message.",
        });
      }

      return { success: true, id: resendData?.id };
    },
  }),
};
