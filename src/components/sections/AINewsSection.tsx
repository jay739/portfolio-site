'use client';
import { useEffect, useState } from 'react';
import { DynamicIcon } from '@/lib/icons';
import { motion } from 'framer-motion';

interface NewsItem {
  title: string;
  summary: string;
  url: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

export default function AINewsSection() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    async function fetchNews() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/ai-news');
        if (!res.ok) throw new Error('Failed to fetch news');
        const data = await res.json();
        setNews(data.articles || []);
      } catch (e) {
        setError('Could not load news. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
    const interval = setInterval(fetchNews, 300000); // Refresh every 5 min
    return () => clearInterval(interval);
  }, []);

  const filteredNews = news.filter((item) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return item.title.toLowerCase().includes(q) || item.summary.toLowerCase().includes(q);
  });

  return (
    <section className="w-full my-16 p-4 sm:p-8 neural-card neural-glow-border" id="ai-news">
      <div className="flex items-center gap-2 mb-4">
        <DynamicIcon name="openai" className="text-2xl text-violet-500" />
        <h2 className="neural-section-title">AI & Tech News</h2>
      </div>
      <p className="neural-section-copy mb-3">
        A curated stream of high-signal AI updates with fast scanability.
      </p>
      <div className="mb-5">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by topic, model, or company..."
          className="neural-input max-w-md"
        />
      </div>
      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 neural-card-soft rounded-lg"></div>
          ))}
        </div>
      ) : error ? (
        <div className="text-red-400 text-center">{error}</div>
      ) : (
        <motion.div
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredNews.map((item, idx) => (
            <motion.a
              key={idx}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block neural-panel neural-card-soft transition-all hover:scale-[1.02] border border-transparent hover:border-accent/20"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <h4 className="font-medium text-slate-100 mb-2 group-hover:text-primary transition-colors">
                {item.title}
              </h4>
              <p className="text-sm text-slate-300">
                {item.summary}
              </p>
              <div className="mt-2 flex items-center text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Read more</span>
                <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </motion.a>
          ))}
          {filteredNews.length === 0 && (
            <div className="text-sm text-slate-300 py-6 text-center">
              No updates match this filter.
            </div>
          )}
        </motion.div>
      )}
    </section>
  );
} 