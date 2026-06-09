"use client";

import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";

interface TocChild {
  id: string;
  text: string;
}

interface TocGroup {
  id: string;
  text: string;
  children: TocChild[];
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export default function BlogTableOfContents() {
  const [groups, setGroups] = useState<TocGroup[]>([]);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const headings = Array.from(
      document.querySelectorAll("article .prose h2, article .prose h3"),
    ) as HTMLElement[];

    // Give every heading a unique id (also the anchor target). De-duplicate so
    // repeated heading text doesn't collide on ids / React keys.
    const seen = new Map<string, number>();
    const assignId = (heading: HTMLElement) => {
      let id = heading.id || slugify(heading.textContent || "section");
      const count = seen.get(id) ?? 0;
      seen.set(id, count + 1);
      if (count > 0) id = `${id}-${count}`;
      heading.id = id;
      return id;
    };

    // Build a 2-level tree: h2 = category, the h3s after it = its subcategories.
    const result: TocGroup[] = [];
    headings.forEach((heading) => {
      const id = assignId(heading);
      const text = heading.textContent || "Section";
      if (heading.tagName === "H3" && result.length > 0) {
        result[result.length - 1].children.push({ id, text });
      } else {
        result.push({ id, text, children: [] });
      }
    });
    setGroups(result);
  }, []);

  // Show on every article that has at least one heading.
  if (groups.length === 0) return null;

  const toggle = (id: string) =>
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <aside className="mb-8 rounded-2xl border border-slate-700/60 bg-slate-950/35 p-4">
      <p className="text-xs uppercase tracking-wider text-amber-300">
        In this post
      </p>
      <nav className="mt-3 space-y-1">
        {groups.map((group) => {
          const hasChildren = group.children.length > 0;
          const isCollapsed = collapsed[group.id] ?? false;
          return (
            <div key={group.id}>
              <div className="flex items-center gap-1">
                {hasChildren ? (
                  <button
                    type="button"
                    onClick={() => toggle(group.id)}
                    aria-expanded={!isCollapsed}
                    aria-label={
                      isCollapsed
                        ? `Expand ${group.text}`
                        : `Collapse ${group.text}`
                    }
                    className="shrink-0 rounded p-0.5 text-slate-500 transition hover:text-amber-300"
                  >
                    <ChevronRight
                      className={`h-3.5 w-3.5 transition-transform ${isCollapsed ? "" : "rotate-90"}`}
                    />
                  </button>
                ) : (
                  <span
                    className="inline-block w-[18px] shrink-0"
                    aria-hidden="true"
                  />
                )}
                <a
                  href={`#${group.id}`}
                  className="block text-sm font-medium text-slate-200 transition hover:text-amber-200"
                >
                  {group.text}
                </a>
              </div>
              {hasChildren && !isCollapsed && (
                <div className="ml-[22px] mt-1 space-y-1 border-l border-slate-700/50 pl-3">
                  {group.children.map((child) => (
                    <a
                      key={child.id}
                      href={`#${child.id}`}
                      className="block text-xs text-slate-400 transition hover:text-amber-200"
                    >
                      {child.text}
                    </a>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
