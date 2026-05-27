# Foresight — foresight.cuvetsmo.com

The prediction market built for Southeast Asia and the niches the rest overlook — Thai politics, monsoon, ASF outbreaks, AI research, sleeper crypto events. Cohort-curated, MCP-native, AI-assisted resolution.

A subdomain of the CUVETSMO ecosystem. Will spin off to its own domain once the product proves itself.

## Stack

- Next.js 16.2.6 (App Router)
- React 19.2.4
- Tailwind CSS 4 (PostCSS)
- TypeScript 5
- Inter + IBM Plex Sans Thai (Google Fonts)
- Hosted on Vercel via GitHub Actions (cuvetsmo org has no Vercel App)

Phase 0 is **frontend-only with mock markets** — no wallet, no on-chain, no real money. The point is to nail product feel before turning on liquidity.

## Local dev

```bash
npm install
npm run dev
```

App boots at http://localhost:3000.

## Project layout

```
app/
├── layout.tsx               Root layout — fonts, metadata, JSON-LD
├── globals.css              Design tokens (light bg + emerald accent)
├── page.tsx                 Landing — hero, featured, how-it-works, MCP, roadmap
├── markets/page.tsx         All markets, grouped by 8 categories
├── markets/[slug]/page.tsx  Market detail — price, order book, resolution
├── not-found.tsx            404 with brand voice
├── robots.ts + sitemap.ts   SEO
components/
├── EcosystemBar.tsx         Shared dark top bar (links to CUVETSMO surfaces)
├── Header.tsx               Sticky light header with brand mark
├── Footer.tsx               Dark footer with curved top
├── MarketCard.tsx           Card primitive with sparkline + YES/NO percent
└── Sparkline.tsx            Pure SVG inline chart
lib/
├── types.ts                 Market + category typedefs
└── markets.ts               10 mock markets across 8 categories
.github/workflows/deploy.yml GH Actions → Vercel CLI (cuvetsmo org pattern)
```

## Design language

Mozi.finance structure (light surface, alternating sections, curved transitions) with emerald accent (#10B981) instead of mozi's purple. NO outcome uses neutral slate (not red) so the product reads as **forecasting, not gambling**.

| Token | Value |
|---|---|
| BG primary | `#FAFAFA` |
| BG dark sections | `#0F172A` |
| Accent (YES, CTA) | `#10B981` |
| NO outcome | `#64748B` |
| Closing-soon | `#F59E0B` |
| Display + body | Inter + IBM Plex Sans Thai |

Sticks to the **CUVETSMO ecosystem subdomain-theme-differentiation rule** — every subdomain has its own visual identity (labs cream/orange, imaging clinical dark, web3 Base Blue, foresight light + emerald).

## Roadmap

- **Phase 0** (this commit) — landing + market list + market detail + 10 mock markets across 8 categories
- **Phase 1** — Foresight MCP server (5 tools) · AI-assisted resolver + appeal panel · smart wallet onboarding (gas-sponsored) · public market proposal flow
- **Phase 2** — USDC on Base mainnet · mobile-first PWA · liquidity grants for market makers · open-source the protocol

## Deploy

GH Actions handles push-to-deploy via Vercel CLI. Set these repo secrets first:

```bash
gh secret set VERCEL_TOKEN     # https://vercel.com/account/tokens
gh secret set VERCEL_ORG_ID    # team_GZDXlQmo6KrpaaO0zJ16w9oB
gh secret set VERCEL_PROJECT_ID # from `vercel link` first run
```

Subdomain is configured in Vercel dashboard → Project Settings → Domains → add `foresight.cuvetsmo.com` and follow CNAME instructions.

> ⚠️ The cuvetsmo org has 100/day Vercel deploy quota team-wide. Don't burst push — squash session-end commits.
