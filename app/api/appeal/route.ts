import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface AppealInput {
  /** Market identifier (id or slug) if appealing a known market. */
  identifier?: string;
  /** The question text — required so an ad-hoc dry-run appeal has context. */
  question: string;
  /** The verifier outcome being disputed (e.g., "ambiguous", "no"). */
  disputedStatus?: string;
  disputedOutcome?: string;
  /** The appellant's reasoning — why the dry-run result is wrong. Required. */
  reasoning: string;
  /** Optional public evidence URL supporting the appeal. */
  evidenceUrl?: string;
  /** Optional contact for follow-up. */
  email?: string;
}

/**
 * POST /api/appeal
 *
 * Captures an appeal against a resolver dry-run result. The resolver is
 * ALLOWED to be wrong or to refuse — the appeal path is how a human
 * contests it. This closes the loop on `appealAvailable: true`, which
 * the verifier returns but Phase 0 previously had no way to act on.
 *
 * Phase 0 sink: stdout + an audit_log row when SUPABASE_SERVICE_ROLE_KEY
 * is configured (same pattern as /api/waitlist). Phase 1 swaps to a
 * dedicated `foresight_appeals` table with a moderator review queue,
 * mirroring /admin/proposals.
 *
 * Iron Rule 0 alignment: an appeal is never auto-accepted. It's logged
 * for human review. We do NOT claim the appeal changes anything yet —
 * the response says exactly that.
 */
export async function POST(req: NextRequest) {
  let body: AppealInput;
  try {
    body = (await req.json()) as AppealInput;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const question = (body.question ?? "").trim();
  const reasoning = (body.reasoning ?? "").trim();

  if (question.length < 3) {
    return NextResponse.json(
      { error: "question is required (the market or dry-run being appealed)" },
      { status: 400 },
    );
  }
  if (reasoning.length < 10) {
    return NextResponse.json(
      { error: "reasoning is required — explain why the result is wrong (≥10 chars)" },
      { status: 400 },
    );
  }
  if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  if (body.evidenceUrl && !/^https?:\/\/\S+$/.test(body.evidenceUrl.trim())) {
    return NextResponse.json(
      { error: "evidenceUrl must be a valid http(s) URL" },
      { status: 400 },
    );
  }

  const entry = {
    identifier: body.identifier ?? null,
    question,
    disputedStatus: body.disputedStatus ?? null,
    disputedOutcome: body.disputedOutcome ?? null,
    reasoning,
    evidenceUrl: body.evidenceUrl?.trim() ?? null,
    email: body.email?.trim().toLowerCase() ?? null,
    submittedAt: new Date().toISOString(),
    userAgent: req.headers.get("user-agent") ?? null,
  };

  console.log("[foresight.appeal]", JSON.stringify(entry));

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
          action: "foresight.appeal.filed",
          target_type: "foresight_resolution",
          target_id: body.identifier ?? "ad-hoc",
          metadata: entry,
        }),
      });
    } catch {
      // non-fatal — already logged to stdout
    }
  }

  return NextResponse.json({
    status: "received",
    queued: true,
    message:
      "Appeal logged for human review. It does NOT change the dry-run result automatically — a moderator reviews the criterion + your evidence against the named sources. Phase 1 adds a public appeals queue (like /admin/proposals).",
    reviewSlaHours: 72,
  });
}
