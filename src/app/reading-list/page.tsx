import NeuralPageIntro from '@/components/ui/NeuralPageIntro';
import ReadingListClient from '@/components/blog/ReadingListClient';
import { getBlogPostMeta } from '@/lib/blog';

export default function ReadingListPage() {
  const allPosts = getBlogPostMeta();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between neural-page-shell gap-4 sm:gap-5">
      <NeuralPageIntro
        title="Reading List"
        subtitle="A lightweight local reading workspace with bookmarks, revisit history, and updates that landed since your last changelog check."
        chips={['Bookmarks', 'History', 'Since Last Visit']}
        theme="blog"
      />
      <section className="w-full rounded-[28px] border border-sky-400/10 bg-gradient-to-br from-sky-950/20 via-slate-950/70 to-slate-950/85 px-4 py-5 sm:px-6">
        <div className="grid gap-3 sm:grid-cols-[1.2fr,0.8fr] sm:items-end">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-sky-300">Local reading workspace</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-100">Your saved posts, recent reads, and fresh updates in one place.</h2>
          </div>
          <p className="text-sm leading-6 text-slate-400">
            This page is personal to the browser you’re on, so it works like a lightweight portfolio reading desk without needing an account.
          </p>
        </div>
      </section>
      <ReadingListClient allPosts={allPosts} />
    </main>
  );
}
