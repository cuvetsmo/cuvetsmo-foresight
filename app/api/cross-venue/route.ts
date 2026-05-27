import { NextResponse, type NextRequest } from "next/server";
import { crossVenueLookup, deriveSearchTermsForMarket } from "@/lib/cross-venue";
import { getMarketBySlug } from "@/lib/markets";

export const runtime = "nodejs";
export const revalidate = 3600;

/**
 * GET /api/cross-venue?slug=<foresight-slug>
 * GET /api/cross-venue?q=<free-text>&terms=foo,bar&terms=baz
 *
 * By-slug mode: pulls the market, derives search terms via the override
 * map in cross-venue.ts, and returns matches from Polymarket + Kalshi.
 *
 * Free-text mode: query string is the human-readable label; terms params
 * are the AND-groups (one ?terms= per group, comma-separated within).
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");
  const q = url.searchParams.get("q");

  let query: string;
  let termGroups: string[][] = [];

  if (slug) {
    const m = await getMarketBySlug(slug);
    if (!m) {
      return NextResponse.json(
        { error: `Market '${slug}' not found` },
        { status: 404 },
      );
    }
    query = m.questionEn ?? m.question;
    termGroups = deriveSearchTermsForMarket({
      id: m.id,
      tags: m.tags,
      question: m.question,
      questionEn: m.questionEn,
    });
  } else if (q) {
    query = q;
    const rawTerms = url.searchParams.getAll("terms");
    termGroups = rawTerms
      .map((g) => g.split(",").map((s) => s.trim()).filter(Boolean))
      .filter((g) => g.length > 0);
    if (termGroups.length === 0) {
      // Fallback: split the query into simple AND group
      termGroups = [q.toLowerCase().split(/\s+/).slice(0, 3)];
    }
  } else {
    return NextResponse.json(
      { error: "Provide either ?slug=<foresight-slug> or ?q=<text>" },
      { status: 400 },
    );
  }

  if (termGroups.length === 0) {
    return NextResponse.json({
      query,
      polymarket: [],
      kalshi: [],
      exclusiveToForesight: true,
      fetchedMs: 0,
      note: "No search terms could be derived from the market.",
    });
  }

  const result = await crossVenueLookup({ query, termGroups });
  return NextResponse.json(result);
}
