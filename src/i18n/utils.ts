import { defaultLang, isLang, routes, showDefaultLang, type Lang, type RouteId } from "./ui";

/** Resolves the active language from the URL, falling back to the default one. */
export function getLangFromUrl(url: URL): Lang {
  const [, segment] = url.pathname.split("/");
  return isLang(segment) ? segment : defaultLang;
}

/**
 * Builds an absolute, locale-aware path.
 *   localizePath("en", "products")      -> "/products"
 *   localizePath("es", "products")      -> "/es/products"
 *   localizePath("es", "products", "x") -> "/es/products/x"
 */
export function localizePath(lang: Lang, route: RouteId, ...rest: string[]): string {
  const segments = [routes[lang][route], ...rest].filter(Boolean);
  const prefix = !showDefaultLang && lang === defaultLang ? "" : `/${lang}`;
  const path = segments.join("/");
  return path ? `${prefix}/${path}` : prefix || "/";
}

/** Curried helper for templates: `const path = usePath(lang)`. */
export function usePath(lang: Lang) {
  return (route: RouteId, ...rest: string[]) => localizePath(lang, route, ...rest);
}

/**
 * Same page in the other locale. Only the locale prefix changes because both
 * locales share their route segments.
 */
export function switchLocalePath(url: URL, target: Lang): string {
  const current = getLangFromUrl(url);
  const rest = url.pathname
    .split("/")
    .filter(Boolean)
    .slice(current === defaultLang && !showDefaultLang ? 0 : 1)
    .join("/");

  const prefix = !showDefaultLang && target === defaultLang ? "" : `/${target}`;
  return rest ? `${prefix}/${rest}` : prefix || "/";
}
