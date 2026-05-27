import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#020617",
          borderRadius: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ width: 110, height: 110 }}
        >
          <path d="M3 17 L9 11 L13 14 L21 5" />
          <circle cx="21" cy="5" r="1.8" fill="#10B981" stroke="none" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
