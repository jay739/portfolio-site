import { renderOgImage, ogSize, ogContentType } from "@/lib/og-template";

export const runtime = "nodejs";
export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Skills Graph — Jayakrishna Konda";

export default function Image() {
  return renderOgImage({
    eyebrow: "Portfolio",
    title: "Skills Graph",
    subtitle: "Interactive skill topology and domain map.",
  });
}
