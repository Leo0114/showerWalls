/**
 * ProjectsGrid — React island
 *
 * Handles client-side search, type filtering, and pagination (20 per page)
 * for the 133-entry proyectos.json dataset.
 *
 * All UI strings are passed as props so the component stays bilingual
 * without importing dictionaries directly.
 */

import { useState, useMemo, useCallback, useId } from "react";
import { FiSearch, FiX, FiChevronLeft, FiChevronRight, FiExternalLink } from "react-icons/fi";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProjectEntry {
  Tipo: string;
  Hotel: string;
  Marca: string | null;
  City: string | null;
  State: string | null;
  Web: string | null;
  /** Dirección intentionally excluded from UI */
}

export interface I18nProjects {
  search_placeholder: string;
  filter_all: string;
  no_results: string;
  visit_web: string;
  pagination: {
    previous: string;
    next: string;
    of: string;
  };
  types: Record<string, string>;
}

interface Props {
  projects: ProjectEntry[];
  i18n: I18nProjects;
  /** Image URLs keyed by Tipo, resolved by Astro at build time. */
  typeImages: Record<string, string>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

// ─── Sub-components ──────────────────────────────────────────────────────────

function TypeBadge({ tipo, label }: { tipo: string; label: string }) {
  const colors: Record<string, string> = {
    Hospitality: "bg-[#006da6]/10 text-[#006da6] dark:bg-[#4fb0e0]/15 dark:text-[#4fb0e0]",
    Multifamily: "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-400",
    Seniorliving: "bg-violet-500/10 text-violet-700 dark:bg-violet-400/15 dark:text-violet-400",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-widest ${colors[tipo] ?? "bg-line text-muted"}`}
    >
      {label}
    </span>
  );
}

function ProjectCard({
  project,
  visitLabel,
  typeImages,
  typeLabel,
}: {
  project: ProjectEntry;
  visitLabel: string;
  typeImages: Record<string, string>;
  typeLabel: string;
}) {
  const { Hotel, Marca, City, State, Web, Tipo } = project;
  const location = [City, State].filter(Boolean).join(", ");
  const imgSrc = typeImages[Tipo] ?? typeImages["Hospitality"];

  return (
    <a
      href={Web ?? "#"}
      target={Web ? "_blank" : undefined}
      rel={Web ? "noopener noreferrer" : undefined}
      aria-label={Hotel}
      className="surface-card press-soft group relative flex flex-col overflow-hidden rounded-2xl hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-e3"
      style={{ transition: "var(--transition-interactive)" }}
    >
      {/* Image strip */}
      <div className="relative h-36 overflow-hidden">
        <img
          src={imgSrc}
          alt={Tipo}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#0b0f14]/60 via-[#0b0f14]/10 to-transparent"
          aria-hidden="true"
        />
        {/* Type badge */}
        <span className="glass-chip type-label absolute top-3 left-3 rounded-full px-2.5 py-1 text-strategic">
          {typeLabel}
        </span>
        {/* External icon */}
        {Web && (
          <span className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-strategic/90 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <FiExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="font-display text-sm font-bold leading-snug tracking-[-0.01em] text-ink line-clamp-2 transition-colors duration-200 group-hover:text-strategic">
          {Hotel}
        </h3>

        {(Marca?.trim() || location) && (
          <p className="type-label mt-0.5 text-muted line-clamp-1">
            {[Marca?.trim(), location].filter(Boolean).join(" · ")}
          </p>
        )}

        {Web && (
          <span className="type-label mt-auto pt-3 inline-flex items-center gap-1.5 text-strategic">
            {visitLabel}
            <FiExternalLink
              className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </span>
        )}
      </div>
    </a>
  );
}

// ─── Pagination controls ──────────────────────────────────────────────────────

function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  i18n,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  i18n: I18nProjects["pagination"];
  onPrev: () => void;
  onNext: () => void;
}) {
  if (totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="mt-10 flex items-center justify-between gap-4" role="navigation" aria-label="Pagination">
      <p className="type-label text-muted">
        {from}–{to} {i18n.of} {total}
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          disabled={page === 1}
          aria-label={i18n.previous}
          className="icon-btn disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <FiChevronLeft className="h-4 w-4" />
        </button>

        <span className="type-label min-w-[4rem] text-center text-ink">
          {page} / {totalPages}
        </span>

        <button
          onClick={onNext}
          disabled={page === totalPages}
          aria-label={i18n.next}
          className="icon-btn disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <FiChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Main island ──────────────────────────────────────────────────────────────

export default function ProjectsGrid({ projects, i18n, typeImages }: Props) {
  const searchId = useId();

  const [query, setQuery] = useState("");
  const [activeType, setActiveType] = useState<string>("all");
  const [page, setPage] = useState(1);

  // Derive unique types from data — preserves insertion order
  const types = useMemo(() => {
    const seen = new Set<string>();
    projects.forEach((p) => seen.add(p.Tipo));
    return Array.from(seen);
  }, [projects]);

  const resetPage = useCallback(() => setPage(1), []);

  const handleQuery = useCallback(
    (v: string) => {
      setQuery(v);
      resetPage();
    },
    [resetPage],
  );

  const handleType = useCallback(
    (t: string) => {
      setActiveType(t);
      resetPage();
    },
    [resetPage],
  );

  // Filtered list — memo so it only recomputes when inputs change
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      if (activeType !== "all" && p.Tipo !== activeType) return false;
      if (!q) return true;
      return (
        p.Hotel.toLowerCase().includes(q) ||
        (p.Marca?.toLowerCase().includes(q) ?? false) ||
        (p.City?.toLowerCase().includes(q) ?? false) ||
        (p.State?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [projects, query, activeType]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  // Clamp page when filter shrinks results
  const safePage = Math.min(page, totalPages);

  const visible = useMemo(
    () => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filtered, safePage],
  );

  return (
    <div>
      {/* ── Toolbar ── */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <label htmlFor={searchId} className="sr-only">
            {i18n.search_placeholder}
          </label>
          <FiSearch
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(e) => handleQuery(e.target.value)}
            placeholder={i18n.search_placeholder}
            className="w-full rounded-full border border-line bg-elevated py-2.5 pl-10 pr-10 text-sm text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors duration-200"
          />
          {query && (
            <button
              onClick={() => handleQuery("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted hover:text-ink transition-colors"
            >
              <FiX className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Type filter pills */}
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by type">
          <button
            onClick={() => handleType("all")}
            className={`btn py-2 px-4 text-[0.65rem] ${
              activeType === "all"
                ? "btn-primary"
                : "btn-outline"
            }`}
          >
            {i18n.filter_all}
          </button>
          {types.map((t) => (
            <button
              key={t}
              onClick={() => handleType(t)}
              className={`btn py-2 px-4 text-[0.65rem] ${
                activeType === t ? "btn-primary" : "btn-outline"
              }`}
            >
              {i18n.types[t] ?? t}
            </button>
          ))}
        </div>
      </div>

      {/* ── Results count ── */}
      <p className="type-label mb-6 text-muted">
        {filtered.length} {activeType !== "all" ? (i18n.types[activeType] ?? activeType) : ""}{" "}
        {filtered.length === 1 ? "" : ""}
      </p>

      {/* ── Grid ── */}
      {visible.length === 0 ? (
        <div className="flex min-h-48 items-center justify-center rounded-2xl border border-line bg-panel">
          <p className="text-base text-muted">{i18n.no_results}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((project, i) => (
            <ProjectCard
              key={`${project.Hotel}-${i}`}
              project={project}
              visitLabel={i18n.visit_web}
              typeImages={typeImages}
              typeLabel={i18n.types[project.Tipo] ?? project.Tipo}
            />
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      <Pagination
        page={safePage}
        totalPages={totalPages}
        total={filtered.length}
        pageSize={PAGE_SIZE}
        i18n={i18n.pagination}
        onPrev={() => {
          setPage((p) => Math.max(1, p - 1));
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onNext={() => {
          setPage((p) => Math.min(totalPages, p + 1));
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    </div>
  );
}
