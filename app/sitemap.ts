import type { MetadataRoute } from "next";
import { DEPLOY } from "@/lib/brand";
import { listMarkets } from "@/lib/markets";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = DEPLOY.baseUrl;
  const now = new Date();
  const markets = await listMarkets();
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
    {
      url: `${base}/resolver`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${base}/docs`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${base}/changelog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${base}/brand`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${base}/admin/proposals`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.4,
    },
    {
      url: `${base}/api/openapi.json`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.3,
    },
    ...markets.map((m) => ({
      url: `${base}/markets/${m.slug}`,
      lastModified: now,
      changeFrequency: "hourly" as const,
      priority: 0.7,
    })),
  ];
}
