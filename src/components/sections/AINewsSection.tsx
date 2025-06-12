'use client';
import { useEffect, useState } from 'react';
import { SiOpenai } from 'react-icons/si';

interface NewsItem {
  title: string;
  summary: string;
  url: string;
}

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
        <SiOpenai className="text-2xl text-blue-500" />
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
        <div className="space-y-4">
          {news.map((item, idx) => (
            <a
              key={idx}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-white/5 dark:bg-slate-600/20 rounded-lg hover:bg-white/10 dark:hover:bg-slate-600/30 transition-colors"
            >
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                {item.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {item.summary}
              </p>
            </a>
          ))}
        </div>
      )}
    </section>
  );
} 