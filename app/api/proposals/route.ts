import { NextResponse } from "next/server";
import { listProposals } from "@/lib/proposals";

export const runtime = "nodejs";
export const revalidate = 30;

/**
 * GET /api/proposals
 *
 * Public read of the market proposal queue. Mirrors the UI rendered at
 * /admin/proposals — single source of truth, no second list. Useful for:
 *   - external dashboards tracking what's been proposed
 *   - press contacts wanting evidence of transparent review
 *   - downstream agents wanting to surface "your category has N pending"
 *
 * Phase 0 returns the same data /admin/proposals shows. Approve/reject
 * actions are NOT exposed here — those need auth (Phase 2). Only the
 * queue read is public.
 *
 * Empty array when Supabase env is missing — same honest empty-state as
 * the UI. Never returns fabricated proposals to look busy.
 */
export async function GET() {
  const proposals = await listProposals();

  const byStatus = {
    pending: proposals.filter((p) => p.reviewStatus === "pending").length,
    revisionsRequested: proposals.filter((p) => p.reviewStatus === "revisions-requested").length,
    approved: proposals.filter((p) => p.reviewStatus === "approved").length,
    rejected: proposals.filter((p) => p.reviewStatus === "rejected").length,
  };

  return NextResponse.json(
    {
      version: 1,
      count: proposals.length,
      byStatus,
      generatedAt: new Date().toISOString(),
      queueUrl: "/admin/proposals",
      submitVia: {
        mcpTool: "foresight_propose_market",
        mcpPackage: "foresight-mcp",
      },
      reviewSlaHours: 48,
      proposals,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=15, s-maxage=30, stale-while-revalidate=120",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
      },
    },
  );
}
