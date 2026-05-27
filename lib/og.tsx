import { ImageResponse } from "next/og";

/**
 * Shared OG card factory. Per-route opengraph-image.tsx files import
 * `routeOg()` instead of duplicating layout + brand boilerplate.
 *
 * Visual contract: dark slate canvas + emerald accent + brand mark
 * top-left + route tag chip top-right + display headline + 3 bullet
 * monoline footer + URL stamp bottom-right. Same as the landing OG
 * shape but with per-route content.
 *
 * Don't add fonts here — next/og resolves the system font stack;
 * adding Inter via fetch costs every cold start.
 */
export interface RouteOgProps {
  /** Top-right chip label (e.g., "Verifier · dry-run") */
  tag: string;
  /** Display headline. Keep ≤ 70 chars for legibility at 1200×630. */
  title: string;
  /** 3 short bullets shown on the bottom row, separated by middle dots. */
  bullets: string[];
  /** URL path stamp bottom-right, e.g., "/resolver" */
  path: string;
}

/**
 * Note: each route's opengraph-image.tsx must inline its own `runtime`,
 * `size`, `contentType` exports as literal strings — Next.js statically
 * analyzes these at build time and rejects imported constants. The
 * factory exports only the image-builder.
 */
export function routeOg({ tag, title, bullets, path }: RouteOgProps) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(135deg, #020617 0%, #0F172A 55%, #0B3D2F 100%)",
          padding: "80px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          color: "white",
          fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
        }}
      >
        {/* Top: brand + section tag */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <span
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                viewBox="0 0 24 24"
                width="34"
                height="34"
                fill="none"
                stroke="#020617"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 17 L9 11 L13 14 L21 5" />
                <circle cx="21" cy="5" r="1.8" fill="#10B981" stroke="none" />
              </svg>
            </span>
            <span style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em" }}>
              Foresight
            </span>
          </div>
          <span
            style={{
              fontSize: 16,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#6EE7B7",
              fontWeight: 600,
              padding: "10px 18px",
              border: "1px solid rgba(110,231,183,0.3)",
              borderRadius: 999,
            }}
          >
            {tag}
          </span>
        </div>

        {/* Middle: headline */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontSize: 84,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              maxWidth: 1020,
            }}
          >
            {title}
          </span>
        </div>

        {/* Bottom: bullets + path stamp */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: "rgba(255,255,255,0.55)",
            fontSize: 18,
          }}
        >
          <div style={{ display: "flex", gap: 26 }}>
            {bullets.map((b, i) => (
              <span key={i} style={{ display: "flex", alignItems: "center", gap: 26 }}>
                {i > 0 && (
                  <span style={{ color: "rgba(255,255,255,0.25)" }}>·</span>
                )}
                <span>{b}</span>
              </span>
            ))}
          </div>
          <span style={{ fontFamily: "monospace" }}>
            foresight.cuvetsmo.com{path}
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
