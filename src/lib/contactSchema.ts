import { z } from "zod";
import { PROJECT_TYPES } from "@/constants/site";

export interface ContactMessages {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  project_type: string;
  message: string;
}

/** Same schema on both sides of the wire; messages come from the dictionary. */
export const buildContactSchema = (m: ContactMessages) =>
  z.object({
    firstName: z.string().trim().min(2, m.first_name).max(60),
    lastName: z.string().trim().min(2, m.last_name).max(60),
    email: z.email(m.email).max(120),
    phone: z
      .string()
      .trim()
      .min(7, m.phone)
      .max(25)
      .regex(/^[+()\d\s.-]+$/, m.phone),
    projectType: z.enum(PROJECT_TYPES, m.project_type),
    message: z.string().trim().min(10, m.message).max(2000),
    /** Honeypot — must stay empty. */
    company: z.string().max(0).optional(),
  });

export type ContactPayload = z.infer<ReturnType<typeof buildContactSchema>>;

export const SERVER_MESSAGES: ContactMessages = {
  first_name: "Invalid first name",
  last_name: "Invalid last name",
  email: "Invalid email",
  phone: "Invalid phone",
  project_type: "Invalid project type",
  message: "Invalid message",
};
