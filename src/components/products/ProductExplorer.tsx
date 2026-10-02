import { useMemo, useRef, useState } from "react";
import { FiArrowUpRight, FiSearch, FiX } from "react-icons/fi";
import { PRODUCT_CATEGORIES, type ProductCategory } from "@/constants/site";
import { useReactI18n } from "@/i18n/useReacti18n";

export interface ProductListItem {
  slug: string;
  title: string;
  code?: string;
  excerpt: string;
  category: ProductCategory;
  href: string;
  cover: string;
  madeToOrder: boolean;
}

interface ProductExplorerProps {
  lang: string;
  products: ProductListItem[];
  initialCategory?: string;
  initialPage?: number;
}

type Filter = ProductCategory | "all";

/** Categories shot as transparent cut-outs: shown whole (contained), never cropped. */
export const CUTOUT_CATEGORIES: ReadonlySet<ProductCategory> = new Set([
  "shower-pans",
  "accessories",
]);

/** Categories whose card is reduced to name + CTA. */
const COMPACT_CATEGORIES: ReadonlySet<ProductCategory> = new Set([
  "tub-shower-surrounds",
  "shower-pans",
  "accessories",
]);

/** Categories whose cover image gets a #eaeaec color tint overlay. */
const TINTED_CATEGORIES: ReadonlySet<ProductCategory> = new Set([
  "tub-shower-surrounds",
]);

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

/** Mirrors explorer state into the query string without adding history entries. */
function syncParam(key: string, value: string | null) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (value === null) url.searchParams.delete(key);
  else url.searchParams.set(key, value);
  window.history.replaceState({}, "", url);
}

