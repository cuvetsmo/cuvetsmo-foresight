import Link from "next/link";
import { EcosystemBar } from "@/components/EcosystemBar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MarketCard } from "@/components/MarketCard";
import { AnimatedCounter, FadeInSection } from "@/components/AnimatedCounter";
import { LiveTickPreview } from "@/components/LiveTickPreview";
import { MCPTerminal } from "@/components/MCPTerminal";
import { BRAND } from "@/lib/brand";
import { listMarkets } from "@/lib/markets";
import { CATEGORIES } from "@/lib/types";

export const revalidate = 60;

export default async function LandingPage() {
  const MARKETS = await listMarkets();
  const allSample = MARKETS.every((m) => m.isSample);
  const closingSoonCount = MARKETS.filter((m) => {
    const days = (new Date(m.closesAt).getTime() - Date.now()) / 86_400_000;
    return days <= 180 && days >= 0;
  }).length;
  // Featured = closing soonest first so visitors see what to engage with
  const featured = [...MARKETS]
    .sort(
      (a, b) =>
        new Date(a.closesAt).getTime() - new Date(b.closesAt).getTime(),
    )
    .slice(0, 6);
  const hero = featured[0] ?? MARKETS[0];

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
                  A forecasting marketplace
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
                  A marketplace for the events the world&apos;s biggest
                  exchanges overlook — regional politics, climate, disease
                  outbreaks, frontier research. Every question carries a
                  public resolution criterion. Every source is named.
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
                  <Stat to={MARKETS.length} label="open questions" />
                  <Stat to={CATEGORIES.length} label="categories" />
                  <Stat to={closingSoonCount} label="closing in 6mo" tone="emerald" />
                  <Stat to={0} label="trades · waitlist live" suffix="" />
                </div>
                {allSample && (
                  <p
                    className="mt-5 text-[11px] text-[var(--color-text-faint)] font-mono animate-fade-up"
                    style={{ animationDelay: "0.22s" }}
                  >
                    Phase 0 — every market is a curated sample. Trading turns on
                    when liquidity infrastructure ships. Join the waitlist on any
                    market to lock your size + side.
                  </p>
                )}
              </div>

              <div
                className="lg:col-span-5 animate-fade-up"
                style={{ animationDelay: "0.25s" }}
              >
                <LiveTickPreview market={hero} />
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
                  Closing-soonest first across politics, climate, health,
                  crypto, and frontier research. Click any to see the
                  resolution criteria, named sources, and reference
                  probability. Trade-intent waitlist live on each.
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
                Every market is a yes-or-no question with a public,
                machine-verifiable resolution criterion. Trade YES or NO
                shares — the price IS the crowd&apos;s probability estimate.
              </p>
            </div>

            <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
              <Step
                num="01"
                title="Pick a question"
                body="Browse markets across politics, climate, public health, frontier research, crypto, and culture. Every question has its resolution criterion published before you trade."
              />
              <Step
                num="02"
                title="Take a position"
                body="Buy YES or NO shares. Your buy price is your edge — pay less than your conviction implies, and the market is paying you to be right."
              />
              <Step
                num="03"
                title="Resolution and payout"
                body="When the event resolves, holders of the correct outcome get paid $1 per share. Disputes go through a multi-source verifier with a human appeal panel."
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
                  Why {BRAND.name}
                </p>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--color-text-strong)]">
                  The markets the giants will never list.
                </h2>
                <p className="mt-5 text-[var(--color-text-muted)] leading-[1.7]">
                  Polymarket and Kalshi serve US politics and global crypto.
                  The world has a thousand other questions worth pricing —
                  regional elections, monsoon timing, disease outbreaks, AI
                  research milestones, sleeper events the broadsheets miss.
                  We list those.
                </p>
              </div>

              <div className="lg:col-span-7">
                <ComparisonTable />
              </div>
            </div>
          </div>
        </section>

        {/* ─── Trust + transparency (replaces the old "cohort" section) ─── */}
        <section
          id="trust"
          className="bg-[var(--color-bg-dark)] text-[var(--color-text-on-dark)] section-curve-top section-curve-bottom scroll-mt-20"
        >
          <div className="max-w-7xl mx-auto px-6 sm:px-8 py-20 sm:py-28">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-emerald-tint)] mb-3">
                Trust + transparency
              </p>
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
                Forecasting earns trust the slow way.
              </h2>
              <p className="mt-5 text-lg text-white/75 leading-[1.7] max-w-2xl">
                A prediction market is only as good as its resolution. Every
                market on {BRAND.name} carries the same four guarantees from
                day one.
              </p>
            </div>

            <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-6">
              <TrustCard
                title="Public resolution criteria"
                body="Every market publishes its resolution criterion before the first trade. No interpretation room added later. If we cannot write a verifiable criterion, we do not list the market."
              />
              <TrustCard
                title="Named primary sources"
                body="Each resolution names the authoritative source — government statistics offices, official electoral commissions, peer-reviewed publications, exchange data feeds. No anonymous oracle votes."
              />
              <TrustCard
                title="Multi-source verifier + appeal"
                body="A verifier cross-checks each resolution against multiple sources and refuses ambiguous calls. Disputed resolutions escalate to a human appeal panel on a published timeline."
              />
              <TrustCard
                title="Audit log on-chain"
                body="Resolution decisions, source citations, and appeal outcomes are written to a public on-chain attestation. Anyone can re-run the audit."
              />
            </div>
          </div>
        </section>

        {/* ─── MCP / developer surface ─── */}
        <section
          id="mcp"
          className="bg-[var(--color-bg)] scroll-mt-20"
        >
          <div className="max-w-7xl mx-auto px-6 sm:px-8 py-20 sm:py-28">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              <div className="lg:col-span-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-emerald-deep)] mb-3">
                  For developers
                </p>
                <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[var(--color-text-strong)]">
                  The first prediction market your agent can talk to.
                </h2>
                <p className="mt-5 text-[var(--color-text-muted)] leading-[1.7] max-w-xl">
                  Every market is exposed through the Model Context Protocol —
                  the open standard for letting language-model agents query
                  state, propose new markets, and stream resolution events.
                  No SDK lock-in. No proprietary authentication.
                </p>

                <ul className="mt-8 space-y-3 text-sm text-[var(--color-text)]">
                  <McpFeature label="foresight_list_markets" desc="Browse, filter, sort live markets" />
                  <McpFeature label="foresight_get_market" desc="Probability, OI, volume, history" />
                  <McpFeature label="foresight_propose_market" desc="Create a market with verifiable criteria" />
                  <McpFeature label="foresight_resolve_check" desc="Dry-run the multi-source verifier" />
                  <McpFeature label="foresight_stream_events" desc="Subscribe to trade and resolve events" />
                </ul>
              </div>

              <div className="lg:col-span-6">
                <MCPTerminal />
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--color-text-muted)] font-mono">
                  <span>$ npm install -g foresight-mcp</span>
                  <span aria-hidden className="text-[var(--color-text-faint)]">·</span>
                  <span>open spec · same fees for bots and humans</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Roadmap ─── */}
        <section id="roadmap" className="bg-[var(--color-bg-card)] scroll-mt-20">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 py-20 sm:py-24">
            <div className="max-w-3xl mb-14">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-emerald-deep)] mb-3">
                Roadmap
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--color-text-strong)]">
                Wedge the venue first, then expand.
              </h2>
              <p className="mt-4 text-[var(--color-text-muted)] leading-[1.65]">
                Geography + verticals prove the venue. Developer surface
                turns us into infrastructure. Global expansion follows
                liquidity, not the other way around.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <RoadmapCard
                phase="Phase 0 — Now"
                title="Forecasting marketplace beta"
                live
                items={[
                  "Seed markets across politics, climate, health, research",
                  "Mock liquidity to validate product feel",
                  "Public resolution criteria for every market",
                  "Free educational tier",
                ]}
              />
              <RoadmapCard
                phase="Phase 1 — Next 90 days"
                title="Developer surface and resolver"
                items={[
                  "Public MCP server with eight tools",
                  "Multi-source verifier and appeal panel",
                  "Gas-sponsored smart-wallet onboarding",
                  "Public market proposal flow",
                ]}
              />
              <RoadmapCard
                phase="Phase 2 — 2027"
                title="Global expansion"
                items={[
                  "USDC settlement on Base mainnet",
                  "Mobile-first PWA, English plus Thai plus Bahasa",
                  "Liquidity grants for professional market makers",
                  "Open-source the protocol layer",
                ]}
              />
            </div>
          </div>
        </section>

        {/* ─── About / final CTA ─── */}
        <section id="about" className="bg-[var(--color-bg)] scroll-mt-20">
          <div className="max-w-4xl mx-auto px-6 sm:px-8 py-20 sm:py-24 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-emerald-deep)] mb-4">
              About {BRAND.name}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--color-text-strong)]">
              Markets are how the world figures out what it actually believes.
            </h2>
            <p className="mt-5 max-w-2xl mx-auto text-[var(--color-text-muted)] leading-[1.7]">
              Prediction markets crossed ten billion dollars in monthly
              volume in early 2026. The infrastructure built so far serves
              a handful of categories — US politics, global crypto, major
              sports. {BRAND.name} is built for everything else — the
              regional, the vertical, the events that already shape lives
              but never make it onto a screen.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link href="/markets" className="btn-emerald">
                Explore live markets
                <span aria-hidden>→</span>
              </Link>
              <a href="#how-it-works" className="btn-outline">
                How resolution works
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
  to,
  label,
  tone = "default",
  prefix,
  suffix,
  decimals = 0,
}: {
  to: number;
  label: string;
  tone?: "default" | "emerald";
  prefix?: string;
  suffix?: string;
  decimals?: number;
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
        <AnimatedCounter to={to} prefix={prefix} suffix={suffix} decimals={decimals} />
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

function TrustCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-7 backdrop-blur-sm">
      <div className="flex items-center gap-2.5 mb-3">
        <span
          aria-hidden
          className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-emerald)]"
        />
        <h3 className="text-base font-semibold tracking-tight text-white">
          {title}
        </h3>
      </div>
      <p className="text-[15px] text-white/70 leading-[1.65]">{body}</p>
    </div>
  );
}

