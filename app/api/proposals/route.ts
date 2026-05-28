import { NextResponse, type NextRequest } from "next/server";
import { listProposals } from "@/lib/proposals";

export const runtime = "nodejs";
export const revalidate = 30;

const CATEGORIES = [
  "thai-politics",
  "thai-climate",
  "thai-vet",
  "sea-elections",
  "crypto",
  "global-tech",
  "global-sports",
  "ai-research",
] as const;

interface ProposeInput {
  question?: string;
  questionEn?: string;
  category?: string;
  closesAt?: string;
  resolutionCriteria?: string;
  resolutionSources?: string[];
  tags?: string[];
  email?: string;
}

// Iron Rule 0 guards — identical contract to the foresight_propose_market
// MCP tool, so the web form and the agent path enforce the same bar.
const BANNED = [
  /\bassassinat/i,
  /\bkill(ed)? by\b/i,
  /\bdeath of\b.*\b(supreme|leader|president|prime minister|king)\b/i,
  /\bdies (in|before|by)\b/i,
];
const TEMPORAL_ANCHOR = /(\bif\b|\bwhen\b|\bbefore\b|\bafter\b|\bon\b|\bby\b)/i;

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
        "Access-Control-Allow-Methods": "GET, POST",
      },
    },
  );
}

/**
 * POST /api/proposals
 *
 * Public market-proposal submission — the browser equivalent of the
 * foresight_propose_market MCP tool. Same Iron Rule 0 validation: a
 * machine-verifiable criterion with a temporal/conditional anchor, at
 * least one named source, a future close date, and NO distress markets
 * predicting the death of named persons.
 *
 * Phase 0 sink: stdout + audit_log row when service-role is configured
 * (same pattern as /api/waitlist + /api/appeal). The proposal lands in
 * the public queue at /admin/proposals; a moderator reviews before any
 * market goes live. We never auto-list.
 */
export async function POST(req: NextRequest) {
  let body: ProposeInput;
  try {
    body = (await req.json()) as ProposeInput;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const question = (body.question ?? "").trim();
  const criteria = (body.resolutionCriteria ?? "").trim();
  const sources = (body.resolutionSources ?? [])
    .map((s) => (typeof s === "string" ? s.trim() : ""))
    .filter(Boolean);

  if (question.length < 10 || question.length > 280) {
    return NextResponse.json(
      { error: "question must be 10-280 characters" },
      { status: 400 },
    );
  }
  if (!body.category || !CATEGORIES.includes(body.category as (typeof CATEGORIES)[number])) {
    return NextResponse.json(
      { error: `category must be one of: ${CATEGORIES.join(", ")}` },
      { status: 400 },
    );
  }
  if (criteria.length < 40 || criteria.length > 1000) {
    return NextResponse.json(
      { error: "resolutionCriteria must be 40-1000 characters and name a public source" },
      { status: 400 },
    );
  }
  if (sources.length < 1 || sources.length > 5) {
    return NextResponse.json(
      { error: "resolutionSources must have 1-5 named primary sources" },
      { status: 400 },
    );
  }
  if (BANNED.some((re) => re.test(question) || re.test(criteria))) {
    return NextResponse.json(
      {
        error:
          "Distress markets predicting the death/assassination of named persons are not allowed. Rephrase around a non-distress event.",
      },
      { status: 422 },
    );
  }
  if (!TEMPORAL_ANCHOR.test(criteria)) {
    return NextResponse.json(
      {
        error:
          "Resolution criterion must contain a temporal or conditional anchor (if/when/before/after/on/by) so it is machine-verifiable.",
      },
      { status: 422 },
    );
  }
  const closes = new Date(body.closesAt ?? "");
  if (Number.isNaN(closes.getTime())) {
    return NextResponse.json(
      { error: "closesAt must be a valid ISO 8601 datetime" },
      { status: 400 },
    );
  }
  if (closes.getTime() <= Date.now()) {
    return NextResponse.json({ error: "closesAt must be in the future" }, { status: 422 });
  }
  if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const draftId = `draft-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const entry = {
    draftId,
    question,
    questionEn: body.questionEn?.trim() || null,
    category: body.category,
    closesAt: closes.toISOString(),
    resolutionCriteria: criteria,
    resolutionSources: sources,
    tags: (body.tags ?? []).map((t) => String(t).trim()).filter(Boolean).slice(0, 8),
    email: body.email?.trim().toLowerCase() ?? null,
    source: "web-form",
    submittedAt: new Date().toISOString(),
  };

  console.log("[foresight.proposal]", JSON.stringify(entry));

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (serviceRoleKey && supabaseUrl) {
    try {
      await fetch(`${supabaseUrl}/rest/v1/audit_log`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          action: "foresight.proposal.web",
          target_type: "foresight_market_proposal",
          target_id: draftId,
          metadata: entry,
        }),
      });
    } catch {
      // non-fatal — already logged to stdout
    }
  }

  return NextResponse.json({
    status: "pending_review",
    draftId,
    queueUrl: "/admin/proposals",
    reviewSlaHours: 48,
    message:
      "Proposal accepted into the review queue. A moderator verifies resolvability against the named sources and either approves, requests edits, or rejects — typically within 48 hours. It is NOT listed automatically.",
  });
}
