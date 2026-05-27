# Foresight — agent guide

Quick orientation for any AI agent (or new contributor) jumping into this repo cold.

## What this is

`foresight.cuvetsmo.com` — Phase 0 prediction-market product. Frontend-only Next.js 16 + Tailwind 4 with mock markets. The goal is to **nail product feel** before turning on real liquidity.

This is part of the CUVETSMO ecosystem (sibling to labs/imaging/web3) — see `EcosystemBar.tsx` for the family.

## Iron rules (read first)

1. **No real-money or wallet code yet.** Phase 0 is read-only. Don't pull in Privy/Pimlico/wagmi until Palm signals Phase 1.
2. **No middle-dot `·` separator in user-facing copy.** Use commas, em-dashes, or line breaks. Tightly paired tech labels are the only exception.
3. **No "Claude" or "AI" leak in user-visible copy.** The MCP section refers to "AI agents" generically. Marketing voice stays product-first.
4. **No emojis as icons.** SVG/text only. Category emojis on market cards are acceptable since they're content labels, not UI chrome.
5. **No Co-Authored-By Claude trailer in commits.** This is a public cuvetsmo-org repo. Vault `MycOS` is the only place Co-Authored-By goes.
6. **Don't burst-push.** The cuvetsmo org shares a 100/day Vercel quota across labs/imaging/web3/foresight/main. Squash to one commit per session.

## Design system summary

| | |
|---|---|
| Surface | Light (`#FAFAFA`) primary, alternating with white cards |
| Dark accent | `#0F172A` slate-900 for "institutional" sections + footer |
| Brand accent | `#10B981` emerald — CTA, YES outcome, live pulse |
| NO outcome | `#64748B` slate-500 (intentional non-red — forecasting, not gambling) |
| Display + body | Inter + IBM Plex Sans Thai (Thai fallback) |
| Radius | `rounded-3xl` cards, `rounded-2xl` buttons, `rounded-4xl` curved section breaks |
| Spacing | `py-20`/`py-24` between major sections, `max-w-7xl` containers |

Inspired by mozi.finance structure (light surface + curved sections + alternating bg) with emerald instead of purple.

## File map

```
app/
├── page.tsx           Landing — hero, featured markets, how-it-works,
│                      competitive table, MCP section, roadmap, cohort callout
├── markets/page.tsx   All markets grouped by 8 categories with chips
├── markets/[slug]/    Market detail — price + chart, resolution criteria,
│   page.tsx           order book mock, trade panel (disabled in Phase 0)
├── globals.css        ALL design tokens live here (CSS vars)
└── layout.tsx         Fonts + metadata + JSON-LD

components/
├── EcosystemBar.tsx   Shared dark CUVETSMO ecosystem switcher
├── Header.tsx         Sticky brand header
├── Footer.tsx         Dark footer w/ curved top
├── MarketCard.tsx     Card primitive — used in landing + markets
└── Sparkline.tsx      Pure SVG mini-chart

lib/
├── types.ts           Market + Category typedefs + CATEGORIES const
└── markets.ts         10 seed markets — edit here to add/remove
```

## Adding a new market

Edit `lib/markets.ts`. Required fields: `id`, `slug` (kebab-case, used in URL), `question` (Thai), `questionEn` (English), `category` (one of 8 in `lib/types.ts`), `status`, `yesProbability` (0..1), `volumeUsd`, `openInterestUsd`, `closesAt` (ISO 8601), `resolutionCriteria` (specific + verifiable), `resolutionSources` (array of named sources), `tags`.

Pre-flight before commit: every market needs **machine-verifiable resolution criteria + at least one named source**. No "we'll figure it out later" markets.

## What's NOT here yet

- Wallet/auth (Privy + Pimlico planned for Phase 1)
- Real order book + matching engine (Phase 1)
- On-chain settlement (Phase 2 — USDC on Base)
- Foresight MCP server (planned standalone in `palm-mcp-suite` or its own repo)
- AI-assisted resolver (Phase 1)
- Supabase backend (Phase 1 — share with cuvetsmo if possible)
- i18n proper (Phase 0 hardcodes Thai + English side-by-side in copy)

## Useful patterns

- **Deep-link category** — use `/markets#cat-thai-vet` (CategorySection has matching `id`).
- **Trending detection** — `priceHistory[last] > priceHistory[0]` → emerald sparkline, else slate.
- **Pulse dot** — `<span className="pulse-dot" aria-hidden />` for any "live" indicator.
- **Mozi-style curved section** — wrap section in `bg-[…] section-curve-top section-curve-bottom` for the rounded-4xl transition.