function ComparisonTable() {
  const rows: {
    feature: string;
    poly: string;
    kalshi: string;
    ours: string;
  }[] = [
    { feature: "Region focus", poly: "US + global", kalshi: "US only", ours: "Regional first → global" },
    { feature: "Regional politics", poly: "—", kalshi: "—", ours: "✓" },
    { feature: "Public health + disease", poly: "—", kalshi: "—", ours: "✓" },
    { feature: "Frontier research", poly: "—", kalshi: "—", ours: "✓" },
    { feature: "Developer-first surface", poly: "Retro-fit", kalshi: "API only", ours: "MCP-native, day one" },
    { feature: "Resolution model", poly: "UMA optimistic", kalshi: "Internal team", ours: "Multi-source + appeal" },
  ];
  return (
    <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-3xl overflow-hidden">
      <div className="grid grid-cols-4 gap-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text-muted)] bg-[var(--color-bg-card)] border-b border-[var(--color-border)]">
        <div className="px-5 py-4">Feature</div>
        <div className="px-3 py-4 text-center">Polymarket</div>
        <div className="px-3 py-4 text-center">Kalshi</div>
        <div className="px-3 py-4 text-center text-[var(--color-emerald-deep)]">{BRAND.name}</div>
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
            <div className="px-3 py-3.5 text-center font-semibold text-[var(--color-emerald-deep)] tabular-nums">{r.ours}</div>
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
        <code className="font-mono text-[13px] text-[var(--color-emerald-deep)] bg-[var(--color-emerald-tint)] px-1.5 py-0.5 rounded">
          {label}
        </code>
        <span className="ml-2.5 text-[var(--color-text-muted)]">{desc}</span>
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
    <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-3xl p-7 relative overflow-hidden">
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
