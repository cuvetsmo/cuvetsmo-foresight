import { routeOg } from "@/lib/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Foresight — Try the multi-source verifier";

export default function OG() {
  return routeOg({
    tag: "Verifier · dry-run",
    title: "Try the verifier on any question.",
    bullets: [
      "Multi-source resolver",
      "Refuse > fabricate",
      "Confidence ≥ 0.85",
    ],
    path: "/resolver",
  });
}
