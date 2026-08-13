import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Toaster, toast } from "sonner";
import { FiSend } from "react-icons/fi";
import { buildContactSchema, type ContactPayload } from "@/lib/contactSchema";
import { PROJECT_TYPES } from "@/constants/site";
import { useReactI18n } from "@/i18n/useReacti18n";

interface ContactFormProps {
  lang: string;
}

const fieldClass =
  "w-full rounded-2xl border border-line bg-canvas px-4 py-3 text-sm text-ink transition-colors placeholder:text-muted focus:border-primary focus:outline-none";

const labelClass =
  "mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted";

export default function ContactForm({ lang }: ContactFormProps) {
  const { t } = useReactI18n(lang);
  const copy = t.contact.form;

  const schema = useMemo(() => buildContactSchema(copy.errors), [copy.errors]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactPayload>({
    resolver: zodResolver(schema),
    mode: "onBlur",
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error(String(response.status));

      toast.success(copy.success_message);
      reset();
    } catch {
      toast.error(copy.error_message);
    }
  });

  const renderError = (message?: string) =>
    message ? (
      <p role="alert" className="mt-1.5 text-xs font-medium text-red-500">
        {message}
      </p>
    ) : null;

  return (
    <>
      <form
        onSubmit={onSubmit}
        noValidate
        className="grid gap-5 sm:grid-cols-2"
      >
        {/* Honeypot */}
        <input
          {...register("company")}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
        />

        <div>
          <label className={labelClass} htmlFor="firstName">
            {copy.first_name_label}
          </label>
          <input
            id="firstName"
            autoComplete="given-name"
            placeholder={copy.first_name_placeholder}
            aria-invalid={Boolean(errors.firstName)}
            className={fieldClass}
            {...register("firstName")}
          />
          {renderError(errors.firstName?.message)}
        </div>

        <div>
          <label className={labelClass} htmlFor="lastName">
            {copy.last_name_label}
          </label>
          <input
            id="lastName"
            autoComplete="family-name"
            placeholder={copy.last_name_placeholder}
            aria-invalid={Boolean(errors.lastName)}
            className={fieldClass}
            {...register("lastName")}
          />
          {renderError(errors.lastName?.message)}
        </div>

        <div>
          <label className={labelClass} htmlFor="email">
            {copy.email_label}
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder={copy.email_placeholder}
            aria-invalid={Boolean(errors.email)}
            className={fieldClass}
            {...register("email")}
          />
          {renderError(errors.email?.message)}
        </div>

        <div>
          <label className={labelClass} htmlFor="phone">
            {copy.phone_label}
          </label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            placeholder={copy.phone_placeholder}
            aria-invalid={Boolean(errors.phone)}
            className={fieldClass}
            {...register("phone")}
          />
          {renderError(errors.phone?.message)}
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="projectType">
            {copy.project_type_label}
          </label>
          <select
            id="projectType"
            defaultValue=""
            aria-invalid={Boolean(errors.projectType)}
            className={`${fieldClass} cursor-pointer appearance-none bg-size-[1rem] bg-position-[right_1rem_center] bg-no-repeat`}
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236f7378' stroke-width='2'><path d='M6 9l6 6 6-6'/></svg>\")",
            }}
            {...register("projectType")}
          >
            <option value="" disabled>
              {copy.project_type_placeholder}
            </option>
            {PROJECT_TYPES.map((type) => (
              <option key={type} value={type}>
                {copy.project_types[type]}
              </option>
            ))}
          </select>
          {renderError(errors.projectType?.message)}
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="message">
            {copy.message_label}
          </label>
          <textarea
            id="message"
            rows={6}
            placeholder={copy.message_placeholder}
            aria-invalid={Boolean(errors.message)}
            className={`${fieldClass} resize-y`}
            {...register("message")}
          />
          {renderError(errors.message?.message)}
        </div>

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="group inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-8 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-primaryDark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? copy.sending : copy.submit_button}
            <FiSend
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </button>
        </div>
      </form>

      <Toaster position="bottom-right" richColors closeButton />
    </>
  );
}
