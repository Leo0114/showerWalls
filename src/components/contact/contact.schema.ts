import { z } from "zod";
import { PROJECT_TYPES, type ProjectType } from "@/constants/site";

export { PROJECT_TYPES, type ProjectType };

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  hospitality: "Hospitality",
  multifamily: "Multifamily",
  "student-housing": "Student Housing",
  residential: "Residential",
  other: "Other",
};

export function getProjectTypeLabel(value?: string): string {
  if (!value) return "";
  return PROJECT_TYPE_LABELS[value as ProjectType] ?? value;
}

export interface ContactMessages {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  project_type?: string;
  message?: string;
}

/** Schema builder accepting localized or custom validation messages. */
export const buildContactSchema = (m?: ContactMessages) =>
  z.object({
    firstName: z
      .string()
      .trim()
      .min(2, m?.first_name ?? "Please enter your first name")
      .max(60),
    lastName: z
      .string()
      .trim()
      .min(2, m?.last_name ?? "Please enter your last name")
      .max(60),
    email: z
      .email(m?.email ?? "Please enter a valid email address")
      .max(120),
    phone: z
      .string()
      .trim()
      .min(7, m?.phone ?? "Please enter a valid phone number")
      .max(25)
      .regex(/^[+()\d\s.-]+$/, m?.phone ?? "Please enter a valid phone number"),
    projectType: z.enum(PROJECT_TYPES, m?.project_type ?? "Please select a project type"),
    message: z
      .string()
      .trim()
      .min(10, m?.message ?? "Please tell us a bit more (10 characters minimum)")
      .max(2000),
    /** Honeypot - must stay empty for humans. */
    company: z.string().max(0).optional(),
  });

/** Default contact schema for server actions & validation */
export const contactSchema = buildContactSchema();

export type ContactFormData = z.infer<typeof contactSchema>;
export type ContactPayload = ContactFormData;
