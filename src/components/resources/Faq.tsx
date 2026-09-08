import { useId, useMemo, useState } from "react";
import { FiPlus } from "react-icons/fi";

export interface FaqItem {
  q: string;
  a: string;
}

export interface FaqGroup {
  id: string;
  label: string;
  items: FaqItem[];
}

interface FaqProps {
  groups: FaqGroup[];
  allLabel: string;
}

export default function Faq({ groups, allLabel }: FaqProps) {
  const baseId = useId();
  const [group, setGroup] = useState<string>("all");
  const [open, setOpen] = useState<Set<string>>(() => new Set());

  const visible = useMemo(
    () => (group === "all" ? groups : groups.filter((entry) => entry.id === group)),
    [groups, group],
  );

  const toggle = (key: string) =>
    setOpen((current) => {
      const next = new Set(current);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const tabs = [{ id: "all", label: allLabel }, ...groups.map(({ id, label }) => ({ id, label }))];

  return (
    <div>
      <div
        role="tablist"
        aria-label={allLabel}
        className="-mx-1 flex snap-x gap-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {tabs.map(({ id, label }) => {
          const active = group === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setGroup(id)}
              className={`press shrink-0 snap-start rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap ${
                active
                  ? "border-primary bg-primary text-white shadow-e2"
                  : "border-line bg-canvas text-muted hover:text-ink"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="mt-8 space-y-10">
        {visible.map((entry) => (
          <section key={entry.id} aria-label={entry.label}>
            {group === "all" && (
              <h3 className="type-label mb-4 text-strategic">{entry.label}</h3>
            )}

            <ul className="divide-y divide-line border-y border-line">
              {entry.items.map((item, index) => {
                const key = `${entry.id}-${index}`;
                const panelId = `${baseId}-${key}`;
                const isOpen = open.has(key);

                return (
                  <li key={key}>
                    <h4>
                      <button
                        type="button"
                        onClick={() => toggle(key)}
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        className="group flex w-full cursor-pointer items-start justify-between gap-6 py-5 text-left"
                      >
                        <span
                          className={`font-display text-base leading-snug font-semibold tracking-[-0.01em] transition-colors duration-200 ${
                            isOpen ? "text-strategic" : "text-ink group-hover:text-strategic"
                          }`}
                        >
                          {item.q}
                        </span>
                        <span
                          data-motion
                          aria-hidden="true"
                          className={`mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line text-muted transition-[transform,background-color,border-color,color] duration-300 ease-out group-hover:border-primary/40 group-hover:text-strategic ${
                            isOpen ? "rotate-45 border-primary bg-primary text-white" : ""
                          }`}
                        >
                          <FiPlus className="h-4 w-4" />
                        </span>
                      </button>
                    </h4>

                    {/* 0fr → 1fr keeps the panel measured by its own content, so
                        the open/close can be reversed mid-flight without ever
                        animating to a stale pixel height. */}
                    <div
                      id={panelId}
                      role="region"
                      className="grid transition-[grid-template-rows,opacity] duration-300 ease-out"
                      style={{
                        gridTemplateRows: isOpen ? "1fr" : "0fr",
                        opacity: isOpen ? 1 : 0,
                      }}
                    >
                      <div className="overflow-hidden">
                        <p className="max-w-2xl pb-6 text-sm leading-relaxed text-pretty text-muted">
                          {item.a}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
