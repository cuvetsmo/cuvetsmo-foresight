/**
 * Cross-venue data layer — fetch Polymarket + Kalshi public APIs to surface
 * "here's what the giants list (or don't) for this question." Strategic
 * positioning: be a venue worth aggregating + the dashboard that points at
 * the gaps the giants don't fill.
 *
 * Both APIs are public, no auth needed. Polymarket Gamma is officially
 * deprecated but still serves; we'll migrate to clob.polymarket.com when
 * Gamma actually disappears.
 *
 * Cached server-side 1h (Next.js fetch cache via `next: { revalidate }`).
 */

export interface VenueMatch {
  source: "polymarket" | "kalshi";
  question: string;
  /** YES probability 0..1, or undefined if the market is multi-outcome and
   *  we can't reduce it to a single yes/no. */
  yesProbability?: number;
  /** Trading volume in USD reported by the venue. */
  volumeUsd?: number;
  /** Liquidity / open interest depth, USD. */
  liquidityUsd?: number;
  /** Closes / expiration ISO 8601. */
  closesAt?: string;
  /** Canonical URL on the venue. */
  url: string;
  /** Venue-side market id, useful for caching. */
  id: string;
}

export interface CrossVenueLookup {
  query: string;
  /** Markets found on Polymarket matching the query. */
  polymarket: VenueMatch[];
  /** Markets found on Kalshi matching the query. */
  kalshi: VenueMatch[];
  /** TRUE if both venues return zero matches — supports the
   *  "you saw it here first" narrative for Foresight-unique content. */
  exclusiveToForesight: boolean;
  /** Server-side timing for the lookup. */
  fetchedMs: number;
}

const REVALIDATE_SEC = 3600;

// ─────────────────────────────────────────────────────────────────
// Polymarket
// ─────────────────────────────────────────────────────────────────

interface PolymarketRow {
  id: string;
  question: string;
  slug: string;
  conditionId?: string;
  endDate?: string;
  liquidity?: string;
  volume?: string;
  outcomes?: string;
  outcomePrices?: string;
  closed?: boolean;
  active?: boolean;
}

async function fetchPolymarketPage(limit = 200): Promise<PolymarketRow[]> {
  const url = new URL("https://gamma-api.polymarket.com/markets");
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("active", "true");
  url.searchParams.set("closed", "false");
  url.searchParams.set("liquidity_num_min", "1000");
  url.searchParams.set("order", "liquidity");
  url.searchParams.set("ascending", "false");

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: REVALIDATE_SEC, tags: ["cross-venue:polymarket"] },
    });
    if (!res.ok) return [];
    return (await res.json()) as PolymarketRow[];
  } catch {
    return [];
  }
}

function parsePolymarketYesProbability(row: PolymarketRow): number | undefined {
  if (!row.outcomePrices || !row.outcomes) return undefined;
  try {
    const prices = JSON.parse(row.outcomePrices) as string[] | number[];
    const outcomes = JSON.parse(row.outcomes) as string[];
    const yesIdx = outcomes.findIndex(
      (o) => typeof o === "string" && o.toLowerCase() === "yes",
    );
    if (yesIdx < 0) return undefined;
    const p = Number(prices[yesIdx]);
    return Number.isFinite(p) ? p : undefined;
  } catch {
    return undefined;
  }
}

function polymarketUrl(row: PolymarketRow): string {
  return `https://polymarket.com/event/${row.slug}`;
}

// ─────────────────────────────────────────────────────────────────
// Kalshi
// ─────────────────────────────────────────────────────────────────

interface KalshiRow {
  ticker?: string;
  title?: string;
  subtitle?: string;
  yes_sub_title?: string;
  no_sub_title?: string;
  status?: string;
  close_time?: string;
  expiration_time?: string;
  last_price?: number;
  liquidity_dollars?: string;
  volume?: number;
  volume_dollars?: string;
  category?: string;
  event_ticker?: string;
}

async function fetchKalshiPage(limit = 100): Promise<KalshiRow[]> {
  const url = new URL("https://api.elections.kalshi.com/trade-api/v2/markets");
  url.searchParams.set("status", "open");
  url.searchParams.set("limit", String(limit));
  try {
    // Kalshi sometimes returns 404 status with valid JSON body (cloudflare
    // quirk). Read the body regardless of status code.
    const res = await fetch(url.toString(), {
      next: { revalidate: REVALIDATE_SEC, tags: ["cross-venue:kalshi"] },
    });
    const text = await res.text();
    try {
      const json = JSON.parse(text) as { markets?: KalshiRow[] };
      return json.markets ?? [];
    } catch {
      return [];
    }
  } catch {
    return [];
  }
}

function kalshiYesProbability(row: KalshiRow): number | undefined {
  if (typeof row.last_price === "number") {
    // Kalshi last_price is in cents (1-99). Convert to probability 0-1.
    return row.last_price / 100;
  }
  return undefined;
}

function kalshiUrl(row: KalshiRow): string {
  if (!row.ticker) return "https://kalshi.com";
  return `https://kalshi.com/markets/${row.event_ticker ?? row.ticker}`;
}

