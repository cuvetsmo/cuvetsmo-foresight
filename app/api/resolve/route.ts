import { NextResponse, type NextRequest } from "next/server";
import { resolve, type ResolveInput } from "@/lib/resolver";
import { getMarketBySlug } from "@/lib/markets";
import { crossVenueLookup, deriveSearchTermsForMarket } from "@/lib/cross-venue";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface IdentifierMode {
  identifier: string;
  asOf?: string;
}

interface AdHocMode {
  question: string;
  resolutionCriteria: string;
  resolutionSources: string[];
  closesAt: string;
  asOf?: string;
}

type Body = IdentifierMode | AdHocMode;

function isAdHoc(body: Body): body is AdHocMode {
  return (
    typeof (body as AdHocMode).question === "string" &&
    typeof (body as AdHocMode).resolutionCriteria === "string"
  );
}

/**
 * POST /api/resolve
 *
 * Two modes:
 *   1. Resolve a known market:    { identifier: "<slug>", asOf?: ISO }
 *   2. Dry-run an ad-hoc market:  { question, resolutionCriteria,
 *                                   resolutionSources, closesAt, asOf? }
 *
 * Returns the same ResolveResult shape in both modes. Always 200 unless
 * the request body is malformed. The resolver itself never throws — it
 * returns status="pending" or "ambiguous" instead of a 500.
 */
export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  // Resolve the known market up front (if identifier mode) so both the
  // input builder and the cross-venue enrichment can use it.
  let knownMarket: Awaited<ReturnType<typeof getMarketBySlug>> = undefined;
  if (!isAdHoc(body)) {
    knownMarket = await getMarketBySlug(body.identifier);
    if (!knownMarket) {
      return NextResponse.json(
        { error: `Market '${body.identifier}' not found` },
        { status: 404 },
      );
    }
  }

  let input: ResolveInput;
  if (isAdHoc(body)) {
    if (
      !body.question ||
      !body.resolutionCriteria ||
      !Array.isArray(body.resolutionSources) ||
      body.resolutionSources.length === 0 ||
      !body.closesAt
    ) {
      return NextResponse.json(
        {
          error:
            "Ad-hoc mode requires: question, resolutionCriteria, resolutionSources[], closesAt",
        },
        { status: 400 },
      );
    }
    input = {
      question: body.question,
      resolutionCriteria: body.resolutionCriteria,
      resolutionSources: body.resolutionSources,
      closesAt: body.closesAt,
      asOf: body.asOf,
    };
  } else {
    // knownMarket is guaranteed defined here (checked above).
    const m = knownMarket!;
    input = {
      question: m.questionEn ?? m.question,
      resolutionCriteria: m.resolutionCriteria,
      resolutionSources: m.resolutionSources,
      closesAt: m.closesAt,
      asOf: body.asOf,
    };
  }

  const result = await resolve(input);

  // Additive cross-venue REFERENCE for known markets. This does NOT feed
  // the verifier's decision — it's a sanity signal attached to the dry-run
  // response ("for reference, other venues price this at X%"). Best-effort:
  // any failure leaves the field null, never breaking the resolve.
  let crossVenueReference: unknown = null;
  if (knownMarket) {
    try {
      const termGroups = deriveSearchTermsForMarket({
        id: knownMarket.id,
        tags: knownMarket.tags,
        question: knownMarket.question,
        questionEn: knownMarket.questionEn,
      });
      if (termGroups.length > 0) {
        const cv = await crossVenueLookup({
          query: knownMarket.questionEn ?? knownMarket.question,
          termGroups,
          limitPerVenue: 2,
        });
        crossVenueReference = {
          exclusiveToForesight: cv.exclusiveToForesight,
          polymarket: cv.polymarket.map((m) => ({ question: m.question, yesProbability: m.yesProbability, url: m.url })),
          kalshi: cv.kalshi.map((m) => ({ question: m.question, yesProbability: m.yesProbability, url: m.url })),
          manifold: cv.manifold.map((m) => ({ question: m.question, yesProbability: m.yesProbability, url: m.url })),
          note: cv.exclusiveToForesight
            ? "No major venue lists this — no external price to cross-check against. Resolution rests entirely on the named primary sources."
            : "Reference only. The verifier decides from the criterion + named sources, NOT from other venues' prices.",
        };
      }
    } catch {
      // best-effort — leave crossVenueReference null
    }
  }

  return NextResponse.json({
    market: isAdHoc(body) ? null : { identifier: (body as IdentifierMode).identifier },
    asOf: input.asOf ?? new Date().toISOString(),
    ...result,
    crossVenueReference,
  });
}
