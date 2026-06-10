import fs from "fs";
import { ImageResponse } from "next/og";
import { getGalleryImage, galleryImagePath } from "@/lib/gallery";
import { renderOgImage, ogSize, ogContentType } from "@/lib/og-template";

// nodejs runtime: we read the rendered PNG off the mounted volume and embed it.
export const runtime = "nodejs";
export const size = ogSize;
export const contentType = ogContentType;
export const alt = "AI-generated image — Jayakrishna Konda";

function mimeFor(filename: string): string {
  if (filename.endsWith(".jpg") || filename.endsWith(".jpeg"))
    return "image/jpeg";
  if (filename.endsWith(".webp")) return "image/webp";
  return "image/png";
}

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const image = getGalleryImage(id);

  // Fall back to the branded template card if the image is missing or
  // unreadable, so a stale/share link never produces a broken preview.
  let dataUrl: string | null = null;
  if (image) {
    try {
      const bytes = fs.readFileSync(galleryImagePath(image.filename));
      dataUrl = `data:${mimeFor(image.filename)};base64,${bytes.toString("base64")}`;
    } catch {
      dataUrl = null;
    }
  }

  if (!image || !dataUrl) {
    return renderOgImage({
      eyebrow: "AI Gallery",
      title: "Generated image",
      subtitle: "Self-hosted generative art on jay739.dev.",
    });
  }

  const caption =
    image.prompt.length > 120
      ? `${image.prompt.slice(0, 119).trimEnd()}…`
      : image.prompt;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background: "#0b0f1a",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* The actual generated image, fitted so any aspect ratio looks right. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={dataUrl}
        alt=""
        width={1200}
        height={630}
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
      />
      {/* Bottom gradient + prompt caption with the brand mark. */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          gap: 6,
          padding: "28px 40px 24px",
          background:
            "linear-gradient(180deg, rgba(11,15,26,0) 0%, rgba(11,15,26,0.82) 60%, rgba(11,15,26,0.96) 100%)",
        }}
      >
        <div
          style={{
            fontSize: 22,
            color: "#fbbf24",
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          jay739.dev · AI Gallery
        </div>
        <div style={{ fontSize: 30, color: "#f1f5f9", lineHeight: 1.25 }}>
          {caption}
        </div>
      </div>
    </div>,
    { ...ogSize },
  );
}
