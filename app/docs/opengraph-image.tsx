import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Foresight — Developer docs · API + MCP";

/**
 * /docs OG card. Developer-flavored: code monospace, endpoint list,
 * keeps the brand mark + emerald accent. Different enough from the
 * default landing OG that a /docs share preview reads as "this is
 * the docs page" at a glance.
 */
export default function OG() {
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
            Developer docs
          </span>
        </div>

        {/* Middle: title + endpoint list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <span
            style={{
              fontSize: 76,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              maxWidth: 1020,
            }}
          >
            Build forecasting into your agent.
          </span>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              fontFamily: "monospace",
              fontSize: 22,
              color: "rgba(255,255,255,0.78)",
              maxWidth: 1020,
            }}
          >
            <div style={{ display: "flex", gap: 18 }}>
              <span style={{ color: "#6EE7B7", minWidth: 64 }}>GET</span>
              <span>/api/markets</span>
            </div>
            <div style={{ display: "flex", gap: 18 }}>
              <span style={{ color: "#FCD34D", minWidth: 64 }}>POST</span>
              <span>/api/resolve</span>
            </div>
            <div style={{ display: "flex", gap: 18 }}>
              <span style={{ color: "#6EE7B7", minWidth: 64 }}>GET</span>
              <span>/api/cross-venue</span>
            </div>
            <div style={{ display: "flex", gap: 18 }}>
              <span style={{ color: "#FCD34D", minWidth: 64 }}>POST</span>
              <span>/api/waitlist</span>
            </div>
            <div style={{ display: "flex", gap: 18 }}>
              <span style={{ color: "rgba(255,255,255,0.4)", minWidth: 64 }}>MCP</span>
              <span>5 tools · npx foresight-mcp@latest</span>
            </div>
          </div>
        </div>

        {/* Bottom: footer */}
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
            <span>OpenAPI 3.1</span>
            <span style={{ color: "rgba(255,255,255,0.25)" }}>·</span>
            <span>No API key</span>
            <span style={{ color: "rgba(255,255,255,0.25)" }}>·</span>
            <span>Public + CORS open</span>
          </div>
          <span style={{ fontFamily: "monospace" }}>
            foresight.cuvetsmo.com/docs
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
