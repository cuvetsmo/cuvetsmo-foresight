import type { Metadata } from "next";
import Link from "next/link";
import { EcosystemBar } from "@/components/EcosystemBar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Changelog · what shipped",
  description: `Public changelog for ${BRAND.name}. What landed, what's known-limited, what's next. Transparency as a trust signal.`,
};

interface Release {
  date: string;
  phase: string;
  title: string;
  bullets: string[];
  knownLimits?: string[];
}

const releases: Release[] = [
  {
    date: "2026-05-27",
    phase: "0.2.6 · DX surface",
    title: "Developer docs + machine-readable spec",
    bullets: [
      "Public /docs developer reference: 5 MCP tools + 8 HTTP endpoints, copy-paste curl examples, response shapes verified against actual code (6 doc-vs-code drifts caught in audit pass and fixed before ship).",
      "/api/openapi.json — OpenAPI 3.1 spec. Drop into Postman, generate SDK clients with openapi-typescript, wire into Stainless/Speakeasy.",
      "/api/stats — one-shot aggregate stats endpoint for dashboards. Market counts by category/status, verifier mode, MCP version. Public-only — no per-user state.",
      "JSON-LD structured data on /markets (Dataset + ItemList) and per-market detail (QAPage + Question with suggestedAnswer). Surfaces in Google rich results.",
      "foresight-mcp v0.2.0 published: tools now fetch from live /api/markets with 5-minute in-process cache, 6s abort, seed fallback on network failure. Override base via FORESIGHT_API_BASE.",
      "/docs OG image — developer-flavored share card distinct from the landing card.",
    ],
  },
  {
    date: "2026-05-27",
    phase: "0.2.5 · Iron Rule 0 audit",
    title: "Fact-check every seed market",
    bullets: [
      "Removed 3 markets that had already resolved before listing (GPT-5 release · Polymarket Solana own-contracts · Tesla FSD V13 stable). Tightened 2 more questions with stale framing.",
      "Zeroed all volume + open-interest numbers on every Phase 0 market — they were never real trades, only placeholder decoration.",
      "Added isSample column + UI badge so consumers see 'Sample · 0 trades · waitlist open' instead of fabricated activity.",
      "Encoded the lesson as a permanent rule: forward-looking datasets get a web-search audit before commit. Fake-able fields default to ZERO with is_sample flag, never decorated.",
    ],
    knownLimits: [
      "Volume + open interest stay zero until real-money trading turns on in Phase 1+.",
    ],
  },
  {
    date: "2026-05-27",
    phase: "0.2 · Phase 2 polish",
    title: "Cross-venue lookup, admin queue, resolver status",
    bullets: [
      "/api/cross-venue — pulls Polymarket Gamma + Kalshi public APIs to show matching markets side-by-side. Honest 'exclusiveToForesight: true' when no global venue lists the topic.",
      "Polymarket pagination walks offset 0/100/200 (top 300 by liquidity, cached 1h) so we catch markets beyond the intraday/sports top 100.",
      "/admin/proposals — public transparency queue. Every market proposal lands here; reviewers approve, request edits, or reject.",
      "/api/resolve/status — probe which LLM providers are wired WITHOUT leaking key values. Used by the /resolver page to show 'live vs Phase 0 fallback' honestly.",
      "Dynamic OG images per route via next/og (markets, resolver, brand, admin).",
    ],
  },
  {
    date: "2026-05-27",
    phase: "0.1 · Phase 1 mega",
    title: "MCP server, Supabase, animations, AI resolver, waitlist",
    bullets: [
      "Standalone foresight-mcp repo with 5 tools: list_markets, get_market, propose_market, resolve_check, stream_events.",
      "Supabase schema: foresight_markets, foresight_proposals, foresight_orders, foresight_resolutions, foresight_appeals. RLS on every table with USING/WITH CHECK split for state-transition safety.",
      "AI-assisted resolver: 5-provider chain (Groq → Cerebras → SambaNova → OpenRouter → Mistral) with Iron Rule 0 hook. Confidence below 0.85 auto-downgrades to ambiguous. Refuse > fabricate.",
      "Trading-intent waitlist via /api/waitlist — captures measurable demand without burning capital on a Privy/Pimlico bundle nobody asked for yet.",
      "Landing animations: animated counter, live tick preview, MCP terminal mockup. Same evidence-based motion vocabulary as mozi.finance — emerald accent, no gambling-coded red.",
    ],
    knownLimits: [
      "Resolver runs in fallback mode (returns status=pending) until at least one provider env key is set. /api/resolve/status reports which.",
      "Waitlist is a measurable demand signal, not a real-money queue. Phase 1+ wires real trading on Base mainnet.",
    ],
  },
  {
    date: "2026-05-27",
    phase: "0.0 · Founder reset",
    title: "Spin-off-ready brand + env-driven abstraction",
    bullets: [
      "lib/brand.ts — every brand string, every URL, every social handle reads from env. Spin off to apex domain = one env var change, no code edits.",
      "Stripped internal-team context from user-facing copy. Product reads as standalone, not as 'sub-product of X'.",
      "Landing rewritten with founder-grade ambition + honest Phase 0 framing. 'Educational beta · no real-money trading yet' lives in the footer, not hidden in a sub-page.",
    ],
  },
  {
    date: "2026-05-27",
    phase: "0.0 · Phase 0 scaffold",
    title: "Hero + market list + market detail",
    bullets: [
      "Next.js 16 + Tailwind 4 + TypeScript on the cuvetsmo-labs lean baseline. No crypto deps yet (Phase 1+).",
      "Mozi-derived design system via Playwright getComputedStyle: light surface primary, alternating sections, rounded-4xl curves, emerald CTA + YES outcome, slate NO (intentional non-red).",
      "Inter + IBM Plex Sans Thai. Subdomain-theme-differentiation rule respected — distinct from labs cream/orange · imaging dark · web3 Base Blue.",
      "10 seed markets across 8 categories, each with machine-verifiable resolution criteria + named primary sources per Iron Rule 0.",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <>
      <EcosystemBar current="foresight" />
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-[var(--color-bg)] border-b border-[var(--color-border)]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-14 pb-12">
            <nav
              aria-label="Breadcrumb"
              className="mb-5 text-sm text-[var(--color-text-muted)] flex items-center gap-2"
            >
              <Link href="/" className="hover:text-[var(--color-emerald-deep)] transition-colors">
                Home
              </Link>
              <span aria-hidden>/</span>
              <span>Changelog</span>
            </nav>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-emerald-deep)] mb-3">
              What shipped · what&apos;s known-limited · what&apos;s next
            </p>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-[1.1] text-[var(--color-text-strong)]">
              Public changelog.
            </h1>
            <p className="mt-5 max-w-2xl text-[var(--color-text-muted)] leading-[1.65]">
              Transparency as a trust signal. Every release lists what
              landed AND its known limits. Nothing is hidden in &quot;coming
              soon&quot; — if it&apos;s not in this list, we have not
              shipped it.
            </p>
          </div>
        </section>

        {/* Timeline */}
        <section className="bg-[var(--color-bg)]">
          <div className="max-w-3xl mx-auto px-6 sm:px-8 py-16 sm:py-20">
            <ol className="space-y-12">
              {releases.map((r, i) => (
                <li key={`${r.date}-${i}`} className="relative">
                  <div className="flex flex-wrap items-baseline gap-3 mb-2">
                    <span className="font-mono text-xs text-[var(--color-text-faint)]">
                      {r.date}
                    </span>
                    <span className="badge badge--open">{r.phase}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text-strong)] mb-4">
                    {r.title}
                  </h2>
                  <ul className="space-y-2.5 text-sm text-[var(--color-text)] leading-[1.7]">
                    {r.bullets.map((b, j) => (
                      <li key={j} className="flex gap-3">
                        <span
                          aria-hidden
                          className="text-[var(--color-emerald)] shrink-0 mt-[2px]"
                        >
                          ✓
                        </span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                  {r.knownLimits && r.knownLimits.length > 0 ? (
                    <div className="mt-5 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] border-dashed p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-faint)] mb-2">
                        Known limits
                      </p>
                      <ul className="space-y-2 text-xs text-[var(--color-text-muted)] leading-[1.7]">
                        {r.knownLimits.map((k, j) => (
                          <li key={j} className="flex gap-2">
                            <span aria-hidden className="text-[var(--color-text-faint)] shrink-0">
                              ↳
                            </span>
                            <span>{k}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </li>
              ))}
            </ol>

            <div className="mt-16 rounded-2xl bg-[var(--color-emerald-tint)]/40 border border-[var(--color-emerald)]/25 p-6 sm:p-8">
              <h3 className="text-sm font-semibold text-[var(--color-text-strong)] mb-2">
                Next on the deck
              </h3>
              <ul className="space-y-2 text-sm text-[var(--color-text-muted)] leading-[1.7]">
                <li className="flex gap-2">
                  <span aria-hidden className="text-[var(--color-emerald-deep)] shrink-0">
                    →
                  </span>
                  <span>
                    Resolver flip from fallback to live — pending the first
                    provider env key (Groq is free, fastest path).
                  </span>
                </li>
                <li className="flex gap-2">
                  <span aria-hidden className="text-[var(--color-emerald-deep)] shrink-0">
                    →
                  </span>
                  <span>
                    foresight-mcp on npm registry — package built, smoke
                    tested, awaiting first publish.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span aria-hidden className="text-[var(--color-emerald-deep)] shrink-0">
                    →
                  </span>
                  <span>
                    Phase 1 wallet wire — Privy + Pimlico smart wallets on
                    Base. Replaces the intent-capture modal with real-money
                    trading once smart-contract settlement lands.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span aria-hidden className="text-[var(--color-emerald-deep)] shrink-0">
                    →
                  </span>
                  <span>
                    Supabase realtime → foresight_stream_events tool — swap
                    synthetic events for real subscription tail. Shape stays
                    identical.
                  </span>
                </li>
              </ul>
            </div>

            <p className="mt-10 text-xs text-[var(--color-text-faint)] leading-[1.7]">
              Want to track changes machine-readably?{" "}
              <a
                href="/api/openapi.json"
                className="font-mono text-[var(--color-emerald-deep)] hover:underline"
              >
                /api/openapi.json
              </a>{" "}
              versions with the API. The OpenAPI{" "}
              <code className="font-mono">info.version</code> field bumps on
              every breaking change.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
