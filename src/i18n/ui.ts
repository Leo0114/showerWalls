export const languages: Record<string, { code: string; name: string }> = {
  es: { code: "es", name: "Español" },
  en: { code: "en", name: "English" },
};

export const defaultLang = "es";
export const showDefaultLang = false;

export const ui = {
  es: {
    "nav.index": "Inicio",
    "nav.about": "Acerca de",
    "nav.contact": "Contacto",
    
  },
  en: {
    "nav.index": "Home",
    "nav.about": "About",
    "nav.contact": "Contact",
  },
} as const;

export const routes = {
  en: {
    index: "home",
    about: "about",
    contact: "contact",
  },
  es: {
    index: "inicio",
    about: "acerca de",
    contact: "contacto",
  },
};