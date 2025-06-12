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

  return (
    <section className="w-full my-16 p-4 sm:p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg" id="ai-news">
      <div className="flex items-center gap-2 mb-4">
        <DynamicIcon name="openai" className="text-2xl text-blue-500" />
        <h2 className="text-2xl font-bold">AI & Tech News</h2>
      </div>
      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          ))}
        </div>
      ) : error ? (
        <div className="text-red-600 text-center">{error}</div>
      ) : (
        <motion.div
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {news.map((item, idx) => (
            <motion.a
              key={idx}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block p-4 bg-white/5 dark:bg-slate-600/20 rounded-lg hover:bg-white/10 dark:hover:bg-slate-600/30 transition-all hover:scale-[1.02] border border-transparent hover:border-accent/20"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 group-hover:text-primary transition-colors">
                {item.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
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
        </motion.div>
      )}
    </section>
  );
} 