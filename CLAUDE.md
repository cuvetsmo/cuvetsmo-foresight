# CLAUDE.md — Foresight project context

Project-level instructions for any Claude Code session that opens this repo. Vault context lives at `C:\Users\palmz\OneDrive\Desktop\MycOS\CLAUDE.md` — read that first if vault context is missing.

## What we're building

Foresight is a prediction market positioned as a **venue, not an aggregator** — the strategic insight from researching mozi.finance is that mozi (and similar aggregators) will aggregate Polymarket + Kalshi. To win we don't compete on aggregation; we become a **venue worth aggregating** by owning content niches the giants don't list (SEA politics, Thai climate, vet/agri, frontier research).

3 layers, 3 phases:

| Phase | Focus | Status |
|---|---|---|
| **Phase 0** | SEA + niche wedge — landing + market list + detail with 10 mock markets | **shipping now** |
| **Phase 1** | MCP-native protocol + AI-assisted resolver + smart wallet | next 90 days |
| **Phase 2** | Global expansion — USDC on Base mainnet + mobile PWA + open-source protocol | 2027 |

## Stack decisions

- **Next.js 16 App Router** — same as labs/imaging/web3 (consistency across CUVETSMO subdomains)
- **Tailwind 4 + CSS vars** — design tokens in `app/globals.css`, NOT scattered through components
- **No state library yet** — Phase 0 has no client state. Use server components for everything possible.
- **No backend yet** — markets are static in `lib/markets.ts`. Will move to Supabase when needed (likely shared with cuvetsmo main project).
- **No wallet code yet** — explicitly deferred to Phase 1. Don't add Privy/Pimlico unless Palm signals.
- **Mozi structure + emerald accent** — Palm's directive 2026-05-27. See `globals.css` tokens.

## Iron rules

Pulled from vault memory + cuvetsmo-org conventions. Verbatim because they bite when ignored:

1. **No `git add -A`.** Stage by name. Reason: untracked noise from .lazyweb, scratch files, .env*.
2. **No `Co-Authored-By: Claude` trailer.** Palm calls this "ดูไม่ polish" in public repos.
3. **No middle-dot `·` separator in user-facing copy.** Comma, em-dash, or line break instead.
4. **No "Claude" / "AI" in user-visible copy.** Marketing voice is product-first. MCP section uses "AI agents" generically.
5. **Subdomain visual differentiation.** Foresight = light + emerald. Don't copy labs cream/orange or web3 Base Blue tokens.
6. **cuvetsmo org has no Vercel App.** Push doesn't auto-deploy. Use the `.github/workflows/deploy.yml` workflow (Vercel CLI via secrets). Set `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` via `gh secret set`.
7. **100/day Vercel deploy quota team-wide.** Squash session-end commits. Use `[skip ci]` for README-only changes.
8. **Iron Rule 0 — never hallucinate.** Especially in resolution criteria. Every market needs a verifiable source. No "TBD" resolution criteria. Refuse > fabricate.

## Adding markets

Open `lib/markets.ts`. Use the existing entries as templates. Required:

- `slug` kebab-case (becomes URL)
- `question` Thai-first, `questionEn` English mirror
- `category` exactly one of the 8 in `lib/types.ts`
- `resolutionCriteria` specific + machine-verifiable + names sources
- `resolutionSources` array of named primary sources (gov, official journals, audited APIs)
- `closesAt` ISO 8601
- `priceHistory` 6-10 values 0..1 for sparkline (visual only in Phase 0)

Before commit: re-read the `resolutionCriteria` — would a stranger be able to verify it without contacting Palm? If no, rewrite.

## Don't do

- Don't add features beyond the current phase. Phase 0 ships a product feel. Phase 1 ships trading. Don't sneak in wallet stubs.
- Don't change the visual palette without re-reading vault rule `subdomain-theme-differentiation`.
- Don't auto-add markets via agent without resolution criteria review. Hallucinated markets = brand kill.
- Don't push to main without `npm run build` passing locally.
- Don't enable real-money paths in Phase 0 even as a flag.

## Reference

- Vault project hub: `projects/foresight/_index.md` (TBD after first commit)
- Sister subdomain projects: `cuvetsmo-labs`, `cuvetsmo-imaging`, `cuvetsmo-web3`
- Design study: `~/.playwright-mcp/mozi-desktop-full.png` + `mozi-mobile-390.png`
- ui-ux-pro-max design system query saved at: `design-system/MASTER.md` (if `--persist` was used)
