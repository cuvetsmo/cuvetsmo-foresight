import { NextResponse } from "next/server";
import { BRAND, DEPLOY } from "@/lib/brand";

/**
 * Public health probe. Phase 0: returns build identity and deployment URL.
 * Phase 1 will extend to report Supabase reachability, MCP server status,
 * resolver queue depth, and latest-deploy commit SHA.
 */
export async function GET() {
  return NextResponse.json({
    name: BRAND.name,
    status: "ok",
    phase: "0",
    baseUrl: DEPLOY.baseUrl,
    educationalBeta: DEPLOY.educationalBeta,
    timestamp: new Date().toISOString(),
  });
}
