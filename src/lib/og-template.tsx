import { ImageResponse } from "next/og";

// Shared Open Graph card template (1200x630) used by every route's
// `opengraph-image.tsx`. One branded amber design, with the page title /
// subtitle / eyebrow / tags injected per route — so each page gets a unique,
// on-brand social preview instead of one generic image.

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

export interface OgParams {
  /** Small amber label above the title, e.g. "Blog", "Projects", a date. */
  eyebrow?: string;
  /** The headline. */
  title: string;
  /** Optional descriptive line under the title. */
  subtitle?: string;
  /** Optional pill chips along the bottom (e.g. post tags). */
  tags?: string[];
}

// Scale the headline down as it gets longer so it never overflows the card.
function titleFontSize(title: string): number {
  const len = title.length;
  if (len > 64) return 52;
  if (len > 44) return 62;
  if (len > 28) return 74;
  return 84;
}

export function renderOgImage({ eyebrow, title, subtitle, tags }: OgParams) {
  const chips = (tags ?? []).filter(Boolean).slice(0, 4);
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px",
        background:
          "linear-gradient(135deg, #07111f 0%, #111827 52%, #172554 100%)",
        color: "#f8fafc",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Header: brand mark + domain */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            color: "#fbbf24",
            fontSize: 28,
            fontWeight: 700,
          }}
        >
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 999,
              background: "#f59e0b",
            }}
          />
          Jayakrishna Konda
        </div>
        <div style={{ color: "#93c5fd", fontSize: 24, fontWeight: 700 }}>
          jay739.dev
        </div>
      </div>

      {/* Body: eyebrow + title + subtitle */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {eyebrow ? (
          <div style={{ color: "#fbbf24", fontSize: 32, fontWeight: 700 }}>
            {eyebrow}
          </div>
        ) : null}
        <div
          style={{
            display: "flex",
            maxWidth: 1000,
            fontSize: titleFontSize(title),
            lineHeight: 1.02,
            fontWeight: 900,
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div
            style={{
              display: "flex",
              maxWidth: 1000,
              color: "#cbd5e1",
              fontSize: 32,
              lineHeight: 1.25,
              fontWeight: 500,
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>

      {/* Footer: tag chips (or a subtle brand strip if none) */}
      <div style={{ display: "flex", gap: 16 }}>
        {chips.length > 0 ? (
          chips.map((label) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid rgba(251, 191, 36, 0.42)",
                borderRadius: 999,
                padding: "12px 20px",
                background: "rgba(15, 23, 42, 0.72)",
                color: "#e5e7eb",
                fontSize: 22,
                fontWeight: 700,
              }}
            >
              {label}
            </div>
          ))
        ) : (
          <div
            style={{
              display: "flex",
              height: 6,
              width: 220,
              borderRadius: 999,
              background:
                "linear-gradient(90deg, #f59e0b 0%, #fbbf24 60%, rgba(251,191,36,0) 100%)",
            }}
          />
        )}
      </div>
    </div>,
    ogSize,
  );
}
