import { getCollection, getEntry, type CollectionEntry } from "astro:content";
import type { Lang } from "@/i18n/ui";

export type Product = CollectionEntry<"products">;
export type Project = CollectionEntry<"projects">;

const byOrderThenTitle = <T extends { data: { order: number; title: string } }>(a: T, b: T) =>
  a.data.order - b.data.order || a.data.title.localeCompare(b.data.title);

/** Entry ids follow `<lang>/<slug>`, so lookups stay O(1) without a filter pass. */
const entryId = (lang: Lang, slug: string) => `${lang}/${slug}`;

export async function getProducts(lang: Lang): Promise<Product[]> {
  const entries = await getCollection(
    "products",
    ({ data }) => data.lang === lang && data.available,
  );
  return entries.sort(byOrderThenTitle);
}

/** Unavailable products resolve to `undefined`, so their detail route 404s. */
export async function getProduct(lang: Lang, slug: string): Promise<Product | undefined> {
  const entry = await getEntry("products", entryId(lang, slug));
  return entry?.data.available ? entry : undefined;
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const siblings = await getCollection(
    "products",
    ({ data }) =>
      data.lang === product.data.lang &&
      data.category === product.data.category &&
      data.available,
  );

  return siblings
    .filter((entry) => entry.id !== product.id)
    .sort(byOrderThenTitle)
    .slice(0, limit);
}

export async function getProjects(lang: Lang): Promise<Project[]> {
  const entries = await getCollection("projects", ({ data }) => data.lang === lang);
  return entries.sort(byOrderThenTitle);
}

export async function getProject(lang: Lang, slug: string): Promise<Project | undefined> {
  return getEntry("projects", entryId(lang, slug));
}

/** Static paths for both locales of a collection. */
export async function getLocalizedPaths(collection: "products" | "projects", lang: Lang) {
  const entries = await getCollection(
    collection,
    ({ data }) => data.lang === lang && (!("available" in data) || data.available),
  );
  return entries.map((entry) => ({ params: { slug: entry.data.slug }, props: { entry } }));
}
