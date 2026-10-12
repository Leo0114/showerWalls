import * as React from "react";
import type { ContactFormData } from "./contact.schema";

interface EmailTemplateProps {
  data: ContactFormData;
  projectTypeLabel?: string;
}

const BRAND = {
  primary: "#006da6",
  primaryDark: "#00527d",
  primaryLight: "#2f9bd4",
  accentSoft: "#e6f3fa",
  ink: "#1c1d1a",
  surface: "#ffffff",
  surface2: "#f2f5f8",
  border: "#e3e8ed",
  muted: "#6f7378",
} as const;

const s = {
  wrapper: {
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    backgroundColor: BRAND.surface2,
    padding: "36px 16px",
    margin: 0,
    WebkitTextSizeAdjust: "100%",
  } as React.CSSProperties,

  card: {
    maxWidth: 620,
    margin: "0 auto",
    backgroundColor: BRAND.surface,
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 8px 30px rgba(0, 109, 166, 0.08)",
    border: `1px solid ${BRAND.border}`,
  } as React.CSSProperties,

  header: {
    background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryDark} 100%)`,
    padding: "36px 36px 32px",
    color: "#ffffff",
  } as React.CSSProperties,

  logoBadge: {
    display: "inline-block",
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    border: "1px solid rgba(255, 255, 255, 0.35)",
    borderRadius: 6,
    padding: "5px 12px",
    color: "#ffffff",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.16em",
    textTransform: "uppercase" as const,
    marginBottom: 16,
  } as React.CSSProperties,

  headerTitle: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: 700,
    margin: 0,
    letterSpacing: "-0.02em",
    lineHeight: 1.25,
  } as React.CSSProperties,

  headerSubtitle: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 14,
    margin: "8px 0 0",
    lineHeight: 1.5,
  } as React.CSSProperties,

  body: {
    padding: "32px 36px",
  } as React.CSSProperties,

  greeting: {
    fontSize: 15,
    color: BRAND.ink,
    marginBottom: 24,
    lineHeight: 1.6,
  } as React.CSSProperties,

  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
    color: BRAND.primary,
    margin: "0 0 12px",
  } as React.CSSProperties,

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    marginBottom: 12,
  } as React.CSSProperties,

  fieldBox: {
    backgroundColor: BRAND.surface2,
    borderRadius: 10,
    padding: "12px 16px",
    border: `1px solid ${BRAND.border}`,
  } as React.CSSProperties,

  fieldBoxFull: {
    backgroundColor: BRAND.surface2,
    borderRadius: 10,
    padding: "12px 16px",
    border: `1px solid ${BRAND.border}`,
    marginBottom: 12,
  } as React.CSSProperties,

  fieldLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: BRAND.muted,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    display: "block",
    marginBottom: 4,
  } as React.CSSProperties,

  fieldValue: {
    fontSize: 14,
    color: BRAND.ink,
    fontWeight: 500,
    margin: 0,
    wordBreak: "break-word" as const,
  } as React.CSSProperties,

  badge: {
    display: "inline-block",
    backgroundColor: BRAND.accentSoft,
    color: BRAND.primary,
    border: `1px solid ${BRAND.primary}33`,
    borderRadius: 20,
    padding: "3px 12px",
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "0.02em",
  } as React.CSSProperties,

  divider: {
    border: "none",
    borderTop: `1px solid ${BRAND.border}`,
    margin: "24px 0",
  } as React.CSSProperties,

  messageBox: {
    backgroundColor: BRAND.accentSoft,
    borderLeft: `4px solid ${BRAND.primary}`,
    borderRadius: "0 10px 10px 0",
    padding: "18px 20px",
    marginBottom: 24,
  } as React.CSSProperties,

  messageText: {
    fontSize: 14,
    color: BRAND.ink,
    lineHeight: 1.7,
    margin: 0,
    whiteSpace: "pre-line" as const,
  } as React.CSSProperties,

  ctaWrapper: {
    textAlign: "center" as const,
    marginTop: 28,
    marginBottom: 8,
  } as React.CSSProperties,

  ctaButton: {
    display: "inline-block",
    backgroundColor: BRAND.primary,
    color: "#ffffff",
    fontWeight: 600,
    fontSize: 14,
    padding: "12px 28px",
    borderRadius: 9999,
    textDecoration: "none",
    letterSpacing: "0.02em",
  } as React.CSSProperties,

  footer: {
    borderTop: `1px solid ${BRAND.border}`,
    padding: "24px 36px",
    backgroundColor: BRAND.surface2,
    textAlign: "center" as const,
  } as React.CSSProperties,

  footerText: {
    fontSize: 12,
    color: BRAND.muted,
    margin: 0,
    lineHeight: 1.6,
  } as React.CSSProperties,
};

function Field({
  label,
  value,
  badge,
  href,
}: {
  label: string;
  value: string;
  badge?: boolean;
  href?: string;
}) {
  return (
    <div style={s.fieldBox}>
      <span style={s.fieldLabel}>{label}</span>
      {badge ? (
        <span style={s.badge}>{value}</span>
      ) : href ? (
        <a
          href={href}
          style={{
            ...s.fieldValue,
            color: BRAND.primary,
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          {value}
        </a>
      ) : (
        <p style={s.fieldValue}>{value}</p>
      )}
    </div>
  );
}

export function EmailTemplate({
  data,
  projectTypeLabel,
}: EmailTemplateProps) {
  const fullName = `${data.firstName} ${data.lastName}`.trim();
  const displayProjectType = projectTypeLabel || data.projectType;

  return (
    <div style={s.wrapper}>
      <div style={s.card}>
        {/* Header */}
        <div style={s.header}>
          <div style={s.logoBadge}>Shower Walls</div>
          <h1 style={s.headerTitle}>Nueva Solicitud de Contacto</h1>
          <p style={s.headerSubtitle}>
            Recibida desde el formulario web de <strong>shower-walls.net</strong>
          </p>
        </div>

        {/* Body */}
        <div style={s.body}>
          <p style={s.greeting}>
            Hola equipo, han recibido un nuevo mensaje de{" "}
            <strong>{fullName}</strong> interesado en soluciones para un proyecto{" "}
            <strong>{displayProjectType}</strong>.
          </p>

          <p style={s.sectionTitle}>Información del remitente</p>
          <div style={s.grid}>
            <Field label="Nombre completo" value={fullName} />
            <Field
              label="Tipo de proyecto"
              value={displayProjectType}
              badge
            />
          </div>

          <div style={s.grid}>
            <Field
              label="Correo electrónico"
              value={data.email}
              href={`mailto:${data.email}`}
            />
            <Field
              label="Teléfono"
              value={data.phone}
              href={`tel:${data.phone}`}
            />
          </div>

          <hr style={s.divider} />

          <p style={s.sectionTitle}>Mensaje del cliente</p>
          <div style={s.messageBox}>
            <p style={s.messageText}>{data.message}</p>
          </div>

          {/* Quick Action Button */}
          <div style={s.ctaWrapper}>
            <a
              href={`mailto:${data.email}?subject=Re:%20Shower%20Walls%20Inquiry%20-%20${encodeURIComponent(fullName)}`}
              style={s.ctaButton}
            >
              Responder a {data.firstName} &rarr;
            </a>
          </div>
        </div>

        {/* Footer */}
        <div style={s.footer}>
          <p style={s.footerText}>
            Este correo fue generado automáticamente por el formulario de contacto de{" "}
            <strong>shower-walls.net</strong>. Puedes responder directamente a este
            mensaje para ponerte en contacto con el cliente (la dirección reply-to ya está
            configurada con <strong>{data.email}</strong>).
          </p>
          <p style={{ ...s.footerText, marginTop: 10 }}>
            © {new Date().getFullYear()} Shower Walls · Monterrey, Nuevo León, México
          </p>
        </div>
      </div>
    </div>
  );
}
