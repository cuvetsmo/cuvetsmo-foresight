import Link from "next/link";
import { EcosystemBar } from "@/components/EcosystemBar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MarketCard } from "@/components/MarketCard";
import { MARKETS } from "@/lib/markets";
import { CATEGORIES } from "@/lib/types";

export default function LandingPage() {
  const totalVolume = MARKETS.reduce((sum, m) => sum + m.volumeUsd, 0);
  const totalOI = MARKETS.reduce((sum, m) => sum + m.openInterestUsd, 0);
  const featured = [...MARKETS]
    .sort((a, b) => b.volumeUsd - a.volumeUsd)
    .slice(0, 6);

  return (
    <>
      <EcosystemBar current="foresight" />
      <Header />

      <main className="flex-1">
        {/* ─── Hero ─── */}
        <section className="relative overflow-hidden section-curve-bottom bg-[var(--color-bg)]">
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(60% 80% at 50% 0%, rgba(16, 185, 129, 0.12), transparent 70%)",
            }}
          />
          <div className="relative max-w-7xl mx-auto px-6 sm:px-8 pt-16 sm:pt-24 pb-20 sm:pb-28">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7">
                <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-emerald-deep)] mb-6 animate-fade-up">
                  <span className="pulse-dot" aria-hidden />
                  Next-gen prediction marketplace
                </p>
                <h1
                  className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.04] animate-fade-up text-[var(--color-text-strong)]"
                  style={{ animationDelay: "0.05s" }}
                >
                  Forecast the things{" "}
                  <span className="relative inline-block">
                    <span className="relative z-10">that matter.</span>
                    <span
                      aria-hidden
                      className="absolute -bottom-1 left-0 right-0 h-3 bg-[var(--color-emerald)]/30"
                    />
                  </span>
                </h1>
                <p
                  className="mt-8 max-w-2xl text-lg sm:text-xl leading-[1.65] text-[var(--color-text-muted)] animate-fade-up"
                  style={{ animationDelay: "0.1s" }}
                >
                  The prediction market built for Southeast Asia and the
                  niches the rest overlook — Thai politics, monsoon, ASF
                  outbreaks, AI research, sleeper crypto events.
                  Cohort-curated, MCP-native, AI-assisted resolution.
                </p>

                <div
                  className="mt-10 flex flex-wrap items-center gap-4 animate-fade-up"
                  style={{ animationDelay: "0.15s" }}
                >
                  <Link href="/markets" className="btn-emerald">
                    Explore markets
                    <span aria-hidden>→</span>
                  </Link>
                  <a href="#how-it-works" className="btn-outline">
                    How it works
                  </a>
                </div>

                <div
                  className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-10 animate-fade-up"
                  style={{ animationDelay: "0.2s" }}
                >
                  <Stat value={MARKETS.length.toString()} label="markets live" />
                  <Stat value={CATEGORIES.length.toString()} label="categories" />
                  <Stat
                    value={"$" + (totalVolume / 1000).toFixed(0) + "k"}
                    label="volume traded"
                    tone="emerald"
                  />
                  <Stat
                    value={"$" + (totalOI / 1000).toFixed(0) + "k"}
                    label="open interest"
                  />
                </div>
              </div>

              <div
                className="lg:col-span-5 animate-fade-up"
                style={{ animationDelay: "0.25s" }}
              >
                <HeroPreviewCard />
              </div>
            </div>
          </div>
        </section>

        {/* ─── Featured markets ─── */}
        <section className="bg-[var(--color-bg-card)]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 py-20 sm:py-24">
            <div className="mb-10 flex items-end justify-between gap-6 flex-wrap">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-emerald-deep)] mb-3">
                  Featured
                </p>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--color-text-strong)]">
                  Markets moving right now.
                </h2>
                <p className="mt-3 text-[var(--color-text-muted)] max-w-xl">
                  A live cross-section across politics, climate, vet, crypto,
                  and frontier research. Click any to see the order book,
                  resolution criteria, and price history.
                </p>
              </div>
              <Link
                href="/markets"
                className="text-sm font-semibold text-[var(--color-emerald-deep)] hover:underline underline-offset-4"
              >
                View all {MARKETS.length} markets →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featured.map((m) => (
                <MarketCard key={m.id} market={m} />
              ))}
            </div>
          </div>
        </section>

        {/* ─── How it works ─── */}
        <section id="how-it-works" className="bg-[var(--color-bg)] scroll-mt-20">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 py-20 sm:py-24">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-emerald-deep)] mb-3">
                How it works
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--color-text-strong)]">
                A forecasting venue, not a casino.
              </h2>
              <p className="mt-4 text-lg text-[var(--color-text-muted)] leading-[1.65]">
                Every market is a yes-or-no question with public,
                machine-verifiable resolution criteria. Trade YES or NO
                shares — the price IS the crowd&apos;s probability estimate.
              </p>
            </div>

            <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
              <Step
                num="01"
                title="Pick a question"
                body="Browse markets across SEA politics, climate, vet, crypto, AI, and global events. Every question has a public resolution criterion before you trade."
              />
              <Step
                num="02"
                title="Take a position"
                body="Buy YES or NO shares. Your buy price IS your edge — pay less than your conviction implies, and the market is overpaying you to be right."
              />
              <Step
                num="03"
                title="Resolution + payout"
                body="When the event resolves, holders of the correct outcome get paid $1 per share. Disputes go through our AI-assisted resolver + human appeal panel."
              />
            </div>
          </div>
        </section>

        {/* ─── Why we exist + competitive positioning ─── */}
        <section className="bg-[var(--color-bg-card)]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 py-20 sm:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              <div className="lg:col-span-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-emerald-deep)] mb-3">
                  Why Foresight
                </p>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--color-text-strong)]">
                  The markets the giants will never list.
                </h2>
                <p className="mt-5 text-[var(--color-text-muted)] leading-[1.7]">
                  Polymarket and Kalshi are built for US politics + global
                  crypto. The world has a thousand other questions worth
                  trading — and they sit in our backyard. We start there.
                </p>
              </div>

              <div className="lg:col-span-7">
                <ComparisonTable />
              </div>
            </div>
          </div>
        </section>

        {/* ─── MCP section — dark accent (mozi institutional pattern) ─── */}
        <section
          id="mcp"
          className="bg-[var(--color-bg-dark)] text-[var(--color-text-on-dark)] section-curve-top section-curve-bottom scroll-mt-20"
        >
          <div className="max-w-7xl mx-auto px-6 sm:px-8 py-20 sm:py-28">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              <div className="lg:col-span-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-emerald-tint)] mb-3">
                  Foresight MCP
                </p>
                <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
                  The first prediction market your AI agent can talk to.
                </h2>
                <p className="mt-5 text-white/75 leading-[1.7] max-w-xl">
                  Every market is exposed via the Model Context Protocol —
                  Claude, GPT, or any MCP-aware agent can query state,
                  propose new markets, and stream resolution events.
                  No SDK lock-in, no proprietary auth.
                </p>

                <ul className="mt-8 space-y-3 text-sm text-white/80">
                  <McpFeature label="foresight_list_markets" desc="Browse + filter live markets" />
                  <McpFeature label="foresight_get_market" desc="Probability, OI, volume, history" />
                  <McpFeature label="foresight_propose_market" desc="Create market with criteria" />
                  <McpFeature label="foresight_resolve_check" desc="Run AI-assisted resolver dry-run" />
                  <McpFeature label="foresight_stream_events" desc="Subscribe to trade + resolve events" />
                </ul>
              </div>

              <div className="lg:col-span-6">
                <pre className="rounded-2xl bg-black/40 border border-white/10 p-6 text-[13px] leading-[1.65] overflow-x-auto font-mono text-white/85">
{`# Claude Code with the Foresight MCP server
$ claude

You: ตลาดอะไรน่าสนใจสำหรับ vet student?
Claude: I queried foresight_list_markets with
  category="thai-vet". Top by volume:

  • ASF outbreak in Thai pig farm < 90 days
    YES 55% · $18.6k volume · 89d left
  • PRRSV strain X detection in Q3 2026
    YES 23% · $4.2k volume · 124d left

  Want me to propose a new vet market or
  inspect the resolution criteria for either?`}
                </pre>

                <p className="mt-5 text-xs text-white/55 font-mono">
                  $ claude mcp add foresight https://foresight.cuvetsmo.com/mcp
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Roadmap ─── */}
        <section id="roadmap" className="bg-[var(--color-bg)] scroll-mt-20">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 py-20 sm:py-24">
            <div className="max-w-3xl mb-14">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-emerald-deep)] mb-3">
                Roadmap
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--color-text-strong)]">
                Three layers, three phases.
              </h2>
              <p className="mt-4 text-[var(--color-text-muted)] leading-[1.65]">
                SEA wedge proves the venue. MCP layer makes us infrastructure.
                Global expansion comes once liquidity is real.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <RoadmapCard
                phase="Phase 0 — Now"
                title="SEA + niche wedge"
                live
                items={[
                  "10 seed markets across 8 categories",
                  "Mock liquidity for product-feel",
                  "Cohort beta with Vet 86 + CUVETSMO",
                  "Forecast accuracy leaderboard",
                ]}
              />
              <RoadmapCard
                phase="Phase 1 — Next 90 days"
                title="MCP + AI resolver"
                items={[
                  "Foresight MCP server (5 tools)",
                  "AI-assisted resolution + appeal panel",
                  "Smart wallet onboarding (gas-sponsored)",
                  "Public market proposal flow",
                ]}
              />
              <RoadmapCard
                phase="Phase 2 — 2027"
                title="Global expansion"
                items={[
                  "USDC on Base mainnet",
                  "Mobile-first PWA with Thai + EN",
                  "Liquidity grants for market makers",
                  "Open-source the protocol layer",
                ]}
              />
            </div>
          </div>
        </section>

        {/* ─── Cohort callout ─── */}
        <section className="bg-[var(--color-bg-card)]">
          <div className="max-w-5xl mx-auto px-6 sm:px-8 py-20 sm:py-24 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-emerald-deep)] mb-4">
              Built in the open
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--color-text-strong)]">
              The cohort is the moat.
            </h2>
            <p className="mt-5 max-w-2xl mx-auto text-[var(--color-text-muted)] leading-[1.7]">
              Foresight is being built with Vet 86 + the CUVETSMO ecosystem —
              5,000+ Chula vet students and alumni who care about the
              questions nobody else lists. Liquidity bootstrapped from a
              real community, not paid acquisition.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link href="/markets" className="btn-emerald">
                Trade your first market
                <span aria-hidden>→</span>
              </Link>
              <a
                href="https://cuvetsmo.com"
                className="btn-outline"
                target="_blank"
                rel="noopener noreferrer"
              >
                About CUVETSMO
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

