import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EcosystemBar } from "@/components/EcosystemBar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Sparkline } from "@/components/Sparkline";
import { TradePanel } from "@/components/TradePanel";
import { CrossVenueComparison } from "@/components/CrossVenueComparison";
import { listMarkets, getMarketBySlug } from "@/lib/markets";
import { CATEGORIES } from "@/lib/types";
import { DEPLOY } from "@/lib/brand";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const all = await listMarkets();
  return all.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const m = await getMarketBySlug(slug);
  if (!m) return { title: "Market not found" };
  const yesPct = Math.round(m.yesProbability * 100);
  return {
    title: m.question,
    description: `${m.questionEn ?? m.question} · YES ${yesPct}% · resolves via ${m.resolutionSources.join(", ")}.`,
  };
}

export default async function MarketDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const market = await getMarketBySlug(slug);
  if (!market) notFound();

  const yesPct = Math.round(market.yesProbability * 100);
  const noPct = 100 - yesPct;
  const cat = CATEGORIES.find((c) => c.key === market.category);
  const recent = market.priceHistory ?? [];
  const trendingYes = recent.length >= 2 && recent[recent.length - 1] > recent[0];

  const deadline = new Date(market.closesAt);
  const daysLeft = Math.max(
    0,
    Math.round((deadline.getTime() - Date.now()) / 86_400_000)
  );

  // Mock order book — phase 0 illustrative depth, not live data
  const yesOrders = [
    { price: yesPct, size: 1240 },
    { price: yesPct - 1, size: 2100 },
    { price: yesPct - 2, size: 880 },
    { price: yesPct - 3, size: 3220 },
  ];
  const noOrders = [
    { price: noPct, size: 1840 },
    { price: noPct - 1, size: 760 },
    { price: noPct - 2, size: 2540 },
    { price: noPct - 3, size: 1120 },
  ];

  // JSON-LD: schema.org Question (the market itself is a question with
  // suggested answers YES + NO) wrapped in a QAPage. Rich-card eligible
  // on Google. References the public Dataset on /markets.
  const url = `${DEPLOY.baseUrl}/markets/${market.slug}`;
  const questionLd = {
    "@context": "https://schema.org",
    "@type": "QAPage",
    mainEntity: {
      "@type": "Question",
      "@id": `${url}#question`,
      name: market.questionEn ?? market.question,
      text: market.questionEn ?? market.question,
      dateCreated: undefined,
      url,
      author: { "@id": `${DEPLOY.baseUrl}/#org` },
      suggestedAnswer: [
        {
          "@type": "Answer",
          text: `YES (${yesPct}%) — ${market.resolutionCriteria}`,
          url: `${url}#yes`,
        },
        {
          "@type": "Answer",
          text: `NO (${noPct}%)`,
          url: `${url}#no`,
        },
      ],
      isPartOf: { "@id": `${DEPLOY.baseUrl}/markets#dataset` },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(questionLd) }}
      />
      <EcosystemBar current="foresight" />
      <Header />

      <main className="flex-1">
        {/* ─── Breadcrumb + header ─── */}
        <section className="bg-[var(--color-bg)] border-b border-[var(--color-border)]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-8 pb-10">
            <nav aria-label="Breadcrumb" className="mb-5 text-sm text-[var(--color-text-muted)] flex items-center gap-2">
              <Link href="/markets" className="hover:text-[var(--color-emerald-deep)] transition-colors">
                Markets
              </Link>
              <span aria-hidden>/</span>
              <Link
                href={`/markets#cat-${market.category}`}
                className="hover:text-[var(--color-emerald-deep)] transition-colors inline-flex items-center gap-1.5"
              >
                <span aria-hidden>{cat?.emoji}</span>
                <span>{cat?.labelEn}</span>
              </Link>
            </nav>

            <div className="flex items-center gap-2.5 mb-4 flex-wrap">
              <span
                className={
                  "badge " +
                  (market.status === "open"
                    ? "badge--open"
                    : market.status === "closing-soon"
                      ? "badge--closing"
                      : "badge--resolved")
                }
              >
                <span className="pulse-dot" aria-hidden />
                {market.status === "open" ? "Live" : market.status === "closing-soon" ? "Closing soon" : "Resolved"}
              </span>
              <span className="text-[11px] font-mono text-[var(--color-text-faint)]">
                {market.id}
              </span>
              {market.tags.map((t) => (
                <span
                  key={t}
                  className="text-[11px] font-mono text-[var(--color-text-muted)] bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-md px-2 py-0.5"
                >
                  #{t}
                </span>
              ))}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.15] text-[var(--color-text-strong)]">
              {market.question}
            </h1>
            {market.questionEn && (
              <p className="mt-3 text-[var(--color-text-muted)] italic text-lg leading-[1.55]">
                {market.questionEn}
              </p>
            )}
          </div>
        </section>

        {/* ─── Body grid: price + trade panel · order book · meta ─── */}
        <section className="bg-[var(--color-bg-card)]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 py-14 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Price + chart */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-3xl p-7 sm:p-8">
                <div className="flex flex-wrap items-end justify-between gap-6">
                  <div>
                    <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-faint)] font-semibold">
                      YES probability
                    </div>
                    <div className="mt-2 flex items-baseline gap-3">
                      <span className="text-6xl sm:text-7xl font-bold tabular-nums text-[var(--color-emerald-deep)]">
                        {yesPct}%
                      </span>
                      <span className="text-base text-[var(--color-text-muted)] tabular-nums">
                        NO {noPct}%
                      </span>
                    </div>
                  </div>
                  <Sparkline
                    data={recent}
                    width={260}
                    height={72}
                    stroke={trendingYes ? "var(--color-emerald)" : "var(--color-slate-no)"}
                    fill={trendingYes ? "rgba(16, 185, 129, 0.12)" : "rgba(100, 116, 139, 0.10)"}
                  />
                </div>
              </div>

              {/* Resolution criteria */}
              <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-3xl p-7 sm:p-8">
                <div className="flex items-center gap-2 mb-4">
                  <span
                    aria-hidden
                    className="inline-block h-2 w-2 rounded-full bg-[var(--color-emerald)]"
                  />
                  <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
                    Resolution criteria
                  </h2>
                </div>
                <p className="text-[var(--color-text)] leading-[1.7]">
                  {market.resolutionCriteria}
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-[var(--color-text-faint)] font-semibold uppercase tracking-[0.16em]">
                    Sources
                  </span>
                  {market.resolutionSources.map((s) => (
                    <span
                      key={s}
                      className="font-mono text-[12px] px-2 py-0.5 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-md text-[var(--color-text-muted)]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Sample-data disclosure */}
              {market.isSample && (
                <div className="bg-[var(--color-bg)] border border-dashed border-[var(--color-border-strong)] rounded-3xl p-6">
                  <div className="flex items-start gap-3">
                    <span
                      aria-hidden
                      className="mt-1 w-5 h-5 rounded-full bg-[var(--color-text-faint)] text-white flex items-center justify-center text-[10px] font-bold"
                    >
                      ◦
                    </span>
                    <div className="text-sm leading-[1.65] text-[var(--color-text)]">
                      <span className="font-semibold text-[var(--color-text-strong)]">
                        Curated sample market.
                      </span>{" "}
                      Zero trades yet. The {Math.round(market.yesProbability * 100)}% number above
                      is a reference probability, not a crowd-derived price. Order
                      book below is illustrative depth shown to convey the future
                      UX — turn waitlist intent into a real position when trading
                      opens in Phase 1.
                    </div>
                  </div>
                </div>
              )}

              {/* Order book — illustrative depth, labeled as such */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <OrderBookSide title="YES bids" orders={yesOrders} side="yes" />
                <OrderBookSide title="NO bids" orders={noOrders} side="no" />
              </div>

              {/* Cross-venue comparison — Polymarket + Kalshi side-by-side */}
              <CrossVenueComparison
                slug={market.slug}
                ourProbability={market.yesProbability}
                isSample={market.isSample}
              />
            </div>

            {/* Trade panel (sticky on desktop) */}
            <aside className="lg:col-span-4">
              <div className="lg:sticky lg:top-24 space-y-5">
                <TradePanel market={market} />

                <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-3xl p-6">
                  <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)] mb-4">
                    Market info
                  </h4>
                  <dl className="space-y-3 text-sm">
                    {market.isSample ? (
                      <Row label="Trades" value="0 · waitlist" />
                    ) : (
                      <>
                        <Row label="Volume" value={`$${(market.volumeUsd / 1000).toFixed(1)}k`} />
                        <Row label="Open interest" value={`$${(market.openInterestUsd / 1000).toFixed(1)}k`} />
                      </>
                    )}
                    <Row label="Closes" value={deadline.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} />
                    <Row label="Time left" value={`${daysLeft}d`} />
                    <Row label="Created by" value={market.createdBy} mono />
                  </dl>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

function Row({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-[var(--color-text-muted)]">{label}</dt>
      <dd
        className={
          "font-semibold text-[var(--color-text)] tabular-nums " +
          (mono ? "font-mono text-[13px]" : "")
        }
      >
        {value}
      </dd>
    </div>
  );
}

function OrderBookSide({
  title,
  orders,
  side,
}: {
  title: string;
  orders: { price: number; size: number }[];
  side: "yes" | "no";
}) {
  const accent = side === "yes" ? "var(--color-emerald)" : "var(--color-slate-no)";
  const accentText =
    side === "yes" ? "var(--color-emerald-deep)" : "#334155";
  const maxSize = Math.max(...orders.map((o) => o.size));
  return (
    <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-3xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold tracking-tight" style={{ color: accentText }}>
          {title}
        </h4>
        <span className="text-[11px] font-mono text-[var(--color-text-faint)] uppercase tracking-[0.14em]">
          mock depth
        </span>
      </div>
      <ul className="space-y-1.5">
        {orders.map((o) => {
          const w = (o.size / maxSize) * 100;
          return (
            <li key={o.price} className="relative flex items-center justify-between text-sm font-mono tabular-nums px-3 py-2 rounded-lg overflow-hidden">
              <span
                aria-hidden
                className="absolute inset-y-0 left-0 opacity-[0.12]"
                style={{ width: `${w}%`, background: accent }}
              />
              <span className="relative" style={{ color: accentText }}>
                {o.price}¢
              </span>
              <span className="relative text-[var(--color-text-muted)]">
                ${o.size.toLocaleString()}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
