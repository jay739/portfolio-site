import { renderOgImage, ogSize, ogContentType } from "@/lib/og-template";

export const runtime = "nodejs";
export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Contact Interface — Jayakrishna Konda";

export default function Image() {
  return renderOgImage({
    eyebrow: "Portfolio",
    title: "Contact Interface",
    subtitle: "Hiring, collaboration, and consulting inquiries.",
  });
}
