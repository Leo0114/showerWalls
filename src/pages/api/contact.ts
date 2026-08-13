import type { APIRoute } from "astro";
import { Resend } from "resend";
import { buildContactSchema, SERVER_MESSAGES } from "@/lib/contactSchema";
import { SITE } from "@/constants/site";

export const prerender = false;

const schema = buildContactSchema(SERVER_MESSAGES);

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return map[char];
  });

export const POST: APIRoute = async ({ request }) => {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return json({ ok: false, error: "invalid_body" }, 400);
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return json(
      { ok: false, error: "validation", issues: parsed.error.flatten().fieldErrors },
      422,
    );
  }

  // Honeypot filled -> silently accept so bots do not learn anything.
  if (parsed.data.company) return json({ ok: true }, 200);

  const { firstName, lastName, email, phone, projectType, message } = parsed.data;

  const apiKey = import.meta.env.RESEND_API_KEY;
  const to = import.meta.env.CONTACT_TO_EMAIL ?? SITE.email;
  const from = import.meta.env.CONTACT_FROM_EMAIL ?? "Shower Walls <onboarding@resend.dev>";

  if (!apiKey) {
    console.warn("[contact] RESEND_API_KEY is not set — submission was not delivered.", {
      email,
      projectType,
    });
    return json({ ok: false, error: "not_configured" }, 503);
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `New ${projectType} inquiry — ${firstName} ${lastName}`,
      html: `
        <h2>New contact request</h2>
        <p><strong>Name:</strong> ${escapeHtml(`${firstName} ${lastName}`)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
        <p><strong>Project type:</strong> ${escapeHtml(projectType)}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>
      `,
    });

    if (error) throw new Error(error.message);
    return json({ ok: true }, 200);
  } catch (error) {
    console.error("[contact] delivery failed", error);
    return json({ ok: false, error: "delivery" }, 502);
  }
};
