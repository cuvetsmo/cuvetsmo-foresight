import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/resolve/status
 *
 * Reports which LLM providers are configured WITHOUT leaking any secrets.
 * Used by:
 *   - the /resolver page footer to surface "verifier live" vs "Phase 0 fallback"
 *   - smoke tests to confirm an env var actually loaded
 *   - the brand kit to honestly say "AI verifier wired" when it is
 *
 * Returns:
 *   {
 *     mode: "live" | "fallback",
 *     providersConfigured: ["groq", ...],
 *     providersAvailable: [..all..],
 *     note: string
 *   }
 *
 * NEVER returns the key value. NEVER returns prefixes or any partial form
 * of the key. Only the boolean "is X configured" — that's the safe surface.
 */
const PROVIDER_ENV: Record<string, string> = {
  groq: "GROQ_API_KEY",
  cerebras: "CEREBRAS_API_KEY",
  sambanova: "SAMBANOVA_API_KEY",
  openrouter: "OPENROUTER_API_KEY",
  mistral: "MISTRAL_API_KEY",
};

export async function GET() {
  const configured: string[] = [];
  for (const [name, envKey] of Object.entries(PROVIDER_ENV)) {
    if (process.env[envKey] && process.env[envKey]!.length > 8) {
      configured.push(name);
    }
  }
  return NextResponse.json({
    mode: configured.length > 0 ? "live" : "fallback",
    providersConfigured: configured,
    providersAvailable: Object.keys(PROVIDER_ENV),
    note:
      configured.length > 0
        ? `Verifier is live · falls through chain ${configured.join(" → ")} on each call`
        : "No providers configured — verifier returns Phase 0 'pending' fallback. Set any of: " +
          Object.values(PROVIDER_ENV).join(", "),
  });
}
