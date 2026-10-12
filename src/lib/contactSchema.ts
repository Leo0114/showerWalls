import {
  buildContactSchema,
  contactSchema,
  getProjectTypeLabel,
  PROJECT_TYPE_LABELS,
  PROJECT_TYPES,
  type ContactFormData,
  type ContactMessages,
  type ContactPayload,
  type ProjectType,
} from "@/components/contact/contact.schema";

export const SERVER_MESSAGES: ContactMessages = {
  first_name: "Invalid first name",
  last_name: "Invalid last name",
  email: "Invalid email",
  phone: "Invalid phone",
  project_type: "Invalid project type",
  message: "Invalid message",
};

export {
  buildContactSchema,
  contactSchema,
  getProjectTypeLabel,
  PROJECT_TYPE_LABELS,
  PROJECT_TYPES,
  type ContactFormData,
  type ContactMessages,
  type ContactPayload,
  type ProjectType,
};