export default function ProductExplorer({
  lang,
  products,
  initialCategory,
}: ProductExplorerProps) {
  const { t } = useReactI18n(lang);
  const copy = t.products;

  const [filter, setFilter] = useState<Filter>(
    PRODUCT_CATEGORIES.includes(initialCategory as ProductCategory)
      ? (initialCategory as ProductCategory)
      : "all",
  );
  const [query, setQuery] = useState("");
  const resultsRef = useRef<HTMLDivElement>(null);

  const counts = useMemo(() => {
    const base = Object.fromEntries(
      PRODUCT_CATEGORIES.map((c) => [c, 0]),
    ) as Record<ProductCategory, number>;
    products.forEach((product) => (base[product.category] += 1));
    return base;
  }, [products]);

  const visible = useMemo(() => {
    const term = normalize(query.trim());
    return products.filter((product) => {
      if (filter !== "all" && product.category !== filter) return false;
      if (!term) return true;
      return normalize(`${product.title} ${product.code ?? ""}`).includes(term);
    });
  }, [products, filter, query]);

  const pageItems = visible;

  const isFiltered = filter !== "all" || query.length > 0;

  const selectFilter = (next: Filter) => {
    setFilter(next);
    syncParam("category", next === "all" ? null : next);
  };

  const updateQuery = (next: string) => {
    setQuery(next);
  };

  const reset = () => {
    updateQuery("");
    selectFilter("all");
  };

  const options: Array<{ id: Filter; label: string; count: number }> = [
    { id: "all", label: t.common.all, count: products.length },
    ...PRODUCT_CATEGORIES.map((id) => ({
      id: id as Filter,
      label: copy.categories[id].name,
      count: counts[id],
    })),
  ];

  return (
    <div className="grid gap-10 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-14">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="surface-card rounded-3xl bg-panel p-6">
          <label htmlFor="product-search" className="sr-only">
            {copy.search_placeholder}
          </label>
          <div className="relative">
            <FiSearch
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              id="product-search"
              type="search"
              value={query}
              onChange={(event) => updateQuery(event.target.value)}
              placeholder={copy.search_placeholder}
              className="w-full rounded-full border border-line bg-canvas py-3 pr-4 pl-11 text-sm text-ink transition-colors duration-200 ease-out placeholder:text-muted focus:border-primary focus:outline-none"
            />
          </div>

          <h2 className="type-label mt-8 text-muted">{t.common.filters}</h2>

          <ul
            className="mt-4 space-y-1"
            role="radiogroup"
            aria-label={t.common.filters}
          >
            {options.map(({ id, label, count }) => {
              const isActive = filter === id;
              return (
                <li key={id}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    onClick={() => selectFilter(id)}
                    className={`press flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl px-4 py-2.5 text-left text-sm ${
                      isActive
                        ? "bg-primary text-white shadow-e1"
                        : "text-muted hover:bg-canvas hover:text-ink"
                    }`}
                  >
                    <span className="font-medium">{label}</span>
                    <span
                      className={`text-xs tabular-nums ${isActive ? "text-white/70" : "text-muted/70"}`}
                    >
                      {count}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {isFiltered && (
            <button
              type="button"
              onClick={reset}
              className="press type-label mt-6 inline-flex cursor-pointer items-center gap-2 text-strategic hover:text-primaryLight"
            >
              <FiX className="h-4 w-4" aria-hidden="true" />
              {t.common.clear}
            </button>
          )}
        </div>
      </aside>

      <div ref={resultsRef} className="scroll-mt-28">
        <p className="text-sm text-muted" aria-live="polite">
          {copy.showing}{" "}
          <span className="font-semibold text-ink tabular-nums">
            {visible.length}
          </span>{" "}
          {copy.products_word}
        </p>

        {visible.length === 0 ? (
          <p className="mt-10 rounded-3xl border border-dashed border-line p-12 text-center text-sm text-muted">
            {t.common.no_results}
          </p>
        ) : (
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {pageItems.map((product) => {
              const isCutout = CUTOUT_CATEGORIES.has(product.category);
              const isCompact = COMPACT_CATEGORIES.has(product.category);
              const isTinted = TINTED_CATEGORIES.has(product.category);
              return (
                <li key={product.slug}>
                  <a
                    href={product.href}
                    className="surface-card press-soft group flex h-full flex-col overflow-hidden rounded-3xl hover:-translate-y-1 hover:border-primary/40 hover:shadow-e3"
                  >
                    <div
                      className={`relative aspect-4/3 overflow-hidden ${
                        isCutout
                          ? "bg-[radial-gradient(ellipse_at_50%_40%,var(--color-canvas)_0%,var(--color-panel)_75%)]"
                          : "bg-panel"
                      }`}
                    >
                      <img
                        src={product.cover}
                        alt={product.title}
                        loading="lazy"
                        decoding="async"
                        style={
                          isTinted
                            ? {
                                filter:
                                  "sepia(1) saturate(0.05) brightness(0.97) hue-rotate(180deg)",
                                mixBlendMode: "multiply",
                              }
                            : undefined
                        }
                        className={
                          isCutout
                            ? // Cut-outs float inside a padded "stage": whole object visible, grounded by a soft shadow.
                              "h-full w-full object-contain px-10 pt-14 pb-10 drop-shadow-[0_14px_18px_rgb(0_0_0/0.14)] transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                            : "h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        }
                      />
                      {isTinted && (
                        <div
                          aria-hidden="true"
                          style={{
                            backgroundColor: "#eaeaec",
                            mixBlendMode: "color",
                            opacity: 0.65,
                            position: "absolute",
                            inset: 0,
                            pointerEvents: "none",
                          }}
                        />
                      )}
                      {product.code && (
                        <span className="glass-chip type-label absolute top-4 left-4 rounded-full px-3 py-1 text-strategic">
                          {product.code}
                        </span>
                      )}
                      {product.madeToOrder && (
                        <span className="absolute top-4 right-4 rounded-full bg-primary px-3 py-1 text-[0.65rem] font-semibold tracking-[0.16em] text-white uppercase shadow-e1">
                          ★
                        </span>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col p-6">
                      {!isCompact && (
                        <p className="type-label mb-2 text-muted">
                          {copy.categories[product.category].name}
                        </p>
                      )}
                      <h3
                        className={`font-display text-lg leading-snug font-semibold tracking-[-0.015em] text-ink ${
                          isCompact ? "flex-1" : ""
                        }`}
                      >
                        {product.title}
                      </h3>
                      {!isCompact && (
                        <p className="mt-3 line-clamp-2 flex-1 text-sm leading-relaxed text-muted">
                          {product.excerpt}
                        </p>
                      )}
                      <span className="type-label mt-5 inline-flex items-center gap-2 text-strategic">
                        {copy.details_button}
                        <FiArrowUpRight
                          className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          aria-hidden="true"
                        />
                      </span>
                    </div>
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

interface PaginationProps {
  page: number;
  totalPages: number;
  labels: { label: string; previous: string; next: string; page: string };
  onChange: (page: number) => void;
}

function Pagination({ page, totalPages, labels, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      aria-label={labels.label}
      className="mt-12 flex items-center justify-center gap-2"
    >
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        aria-label={labels.previous}
        className="icon-btn press cursor-pointer disabled:cursor-not-allowed disabled:opacity-30"
      >
        {/* <FiChevronLeft className="h-4 w-4" aria-hidden="true" /> */}
      </button>

      <ul className="flex items-center gap-1.5">
        {pages.map((n) => {
          const isCurrent = n === page;
          return (
            <li key={n}>
              <button
                type="button"
                onClick={() => onChange(n)}
                aria-label={`${labels.page} ${n}`}
                aria-current={isCurrent ? "page" : undefined}
                className={`press h-10 min-w-10 cursor-pointer rounded-full px-3 text-sm font-medium tabular-nums ${
                  isCurrent
                    ? "bg-primary text-white shadow-e1"
                    : "text-muted hover:bg-panel hover:text-ink"
                }`}
              >
                {n}
              </button>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        aria-label={labels.next}
        className="icon-btn press cursor-pointer disabled:cursor-not-allowed disabled:opacity-30"
      >
        {/* <FiChevronRight className="h-4 w-4" aria-hidden="true" /> */}
      </button>
    </nav>
  );
}
