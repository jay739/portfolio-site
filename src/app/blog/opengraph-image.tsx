import { renderOgImage, ogSize, ogContentType } from "@/lib/og-template";

export const runtime = "nodejs";
export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Blog — Jayakrishna Konda";

export default function Image() {
  return renderOgImage({
    eyebrow: "Portfolio",
    title: "Blog",
    subtitle: "Homelab, AI engineering, and build logs.",
  });
}
