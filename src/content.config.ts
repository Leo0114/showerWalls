import { defineCollection } from "astro:content";
import { z } from "zod";
import { glob } from "astro/loaders";
import { PRODUCT_CATEGORIES, SURFACE_FINISHES } from "@/constants/site";

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
  /** Folder path inside `src/assets/images/` consumed by `<Gallery />`. */
  gallery: z.string().optional(),
  featured: z.boolean().default(false),
  order: z.number().int().default(0),
};

/** Keeps the `<lang>/<slug>` shape as the entry id instead of collapsing it. */
const generateId = ({ entry }: { entry: string }) =>
  entry.replace(/\.mdx?$/, "");

const products = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/products",
    generateId,
  }),
  schema: ({ image }) =>
    z.object({
      ...localized,
      /** Always `products/<section>/<product>/one.*` for listed products. */
      cover: image(),
      /** Catalog code; omitted for products that have not been assigned one yet. */
      code: z.string().optional(),
      category: z.enum(PRODUCT_CATEGORIES),
      /**
       * `false` hides the product everywhere (listing, detail, related). Set it
       * when the product has no image folder under `assets/images/products/`.
       */
      available: z.boolean().default(true),
      /** Wall surface finishes this pattern ships in. Omit when not confirmed. */
      surfaceFinishes: z.array(z.enum(SURFACE_FINISHES)).optional(),
      madeToOrder: z.boolean().default(false),
      specs: z
        .array(z.object({ label: z.string(), value: z.string() }))
        .default([]),
    }),
});

const projects = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/projects",
    generateId,
  }),
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
