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
        `Seven functional endpoints powering ${BRAND.name} (this spec is the 8th meta-endpoint). No API key in Phase 0; fair-use only. ` +
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
          required: ["query", "polymarket", "kalshi", "exclusiveToForesight", "fetchedMs"],
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
