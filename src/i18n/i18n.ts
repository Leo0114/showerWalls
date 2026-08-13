import en from "@/constants/en.json";
import es from "@/constants/es.json";
import { defaultLang, isLang, type Lang } from "./ui";

export type Dictionary = typeof en;

const DICTIONARIES: Record<Lang, Dictionary> = {
  en,
  es: es as Dictionary,
};

/**
 * Returns the dictionary for the given locale. Accepts `Astro.currentLocale`
 * (which may be undefined on the default, unprefixed routes).
 */
export const getI18N = (currentLocale?: string | null): Dictionary =>
  DICTIONARIES[isLang(currentLocale) ? currentLocale : defaultLang];

export const getLang = (currentLocale?: string | null): Lang =>
  isLang(currentLocale) ? currentLocale : defaultLang;
