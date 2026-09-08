import { getImage } from "astro:assets";

/**
 * Every equirectangular panorama in `src/assets/images/360/`, keyed by file name
 * without its extension — the same key the project frontmatter stores.
 */
const MODULES = import.meta.glob<{ default: ImageMetadata }>(
  "../assets/images/360/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG}",
  { eager: true },
);

const BY_NAME = new Map<string, ImageMetadata>(
  Object.entries(MODULES).map(([path, mod]) => [
    path.split("/").pop()!.replace(/\.[^.]+$/, ""),
    mod.default,
  ]),
);

/**
 * 4096 px is the equirectangular width that still fits the WebGL texture limit
 * on the phones this site is browsed from; the sources are 7–9 k and would be
 * silently downscaled (or dropped) on those devices anyway.
 */
const SPHERE_WIDTH = 4096;
/** Poster only has to survive one card, and it blocks the first paint. */
const POSTER_WIDTH = 1280;

export interface ResolvedPanorama {
  name: string;
  /** Full-resolution equirectangular texture. */
  src: string;
  /** Still shown until the sphere is textured. */
  poster: string;
}

export const hasPanorama = (name: string) => BY_NAME.has(name);

/** Resolves names to build-time optimized panorama pairs, skipping unknown ones. */
export async function resolvePanoramas(names: string[]): Promise<ResolvedPanorama[]> {
  const found = names
    .map((name) => ({ name, image: BY_NAME.get(name) }))
    .filter((entry): entry is { name: string; image: ImageMetadata } => Boolean(entry.image));

  return Promise.all(
    found.map(async ({ name, image }) => {
      const [full, poster] = await Promise.all([
        getImage({ src: image, width: SPHERE_WIDTH, format: "webp", quality: 76 }),
        getImage({ src: image, width: POSTER_WIDTH, format: "webp", quality: 60 }),
      ]);
      return { name, src: full.src, poster: poster.src };
    }),
  );
}

/** Convenience for the single-panorama surfaces (the home showcase). */
export async function resolvePanorama(name: string): Promise<ResolvedPanorama | undefined> {
  const [panorama] = await resolvePanoramas([name]);
  return panorama;
}
