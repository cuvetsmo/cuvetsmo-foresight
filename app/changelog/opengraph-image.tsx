import { routeOg } from "@/lib/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Foresight — Public changelog";

export default function OG() {
  return routeOg({
    tag: "Changelog",
    title: "What shipped. What's limited. What's next.",
    bullets: [
      "Every release",
      "Known limits surfaced",
      "Transparency as default",
    ],
    path: "/changelog",
  });
}
