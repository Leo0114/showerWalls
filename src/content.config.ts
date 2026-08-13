import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { PRODUCT_CATEGORIES } from "@/constants/site";

const LANGS = ["en", "es"] as const;

/**
 * Files live under `<collection>/<lang>/<slug>.md`, so the entry id already
 * encodes both. `lang` + `slug` stay explicit in the frontmatter to keep the
 * routing logic independent from the folder layout.
 */
const localized = {
  lang: z.enum(LANGS),
  slug: z.string(),
  title: z.string(),
  excerpt: z.string(),
  /** Folder name inside `src/assets/images/` consumed by `<Gallery />`. */
  gallery: z.string().optional(),
  featured: z.boolean().default(false),
  order: z.number().int().default(0),
};

/** Keeps the `<lang>/<slug>` shape as the entry id instead of collapsing it. */
const generateId = ({ entry }: { entry: string }) => entry.replace(/\.mdx?$/, "");

const products = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/products", generateId }),
  schema: ({ image }) =>
    z.object({
      ...localized,
      cover: image(),
      code: z.string(),
      category: z.enum(PRODUCT_CATEGORIES),
      madeToOrder: z.boolean().default(false),
      specs: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
    }),
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects", generateId }),
  schema: ({ image }) =>
    z.object({
      ...localized,
      cover: image(),
      client: z.string(),
      location: z.string(),
      year: z.number().int(),
      sector: z.string(),
      units: z.string().optional(),
      scope: z.array(z.string()).default([]),
      /** Image names inside `src/assets/images/360/` (without extension). */
      panoramas: z.array(z.string()).default([]),
    }),
});

export const collections = { products, projects };
