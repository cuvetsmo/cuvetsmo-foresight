import { NextResponse } from "next/server";
import { listMarkets } from "@/lib/markets";

export const runtime = "nodejs";
export const revalidate = 60;

/**
 * GET /api/markets
 *
 * Public read of every market in the live Foresight Supabase. Returns
 * the SAME shape the web app uses (mapped via lib/markets.ts) so the
 * MCP server, Magic-MCP component generators, and any external
 * consumer can pull a single source of truth.
 *
 * Cache: 60s revalidate at the Next layer, plus an extra in-process
 * cache via lib/markets.ts. The MCP server adds its own 5-min cache
 * on top so a single `foresight_list_markets` call doesn't round-trip
 * to Vercel on every invocation.
 *
 * NEVER returns service-role data or any field the public surface
 * doesn't already render — same `Market` shape exposed by the web UI.
 */
export async function GET() {
  const markets = await listMarkets();
  return NextResponse.json(
    {
      version: 1,
      count: markets.length,
      generatedAt: new Date().toISOString(),
      markets,
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
