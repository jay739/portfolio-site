import { renderOgImage, ogSize, ogContentType } from "@/lib/og-template";

export const runtime = "nodejs";
export const size = ogSize;
export const contentType = ogContentType;
export const alt = "AI News Feed — Jayakrishna Konda";

export default function Image() {
  return renderOgImage({
    eyebrow: "Portfolio",
    title: "AI News Feed",
    subtitle: "Curated AI launches, research, and tooling updates.",
  });
}