// ─────────────────────────────────────────────────────────────────
// Matching
// ─────────────────────────────────────────────────────────────────

function matches(text: string, terms: string[]): boolean {
  const t = text.toLowerCase();
  return terms.every((term) => t.includes(term.toLowerCase()));
}

/**
 * Look up cross-venue matches for a Foresight market. The caller passes
 * a list of search "term groups" — a row matches if ALL terms in ANY
 * group are present (OR over groups, AND within a group). Example:
 *
 *   crossVenueLookup({ query: "BTC $200K", termGroups: [
 *     ["bitcoin", "200"], ["btc", "200k"]
 *   ]})
 */
export async function crossVenueLookup({
  query,
  termGroups,
  limitPerVenue = 3,
}: {
  query: string;
  termGroups: string[][];
  limitPerVenue?: number;
}): Promise<CrossVenueLookup> {
  const t0 = Date.now();
  const [pmRows, ksRows] = await Promise.all([
    fetchPolymarketPage(),
    fetchKalshiPage(),
  ]);

  const polymarketMatches: VenueMatch[] = [];
  for (const row of pmRows) {
    if (!row.question) continue;
    if (
      termGroups.some((group) =>
        group.length > 0 && matches(row.question, group),
      )
    ) {
      polymarketMatches.push({
        source: "polymarket",
        id: row.id,
        question: row.question,
        yesProbability: parsePolymarketYesProbability(row),
        liquidityUsd: row.liquidity ? Number(row.liquidity) : undefined,
        volumeUsd: row.volume ? Number(row.volume) : undefined,
        closesAt: row.endDate,
        url: polymarketUrl(row),
      });
      if (polymarketMatches.length >= limitPerVenue) break;
    }
  }

  const kalshiMatches: VenueMatch[] = [];
  for (const row of ksRows) {
    const text = `${row.title ?? ""} ${row.subtitle ?? ""} ${row.yes_sub_title ?? ""}`;
    if (!text.trim()) continue;
    if (termGroups.some((group) => group.length > 0 && matches(text, group))) {
      kalshiMatches.push({
        source: "kalshi",
        id: row.ticker ?? row.event_ticker ?? "",
        question: row.title ?? row.yes_sub_title ?? "(untitled)",
        yesProbability: kalshiYesProbability(row),
        liquidityUsd: row.liquidity_dollars ? Number(row.liquidity_dollars) : undefined,
        volumeUsd: row.volume_dollars ? Number(row.volume_dollars) : undefined,
        closesAt: row.close_time ?? row.expiration_time,
        url: kalshiUrl(row),
      });
      if (kalshiMatches.length >= limitPerVenue) break;
    }
  }

  return {
    query,
    polymarket: polymarketMatches,
    kalshi: kalshiMatches,
    exclusiveToForesight:
      polymarketMatches.length === 0 && kalshiMatches.length === 0,
    fetchedMs: Date.now() - t0,
  };
}

/**
 * Heuristic: derive useful search term groups from a Foresight market.
 * Phase 0 uses tags + key noun phrases from the question; Phase 1 will
 * add explicit per-market overrides via a `competitor_search_terms`
 * column.
 */
export function deriveSearchTermsForMarket(market: {
  id: string;
  tags: string[];
  question: string;
  questionEn?: string;
}): string[][] {
  // Curated map for the markets where a generic heuristic doesn't work
  const overrides: Record<string, string[][]> = {
    "btc-200k-2026": [["bitcoin", "200"], ["btc", "200"]],
    "wc30-1.5b-viewers": [["world cup"]],
    "id-presidential-2029": [["indonesia", "president"]],
    "ph-presidential-2028": [["philippines", "president"]],
    "th-elec-2027": [["thailand", "election"]],
    "vn-economy-gdp-2027": [["vietnam", "gdp"]],
    "kalshi-sea-market": [["kalshi"]],
    "anthropic-1m-context-default": [["anthropic"], ["claude"]],
    "chulagenie-vet": [["chulagenie"], ["chula", "ai"]],
    "spacex-starship-iss-dock": [["spacex", "iss"], ["starship", "dock"]],
    "apple-vision-pro2-2026": [["vision pro"]],
    "sea-games-2027-host": [["sea games"]],
    "asf-th-90d": [["asf"], ["swine fever"]],
    "lumpy-skin-2026": [["lumpy skin"]],
    "thai-mr-2026": [["thailand", "measles"]],
    "pm25-cnx-q3": [["chiang mai", "pm2.5"], ["pm25"]],
    "bkk-flood-2026": [["bangkok", "flood"]],
  };
  if (overrides[market.id]) return overrides[market.id];

  // Fallback: use first 2 non-stopword tokens from question
  const stop = new Set([
    "will","the","a","an","by","of","in","on","at","is","to","for","and","or",
    "before","after","this","that","with","jp","th","en",
  ]);
  const tokens = (market.questionEn ?? market.question)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !stop.has(t));
  const head = tokens.slice(0, 2);
  return head.length > 0 ? [head] : [];
}
