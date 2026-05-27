import type { MetadataRoute } from "next";
import { DEPLOY } from "@/lib/brand";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: `${DEPLOY.baseUrl}/sitemap.xml`,
    host: DEPLOY.baseUrl,
  };
}
