import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Foresight — Forecast the things that matter";

/**
 * Default OG image for the landing page + any route that doesn't override.
 * Dark slate canvas, emerald checkmark mark, hero tagline, brand wordmark.
 *
 * Dynamic generation via next/og — no asset pipeline, no Figma export.
 */
export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(135deg, #020617 0%, #0F172A 60%, #064E3B 100%)",
          padding: "80px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          color: "white",
          fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
        }}
      >
        {/* Top mark */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <span
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              width="40"
              height="40"
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
          <span style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.02em" }}>
            Foresight
          </span>
        </div>

        {/* Middle: tagline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <span
            style={{
              fontSize: 16,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#10B981",
              fontWeight: 600,
            }}
          >
            A forecasting marketplace
          </span>
          <span
            style={{
              fontSize: 88,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              maxWidth: 960,
            }}
          >
            Forecast the things that matter.
          </span>
          <span
            style={{
              fontSize: 26,
              color: "rgba(255,255,255,0.75)",
              lineHeight: 1.5,
              maxWidth: 880,
              marginTop: 12,
            }}
          >
            Regional politics, climate, disease outbreaks, frontier research —
            the markets the world&apos;s biggest exchanges overlook.
          </span>
        </div>

        {/* Bottom: feature row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: "rgba(255,255,255,0.55)",
            fontSize: 18,
          }}
        >
          <div style={{ display: "flex", gap: 32 }}>
            <span>Public resolution</span>
            <span style={{ color: "rgba(255,255,255,0.25)" }}>·</span>
            <span>Named sources</span>
            <span style={{ color: "rgba(255,255,255,0.25)" }}>·</span>
            <span>MCP-native</span>
          </div>
          <span style={{ fontFamily: "monospace" }}>foresight.cuvetsmo.com</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
