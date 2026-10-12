import type { APIRoute } from "astro";
import { Resend } from "resend";
import {
  contactSchema,
  getProjectTypeLabel,
} from "@/components/contact/contact.schema";
import { EmailTemplate } from "@/components/contact/email-template";
import { renderToString } from "react-dom/server";
import React from "react";

export const prerender = false;

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export const POST: APIRoute = async ({ request }) => {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return json({ ok: false, error: "invalid_body" }, 400);
  }

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    return json(
      { ok: false, error: "validation", issues: parsed.error.issues },
      422,
    );
  }

  // Honeypot filled -> silently accept so bots do not learn anything.
  if (parsed.data.company) return json({ ok: true }, 200);

  const apiKey = import.meta.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[contact] RESEND_API_KEY is not set — submission was not delivered.");
    return json({ ok: false, error: "not_configured" }, 503);
  }

  const data = parsed.data;
  const to =
    import.meta.env.RESEND_TO ??
    import.meta.env.CONTACT_TO_EMAIL ??
    "sistemas@shower-walls.net";
  const from =
    import.meta.env.RESEND_FROM ??
    import.meta.env.CONTACT_FROM_EMAIL ??
    "Shower Walls <onboarding@resend.dev>";

  try {
    const resend = new Resend(apiKey);
    const projectTypeLabel = getProjectTypeLabel(data.projectType);
    const html = renderToString(
      React.createElement(EmailTemplate, {
        data,
        projectTypeLabel,
      }),
    );

    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: data.email,
      subject: `New Inquiry (${projectTypeLabel}) — ${data.firstName} ${data.lastName} | Shower Walls`,
      html,
    });

    if (error) throw new Error(error.message);
    return json({ ok: true }, 200);
  } catch (error) {
    console.error("[contact] delivery failed", error);
    return json({ ok: false, error: "delivery" }, 502);
  }
};
