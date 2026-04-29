import dynamic from 'next/dynamic';
import HomePageClient from '@/components/home/HomePageClient';
import { getBlogPostMeta } from '@/lib/blog';

const AboutSection = dynamic(() => import('@/components/sections/AboutSection'), {
  loading: () => (
    <div className="w-full min-h-[420px] neural-card-soft rounded-xl animate-pulse" />
  ),
});

export default function Home() {
  const latestPost = getBlogPostMeta()[0];

  return (
    <HomePageClient latestPost={latestPost}>
      <AboutSection />
    </HomePageClient>
  );
}
