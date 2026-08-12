import es from "@/constants/es.json";
import en from "@/constants/en.json";

type Translations = typeof es;

/**
 * Hook para i18n en componentes React (islands).
 * Detecta el locale desde el pathname del navegador.
 */
export function useReactI18n(initialLang?: string): {
  t: Translations;
  locale: string;
} {
  const locale =
    initialLang ||
    (typeof window !== "undefined" && window.location.pathname.startsWith("/en")
      ? "en"
      : "es");

  const t: Translations = locale === "en" ? en : es;
  return { t, locale };
}