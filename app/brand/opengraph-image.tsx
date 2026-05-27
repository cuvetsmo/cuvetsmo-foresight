import { routeOg } from "@/lib/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Foresight — Press + brand kit";

export default function OG() {
  return routeOg({
    tag: "Press + brand kit",
    title: "Brand assets + press one-liners.",
    bullets: [
      "Wordmark + mark",
      "Color tokens",
      "Boilerplate copy",
    ],
    path: "/brand",
  });
}
