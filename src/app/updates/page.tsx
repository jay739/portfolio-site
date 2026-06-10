"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import NeuralPageIntro from "@/components/ui/NeuralPageIntro";
import { latestSiteUpdateTimestamp, siteUpdates } from "@/data/site-updates";
import { markUpdatesSeen } from "@/lib/site-ux";

const PAGE_SIZE = 6;

export default function UpdatesPage() {
  // Show the most recent few up front; reveal older entries on demand so the
  // changelog does not become an overwhelming wall on first load.
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    markUpdatesSeen(latestSiteUpdateTimestamp);
  }, []);

  const visibleUpdates = siteUpdates.slice(0, visibleCount);
  const remaining = siteUpdates.length - visibleUpdates.length;

  return (
    <main className="flex min-h-screen flex-col items-center justify-between neural-page-shell gap-4 sm:gap-5">
      <NeuralPageIntro
        title="What’s New"
        subtitle="A compact changelog for repeat visitors who want to see what has changed across the portfolio."
        chips={["Changelog", "Recent Improvements", "Portfolio Updates"]}
        theme="blog"
      />
      <section className="w-full neural-card neural-glow-border p-4 sm:p-6 md:p-8 bg-gradient-to-br from-sky-50 via-slate-50 to-sky-100 dark:from-sky-950/30 dark:via-slate-950/70 dark:to-slate-950/80">
        <div className="space-y-4">
          {visibleUpdates.map((update) => (
            <article
              key={`${update.date}-${update.title}`}
              className="rounded-2xl border border-slate-700/55 bg-slate-950/35 p-5"
            >
              <p className="text-[11px] uppercase tracking-widest text-amber-300">
                {update.date}
              </p>
              <h2 className="mt-2 text-lg font-semibold text-slate-100">
                {update.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {update.details}
              </p>
              {update.href && (
                <Link
                  href={update.href}
                  className="mt-3 inline-flex text-xs text-amber-300 hover:text-amber-200"
                >
                  Open related surface →
                </Link>
              )}
            </article>
          ))}
        </div>
        {remaining > 0 && (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() =>
                setVisibleCount((c) =>
                  Math.min(c + PAGE_SIZE, siteUpdates.length),
                )
              }
              className="neural-pill-intro px-4 py-2 text-sm text-amber-200 transition hover:text-amber-100"
            >
              Show {Math.min(PAGE_SIZE, remaining)} more
              <span className="ml-1 text-slate-400">({remaining} older)</span>
            </button>
          </div>
        )}
        {visibleCount > PAGE_SIZE && (
          <div className="mt-3 flex justify-center">
            <button
              type="button"
              onClick={() => setVisibleCount(PAGE_SIZE)}
              className="text-xs text-slate-400 transition hover:text-amber-200"
            >
              Collapse
            </button>
          </div>
        )}
        <div className="mt-8 rounded-2xl border border-slate-700/55 bg-slate-950/35 p-5">
          <p className="text-sm text-slate-300">
            Want to suggest any improvements or new features?{" "}
            <Link
              href="/contact"
              className="text-amber-300 hover:text-amber-200"
            >
              Send a suggestion
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
