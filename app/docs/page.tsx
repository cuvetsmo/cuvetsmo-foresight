import type { Metadata } from "next";
import Link from "next/link";
import { EcosystemBar } from "@/components/EcosystemBar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BRAND, DEPLOY } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Developer docs · API + MCP",
  description: `Developer reference for ${BRAND.name} — eight MCP tools and a full public REST surface, copy-paste examples. No signup, no API key in Phase 0.`,
};

const BASE = DEPLOY.baseUrl;

interface ApiSection {
  id: string;
  method: "GET" | "POST";
  path: string;
  summary: string;
  description: string;
  example: string;
  responseShape: string;
  notes?: string[];
}

const apiSections: ApiSection[] = [
  {
    id: "get-markets",
    method: "GET",
    path: "/api/markets",
    summary: "List every market — single source of truth.",
    description:
      "Returns the full market catalogue in the same shape rendered by the web UI. The MCP server, downstream agents, and external tools all read from here. Headers: max-age=30, s-maxage=60, stale-while-revalidate=300. CORS open.",
    example: `curl ${BASE}/api/markets | jq '.markets[0]'`,
    responseShape: `{
  "version": 1,
  "count": 17,
  "generatedAt": "2026-05-27T12:00:00.000Z",
  "markets": [
    {
      "id": "string",
      "slug": "string",
      "question": "string",
      "questionEn": "string?",
      "category": "thai-politics | thai-climate | thai-vet | sea-elections | crypto | global-tech | global-sports | ai-research",
      "status": "open | closing-soon | resolved",
      "yesProbability": 0.42,
      "volumeUsd": 0,
      "openInterestUsd": 0,
      "closesAt": "2027-01-01T00:00:00.000Z",
      "resolutionCriteria": "string",
      "resolutionSources": ["string"],
      "tags": ["string"],
      "isSample": true
    }
  ]
}`,
    notes: [
      "Phase 0 markets all carry isSample=true — they are curated demonstrations of the resolution-criteria pattern, not live order-book contracts.",
      "Volume + openInterest are zero by design until real trading turns on. Do not interpret them as activity signals.",
    ],
  },
  {
    id: "post-resolve",
    method: "POST",
    path: "/api/resolve",
    summary: "Dry-run the multi-source verifier.",
    description:
      "Two input modes. Pass an existing market identifier to resolve a known market, or pass an ad-hoc question + criterion + sources for any forecast. Always returns the same ResolveResult shape. Status of pending, ambiguous, or refused is a feature — the verifier will say it doesn't know rather than fabricate.",
    example: `curl -X POST ${BASE}/api/resolve \\
  -H "Content-Type: application/json" \\
  -d '{
    "question": "Will the Bank of Thailand cut the policy rate at the December 2026 MPC meeting?",
    "resolutionCriteria": "YES if the BoT MPC December 2026 statement records a policy rate decrease vs the previous meeting. NO otherwise.",
    "resolutionSources": ["https://www.bot.or.th/en/our-roles/monetary-policy/mpc-meeting.html"],
    "closesAt": "2026-12-31T23:59:59Z"
  }'`,
    responseShape: `{
  "market": { "identifier": "string" } | null,
  "asOf": "ISO",
  "status": "verifiable | pending | ambiguous | refused",
  "proposedOutcome"?: "yes | no | void",
  "confidence"?: 0.92,
  "reasoning": "string",
  "citedSources": [{ "source": "url", "checked": true, "note": "string" }],
  "appealAvailable": true,
  "providerUsed"?: "groq | cerebras | sambanova | openrouter | mistral",
  "refusalReason"?: "string",
  "crossVenueReference"?: { /* known-market only — what other venues price this at */ }
}`,
    notes: [
      "Confidence below 0.85 auto-downgrades status to ambiguous. The verifier never commits a low-confidence outcome.",
      "5-provider fallback chain (Groq → Cerebras → SambaNova → OpenRouter → Mistral). When none are configured the route returns status=pending with a transparent note; providerUsed is omitted in that case.",
      "12s abort timeout across the chain. proposedOutcome can also be 'void' when the resolver determines the market is unresolvable as-stated.",
      "Identifier mode attaches crossVenueReference (Polymarket/Kalshi/Manifold prices for the same question) as a sanity signal — it does NOT influence the verdict; the criterion + named sources decide.",
    ],
  },
  {
    id: "get-resolve-status",
    method: "GET",
    path: "/api/resolve/status",
    summary: "Probe which verifier providers are wired.",
    description:
      "Returns which LLM providers are configured WITHOUT leaking key values, prefixes, or any partial form. Used by the /resolver page footer to show live vs Phase 0 fallback honestly.",
    example: `curl ${BASE}/api/resolve/status`,
    responseShape: `{
  "mode": "live | fallback",
  "providersConfigured": ["groq"],
  "providersAvailable": ["groq", "cerebras", "sambanova", "openrouter", "mistral"],
  "note": "string"
}`,
  },
  {
    id: "get-cross-venue",
    method: "GET",
    path: "/api/cross-venue",
    summary: "Find matching markets on Polymarket and Kalshi.",
    description:
      "By-slug mode resolves a Foresight market then pulls term-derived matches from Polymarket Gamma + Kalshi + Manifold Markets public APIs. Free-text mode lets you pass an arbitrary query + AND-group keyword sets. Returns exclusiveToForesight: true when no venue carries the topic — that is a feature, not a bug.",
    example: `# by Foresight slug
curl '${BASE}/api/cross-venue?slug=anthropic-1m-ctx-2027-q1'

# free-text + AND-groups
curl '${BASE}/api/cross-venue?q=BoT%20rate%20cut&terms=bank+thailand&terms=rate+cut'`,
    responseShape: `{
  "query": "string",
  "polymarket": [{ "question": "string", "url": "string", "yesProbability": 0.18, "volumeUsd": 0 }],
  "kalshi": [{ "question": "string", "url": "string", "yesProbability": 0.22 }],
  "manifold": [{ "question": "string", "url": "string", "yesProbability": 0.63, "volumeUsd": 53 }],
  "exclusiveToForesight": false,
  "fetchedMs": 412,
  "note": "string?"
}`,
    notes: [
      "Cached at the route level for 1h. Polymarket pagination walks offset 0/100/200; Kalshi handles their 404-with-body quirk; Manifold uses per-query search-markets (higher recall for SEA/AI/climate/vet).",
      "exclusiveToForesight=true is positive social proof — it means the topic is on our venue and no global aggregator lists it.",
      "Manifold is MIT-licensed; Polymarket + Kalshi are public APIs without official partnership.",
    ],
  },
  {
    id: "post-waitlist",
    method: "POST",
    path: "/api/waitlist",
    summary: "Capture trading-intent for a market.",
    description:
      "Records a measurable demand signal — email, optional market, side, and intended size. Phase 0 sink is stdout plus an audit-log row when Supabase service-role is wired. Phase 1 swaps to a dedicated waitlist table.",
    example: `curl -X POST ${BASE}/api/waitlist \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "trader@example.com",
    "marketId": "anthropic-1m-ctx-2027-q1",
    "side": "yes",
    "sizeUsd": 50,
    "source": "docs"
  }'`,
    responseShape: `{ "status": "ok", "saved": true }`,
    notes: [
      "Email is the only required field. Side, marketId, sizeUsd, and source are optional context.",
      "No confirmation email yet — Phase 1 adds a double-opt-in flow.",
    ],
  },
  {
    id: "get-health",
    method: "GET",
    path: "/api/health",
    summary: "Build identity + deployment URL.",
    description:
      "Linked from the footer Status link. Phase 1 will extend to report Supabase reachability, MCP server status, and the deploy commit SHA.",
    example: `curl ${BASE}/api/health`,
    responseShape: `{
  "name": "Foresight",
  "status": "ok",
  "phase": "0",
  "baseUrl": "${BASE}",
  "educationalBeta": true,
  "timestamp": "ISO"
}`,
  },
  {
    id: "get-proposals",
    method: "GET",
    path: "/api/proposals",
    summary: "Read the market proposal queue.",
    description:
      "Mirrors the UI at /admin/proposals — single source of truth, no second list. Phase 0 queue is intentionally empty. Approve/reject actions are NOT exposed here (auth-gated, Phase 2).",
    example: `curl ${BASE}/api/proposals | jq '.byStatus'`,
    responseShape: `{
  "version": 1,
  "count": 0,
  "byStatus": { "pending": 0, "revisionsRequested": 0, "approved": 0, "rejected": 0 },
  "generatedAt": "ISO",
  "queueUrl": "/admin/proposals",
  "submitVia": { "mcpTool": "foresight_propose_market", "mcpPackage": "foresight-mcp" },
  "reviewSlaHours": 48,
  "proposals": [/* MarketProposal[] */]
}`,
    notes: [
      "Empty array is the honest empty-state — no fabricated proposals to look busy.",
      "Read endpoint. To submit, POST to this same path (below) or use the foresight_propose_market MCP tool — same Iron Rule 0 contract.",
    ],
  },
  {
    id: "post-proposals",
    method: "POST",
    path: "/api/proposals",
    summary: "Submit a market proposal (web form + agent share this).",
    description:
      "Browser equivalent of foresight_propose_market — the /propose page posts here. Identical Iron Rule 0 contract: 10-280 char question, machine-verifiable criterion (40-1000 chars) with a temporal anchor, 1-5 named sources, future close, no distress markets. Lands in the public queue — never auto-listed.",
    example: `curl -X POST ${BASE}/api/proposals \\
  -H "Content-Type: application/json" \\
  -d '{
    "question": "Will the BoT cut its policy rate at the December 2026 MPC meeting?",
    "category": "thai-politics",
    "closesAt": "2026-12-31T23:59:59Z",
    "resolutionCriteria": "Resolves YES if the BoT MPC December 2026 statement records a policy rate decrease vs the previous meeting, per bot.or.th.",
    "resolutionSources": ["https://www.bot.or.th/"]
  }'`,
    responseShape: `{
  "status": "pending_review",
  "draftId": "draft-<ts>-<rand>",
  "queueUrl": "/admin/proposals",
  "reviewSlaHours": 48,
  "message": "string"
}`,
    notes: [
      "400 = malformed field (length/date/email). 422 = failed Iron Rule 0 (distress market, no temporal anchor, or past close).",
      "Same validation as the MCP tool, so the web form and agents can't propose anything the other couldn't.",
    ],
  },
  {
    id: "post-appeal",
    method: "POST",
    path: "/api/appeal",
    summary: "Appeal a resolver dry-run result.",
    description:
      "Closes the loop on appealAvailable:true. The verifier may refuse or be wrong; this logs a human-reviewable appeal. Never auto-changes the result. The appeal panel under any /resolver result posts here.",
    example: `curl -X POST ${BASE}/api/appeal \\
  -H "Content-Type: application/json" \\
  -d '{
    "question": "Will X happen by Y?",
    "disputedStatus": "ambiguous",
    "reasoning": "The criterion was clearly met on 2027-03-02 — see the official source.",
    "evidenceUrl": "https://example.gov/official-notice"
  }'`,
    responseShape: `{
  "status": "received",
  "queued": true,
  "message": "string",
  "reviewSlaHours": 72
}`,
    notes: [
      "question + reasoning (≥10 chars) are required; identifier, evidenceUrl, email optional.",
      "An appeal is logged, never auto-accepted — a moderator reviews the criterion + evidence against the named sources.",
    ],
  },
  {
    id: "get-openapi",
    method: "GET",
    path: "/api/openapi.json",
    summary: "OpenAPI 3.1 machine-readable spec.",
    description:
      "The whole API in one JSON document. Drop into Postman / Insomnia / Bruno. Generate TypeScript clients via openapi-typescript. Wire into Stainless or Speakeasy for SDK pipelines. 1-hour edge cache.",
    example: `curl ${BASE}/api/openapi.json | jq '.info'

# Generate TS client
npx openapi-typescript ${BASE}/api/openapi.json -o foresight.d.ts`,
    responseShape: `{
  "openapi": "3.1.0",
  "info": { "title": "Foresight Public API", "version": "0.1.0", ... },
  "paths": { /* 8 endpoints */ },
  "components": { "schemas": { /* 12 reusable shapes */ } }
}`,
    notes: [
      "The OpenAPI version field bumps on every breaking change — track it to catch contract drift in your client.",
      "Self-referential — the spec describes the 8 functional endpoints but omits itself (a meta-endpoint about the API).",
    ],
  },
  {
    id: "get-stats",
    method: "GET",
    path: "/api/stats",
    summary: "One-shot aggregate stats — for dashboards.",
    description:
      "Market counts (by category + status + sample-vs-real), verifier mode, MCP version. Public-only — never includes per-user state. Powers external status pages without scraping the UI.",
    example: `curl ${BASE}/api/stats | jq '{ total: .markets.total, verifier: .verifier.mode }'`,
    responseShape: `{
  "name": "Foresight",
  "phase": "0",
  "generatedAt": "ISO",
  "markets": {
    "total": 17,
    "sample": 17,
    "real": 0,
    "byStatus": { "open": 12, "closingSoon": 3, "resolved": 2 },
    "byCategory": [{ "key": "thai-politics", "label": "Thai Politics", "count": 3 }]
  },
  "verifier": { "mode": "live | fallback", "providersConfigured": [...] },
  "mcp": { "package": "foresight-mcp", "sourceVersion": "0.2.0", "npmPublished": false, "tools": [...] },
  "docs": { "openapi": "/api/openapi.json", "developerPage": "/docs", "changelog": "/changelog" }
}`,
    notes: [
      "Caches at the edge — same headers as /api/markets. Safe to poll once a minute from a dashboard.",
      "npmPublished flips to true once the foresight-mcp package lands on the npm registry.",
    ],
  },
];

