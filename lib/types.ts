/**
 * Foresight — domain types.
 *
 * Phase 0 ships mock data only (lib/markets.ts). Once we wire Supabase
 * + on-chain settlement these stay identical — only the data source flips.
 */

export type MarketCategory =
  | "thai-politics"
  | "thai-climate"
  | "thai-vet"
  | "sea-elections"
  | "crypto"
  | "global-tech"
  | "global-sports"
  | "ai-research";

export type MarketStatus = "open" | "closing-soon" | "resolved";

export type Outcome = "yes" | "no";

export interface Market {
  id: string;
  slug: string;
  question: string;
  questionEn?: string;
  category: MarketCategory;
  status: MarketStatus;
  /** Current YES probability — 0..1. NO probability = 1 - this. Phase 0
   *  values are curated reference probabilities, not crowd-derived prices —
   *  isSample === true signals this to the UI. */
  yesProbability: number;
  /** USD-equivalent volume traded over market lifetime. ZERO during
   *  Phase 0 — real number is 0 until trading opens. */
  volumeUsd: number;
  /** Open interest — USD locked in active positions. ZERO during Phase 0. */
  openInterestUsd: number;
  /** ISO 8601 deadline. */
  closesAt: string;
  /** Plain-language resolution criteria — the thing a 3rd party can verify. */
  resolutionCriteria: string;
  /** Where the resolver looks for the answer. */
  resolutionSources: string[];
  /** Optional sparkline of past YES probabilities — most recent last.
   *  In Phase 0 this is a curated reference series, not real trade prints. */
  priceHistory?: number[];
  /** Who proposed this market. Phase 0 = "Foresight" for all. */
  createdBy: string;
  /** Tag chips shown on the card. */
  tags: string[];
  /** TRUE if the market is a curated sample (no real trades). UI shows a
   *  "Sample" badge and suppresses fabricated volume / OI numbers. */
  isSample: boolean;
}

export interface CategoryMeta {
  key: MarketCategory;
  labelTh: string;
  labelEn: string;
  emoji: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { key: "thai-politics", labelTh: "การเมืองไทย", labelEn: "Thai Politics", emoji: "🇹🇭" },
  { key: "thai-climate", labelTh: "ภูมิอากาศไทย", labelEn: "Thai Climate", emoji: "🌧" },
  { key: "thai-vet", labelTh: "สัตวแพทย์ + เกษตร", labelEn: "Vet + Agri", emoji: "🐄" },
  { key: "sea-elections", labelTh: "การเลือกตั้ง SEA", labelEn: "SEA Elections", emoji: "🗳" },
  { key: "crypto", labelTh: "Crypto", labelEn: "Crypto", emoji: "₿" },
  { key: "global-tech", labelTh: "Tech โลก", labelEn: "Global Tech", emoji: "💻" },
  { key: "global-sports", labelTh: "กีฬาโลก", labelEn: "Global Sports", emoji: "⚽" },
  { key: "ai-research", labelTh: "AI + Research", labelEn: "AI Research", emoji: "🧬" },
];
