import fs from 'fs';
import path from 'path';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import GalleryCarousel, { type GalleryItem } from '@/components/sections/GalleryCarousel';
import PodcastGallery, { type PodcastItem } from '@/components/sections/PodcastGallery';
import NeuralPageIntro from '@/components/ui/NeuralPageIntro';
import RouteNextSteps from '@/components/layout/RouteNextSteps';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'AI Gallery',
  description:
    'AI-generated images and podcasts produced on self-hosted Batcave infrastructure with ComfyUI, Ollama, and neural text-to-speech.',
  path: '/gallery',
});

// The manifests live on a mounted volume that changes at runtime, so we must
// re-read them on every request instead of caching the SSR result at build time.
export const dynamic = 'force-dynamic';

function readManifest<T>(relativePath: string): T[] {
  try {
    const manifestPath = path.join(process.cwd(), relativePath);
    const raw = fs.readFileSync(manifestPath, 'utf8');
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as unknown as T[]) : [];
  } catch {
    return [];
  }
}

export default function GalleryPage() {
  const initialImages = readManifest<GalleryItem>('public/images/gallery/manifest.json');
  const initialPodcasts = readManifest<PodcastItem>('public/images/gallery/podcasts/manifest.json');

  return (
    <main className="flex min-h-screen flex-col items-center justify-between neural-page-shell gap-4 sm:gap-5">
      <NeuralPageIntro
        title="AI Showcase"
        subtitle="Images and podcasts generated on self-hosted Batcave infrastructure — Apple M4 Metal GPU, ComfyUI for images, Ollama + Piper/Kokoro/Bark for podcasts."
        chips={['Stable Diffusion', 'ComfyUI', 'Piper TTS', 'Kokoro-82M', 'Apple M4', 'Self-Hosted']}
        theme="gallery"
      />
      <section id="gallery" className="w-full">
        <Suspense fallback={<div className="w-full min-h-[420px] neural-card-soft rounded-xl animate-pulse" />}>
          <GalleryCarousel initialItems={initialImages} />
        </Suspense>
      </section>
      <section id="podcasts" className="w-full">
        <Suspense fallback={<div className="w-full min-h-[200px] neural-card-soft rounded-xl animate-pulse" />}>
          <PodcastGallery initialItems={initialPodcasts} />
        </Suspense>
      </section>
      <RouteNextSteps
        items={[
          { href: '/ai-tools?tool=image-generator', label: 'Generate an image', note: 'Open the image generator with shareable presets.' },
          { href: '/ai-tools', label: 'Generate a podcast', note: 'Upload a PDF and pick a voice engine.' },
          { href: '/homeserver?lite=1', label: 'See the runtime stack', note: 'Inspect the public-safe telemetry behind the visuals.' },
        ]}
      />
    </main>
  );
}
