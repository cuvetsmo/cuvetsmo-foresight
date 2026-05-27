import type { Metadata } from "next";
import { EcosystemBar } from "@/components/EcosystemBar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MarketCard } from "@/components/MarketCard";
import { MARKETS } from "@/lib/markets";
import { CATEGORIES, type MarketCategory } from "@/lib/types";

export const metadata: Metadata = {
  title: "All markets",
  description:
    "Browse every Foresight prediction market — SEA politics, climate, vet, crypto, AI, global tech, sports.",
};

export default function MarketsPage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string }>;
}) {
  // Phase 0: render every market; the chips link via plain anchors so we
  // get free deep-link + bookmark support without client state.
  const totalVolume = MARKETS.reduce((sum, m) => sum + m.volumeUsd, 0);

  return (
    <>
      <EcosystemBar current="foresight" />
      <Header />

      <main className="flex-1">
        {/* ─── Header band ─── */}
        <section className="bg-[var(--color-bg)] border-b border-[var(--color-border)]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-14 pb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-emerald-deep)] mb-3">
              All markets
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[var(--color-text-strong)]">
              {MARKETS.length} live questions.
            </h1>
            <p className="mt-3 max-w-2xl text-[var(--color-text-muted)] leading-[1.65]">
              ${(totalVolume / 1000).toFixed(1)}k total volume across{" "}
              {CATEGORIES.length} categories. Every market has machine-verifiable
              resolution criteria — no judgment calls, no rug.
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              <CategoryChip
                href="/markets"
                label="All"
                emoji="●"
                count={MARKETS.length}
                active={true}
              />
              {CATEGORIES.map((c) => {
                const count = MARKETS.filter((m) => m.category === c.key).length;
                if (count === 0) return null;
                return (
                  <CategoryChip
                    key={c.key}
                    href={`#cat-${c.key}`}
                    label={c.labelEn}
                    emoji={c.emoji}
                    count={count}
                  />
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── Markets grouped by category ─── */}
        <section className="bg-[var(--color-bg-card)]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16 sm:py-20 space-y-16">
            {CATEGORIES.map((c) => {
              const inCategory = MARKETS.filter((m) => m.category === c.key);
              if (inCategory.length === 0) return null;
              return (
                <CategorySection
                  key={c.key}
                  id={`cat-${c.key}`}
                  category={c.key}
                  labelTh={c.labelTh}
                  labelEn={c.labelEn}
                  emoji={c.emoji}
                  markets={inCategory}
                />
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

function CategoryChip({
  href,
  label,
  emoji,
  count,
  active = false,
}: {
  href: string;
  label: string;
  emoji: string;
  count: number;
  active?: boolean;
}) {
  return (
    <a
      href={href}
      className={
        "inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium transition-colors border " +
        (active
          ? "bg-[var(--color-text-strong)] text-white border-[var(--color-text-strong)]"
          : "bg-[var(--color-bg-card)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:border-[var(--color-emerald)] hover:text-[var(--color-emerald-deep)]")
      }
    >
      <span aria-hidden className="text-xs">
        {emoji}
      </span>
      <span>{label}</span>
      <span
        className={
          "tabular-nums text-xs " +
          (active ? "text-white/70" : "text-[var(--color-text-faint)]")
        }
      >
        {count}
      </span>
    </a>
  );
}

function CategorySection({
  id,
  category,
  labelTh,
  labelEn,
  emoji,
  markets,
}: {
  id: string;
  category: MarketCategory;
  labelTh: string;
  labelEn: string;
  emoji: string;
  markets: typeof MARKETS;
}) {
  return (
    <div id={id} className="scroll-mt-24">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span aria-hidden className="text-2xl">
              {emoji}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-text-strong)]">
              {labelEn}
            </h2>
            <span className="text-sm text-[var(--color-text-muted)] italic">
              {labelTh}
            </span>
          </div>
        </div>
        <span className="text-xs uppercase tracking-[0.16em] font-semibold text-[var(--color-text-faint)] tabular-nums">
          {markets.length} {markets.length === 1 ? "market" : "markets"}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {markets.map((m) => (
          <MarketCard key={m.id} market={m} />
        ))}
      </div>
    </div>
  );
}
