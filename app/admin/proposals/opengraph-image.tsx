import { routeOg } from "@/lib/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Foresight — Public proposal review queue";

export default function OG() {
  return routeOg({
    tag: "Proposal queue",
    title: "Every proposed market, reviewed in public.",
    bullets: [
      "Public queue",
      "48h SLA",
      "Auditable decisions",
    ],
    path: "/admin/proposals",
  });
}
