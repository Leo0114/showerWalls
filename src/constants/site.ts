import type { RouteId } from "@/i18n/ui";

export const SITE = {
  name: "Shower Walls",
  url: "https://shower-walls.net",
  email: "contact@shower-walls.net",
  phone: "+1 (800) 123-4567",
  phoneHref: "tel:+18001234567",
  social: {
    instagram: "https://instagram.com/",
    facebook: "https://facebook.com/",
    linkedin: "https://linkedin.com/",
  },
} as const;

/** Header / footer navigation. Labels live in the i18n dictionaries. */
export const NAV_ITEMS = [
  { route: "index", key: "home" },
  { route: "about", key: "about_us" },
  { route: "products", key: "products" },
  { route: "projects", key: "projects" },
  { route: "contact", key: "contact" },
] as const satisfies ReadonlyArray<{ route: RouteId; key: string }>;

export const PRODUCT_CATEGORIES = [
  "tub-shower-surrounds",
  "shower-pans",
  "accessories",
  "free-standing-tub",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

/**
 * The five standard finishes. Hex values are placeholders until the client
 * sends the real chips — change them here only, every surface reads from this.
 * `ink` is the readable foreground over `hex`.
 */
export const FINISHES = [
  { id: "arctic", hex: "#F4F6F7", ink: "#1c1d1a", accent: "#C9D6DD" },
  { id: "sand", hex: "#D9CDBC", ink: "#1c1d1a", accent: "#B9A88F" },
  { id: "carrara", hex: "#B7BEC4", ink: "#1c1d1a", accent: "#8E979F" },
  { id: "slate", hex: "#5C7183", ink: "#ffffff", accent: "#3E505F" },
  { id: "graphite", hex: "#2E3439", ink: "#ffffff", accent: "#1A1F23" },
] as const;

export type FinishId = (typeof FINISHES)[number]["id"];

/**
 * Drop the PDFs in `public/catalogs/` using these exact file names and the
 * download cards go live automatically.
 */
export const CATALOGS = [
  { id: "shower-walls", file: "/catalogs/shower-walls-catalog.pdf" },
  { id: "shower-pans", file: "/catalogs/shower-pans-catalog.pdf" },
] as const;

/** Shared gallery folder under `src/assets/images/`. */
export const DEFAULT_GALLERY = "showcase";

export const PROJECT_TYPES = [
  "hospitality",
  "multifamily",
  "student-housing",
  "residential",
  "healthcare-ada",
  "other",
] as const;

export type ProjectType = (typeof PROJECT_TYPES)[number];
