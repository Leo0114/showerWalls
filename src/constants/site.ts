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
 * The five standard finishes. Hex values match the real product chips.
 * Change them here only — every surface reads from this single source.
 * `ink` is the readable foreground over `hex`.
 */
export const FINISHES = [
  { id: "firefox-beige", hex: "#ecebeb", ink: "#1c1d1a", accent: "#d4d3d3" },
  { id: "ivory", hex: "#dbdbdb", ink: "#1c1d1a", accent: "#c4c4c4" },
  { id: "light-gray", hex: "#e9e9e6", ink: "#1c1d1a", accent: "#d1d1ce" },
  { id: "solid-bone", hex: "#c7c5b8", ink: "#1c1d1a", accent: "#b0aea2" },
  { id: "solid-white", hex: "#dad9d9", ink: "#1c1d1a", accent: "#c3c2c2" },
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