interface McpTool {
  id: string;
  name: string;
  summary: string;
  description: string;
  inputShape: string;
  outputShape: string;
}

const mcpTools: McpTool[] = [
  {
    id: "list-markets",
    name: "foresight_list_markets",
    summary: "Browse the live forecasting marketplace.",
    description:
      "Filter by category and status, sort by volume, open interest, closing date, or newest. Read-only, free. The agent uses this to discover what is listable before any other tool.",
    inputShape: `{
  "category"?: "thai-politics" | "thai-climate" | "thai-vet" | "sea-elections" |
              "crypto" | "global-tech" | "global-sports" | "ai-research",
  "status"?: "open" | "closing-soon" | "resolved",
  "sortBy"?: "volume" | "open-interest" | "closing-soonest" | "newest",  // default volume
  "limit"?: number  // 1-50, default 10
}`,
    outputShape: `{
  "count": 10,
  "totalAvailable": 17,
  "filters": { "category": "...", "status": "...", "sortBy": "..." },
  "source": "live" | "bundled-seed",
  "markets": [/* market summary objects with id, slug, question, probabilities, url */]
}`,
  },
  {
    id: "get-market",
    name: "foresight_get_market",
    summary: "Full detail for one market.",
    description:
      "Pass an id or slug — either works. Returns probabilities, volume, open interest, deadline countdown, resolution criterion, named primary sources, tags, and the canonical web URL.",
    inputShape: `{
  "identifier": "string"  // id like 'th-elec-2027' or slug
}`,
    outputShape: `{
  "id": "string",
  "slug": "string",
  "question": "string",
  "category": "...",
  "status": "open | closing-soon | resolved",
  "probabilities": { "yes": 0.42, "no": 0.58 },
  "volume": { "usd": 0, "openInterestUsd": 0 },
  "timing": { "closesAt": "ISO", "daysLeft": 240 },
  "resolution": { "criteria": "string", "sources": ["url"] },
  "tags": ["..."],
  "url": "${BASE}/markets/<slug>"
}`,
  },
  {
    id: "propose-market",
    name: "foresight_propose_market",
    summary: "Submit a new market proposal to the review queue.",
    description:
      "Any MCP-aware agent can propose. Proposals land in the public review queue at /admin/proposals — they are not auto-listed. Iron-Rule-0 schema: requires a machine-verifiable resolution criterion plus at least one named primary source URL.",
    inputShape: `{
  "question": "string  // 10-280 chars, yes/no phrasing",
  "questionEn"?: "string  // optional English translation",
  "category": "thai-politics" | "thai-climate" | "thai-vet" |
              "sea-elections" | "crypto" | "global-tech" |
              "global-sports" | "ai-research",
  "closesAt": "ISO datetime  // must be in the future",
  "resolutionCriteria": "string  // 40-1000 chars, machine-verifiable",
  "resolutionSources": ["url"],  // 1-5 named primary sources
  "tags"?: ["string"]  // 0-8 discovery tags, ≤40 chars each
}`,
    outputShape: `{
  "status": "pending_review",
  "draftId": "draft-<timestamp>-<rand>",
  "proposal": { /* the validated input echoed back */ },
  "preview": {
    "url": "${BASE}/propose?draft=<id>",
    "reviewSlaHours": 48
  },
  "message": "string  // human-readable acceptance"
}`,
  },
  {
    id: "resolve-check",
    name: "foresight_resolve_check",
    summary: "Dry-run the multi-source verifier on a market.",
    description:
      "Identical resolver as POST /api/resolve, but scoped to a known market. Read-only — never mutates state. Useful for agents that want to preview a resolution before proposing an appeal.",
    inputShape: `{
  "identifier": "string",  // market id or slug
  "asOf"?: "ISO datetime"  // simulate 'resolve as of' — defaults to now
}`,
    outputShape: `{
  "market": { "id": "string", "slug": "string", "question": "string" },
  "asOf": "ISO",
  "status": "verifiable | pending | ambiguous | refused",
  "proposedOutcome"?: "yes | no",
  "confidence"?: 0.92,
  "reasoning": "string",
  "citedSources": [{ "source": "url", "checked": true, "note": "string" }],
  "appealAvailable": true
}`,
  },
  {
    id: "stream-events",
    name: "foresight_stream_events",
    summary: "Subscribe to market lifecycle events.",
    description:
      "Returns the recent event tail for one market or for all markets matching a filter. Phase 0 returns a synthetic tail; Phase 1 wires to Supabase realtime. Use for live dashboards, calibration trackers, or alert bots.",
    inputShape: `{
  "market"?: "string",  // id or slug — omit for global stream
  "since"?: "ISO datetime"  // cursor — pass back the previous response's cursor
}`,
    outputShape: `{
  "events": [
    {
      "cursor": "ISO",  // use as 'since' on next call
      "type": "price-tick | trade | market-open | market-close | resolution",
      "marketId": "string",
      "marketSlug": "string",
      "marketUrl": "${BASE}/markets/<slug>",
      "data": { /* event-specific payload */ },
      "ts": "ISO"
    }
  ],
  "count": 4,
  "cursor": "ISO",  // next-page cursor (last event's ts)
  "pollIntervalSec": 30,
  "note": "string"
}`,
  },
  {
    id: "cross-venue",
    name: "foresight_cross_venue",
    summary: "Compare Polymarket, Kalshi, and Manifold pricing.",
    description:
      "Look up how the major venues price a question — by Foresight market id/slug (auto-derives search terms) or by free-text query. Returns each venue's matching markets with YES probability, volume, liquidity. When all three return nothing, exclusiveToForesight is true: the topic is priced here and nowhere else — the niche the giants overlook. Read-only; data public + cached 1h. (v0.3.0+)",
    inputShape: `{
  "identifier"?: "string",  // market id or slug — auto-derives terms
  "query"?: "string",       // free-text (when identifier omitted)
  "terms"?: ["string"]      // optional AND-group keyword sets, e.g. ["bank,thailand","rate,cut"]
}`,
    outputShape: `{
  "query": "string",
  "exclusiveToForesight": false,
  "totalMatches": 3,
  "venues": {
    "polymarket": [{ "question": "...", "yesProbability": 0.18, "volumeUsd": 0, "url": "..." }],
    "kalshi": [/* same shape */],
    "manifold": [/* same shape */]
  },
  "interpretation": "string  // plain-English read of the result",
  "fetchedMs": 350,
  "attribution": "string"
}`,
  },
  {
    id: "arxiv-search",
    name: "foresight_arxiv_search",
    summary: "Search ArXiv preprints — ai-research resolver fuel.",
    description:
      "Search ArXiv by query (field-prefix syntax: all:, ti:, au:, cat:). Returns recent papers with title, authors, abstract, submitted/updated dates, primary category, PDF + abstract URLs. Use to dry-run 'has paper X been published yet' resolution. Public, no auth. ArXiv rate-limits aggressive callers (~1 req/3s) — one call per turn is fine. (v0.4.0+)",
    inputShape: `{
  "query": "string",  // e.g. "all:mixture of experts", "ti:scaling laws", "au:Bengio"
  "maxResults"?: number,  // 1-20, default 5
  "sortBy"?: "relevance" | "lastUpdatedDate" | "submittedDate"  // default submittedDate
}`,
    outputShape: `{
  "query": "string",
  "count": 5,
  "papers": [{
    "id": "2401.00123v2",
    "title": "string",
    "summary": "string  // abstract, truncated to 600 chars",
    "authors": ["string"],
    "published": "ISO", "updated": "ISO",
    "primaryCategory": "cs.CL",
    "absUrl": "https://arxiv.org/abs/...", "pdfUrl": "https://arxiv.org/pdf/..."
  }],
  "note": "string", "attribution": "string"
}`,
  },
  {
    id: "wikidata-entity",
    name: "foresight_wikidata_entity",
    summary: "Ground a named entity to a stable Wikidata Q-id.",
    description:
      "Resolve a name (person, org, place, party, event) to a stable Wikidata Q-id + label + description. Lets a resolution criterion cite a Q-id so the verifier and appeal panel can't disagree on WHICH entity is meant — stable IDs survive renames and translations. Wikidata is CC0. Public, no auth. (v0.4.0+)",
    inputShape: `{
  "query": "string",  // e.g. "Pheu Thai Party", "Prabowo Subianto", "Chiang Mai"
  "language"?: "string",  // "en" or "th" most useful, default "en"
  "limit"?: number  // 1-10, default 5
}`,
    outputShape: `{
  "query": "string",
  "language": "en",
  "count": 3,
  "entities": [{
    "qid": "Q116758847",
    "label": "Anthropic",
    "description": "American artificial intelligence corporation",
    "url": "https://www.wikidata.org/wiki/Q116758847",
    "conceptUri": "http://www.wikidata.org/entity/Q116758847"
  }],
  "note": "string", "license": "Wikidata content is CC0 (public domain)."
}`,
  },
];

