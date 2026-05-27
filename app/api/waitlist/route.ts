import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface WaitlistInput {
  email: string;
  marketId?: string;
  side?: "yes" | "no";
  sizeUsd?: number;
  source?: string;
}

/**
 * POST /api/waitlist
 *
 * Captures trading-intent waitlist signals from the TradePanel modal.
 *
 * Phase 0 sink: server console + optional Supabase audit_log row when
 * SUPABASE_SERVICE_ROLE_KEY is configured. Phase 1 will swap to a
 * dedicated `foresight_waitlist` table with a unique index on email.
 *
 * Why not a dedicated table right now: capital discipline. We don't yet
 * know the right shape (per-market vs global, per-side vs side-agnostic,
 * referral attribution?). The audit_log row preserves every field as
 * JSONB so when the shape lands we can backfill cleanly.
 */
export async function POST(req: NextRequest) {
  let body: WaitlistInput;
  try {
    body = (await req.json()) as WaitlistInput;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const entry = {
    email,
    marketId: body.marketId ?? null,
    side: body.side ?? null,
    sizeUsd: typeof body.sizeUsd === "number" ? body.sizeUsd : null,
    source: body.source ?? "unknown",
    submittedAt: new Date().toISOString(),
    userAgent: req.headers.get("user-agent") ?? null,
    referer: req.headers.get("referer") ?? null,
  };

  // Server-side sink — always present for now. When SUPABASE_SERVICE_ROLE_KEY
  // is available the same payload also lands in audit_log.
  console.log("[foresight.waitlist]", JSON.stringify(entry));

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
          action: "foresight.waitlist.intent",
          target_type: "foresight_market",
          target_id: body.marketId ?? "n/a",
          metadata: entry,
        }),
      });
    } catch {
      // Non-fatal — we already logged to stdout.
    }
  }

  return NextResponse.json({ status: "ok", saved: true });
}

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}
