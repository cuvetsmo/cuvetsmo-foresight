import type { MetadataRoute } from "next";
import { MARKETS } from "@/lib/markets";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://foresight.cuvetsmo.com";
  const now = new Date();
  return [
    {
      url: `${base}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/markets`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...MARKETS.map((m) => ({
      url: `${base}/markets/${m.slug}`,
      lastModified: now,
      changeFrequency: "hourly" as const,
      priority: 0.7,
    })),
  ];
}
