import { getI18N, type Dictionary } from "./i18n";
import { defaultLang, isLang, type Lang } from "./ui";

/**
 * i18n for React islands. Prefer passing `lang` down from Astro (it is known at
 * render time); the pathname sniffing is only a client-side fallback.
 */
export function useReactI18n(lang?: string): { t: Dictionary; locale: Lang } {
  const fromPath =
    typeof window !== "undefined" ? window.location.pathname.split("/")[1] : undefined;

  const locale: Lang = isLang(lang) ? lang : isLang(fromPath) ? fromPath : defaultLang;

  return { t: getI18N(locale), locale };
}
