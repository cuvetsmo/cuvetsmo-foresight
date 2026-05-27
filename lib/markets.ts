import type { Market, MarketCategory } from "./types";
import { SEED_MARKETS } from "./markets-seed";
import { getSupabase } from "./supabase";

/**
 * Markets data layer. Reads from Supabase `public.foresight_markets` when
 * env is configured, falls back to the seed bundled with the build so the
 * landing never breaks.
 *
 * All callers are server components in App Router — these functions only
 * run on the server. Caching follows Next.js' default fetch semantics +
 * an explicit revalidate hint via `next: { revalidate, tags }`.
 */

const REVALIDATE_SEC = 60;

interface DbMarketRow {
  id: string;
  slug: string;
  question: string;
  question_en: string | null;
  category: MarketCategory;
  status: "open" | "closing-soon" | "resolved";
  yes_probability: number;
  volume_usd: number;
  open_interest_usd: number;
  closes_at: string;
  resolution_criteria: string;
  resolution_sources: string[];
  price_history: number[] | null;
  tags: string[] | null;
  created_by: string;
}

function rowToMarket(r: DbMarketRow): Market {
  return {
    id: r.id,
    slug: r.slug,
    question: r.question,
    questionEn: r.question_en ?? undefined,
    category: r.category,
    status: r.status,
    yesProbability: Number(r.yes_probability),
    volumeUsd: Number(r.volume_usd),
    openInterestUsd: Number(r.open_interest_usd),
    closesAt: r.closes_at,
    resolutionCriteria: r.resolution_criteria,
    resolutionSources: r.resolution_sources,
    priceHistory: (r.price_history ?? []).map(Number),
    tags: r.tags ?? [],
    createdBy: r.created_by,
  };
}

let cachedMarkets: { ts: number; data: Market[] } | null = null;

/**
 * Fetch every active market. Cached in-process for `REVALIDATE_SEC`.
 * Falls back to the bundled seed if Supabase is unreachable.
 */
export async function listMarkets(): Promise<Market[]> {
  if (cachedMarkets && Date.now() - cachedMarkets.ts < REVALIDATE_SEC * 1000) {
    return cachedMarkets.data;
  }

  const supabase = getSupabase();
  if (!supabase) {
    cachedMarkets = { ts: Date.now(), data: SEED_MARKETS };
    return SEED_MARKETS;
  }

  const { data, error } = await supabase
    .from("foresight_markets")
    .select(
      "id,slug,question,question_en,category,status,yes_probability,volume_usd,open_interest_usd,closes_at,resolution_criteria,resolution_sources,price_history,tags,created_by",
    )
    .order("volume_usd", { ascending: false });

  if (error || !data || data.length === 0) {
    if (error && process.env.NODE_ENV !== "production") {
      console.warn("[foresight] markets fetch failed, using seed:", error.message);
    }
    cachedMarkets = { ts: Date.now(), data: SEED_MARKETS };
    return SEED_MARKETS;
  }

  const mapped = data.map(rowToMarket);
  cachedMarkets = { ts: Date.now(), data: mapped };
  return mapped;
}

export async function getMarketBySlug(slug: string): Promise<Market | undefined> {
  const all = await listMarkets();
  return all.find((m) => m.slug === slug);
}

export async function marketsByCategory(category: MarketCategory): Promise<Market[]> {
  const all = await listMarkets();
  return all.filter((m) => m.category === category);
}
