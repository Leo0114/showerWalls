import { useMemo, useState } from "react";
import { FiArrowUpRight, FiSearch, FiX } from "react-icons/fi";
import { PRODUCT_CATEGORIES, type ProductCategory } from "@/constants/site";
import { useReactI18n } from "@/i18n/useReacti18n";

export interface ProductListItem {
  slug: string;
  title: string;
  code: string;
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
}

type Filter = ProductCategory | "all";

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export default function ProductExplorer({ lang, products, initialCategory }: ProductExplorerProps) {
  const { t } = useReactI18n(lang);
  const copy = t.products;

  const [filter, setFilter] = useState<Filter>(
    PRODUCT_CATEGORIES.includes(initialCategory as ProductCategory)
      ? (initialCategory as ProductCategory)
      : "all",
  );
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const base = Object.fromEntries(PRODUCT_CATEGORIES.map((c) => [c, 0])) as Record<
      ProductCategory,
      number
    >;
    products.forEach((product) => (base[product.category] += 1));
    return base;
  }, [products]);

  const visible = useMemo(() => {
    const term = normalize(query.trim());
    return products.filter((product) => {
      if (filter !== "all" && product.category !== filter) return false;
      if (!term) return true;
      return normalize(`${product.title} ${product.code}`).includes(term);
    });
  }, [products, filter, query]);

  const isFiltered = filter !== "all" || query.length > 0;

  const selectFilter = (next: Filter) => {
    setFilter(next);
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (next === "all") url.searchParams.delete("category");
    else url.searchParams.set("category", next);
    window.history.replaceState({}, "", url);
  };

  const reset = () => {
    setQuery("");
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
        <div className="rounded-3xl border border-line bg-panel p-6">
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
              onChange={(event) => setQuery(event.target.value)}
              placeholder={copy.search_placeholder}
              className="w-full rounded-full border border-line bg-canvas py-3 pl-11 pr-4 text-sm text-ink placeholder:text-muted focus:border-primary focus:outline-none"
            />
          </div>

          <h2 className="mt-8 text-xs font-semibold uppercase tracking-[0.24em] text-muted">
            {t.common.filters}
          </h2>

          <ul className="mt-4 space-y-1" role="radiogroup" aria-label={t.common.filters}>
            {options.map(({ id, label, count }) => {
              const isActive = filter === id;
              return (
                <li key={id}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    onClick={() => selectFilter(id)}
                    className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl px-4 py-2.5 text-left text-sm transition-colors duration-300 ${
                      isActive
                        ? "bg-primary text-white"
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
              className="mt-6 inline-flex cursor-pointer items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary transition-colors hover:text-primaryDark"
            >
              <FiX className="h-4 w-4" aria-hidden="true" />
              {t.common.clear}
            </button>
          )}
        </div>
      </aside>

      <div>
        <p className="text-sm text-muted" aria-live="polite">
          {copy.showing} <span className="font-semibold text-ink">{visible.length}</span> {copy.of}{" "}
          {products.length} {copy.products_word}
        </p>

        {visible.length === 0 ? (
          <p className="mt-10 rounded-3xl border border-dashed border-line p-12 text-center text-sm text-muted">
            {t.common.no_results}
          </p>
        ) : (
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((product) => (
              <li key={product.slug}>
                <a
                  href={product.href}
                  className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-canvas transition-all duration-500 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5"
                >
                  <div className="relative aspect-4/3 overflow-hidden bg-panel">
                    <img
                      src={product.cover}
                      alt={product.title}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <span className="absolute left-4 top-4 rounded-full bg-canvas/90 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-primary backdrop-blur-sm">
                      {product.code}
                    </span>
                    {product.madeToOrder && (
                      <span className="absolute right-4 top-4 rounded-full bg-primary px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-white">
                        ★
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted">
                      {copy.categories[product.category].name}
                    </p>
                    <h3 className="mt-2 font-display text-lg font-semibold leading-snug text-ink">
                      {product.title}
                    </h3>
                    <p className="mt-3 line-clamp-2 flex-1 text-sm leading-relaxed text-muted">
                      {product.excerpt}
                    </p>
                    <span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                      {copy.details_button}
                      <FiArrowUpRight
                        className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        aria-hidden="true"
                      />
                    </span>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
