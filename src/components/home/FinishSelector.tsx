import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiArrowRight, FiCheck } from "react-icons/fi";
import { FINISHES, type FinishId } from "@/constants/site";
import { useReactI18n } from "@/i18n/useReacti18n";

interface FinishSelectorProps {
  lang: string;
  ctaHref: string;
  previewSrc: string;
}

export default function FinishSelector({
  lang,
  ctaHref,
  previewSrc,
}: FinishSelectorProps) {
  const { t } = useReactI18n(lang);
  const copy = t.home.colors;

  const [activeId, setActiveId] = useState<FinishId>(FINISHES[0].id);
  const active =
    FINISHES.find((finish) => finish.id === activeId) ?? FINISHES[0];
  const activeCopy = copy.items[activeId];

  return (
    <div
      className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-center"
      style={{
        ["--finish" as string]: active.hex,
        ["--finish-accent" as string]: active.accent,
      }}
    >
      <motion.div
        className="relative aspect-4/3 overflow-hidden rounded-4xl border border-line"
        animate={{ backgroundColor: active.hex }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <img
          src={previewSrc}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover mix-blend-luminosity opacity-90"
        />

        <motion.div
          className="absolute inset-0"
          animate={{ backgroundColor: active.hex }}
          style={{ mixBlendMode: "color" }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          aria-hidden="true"
        />

        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-baseBlack/70 to-transparent p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
            >
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-white/60">
                {copy.selected}
              </p>
              <p className="mt-2 font-display text-2xl font-bold text-white">
                {activeCopy.name}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      <div>
        <ul
          className="flex flex-wrap gap-3"
          role="radiogroup"
          aria-label={copy.title}
        >
          {FINISHES.map((finish) => {
            const isActive = finish.id === activeId;
            return (
              <li key={finish.id}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  aria-label={copy.items[finish.id].name}
                  onClick={() => setActiveId(finish.id)}
                  className={`relative flex h-14 w-14 cursor-pointer items-center justify-center rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                    isActive
                      ? "border-primary shadow-lg shadow-primary/20"
                      : "border-line"
                  }`}
                  style={{ backgroundColor: finish.hex }}
                >
                  {isActive && (
                    <FiCheck
                      className="h-5 w-5"
                      style={{ color: finish.ink }}
                      aria-hidden="true"
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="mt-8"
          >
            <h3 className="font-display text-2xl font-bold text-ink">
              {activeCopy.name}
            </h3>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
              {activeCopy.description}
            </p>
          </motion.div>
        </AnimatePresence>

        <p className="mt-8 border-t border-line pt-6 text-xs text-muted">
          {copy.note}
        </p>

        <a
          href={ctaHref}
          className="group mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-primaryDark"
        >
          {copy.cta}
          <FiArrowRight
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </a>
      </div>
    </div>
  );
}
