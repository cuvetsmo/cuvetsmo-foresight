import { NextResponse, type NextRequest } from "next/server";
import { resolve, type ResolveInput } from "@/lib/resolver";
import { getMarketBySlug } from "@/lib/markets";

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
    const m = await getMarketBySlug(body.identifier);
    if (!m) {
      return NextResponse.json(
        { error: `Market '${body.identifier}' not found` },
        { status: 404 },
      );
    }
    input = {
      question: m.questionEn ?? m.question,
      resolutionCriteria: m.resolutionCriteria,
      resolutionSources: m.resolutionSources,
      closesAt: m.closesAt,
      asOf: body.asOf,
    };
  }

  const result = await resolve(input);

  return NextResponse.json({
    market: isAdHoc(body) ? null : { identifier: (body as IdentifierMode).identifier },
    asOf: input.asOf ?? new Date().toISOString(),
    ...result,
  });
}
