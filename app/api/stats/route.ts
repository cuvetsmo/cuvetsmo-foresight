import { NextResponse } from "next/server";
import { BRAND, DEPLOY } from "@/lib/brand";
import { listMarkets } from "@/lib/markets";
import { CATEGORIES } from "@/lib/types";

export const runtime = "nodejs";
export const revalidate = 60;

/**
 * GET /api/stats
 *
 * One-shot stats. Press dashboards, status pages, ecosystem
 * widgets. NEVER includes private state (volume per user, waitlist
 * emails, anything user-identifying).
 *
 * Aggregates over the public market catalogue only. Resolver mode is
 * the same boolean /api/resolve/status reports, repeated here so a
 * single fetch tells a dashboard everything.
 */
const PROVIDER_ENV: Record<string, string> = {
  groq: "GROQ_API_KEY",
  cerebras: "CEREBRAS_API_KEY",
  sambanova: "SAMBANOVA_API_KEY",
  openrouter: "OPENROUTER_API_KEY",
  mistral: "MISTRAL_API_KEY",
};

export async function GET() {
  const markets = await listMarkets();

  const byCategory = CATEGORIES.map((c) => ({
    key: c.key,
    label: c.labelEn,
    count: markets.filter((m) => m.category === c.key).length,
  })).filter((c) => c.count > 0);

  const byStatus = {
    open: markets.filter((m) => m.status === "open").length,
    closingSoon: markets.filter((m) => m.status === "closing-soon").length,
    resolved: markets.filter((m) => m.status === "resolved").length,
  };

  const sampleCount = markets.filter((m) => m.isSample).length;
  const realCount = markets.length - sampleCount;

  const providersConfigured: string[] = [];
  for (const [name, envKey] of Object.entries(PROVIDER_ENV)) {
    if (process.env[envKey] && process.env[envKey]!.length > 8) {
      providersConfigured.push(name);
    }
  }

  return NextResponse.json(
    {
      name: BRAND.name,
      baseUrl: DEPLOY.baseUrl,
      phase: "0",
      generatedAt: new Date().toISOString(),
      markets: {
        total: markets.length,
        sample: sampleCount,
        real: realCount,
        byStatus,
        byCategory,
      },
      verifier: {
        mode: providersConfigured.length > 0 ? "live" : "fallback",
        providersConfigured,
        providersAvailable: Object.keys(PROVIDER_ENV),
      },
      mcp: {
        package: "foresight-mcp",
        sourceVersion: "0.2.0",
        npmPublished: false, // flip to true after `npm publish` from cuvetsmo-foresight-mcp/
        tools: [
          "foresight_list_markets",
          "foresight_get_market",
          "foresight_propose_market",
          "foresight_resolve_check",
          "foresight_stream_events",
        ],
        sourceUrl: "https://github.com/cuvetsmo/cuvetsmo-foresight-mcp",
      },
      docs: {
        openapi: "/api/openapi.json",
        developerPage: "/docs",
        changelog: "/changelog",
      },
    },
    {
      headers: {
        "Cache-Control": "public, max-age=30, s-maxage=60, stale-while-revalidate=300",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
      },
    },
  );
}
