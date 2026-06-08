import { renderOgImage, ogSize, ogContentType } from "@/lib/og-template";

export const runtime = "nodejs";
export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Reading List — Jayakrishna Konda";

export default function Image() {
  return renderOgImage({
    eyebrow: "Portfolio",
    title: "Reading List",
    subtitle: "Books, papers, and articles worth your time.",
  });
}