function Stat({
  value,
  label,
  tone = "default",
}: {
  value: string;
  label: string;
  tone?: "default" | "emerald";
}) {
  return (
    <div>
      <div
        className={
          "text-3xl sm:text-4xl font-bold tracking-tight tabular-nums " +
          (tone === "emerald"
            ? "text-[var(--color-emerald-deep)]"
            : "text-[var(--color-text-strong)]")
        }
      >
        {value}
      </div>
      <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)] font-semibold">
        {label}
      </div>
    </div>
  );
}

function Step({ num, title, body }: { num: string; title: string; body: string }) {
  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-3xl p-7">
      <div className="text-xs font-mono font-semibold text-[var(--color-emerald-deep)] tracking-[0.16em]">
        {num}
      </div>
      <h3 className="mt-3 text-xl font-semibold tracking-tight text-[var(--color-text-strong)]">
        {title}
      </h3>
      <p className="mt-2.5 text-[15px] text-[var(--color-text-muted)] leading-[1.65]">
        {body}
      </p>
    </div>
  );
}

function HeroPreviewCard() {
  const m = MARKETS[0];
  const yesPct = Math.round(m.yesProbability * 100);
  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-3xl p-6 sm:p-8 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.18)]">
      <div className="flex items-center justify-between gap-3 mb-5">
        <span className="badge badge--open">
          <span className="pulse-dot" aria-hidden />
          Live
        </span>
        <span className="text-[11px] font-mono text-[var(--color-text-faint)]">
          th-elec-2027
        </span>
      </div>
      <h3 className="text-lg sm:text-xl font-semibold leading-[1.4] tracking-tight text-[var(--color-text-strong)]">
        {m.question}
      </h3>

      <div className="mt-6 flex items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-faint)] font-semibold">
            YES probability
          </div>
          <div className="mt-1 text-5xl font-bold tabular-nums text-[var(--color-emerald-deep)]">
            {yesPct}%
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-faint)] font-semibold">
            Volume
          </div>
          <div className="mt-1 text-2xl font-semibold tabular-nums text-[var(--color-text)]">
            ${(m.volumeUsd / 1000).toFixed(1)}k
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button className="btn-yes" type="button" aria-label="Buy YES">
          <span>Buy YES</span>
          <span className="font-mono text-sm">{yesPct}¢</span>
        </button>
        <button className="btn-no" type="button" aria-label="Buy NO">
          <span>Buy NO</span>
          <span className="font-mono text-sm">{100 - yesPct}¢</span>
        </button>
      </div>

      <p className="mt-5 pt-5 border-t border-[var(--color-border)] text-xs text-[var(--color-text-faint)] leading-[1.6]">
        Resolves via Election Commission of Thailand official announcement.
        Demo data — real trading goes live in Phase 1.
      </p>
    </div>
  );
}

