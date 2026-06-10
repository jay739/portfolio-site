"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { siteUpdates } from "@/data/site-updates";

interface LiveStatusStripProps {
  // Newest blog post date, computed server-side in the root layout (blog.ts
  // reads the filesystem, so it can't run in this client component).
  latestBlogDate?: string;
}

function formatDate(value?: string): string | null {
  if (!value) return null;
  // siteUpdates dates are already human ("June 2026"); post dates are ISO.
  if (!/\d{4}-\d{2}-\d{2}/.test(value)) return value;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function LiveStatusStrip({
  latestBlogDate,
}: LiveStatusStripProps) {
  const [activeUsers, setActiveUsers] = useState<number | null>(null);

  // Live, public-safe signal: how many people are on the site right now.
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/active-users", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        const n =
          typeof data.dailyVisitors === "number"
            ? data.dailyVisitors
            : typeof data.count === "number"
              ? data.count
              : null;
        if (!cancelled && n !== null) setActiveUsers(n);
      } catch {
        /* network/offline — pill just stays hidden, no error in the footer */
      }
    };
    load();
    const id = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const items = useMemo(() => {
    const blogDate = formatDate(latestBlogDate);
    const updateDate = formatDate(siteUpdates[0]?.date);
    const list: { label: string; value: string; href: string }[] = [];
    if (activeUsers !== null) {
      list.push({
        label: "Live now",
        value: `${activeUsers} today`,
        href: "/homeserver",
      });
    }
    if (blogDate) {
      list.push({ label: "Latest post", value: blogDate, href: "/blog" });
    }
    if (updateDate) {
      list.push({ label: "Last update", value: updateDate, href: "/updates" });
    }
    list.push({
      label: "AI tools",
      value: "Self-hosted demos",
      href: "/ai-tools",
    });
    return list;
  }, [activeUsers, latestBlogDate]);

  return (
    <div className="mx-auto mb-6 flex max-w-3xl flex-wrap items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="rounded-full border border-slate-300/60 bg-white/50 px-3 py-1 transition hover:border-amber-400/40 hover:text-amber-700 dark:border-slate-700/60 dark:bg-slate-900/50 dark:hover:text-amber-200"
        >
          <span className="text-slate-400 dark:text-slate-500">
            {item.label}:
          </span>{" "}
          {item.value}
        </Link>
      ))}
    </div>
  );
}
