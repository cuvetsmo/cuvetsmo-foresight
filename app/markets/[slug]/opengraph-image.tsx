import { ImageResponse } from "next/og";
import { getMarketBySlug } from "@/lib/markets";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Params {
  params: Promise<{ slug: string }>;
}

export default async function MarketOG({ params }: Params) {
  const { slug } = await params;
  const market = await getMarketBySlug(slug);
  if (!market) {
    return defaultOG();
  }
  const yesPct = Math.round(market.yesProbability * 100);
  const noPct = 100 - yesPct;
  const question = market.questionEn ?? market.question;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#FAFAFA",
          padding: "72px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          color: "#020617",
          fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
        }}
      >
        {/* Top: wordmark + status pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "#020617",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="white" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 17 L9 11 L13 14 L21 5" />
                <circle cx="21" cy="5" r="1.8" fill="#10B981" stroke="none" />
              </svg>
            </span>
            <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em" }}>
              Foresight
            </span>
          </div>
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              padding: "8px 16px",
              borderRadius: 9999,
              background: "#D1FAE5",
              color: "#047857",
              border: "1px solid rgba(16,185,129,0.3)",
            }}
          >
            LIVE
          </span>
        </div>

        {/* Middle: question */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 1060 }}>
          <span style={{ fontSize: 16, color: "#475569", letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 600 }}>
            {market.category.replace(/-/g, " ")}
          </span>
          <span
            style={{
              fontSize: question.length > 80 ? 50 : 64,
              fontWeight: 700,
              letterSpacing: "-0.025em",
              lineHeight: 1.1,
            }}
          >
            {question}
          </span>
        </div>

        {/* Bottom: probability + meta */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 14, color: "#475569", textTransform: "uppercase", letterSpacing: "0.16em", fontWeight: 600 }}>
              YES probability
            </span>
            <span style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
              <span style={{ fontSize: 96, fontWeight: 700, color: "#047857", letterSpacing: "-0.02em" }}>
                {yesPct}%
              </span>
              <span style={{ fontSize: 22, color: "#94A3B8" }}>NO {noPct}%</span>
            </span>
          </div>
          <span
            style={{
              fontSize: 18,
              color: "#94A3B8",
              fontFamily: "monospace",
            }}
          >
            foresight.cuvetsmo.com
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}

function defaultOG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#020617",
          color: "white",
          padding: 80,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 64,
          fontWeight: 700,
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        Foresight
      </div>
    ),
    { ...size },
  );
}