function ComparisonTable() {
  const rows: {
    feature: string;
    poly: string;
    kalshi: string;
    foresight: string;
  }[] = [
    { feature: "Region focus", poly: "US + global", kalshi: "US only", foresight: "SEA-first → global" },
    { feature: "Thai politics", poly: "—", kalshi: "—", foresight: "✓" },
    { feature: "Vet + agri events", poly: "—", kalshi: "—", foresight: "✓" },
    { feature: "MCP / AI native", poly: "—", kalshi: "—", foresight: "✓" },
    { feature: "AI-assisted resolver", poly: "UMA optimistic", kalshi: "Internal team", foresight: "Multi-source + appeal" },
    { feature: "Mobile-first UX", poly: "Desktop", kalshi: "OK", foresight: "Mobile-native" },
  ];
  return (
    <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-3xl overflow-hidden">
      <div className="grid grid-cols-4 gap-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text-muted)] bg-[var(--color-bg-card)] border-b border-[var(--color-border)]">
        <div className="px-5 py-4">Feature</div>
        <div className="px-3 py-4 text-center">Polymarket</div>
        <div className="px-3 py-4 text-center">Kalshi</div>
        <div className="px-3 py-4 text-center text-[var(--color-emerald-deep)]">Foresight</div>
      </div>
      <ul>
        {rows.map((r, i) => (
          <li
            key={r.feature}
            className={
              "grid grid-cols-4 gap-0 text-sm " +
              (i % 2 === 1 ? "bg-[var(--color-bg-card)]/50" : "")
            }
          >
            <div className="px-5 py-3.5 font-medium text-[var(--color-text)]">{r.feature}</div>
            <div className="px-3 py-3.5 text-center text-[var(--color-text-muted)] tabular-nums">{r.poly}</div>
            <div className="px-3 py-3.5 text-center text-[var(--color-text-muted)] tabular-nums">{r.kalshi}</div>
            <div className="px-3 py-3.5 text-center font-semibold text-[var(--color-emerald-deep)] tabular-nums">{r.foresight}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function McpFeature({ label, desc }: { label: string; desc: string }) {
  return (
    <li className="flex items-start gap-3">
      <span
        aria-hidden
        className="mt-2 inline-block h-1 w-1 rounded-full bg-[var(--color-emerald)] shrink-0"
      />
      <div>
        <code className="font-mono text-[13px] text-[var(--color-emerald-tint)]">
          {label}
        </code>
        <span className="ml-3 text-white/65">{desc}</span>
      </div>
    </li>
  );
}

function RoadmapCard({
  phase,
  title,
  items,
  live = false,
}: {
  phase: string;
  title: string;
  items: string[];
  live?: boolean;
}) {
  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-3xl p-7 relative overflow-hidden">
      {live && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--color-emerald)]" aria-hidden />
      )}
      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-emerald-deep)]">
        {phase}
      </div>
      <h3 className="mt-3 text-xl font-semibold tracking-tight text-[var(--color-text-strong)]">
        {title}
      </h3>
      <ul className="mt-5 space-y-2.5 text-[15px]">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-[var(--color-text)] leading-[1.55]">
            <span
              aria-hidden
              className="mt-2 inline-block h-1 w-1 rounded-full bg-[var(--color-emerald)] shrink-0"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
