export const LANGUAGES = {
  en: { code: "en", name: "English", short: "EN", locale: "en-US" },
  es: { code: "es", name: "Español", short: "ES", locale: "es-MX" },
} as const;

export type Lang = keyof typeof LANGUAGES;

export const defaultLang: Lang = "en";
export const showDefaultLang = false;

export const isLang = (value?: string | null): value is Lang =>
  !!value && value in LANGUAGES;

/**
 * Canonical route ids -> localized segment. `en` is the default locale and is
 * served from the root (`prefixDefaultLocale: false`).
 */
export const routes = {
  en: {
    index: "",
    about: "about-us",
    products: "products",
    projects: "projects",
    contact: "contact",
  },
  es: {
    index: "",
    about: "about-us",
    products: "products",
    projects: "projects",
    contact: "contact",
  },
} as const satisfies Record<Lang, Record<string, string>>;

export type RouteId = keyof (typeof routes)["en"];