export default function DocsPage() {
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
              <span>Developer docs</span>
            </nav>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-emerald-deep)] mb-3">
              Developer reference · API + MCP
            </p>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-[1.1] text-[var(--color-text-strong)]">
              Build forecasting into your agent.
            </h1>
            <p className="mt-5 max-w-2xl text-[var(--color-text-muted)] leading-[1.65]">
              Eight MCP tools, a full HTTP surface, zero auth in Phase 0. Every
              endpoint mirrors the same data the web UI renders — no second
              source of truth to keep in sync. Copy any command below and run
              it locally.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-emerald-tint)] px-3 py-1.5 text-[var(--color-emerald-deep)]">
                <span className="pulse-dot" aria-hidden />
                <span className="font-medium">Live · cached at the edge</span>
              </span>
              <a
                href="/api/health"
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border-strong)] px-3 py-1.5 text-[var(--color-text-muted)] hover:border-[var(--color-emerald)] hover:text-[var(--color-emerald-deep)] transition-colors font-mono text-xs"
              >
                /api/health
                <span aria-hidden>↗</span>
              </a>
              <a
                href="https://github.com/cuvetsmo/cuvetsmo-foresight-mcp"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border-strong)] px-3 py-1.5 text-[var(--color-text-muted)] hover:border-[var(--color-emerald)] hover:text-[var(--color-emerald-deep)] transition-colors text-xs"
              >
                MCP server source
                <span aria-hidden>↗</span>
              </a>
              <a
                href="/api/openapi.json"
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border-strong)] px-3 py-1.5 text-[var(--color-text-muted)] hover:border-[var(--color-emerald)] hover:text-[var(--color-emerald-deep)] transition-colors font-mono text-xs"
              >
                OpenAPI 3.1 spec
                <span aria-hidden>↗</span>
              </a>
            </div>
          </div>
        </section>

        {/* Table of contents */}
        <section className="bg-[var(--color-bg-card)] border-b border-[var(--color-border)]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-faint)] mb-4">
              On this page
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
              <a href="#quickstart" className="text-[var(--color-text)] hover:text-[var(--color-emerald-deep)] transition-colors">
                → Quickstart
              </a>
              <a href="#mcp" className="text-[var(--color-text)] hover:text-[var(--color-emerald-deep)] transition-colors">
                → MCP server
              </a>
              <a href="#http" className="text-[var(--color-text)] hover:text-[var(--color-emerald-deep)] transition-colors">
                → HTTP endpoints
              </a>
              <a href="#limits" className="text-[var(--color-text)] hover:text-[var(--color-emerald-deep)] transition-colors">
                → Rate limits + status
              </a>
            </div>
          </div>
        </section>

        {/* Quickstart */}
        <section id="quickstart" className="bg-[var(--color-bg)]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16 sm:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-emerald-deep)] mb-3">
                  01 · Quickstart
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-text-strong)] mb-4">
                  Pick your surface.
                </h2>
                <p className="text-sm text-[var(--color-text-muted)] leading-[1.7]">
                  AI agents speak MCP — one install gives them tool-calling
                  access to the marketplace. Server-side code or bash scripts
                  read the HTTP endpoints directly. Same data either way.
                </p>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <DocCard
                  title="Use from any MCP-aware agent"
                  subtitle="Claude Desktop · Claude Code · custom SDK clients"
                  code={`# Add to your agent's MCP config (e.g., claude_desktop_config.json)
{
  "mcpServers": {
    "foresight": {
      "command": "npx",
      "args": ["-y", "foresight-mcp@latest"]
    }
  }
}`}
                />
                <DocCard
                  title="Use from any HTTP client"
                  subtitle="curl · fetch · requests · server-to-server"
                  code={`curl ${BASE}/api/markets \\
  -H "Accept: application/json" | jq '.markets[0]'`}
                />
              </div>
            </div>
          </div>
        </section>

        {/* MCP server */}
        <section id="mcp" className="bg-[var(--color-bg-dark)] text-[var(--color-text-on-dark)] section-curve-top section-curve-bottom">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 py-20 sm:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-12">
              <div className="lg:col-span-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-emerald-tint)] mb-3">
                  02 · MCP server
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-4">
                  Eight tools, one server.
                </h2>
                <p className="text-sm text-white/70 leading-[1.7]">
                  Standalone Node package. Reads from the public{" "}
                  <span className="font-mono text-white/90">/api/markets</span>{" "}
                  endpoint with a 5-minute in-process cache, falls back to a
                  bundled seed if the network is down. Override the base URL
                  with{" "}
                  <span className="font-mono text-white/90">
                    FORESIGHT_API_BASE
                  </span>
                  .
                </p>
                <a
                  href="https://github.com/cuvetsmo/cuvetsmo-foresight-mcp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-5 text-sm text-[var(--color-emerald-tint)] hover:text-white transition-colors font-medium"
                >
                  View on GitHub
                  <span aria-hidden>↗</span>
                </a>
              </div>

              <div className="lg:col-span-2">
                <DocCardDark
                  title="Install"
                  code={`# Add to your MCP-aware agent's config
{
  "mcpServers": {
    "foresight": {
      "command": "npx",
      "args": ["-y", "foresight-mcp@latest"]
    }
  }
}

# Then in your conversation:
> List the top 5 Thai politics markets closing this quarter.
> Dry-run the resolver on 'anthropic-1m-ctx-2027-q1' as of next March.`}
                />
              </div>
            </div>

            {/* Tool table */}
            <div className="space-y-6">
              {mcpTools.map((tool) => (
                <article
                  key={tool.id}
                  id={tool.id}
                  className="rounded-2xl bg-white/[0.04] border border-white/10 p-6 sm:p-8"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div>
                      <h3 className="font-mono text-base sm:text-lg font-semibold text-white tracking-tight">
                        {tool.name}
                      </h3>
                      <p className="mt-1.5 text-sm text-white/75">{tool.summary}</p>
                    </div>
                    <span className="badge badge--open shrink-0">tool</span>
                  </div>
                  <p className="text-sm text-white/65 leading-[1.7] mb-5">
                    {tool.description}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45 mb-2">
                        Input
                      </p>
                      <pre className="rounded-xl bg-black/40 border border-white/5 p-4 text-[12px] leading-[1.65] text-white/85 overflow-x-auto font-mono">
                        <code>{tool.inputShape}</code>
                      </pre>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45 mb-2">
                        Output
                      </p>
                      <pre className="rounded-xl bg-black/40 border border-white/5 p-4 text-[12px] leading-[1.65] text-white/85 overflow-x-auto font-mono">
                        <code>{tool.outputShape}</code>
                      </pre>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* HTTP endpoints */}
        <section id="http" className="bg-[var(--color-bg)]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 py-20 sm:py-24">
            <div className="max-w-2xl mb-12">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-emerald-deep)] mb-3">
                03 · HTTP endpoints
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-text-strong)] mb-4">
                The full REST surface, no API key.
              </h2>
              <p className="text-sm text-[var(--color-text-muted)] leading-[1.7]">
                All endpoints are public in Phase 0. No signup, no rate limit
                gating — fair-use only. CORS open on read endpoints; write
                endpoints accept JSON only.
              </p>
            </div>

            <div className="space-y-6">
              {apiSections.map((api) => (
                <article
                  key={api.id}
                  id={api.id}
                  className="rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] p-6 sm:p-8"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`inline-flex items-center font-mono text-[11px] font-semibold uppercase tracking-[0.1em] px-2 py-0.5 rounded ${
                            api.method === "GET"
                              ? "bg-[var(--color-emerald-tint)] text-[var(--color-emerald-deep)]"
                              : "bg-[var(--color-amber-tint)] text-[#92400E]"
                          }`}
                        >
                          {api.method}
                        </span>
                        <h3 className="font-mono text-base sm:text-lg font-semibold text-[var(--color-text-strong)] tracking-tight">
                          {api.path}
                        </h3>
                      </div>
                      <p className="mt-2 text-sm text-[var(--color-text)]">{api.summary}</p>
                    </div>
                  </div>
                  <p className="text-sm text-[var(--color-text-muted)] leading-[1.7] mb-5">
                    {api.description}
                  </p>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-faint)] mb-2">
                        Example
                      </p>
                      <pre className="rounded-xl bg-[var(--color-bg-dark)] text-[var(--color-text-on-dark)] border border-[var(--color-border-strong)]/40 p-4 text-[12px] leading-[1.65] overflow-x-auto font-mono">
                        <code>{api.example}</code>
                      </pre>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-faint)] mb-2">
                        Response shape
                      </p>
                      <pre className="rounded-xl bg-[var(--color-bg-tint)] border border-[var(--color-emerald)]/15 p-4 text-[12px] leading-[1.65] text-[var(--color-text)] overflow-x-auto font-mono">
                        <code>{api.responseShape}</code>
                      </pre>
                    </div>
                    {api.notes && api.notes.length > 0 ? (
                      <ul className="mt-2 space-y-2 text-xs text-[var(--color-text-muted)] leading-[1.7]">
                        {api.notes.map((note, i) => (
                          <li key={i} className="flex gap-2">
                            <span aria-hidden className="text-[var(--color-emerald)] shrink-0">
                              ↳
                            </span>
                            <span>{note}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Rate limits + status */}
        <section id="limits" className="bg-[var(--color-bg-card)] border-t border-[var(--color-border)]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 py-20 sm:py-24">
            <div className="max-w-2xl mb-10">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-emerald-deep)] mb-3">
                04 · Rate limits + status
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-text-strong)] mb-4">
                Fair-use, transparent state.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <article className="rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)] p-6">
                <h3 className="text-sm font-semibold text-[var(--color-text-strong)] mb-2">
                  Phase 0 limits
                </h3>
                <p className="text-sm text-[var(--color-text-muted)] leading-[1.7]">
                  No quota enforcement. Edge cache absorbs reads. Don&apos;t
                  hammer the resolver in a tight loop — it costs real LLM
                  tokens once providers are wired.
                </p>
              </article>
              <article className="rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)] p-6">
                <h3 className="text-sm font-semibold text-[var(--color-text-strong)] mb-2">
                  Auth
                </h3>
                <p className="text-sm text-[var(--color-text-muted)] leading-[1.7]">
                  None for reads. Writes (waitlist, future proposals) accept
                  plain JSON. Phase 1 adds API keys + per-key budgets for the
                  resolver.
                </p>
              </article>
              <article className="rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)] p-6">
                <h3 className="text-sm font-semibold text-[var(--color-text-strong)] mb-2">
                  Status probes
                </h3>
                <ul className="text-sm text-[var(--color-text-muted)] leading-[1.7] space-y-1.5">
                  <li>
                    <a
                      href="/api/health"
                      className="font-mono text-xs text-[var(--color-emerald-deep)] hover:underline"
                    >
                      /api/health
                    </a>{" "}
                    — build identity
                  </li>
                  <li>
                    <a
                      href="/api/resolve/status"
                      className="font-mono text-xs text-[var(--color-emerald-deep)] hover:underline"
                    >
                      /api/resolve/status
                    </a>{" "}
                    — verifier mode
                  </li>
                  <li>
                    <a
                      href="/api/openapi.json"
                      className="font-mono text-xs text-[var(--color-emerald-deep)] hover:underline"
                    >
                      /api/openapi.json
                    </a>{" "}
                    — OpenAPI 3.1
                  </li>
                </ul>
              </article>
            </div>

            <div className="mt-10 rounded-2xl bg-[var(--color-emerald-tint)]/40 border border-[var(--color-emerald)]/25 p-6 sm:p-8">
              <h3 className="text-sm font-semibold text-[var(--color-text-strong)] mb-2">
                Found a bug? Want a new endpoint?
              </h3>
              <p className="text-sm text-[var(--color-text-muted)] leading-[1.7] mb-4">
                Public review queue at{" "}
                <Link
                  href="/admin/proposals"
                  className="text-[var(--color-emerald-deep)] hover:underline font-medium"
                >
                  /admin/proposals
                </Link>{" "}
                — submit a market proposal through{" "}
                <code className="font-mono text-xs bg-white px-1.5 py-0.5 rounded border border-[var(--color-border)]">
                  foresight_propose_market
                </code>{" "}
                and it lands there. For DX feedback, open an issue against the
                MCP server repo.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/admin/proposals" className="btn-outline text-sm py-2 px-4">
                  Proposal queue
                  <span aria-hidden>→</span>
                </Link>
                <a
                  href="https://github.com/cuvetsmo/cuvetsmo-foresight-mcp/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline text-sm py-2 px-4"
                >
                  Open an issue
                  <span aria-hidden>↗</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

function DocCard({
  title,
  subtitle,
  code,
}: {
  title: string;
  subtitle: string;
  code: string;
}) {
  return (
    <article className="rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] overflow-hidden">
      <div className="px-6 py-4 border-b border-[var(--color-border)]">
        <h3 className="text-sm font-semibold text-[var(--color-text-strong)]">{title}</h3>
        <p className="text-xs text-[var(--color-text-faint)] mt-0.5">{subtitle}</p>
      </div>
      <pre className="bg-[var(--color-bg-dark)] text-[var(--color-text-on-dark)] p-5 text-[12px] leading-[1.65] overflow-x-auto font-mono">
        <code>{code}</code>
      </pre>
    </article>
  );
}

function DocCardDark({ title, code }: { title: string; code: string }) {
  return (
    <article className="rounded-2xl bg-white/[0.04] border border-white/10 overflow-hidden">
      <div className="px-6 py-4 border-b border-white/10">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      <pre className="bg-black/40 p-5 text-[12px] leading-[1.65] text-white/85 overflow-x-auto font-mono">
        <code>{code}</code>
      </pre>
    </article>
  );
}
