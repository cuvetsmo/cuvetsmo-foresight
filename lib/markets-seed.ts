import type { Market } from "./types";

/**
 * Local fallback seed — used when NEXT_PUBLIC_SUPABASE_* env vars are unset
 * OR the Supabase query errors. Production reads from the live table.
 *
 * Every entry below has:
 *   - isSample: true (Phase 0 — UI labels as "sample data" honestly)
 *   - volumeUsd: 0, openInterestUsd: 0 (real number — no trades yet)
 *   - yesProbability: curated reference, NOT a crowd-derived price
 *   - resolution criteria that point at events still in the future relative
 *     to 2026-05-27 (Iron Rule 0 audit, see migration foresight_iron_rule_0_audit)
 *
 * Three earlier entries were dropped after the audit:
 *   - gpt5-release-2026     · GPT-5 released Aug 7, 2025
 *   - polymarket-solana     · Polymarket own-contracts upgrade Apr 2026
 *   - tsla-fsd-v13          · V13.2.9 stable shipped + superseded by V14
 */
export const SEED_MARKETS: Market[] = [
  {
    id: "asf-th-90d",
    slug: "new-asf-outbreak-thailand-90d",
    question:
      "ASF จะถูกตรวจพบในจังหวัดใหม่ของไทย (ไม่เคยมี case ใน 12 เดือนก่อน) ภายใน 90 วัน?",
    questionEn:
      "Will the Thai DLD confirm an African Swine Fever outbreak in a province that has had zero ASF cases in the prior 12 months, within the next 90 days?",
    category: "thai-vet",
    status: "open",
    yesProbability: 0.55,
    volumeUsd: 0,
    openInterestUsd: 0,
    closesAt: "2026-08-25T00:00:00Z",
    resolutionCriteria:
      "Resolves YES if the Department of Livestock Development (DLD) publishes a confirmed ASF case on a commercial Thai pig farm between 2026-05-27 and 2026-08-25 in a province that had zero DLD-reported ASF cases for the 12 months immediately preceding 2026-05-27.",
    resolutionSources: ["dld.go.th", "WOAH official disease reports"],
    priceHistory: [0.62, 0.58, 0.54, 0.52, 0.55, 0.57, 0.56, 0.55],
    createdBy: "Foresight",
    tags: ["asf", "biosecurity", "vet"],
    isSample: true,
  },
  {
    id: "pm25-cnx-q3",
    slug: "chiangmai-pm25-150-14days-q3",
    question: "เชียงใหม่จะมี PM2.5 > 150 µg/m³ ติดกัน 14 วันใน Q3 2026?",
    questionEn:
      "Chiang Mai PM2.5 > 150 ug/m3 for 14 consecutive days in Q3 2026?",
    category: "thai-climate",
    status: "open",
    yesProbability: 0.18,
    volumeUsd: 0,
    openInterestUsd: 0,
    closesAt: "2026-09-30T23:59:59Z",
    resolutionCriteria:
      "Resolves YES if the Pollution Control Department (PCD) Chiang Mai station records a 14-day rolling window with PM2.5 24h-avg > 150 within 2026-07-01 to 2026-09-30.",
    resolutionSources: ["air4thai.com", "IQAir cross-check"],
    priceHistory: [0.22, 0.2, 0.19, 0.17, 0.16, 0.18, 0.19, 0.18],
    createdBy: "Foresight",
    tags: ["pm25", "climate", "chiangmai"],
    isSample: true,
  },
  {
    id: "btc-200k-2026",
    slug: "btc-touch-200k-by-eoy-2026",
    question: "BTC จะแตะ $200K ก่อนสิ้นปี 2026?",
    questionEn: "Will Bitcoin touch $200,000 USD before 2026-12-31?",
    category: "crypto",
    status: "open",
    yesProbability: 0.28,
    volumeUsd: 0,
    openInterestUsd: 0,
    closesAt: "2026-12-31T23:59:59Z",
    resolutionCriteria:
      "Resolves YES if the Coinbase BTC-USD spot price prints >= 200,000 at least once on a 1-minute candle before 2026-12-31 23:59 UTC.",
    resolutionSources: ["Coinbase Pro", "Kraken (tiebreaker)"],
    priceHistory: [0.18, 0.21, 0.25, 0.3, 0.27, 0.29, 0.32, 0.28],
    createdBy: "Foresight",
    tags: ["bitcoin", "price", "crypto"],
    isSample: true,
  },
  {
    id: "chulagenie-vet",
    slug: "chulagenie-vet-vertical-2026",
    question: "ChulaGENIE จะเพิ่ม vet-specific agent ภายใน 2026?",
    questionEn:
      "Will ChulaGENIE ship a veterinary-specific agent by 2026-12-31?",
    category: "ai-research",
    status: "open",
    yesProbability: 0.22,
    volumeUsd: 0,
    openInterestUsd: 0,
    closesAt: "2026-12-31T23:59:59Z",
    resolutionCriteria:
      "Resolves YES if ChulaGENIE (chula.ai / Chula AI portal) lists a published agent template explicitly labeled veterinary, vet, สัตวแพทย์, or equivalent before 2026-12-31.",
    resolutionSources: ["chula.ai", "official Chula announcement"],
    priceHistory: [0.15, 0.18, 0.2, 0.22, 0.24, 0.21, 0.23, 0.22],
    createdBy: "Foresight",
    tags: ["chulagenie", "ai", "vet"],
    isSample: true,
  },
  {
    id: "kalshi-sea-market",
    slug: "kalshi-first-sea-market-2026",
    question: "Kalshi จะมี market ตลาด SEA (ไม่ใช่ US/EU) ก่อนสิ้นปี 2026?",
    questionEn:
      "Will Kalshi list a Southeast Asia-specific market before 2026-12-31?",
    category: "crypto",
    status: "open",
    yesProbability: 0.07,
    volumeUsd: 0,
    openInterestUsd: 0,
    closesAt: "2026-12-31T23:59:59Z",
    resolutionCriteria:
      "Resolves YES if Kalshi lists any market whose underlying event is geographically specific to Singapore, Thailand, Vietnam, Indonesia, Philippines, Malaysia, or Myanmar before 2026-12-31.",
    resolutionSources: ["kalshi.com markets index"],
    priceHistory: [0.05, 0.06, 0.07, 0.08, 0.06, 0.07, 0.08, 0.07],
    createdBy: "Foresight",
    tags: ["kalshi", "competitor-watch", "sea"],
    isSample: true,
  },
  {
    id: "th-elec-2027",
    slug: "thailand-snap-election-before-q4-2027",
    question: "ประเทศไทยจะมีการเลือกตั้งทั่วไปก่อน Q4 2027?",
    questionEn: "Will Thailand hold a general election before Q4 2027?",
    category: "thai-politics",
    status: "open",
    yesProbability: 0.42,
    volumeUsd: 0,
    openInterestUsd: 0,
    closesAt: "2027-10-01T00:00:00Z",
    resolutionCriteria:
      "Resolves YES if the Election Commission of Thailand (ECT) holds a general election with results announced before 2027-10-01. Snap elections count.",
    resolutionSources: ["ect.go.th", "Royal Thai Government Gazette"],
    priceHistory: [0.31, 0.33, 0.36, 0.34, 0.38, 0.42, 0.44, 0.42],
    createdBy: "Foresight",
    tags: ["election", "thailand", "long-term"],
    isSample: true,
  },
  {
    id: "wc30-1.5b-viewers",
    slug: "world-cup-2030-final-viewers-1.5b",
    question: "นัดชิง World Cup 2030 จะมีผู้ชม > 1.5B?",
    questionEn:
      "World Cup 2030 final — global TV audience > 1.5 billion?",
    category: "global-sports",
    status: "open",
    yesProbability: 0.48,
    volumeUsd: 0,
    openInterestUsd: 0,
    closesAt: "2030-08-01T00:00:00Z",
    resolutionCriteria:
      "Resolves YES if FIFA's official post-tournament audit reports a global cumulative live audience for the final match > 1.5 billion within 6 months of the final whistle.",
    resolutionSources: ["fifa.com official audit", "Kantar Sport report"],
    priceHistory: [0.5, 0.49, 0.51, 0.47, 0.46, 0.48, 0.49, 0.48],
    createdBy: "Foresight",
    tags: ["worldcup", "fifa", "audience"],
    isSample: true,
  },
  {
    id: "id-presidential-2029",
    slug: "indonesia-presidential-2029-winner-coalition-a",
    question: "พรรค Coalition A จะชนะ presidential ของอินโดฯ 2029?",
    questionEn:
      "Will Coalition A win the Indonesia 2029 presidential election?",
    category: "sea-elections",
    status: "open",
    yesProbability: 0.31,
    volumeUsd: 0,
    openInterestUsd: 0,
    closesAt: "2029-02-14T00:00:00Z",
    resolutionCriteria:
      "Resolves YES if KPU (Komisi Pemilihan Umum) certifies a candidate from Coalition A as president-elect of Indonesia in the 2029 election cycle.",
    resolutionSources: ["kpu.go.id", "Reuters election desk"],
    priceHistory: [0.28, 0.3, 0.32, 0.31, 0.33, 0.3, 0.32, 0.31],
    createdBy: "Foresight",
    tags: ["indonesia", "election", "sea"],
    isSample: true,
  },
];
