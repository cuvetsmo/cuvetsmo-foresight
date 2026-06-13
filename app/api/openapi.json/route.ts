import { NextResponse } from "next/server";
import { BRAND, DEPLOY } from "@/lib/brand";

export const runtime = "nodejs";
export const revalidate = 3600;

/**
 * GET /api/openapi.json
 *
 * OpenAPI 3.1 spec for the public surface. Hand-maintained — every change to
 * a /api/* handler should be reflected here. Powers:
 *   - Postman / Insomnia / Bruno collection import
 *   - openapi-typescript / swagger-codegen client generation
 *   - Stainless / Speakeasy SDK pipelines (Phase 1+)
 *   - the /docs page's "machine-readable contract" claim
 *
 * Single source of truth for shapes: lib/types.ts (Market) +
 * lib/resolver.ts (ResolveResult) + each route handler. Drift here is a
 * documentation bug — keep this in lockstep.
 */
export async function GET() {
  const spec = {
    openapi: "3.1.0",
    info: {
      title: `${BRAND.name} Public API`,
      version: "0.1.0",
      description:
        `The public REST surface powering ${BRAND.name} — this spec covers every functional endpoint (it omits only itself). No API key in Phase 0; fair-use only. ` +
        "Same data the web UI renders — single source of truth.",
      contact: {
        name: BRAND.name,
        url: DEPLOY.baseUrl,
      },
      license: { name: "Foresight terms", url: `${DEPLOY.baseUrl}/brand` },
    },
    servers: [{ url: DEPLOY.baseUrl, description: "Production" }],
    tags: [
      { name: "markets", description: "Read forecasting markets" },
      { name: "verifier", description: "Multi-source resolver dry-run" },
      { name: "cross-venue", description: "Polymarket + Kalshi lookup" },
      { name: "intent", description: "Waitlist + intent capture" },
      { name: "status", description: "Health + identity" },
    ],
    paths: {
      "/api/markets": {
        get: {
          tags: ["markets"],
          summary: "List every market — single source of truth",
          description:
            "Returns the full market catalogue. Headers: max-age=30, s-maxage=60, stale-while-revalidate=300. CORS open.",
          responses: {
            "200": {
              description: "Market list",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    required: ["version", "count", "generatedAt", "markets"],
                    properties: {
                      version: { type: "integer", example: 1 },
                      count: { type: "integer", example: 17 },
                      generatedAt: { type: "string", format: "date-time" },
                      markets: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Market" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/resolve": {
        post: {
          tags: ["verifier"],
          summary: "Dry-run the multi-source verifier",
          description:
            "Two modes: identifier (resolve a known market) or ad-hoc (custom question + criterion + sources). Always returns the same ResolveResult shape. Never throws — pending or ambiguous is a valid outcome.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  oneOf: [
                    { $ref: "#/components/schemas/ResolveByIdentifier" },
                    { $ref: "#/components/schemas/ResolveAdHoc" },
                  ],
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Resolver outcome",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ResolveResult" },
                },
              },
            },
            "400": { description: "Invalid request body" },
            "404": { description: "Market identifier not found" },
          },
        },
      },
      "/api/resolve/status": {
        get: {
          tags: ["verifier", "status"],
          summary: "Probe which verifier providers are configured",
          description:
            "Returns which LLM providers are wired WITHOUT leaking key values, prefixes, or any partial form.",
          responses: {
            "200": {
              description: "Verifier status",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ResolverStatus" },
                },
              },
            },
          },
        },
      },
      "/api/cross-venue": {
        get: {
          tags: ["cross-venue"],
          summary: "Find matching markets on Polymarket and Kalshi",
          description:
            "By-slug mode: pass ?slug=<foresight-slug>. Free-text mode: pass ?q=<text>&terms=<AND-group>. Cached at the route level for 1 hour.",
          parameters: [
            {
              name: "slug",
              in: "query",
              schema: { type: "string" },
              description: "Foresight market slug",
            },
            {
              name: "q",
              in: "query",
              schema: { type: "string" },
              description: "Free-text query (used if slug omitted)",
            },
            {
              name: "terms",
              in: "query",
              schema: { type: "array", items: { type: "string" } },
              description:
                "AND-group keywords; comma-separated within a group. Repeat the param for multiple groups.",
            },
          ],
          responses: {
            "200": {
              description: "Cross-venue lookup result",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/CrossVenueResult" },
                },
              },
            },
            "400": { description: "Missing slug or q parameter" },
            "404": { description: "Slug not found" },
          },
        },
      },
      "/api/waitlist": {
        post: {
          tags: ["intent"],
          summary: "Capture trading-intent for a market",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/WaitlistInput" },
              },
            },
          },
          responses: {
            "200": {
              description: "Saved",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string", example: "ok" },
                      saved: { type: "boolean", example: true },
                    },
                  },
                },
              },
            },
            "400": { description: "Invalid email or JSON" },
          },
        },
      },
      "/api/health": {
        get: {
          tags: ["status"],
          summary: "Build identity + deployment URL",
          responses: {
            "200": {
              description: "Service is up",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Health" },
                },
              },
            },
          },
        },
      },
      "/api/stats": {
        get: {
          tags: ["status"],
          summary: "One-shot aggregate stats",
          description:
            "Market counts by category/status, sample-vs-real split, verifier mode, MCP version. Public-only — no per-user state.",
          responses: {
            "200": {
              description: "Aggregate stats",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Stats" } } },
            },
          },
        },
      },
      "/api/proposals": {
        get: {
          tags: ["intent"],
          summary: "Public read of the market proposal queue",
          description:
            "Mirrors the UI at /admin/proposals. Approve/reject actions are auth-gated and not exposed here.",
          responses: {
            "200": {
              description: "Proposal queue",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ProposalQueue" } } },
            },
          },
        },
        post: {
          tags: ["intent"],
          summary: "Submit a market proposal (browser equivalent of foresight_propose_market)",
          description:
            "Same Iron Rule 0 contract as the MCP tool: machine-verifiable criterion with a temporal anchor, 1-5 named sources, future close date, no distress markets. Lands in the public review queue — never auto-listed.",
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/ProposeInput" } } },
          },
          responses: {
            "200": {
              description: "Accepted into review queue",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ProposeAccepted" } } },
            },
            "400": { description: "Malformed field (length, date, email)" },
            "422": { description: "Failed Iron Rule 0 check (distress / no temporal anchor / past close)" },
          },
        },
      },
      "/api/appeal": {
        post: {
          tags: ["verifier"],
          summary: "Appeal a resolver dry-run result",
          description:
            "Closes the loop on appealAvailable:true. The verifier may refuse or be wrong; this logs a human-reviewable appeal. Never auto-changes the result.",
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/AppealInput" } } },
          },
          responses: {
            "200": {
              description: "Appeal received for review",
              content: { "application/json": { schema: { $ref: "#/components/schemas/AppealReceived" } } },
            },
            "400": { description: "Missing question/reasoning or malformed email/URL" },
          },
        },
      },
    },
    components: {
      schemas: {
        Market: {
          type: "object",
          required: [
            "id",
            "slug",
            "question",
            "category",
            "status",
            "yesProbability",
            "volumeUsd",
            "openInterestUsd",
            "closesAt",
            "resolutionCriteria",
            "resolutionSources",
            "tags",
            "createdBy",
          ],
          properties: {
            id: { type: "string", example: "anthropic-1m-ctx-2027-q1" },
            slug: { type: "string", example: "anthropic-1m-ctx-2027-q1" },
            question: { type: "string" },
            questionEn: { type: "string", nullable: true },
            category: {
              type: "string",
              enum: [
                "thai-politics",
                "thai-climate",
                "thai-vet",
                "sea-elections",
                "crypto",
                "global-tech",
                "global-sports",
                "ai-research",
              ],
            },
            status: {
              type: "string",
              enum: ["open", "closing-soon", "resolved"],
            },
            yesProbability: { type: "number", minimum: 0, maximum: 1 },
            volumeUsd: { type: "number", minimum: 0 },
            openInterestUsd: { type: "number", minimum: 0 },
            closesAt: { type: "string", format: "date-time" },
            resolutionCriteria: { type: "string" },
            resolutionSources: {
              type: "array",
              items: { type: "string", format: "uri" },
            },
            priceHistory: {
              type: "array",
              items: { type: "number" },
              nullable: true,
            },
            tags: { type: "array", items: { type: "string" } },
            createdBy: { type: "string" },
            isSample: {
              type: "boolean",
              description:
                "TRUE for Phase 0 curated samples — no real trading volume. Default true.",
            },
          },
        },
        ResolveByIdentifier: {
          type: "object",
          required: ["identifier"],
          properties: {
            identifier: { type: "string", example: "anthropic-1m-ctx-2027-q1" },
            asOf: { type: "string", format: "date-time" },
          },
        },
        ResolveAdHoc: {
          type: "object",
          required: [
            "question",
            "resolutionCriteria",
            "resolutionSources",
            "closesAt",
          ],
          properties: {
            question: { type: "string" },
            resolutionCriteria: { type: "string" },
            resolutionSources: {
              type: "array",
              items: { type: "string", format: "uri" },
              minItems: 1,
            },
            closesAt: { type: "string", format: "date-time" },
            asOf: { type: "string", format: "date-time" },
          },
        },
        ResolveResult: {
          type: "object",
          required: ["status", "reasoning", "citedSources", "appealAvailable"],
          properties: {
            market: {
              type: "object",
              nullable: true,
              properties: {
                identifier: { type: "string" },
              },
            },
            asOf: { type: "string", format: "date-time" },
            status: {
              type: "string",
              enum: ["verifiable", "pending", "ambiguous", "refused"],
            },
            proposedOutcome: {
              type: "string",
              enum: ["yes", "no", "void"],
            },
            confidence: { type: "number", minimum: 0, maximum: 1 },
            reasoning: { type: "string" },
            citedSources: {
              type: "array",
              items: {
                type: "object",
                required: ["source", "checked", "note"],
                properties: {
                  source: { type: "string" },
                  checked: { type: "boolean" },
                  note: { type: "string" },
                  url: { type: "string", format: "uri" },
                },
              },
            },
            appealAvailable: { type: "boolean" },
            providerUsed: {
              type: "string",
              enum: ["groq", "cerebras", "sambanova", "openrouter", "mistral"],
              description:
                "Omitted when no providers are configured — see /api/resolve/status.",
            },
            refusalReason: { type: "string" },
            crossVenueReference: {
              type: "object",
              nullable: true,
              description:
                "Present only for known-market (identifier-mode) resolves. Reference signal — what Polymarket/Kalshi/Manifold price the same question at. Does NOT influence the verifier's decision (criterion + named sources decide). null for ad-hoc resolves or when the lookup is unavailable.",
              properties: {
                exclusiveToForesight: { type: "boolean" },
                polymarket: { type: "array", items: { $ref: "#/components/schemas/CrossVenueMatch" } },
                kalshi: { type: "array", items: { $ref: "#/components/schemas/CrossVenueMatch" } },
                manifold: { type: "array", items: { $ref: "#/components/schemas/CrossVenueMatch" } },
                note: { type: "string" },
              },
            },
          },
        },
        ResolverStatus: {
          type: "object",
          required: [
            "mode",
            "providersConfigured",
            "providersAvailable",
            "note",
          ],
          properties: {
            mode: { type: "string", enum: ["live", "fallback"] },
            providersConfigured: { type: "array", items: { type: "string" } },
            providersAvailable: { type: "array", items: { type: "string" } },
            note: { type: "string" },
          },
        },
        CrossVenueResult: {
          type: "object",
          required: ["query", "polymarket", "kalshi", "manifold", "exclusiveToForesight", "fetchedMs"],
          properties: {
            query: { type: "string" },
            polymarket: {
              type: "array",
              items: { $ref: "#/components/schemas/CrossVenueMatch" },
            },
            kalshi: {
              type: "array",
              items: { $ref: "#/components/schemas/CrossVenueMatch" },
            },
            manifold: {
              type: "array",
              items: { $ref: "#/components/schemas/CrossVenueMatch" },
              description:
                "Matches from Manifold Markets (MIT-licensed open community forecasting). Per-query search, much higher recall than Polymarket/Kalshi for SEA / AI / climate / vet topics.",
            },
            exclusiveToForesight: { type: "boolean" },
            fetchedMs: { type: "integer", minimum: 0 },
            note: { type: "string" },
          },
        },
        CrossVenueMatch: {
          type: "object",
          required: ["title", "url"],
          properties: {
            title: { type: "string" },
            url: { type: "string", format: "uri" },
            yesProbability: { type: "number", minimum: 0, maximum: 1 },
            volumeUsd: { type: "number", minimum: 0 },
          },
        },
        WaitlistInput: {
          type: "object",
          required: ["email"],
          properties: {
            email: { type: "string", format: "email" },
            marketId: { type: "string" },
            side: { type: "string", enum: ["yes", "no"] },
            sizeUsd: { type: "number", minimum: 0 },
            source: { type: "string" },
          },
        },
        Health: {
          type: "object",
          required: ["name", "status", "phase", "baseUrl", "timestamp"],
          properties: {
            name: { type: "string", example: "Foresight" },
            status: { type: "string", example: "ok" },
            phase: { type: "string", example: "0" },
            baseUrl: { type: "string", format: "uri" },
            educationalBeta: { type: "boolean" },
            timestamp: { type: "string", format: "date-time" },
          },
        },
        Stats: {
          type: "object",
          required: ["name", "baseUrl", "phase", "generatedAt", "markets", "verifier", "mcp", "endpoints"],
          properties: {
            name: { type: "string" },
            baseUrl: { type: "string", format: "uri" },
            phase: { type: "string" },
            generatedAt: { type: "string", format: "date-time" },
            markets: {
              type: "object",
              properties: {
                total: { type: "integer", minimum: 0 },
                sample: { type: "integer", minimum: 0 },
                real: { type: "integer", minimum: 0 },
                byStatus: {
                  type: "object",
                  properties: {
                    open: { type: "integer", minimum: 0 },
                    closingSoon: { type: "integer", minimum: 0 },
                    resolved: { type: "integer", minimum: 0 },
                  },
                },
                byCategory: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      key: { type: "string" },
                      label: { type: "string" },
                      count: { type: "integer", minimum: 0 },
                    },
                  },
                },
              },
            },
            verifier: {
              type: "object",
              properties: {
                mode: { type: "string", enum: ["live", "fallback"] },
                providersConfigured: { type: "array", items: { type: "string" } },
                providersAvailable: { type: "array", items: { type: "string" } },
              },
            },
            mcp: {
              type: "object",
              properties: {
                package: { type: "string" },
                sourceVersion: { type: "string" },
                npmPublished: { type: "boolean" },
                tools: { type: "array", items: { type: "string" } },
                sourceUrl: { type: "string", format: "uri" },
              },
            },
            docs: {
              type: "object",
              properties: {
                openapi: { type: "string" },
                developerPage: { type: "string" },
                changelog: { type: "string" },
              },
            },
          },
        },
        MarketProposal: {
          type: "object",
          required: [
            "id",
            "draftId",
            "question",
            "category",
            "closesAt",
            "resolutionCriteria",
            "resolutionSources",
            "tags",
            "proposedAt",
            "reviewStatus",
          ],
          properties: {
            id: { type: "string" },
            draftId: { type: "string" },
            question: { type: "string" },
            questionEn: { type: "string", nullable: true },
            category: { type: "string" },
            closesAt: { type: "string", format: "date-time" },
            resolutionCriteria: { type: "string" },
            resolutionSources: { type: "array", items: { type: "string", format: "uri" } },
            tags: { type: "array", items: { type: "string" } },
            proposedBy: { type: "string", nullable: true },
            proposedAt: { type: "string", format: "date-time" },
            reviewedBy: { type: "string", nullable: true },
            reviewedAt: { type: "string", format: "date-time", nullable: true },
            reviewStatus: {
              type: "string",
              enum: ["pending", "approved", "rejected", "revisions-requested"],
            },
            reviewNotes: { type: "string", nullable: true },
          },
        },
        ProposeInput: {
          type: "object",
          required: ["question", "category", "closesAt", "resolutionCriteria", "resolutionSources"],
          properties: {
            question: { type: "string", minLength: 10, maxLength: 280 },
            questionEn: { type: "string" },
            category: {
              type: "string",
              enum: [
                "thai-politics",
                "thai-climate",
                "thai-vet",
                "sea-elections",
                "crypto",
                "global-tech",
                "global-sports",
                "ai-research",
              ],
            },
            closesAt: { type: "string", format: "date-time", description: "Must be in the future." },
            resolutionCriteria: {
              type: "string",
              minLength: 40,
              maxLength: 1000,
              description: "Must contain a temporal/conditional anchor (if/when/before/after/on/by).",
            },
            resolutionSources: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 5 },
            tags: { type: "array", items: { type: "string" }, maxItems: 8 },
            email: { type: "string", format: "email" },
          },
        },
        ProposeAccepted: {
          type: "object",
          required: ["status", "draftId", "queueUrl", "reviewSlaHours", "message"],
          properties: {
            status: { type: "string", example: "pending_review" },
            draftId: { type: "string" },
            queueUrl: { type: "string", example: "/admin/proposals" },
            reviewSlaHours: { type: "integer", example: 48 },
            message: { type: "string" },
          },
        },
        AppealInput: {
          type: "object",
          required: ["question", "reasoning"],
          properties: {
            identifier: { type: "string", description: "Market id/slug if appealing a known market." },
            question: { type: "string" },
            disputedStatus: { type: "string" },
            disputedOutcome: { type: "string" },
            reasoning: { type: "string", minLength: 10, description: "Why the result is wrong." },
            evidenceUrl: { type: "string", format: "uri" },
            email: { type: "string", format: "email" },
          },
        },
        AppealReceived: {
          type: "object",
          required: ["status", "queued", "message", "reviewSlaHours"],
          properties: {
            status: { type: "string", example: "received" },
            queued: { type: "boolean", example: true },
            message: { type: "string" },
            reviewSlaHours: { type: "integer", example: 72 },
          },
        },
        ProposalQueue: {
          type: "object",
          required: ["version", "count", "byStatus", "generatedAt", "queueUrl", "submitVia", "reviewSlaHours", "proposals"],
          properties: {
            version: { type: "integer" },
            count: { type: "integer", minimum: 0 },
            byStatus: {
              type: "object",
              properties: {
                pending: { type: "integer", minimum: 0 },
                revisionsRequested: { type: "integer", minimum: 0 },
                approved: { type: "integer", minimum: 0 },
                rejected: { type: "integer", minimum: 0 },
              },
            },
            generatedAt: { type: "string", format: "date-time" },
            queueUrl: { type: "string" },
            submitVia: {
              type: "object",
              properties: {
                mcpTool: { type: "string" },
                mcpPackage: { type: "string" },
              },
            },
            reviewSlaHours: { type: "integer" },
            proposals: { type: "array", items: { $ref: "#/components/schemas/MarketProposal" } },
          },
        },
      },
    },
  } as const;

  return NextResponse.json(spec, {
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=3600",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
    },
  });
}
