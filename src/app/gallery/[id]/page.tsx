import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getGalleryImage } from "@/lib/gallery";

interface GalleryImagePageProps {
  params: Promise<{ id: string }>;
}

// The manifest changes at runtime as new images are saved, so resolve ids on
// demand rather than baking a fixed set at build time.
export const dynamic = "force-dynamic";

function shortPrompt(prompt: string, max = 70): string {
  const clean = prompt.trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
}

export async function generateMetadata({
  params,
}: GalleryImagePageProps): Promise<Metadata> {
  const { id } = await params;
  const image = getGalleryImage(id);
  if (!image) return { title: "Image Not Found" };

  const title = shortPrompt(image.prompt);
  const path = `/gallery/${image.id}`;
  // Note: no explicit `images:` here, so Next auto-wires this segment's
  // opengraph-image.tsx (which renders the actual image) as the OG/Twitter card.
  return {
    title,
    description: image.prompt,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      url: `https://jay739.dev${path}`,
      title,
      description: image.prompt,
      siteName: "Jayakrishna Konda Portfolio",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: image.prompt,
    },
  };
}

export default async function GalleryImagePage({
  params,
}: GalleryImagePageProps) {
  const { id } = await params;
  const image = getGalleryImage(id);
  if (!image) notFound();

  const cleanModel = (image.model ?? "").replace(".safetensors", "");
  const facts = [
    image.style && image.style !== "none" ? image.style : null,
    `${image.width}×${image.height}`,
    image.seed != null ? `seed ${image.seed}` : null,
    cleanModel || null,
  ].filter(Boolean) as string[];

  return (
    <div className="flex min-h-screen flex-col items-center neural-page-shell gap-6">
      <div className="w-full max-w-4xl">
        <div className="mb-6">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 text-amber-300 transition-colors hover:text-amber-200 neural-pill"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Gallery
          </Link>
        </div>

        <article className="neural-card neural-glow-border overflow-hidden rounded-2xl shadow-lg">
          <div className="flex items-center justify-center bg-slate-950/40 p-4">
            <Image
              src={`/api/gallery/image/${image.filename}`}
              alt={image.prompt}
              width={image.width}
              height={image.height}
              sizes="(max-width: 768px) 100vw, 768px"
              className="h-auto w-auto max-h-[75vh] max-w-full rounded-lg object-contain"
              priority
              unoptimized
            />
          </div>
          <div className="p-6 md:p-8">
            <p className="text-[11px] uppercase tracking-widest text-amber-300">
              Generated image
            </p>
            <h1 className="mt-2 text-lg font-semibold leading-relaxed text-slate-100">
              {image.prompt}
            </h1>
            <div className="mt-4 flex flex-wrap gap-2">
              {facts.map((fact) => (
                <span
                  key={fact}
                  className="rounded-full bg-slate-500/20 px-3 py-1 text-xs text-slate-300"
                >
                  {fact}
                </span>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/gallery?image=${image.id}`}
                className="neural-pill-intro px-4 py-2 text-sm text-amber-200 transition hover:text-amber-100"
              >
                View in full gallery
              </Link>
              <Link
                href="/ai-tools?tool=image-generator"
                className="text-sm text-slate-400 transition hover:text-amber-200"
                style={{ alignSelf: "center" }}
              >
                Generate your own →
              </Link>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
