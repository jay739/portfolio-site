'use client';

import { useEffect, useState } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}

export default function BlogTableOfContents() {
  const [items, setItems] = useState<TocItem[]>([]);

  useEffect(() => {
    const headings = Array.from(document.querySelectorAll('article .prose h2, article .prose h3')) as HTMLElement[];
    const nextItems = headings.map((heading) => {
      if (!heading.id) {
        heading.id = slugify(heading.textContent || 'section');
      }
      return {
        id: heading.id,
        text: heading.textContent || 'Section',
        level: heading.tagName === 'H3' ? 3 : 2,
      };
    });
    setItems(nextItems);
  }, []);

  if (items.length < 2) return null;

  return (
    <aside className="mb-8 rounded-2xl border border-slate-700/60 bg-slate-950/35 p-4">
      <p className="text-xs uppercase tracking-wider text-amber-300">On this page</p>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={`block text-sm text-slate-300 transition hover:text-amber-200 ${item.level === 3 ? 'pl-4 text-xs' : ''}`}
          >
            {item.text}
          </a>
        ))}
      </div>
    </aside>
  );
}
