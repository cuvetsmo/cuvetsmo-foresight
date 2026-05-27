"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface VenueMatch {
  source: "polymarket" | "kalshi" | "manifold";
  id: string;
  question: string;
  yesProbability?: number;
  liquidityUsd?: number;
  volumeUsd?: number;
  closesAt?: string;
  url: string;
}

interface CrossVenueLookup {
  query: string;
  polymarket: VenueMatch[];
  kalshi: VenueMatch[];
  manifold: VenueMatch[];
  exclusiveToForesight: boolean;
  fetchedMs: number;
}

const VENUE_META: Record<
  "polymarket" | "kalshi" | "manifold",
  { label: string; brandColor: string; bg: string }
> = {
  polymarket: {
    label: "Polymarket",
    brandColor: "#2C3B5A",
    bg: "bg-[#EEF2F7] border-[#CBD5E1]",
  },
  kalshi: {
    label: "Kalshi",
    brandColor: "#0F7C66",
    bg: "bg-[#ECFDF5] border-[#A7F3D0]",
  },
  manifold: {
    label: "Manifold",
    brandColor: "#4F46E5",
    bg: "bg-[#EEF2FF] border-[#C7D2FE]",
  },
};

function formatUsd(n: number | undefined): string | null {
  if (n == null || !Number.isFinite(n)) return null;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${n.toFixed(0)}`;
}

/**
 * CrossVenueComparison — sits below the market detail body. Fetches
 * /api/cross-venue?slug=<slug> on mount, renders matches from Polymarket
 * and Kalshi side-by-side with our own probability. When the venues
 * have nothing, the message becomes the value: "exclusive to Foresight."
 */
export function CrossVenueComparison({
  slug,
  ourProbability,
  isSample,
}: {
  slug: string;
  ourProbability: number;
  isSample: boolean;
}) {
  const [data, setData] = useState<CrossVenueLookup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/cross-venue?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        if (json?.error) {
          setError(json.error as string);
        } else {
          setData(json as CrossVenueLookup);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "fetch failed");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const ourPct = Math.round(ourProbability * 100);

  return (
    <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-3xl p-7 sm:p-8">
      <div className="flex items-center gap-2 mb-5">
        <span
          aria-hidden
          className="inline-block h-2 w-2 rounded-full bg-[var(--color-emerald)]"
        />
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
          Cross-venue comparison
        </h2>
        {data && (
          <span className="ml-auto text-[11px] font-mono text-[var(--color-text-faint)]">
            {data.fetchedMs}ms
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-12 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] animate-pulse"
                style={{ animationDelay: `${i * 80}ms` }}
              />
            ))}
          </motion.div>
        )}

        {!loading && error && (
          <motion.p
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-[var(--color-text-muted)]"
          >
            Could not reach Polymarket / Kalshi right now ({error}). The
            cross-venue lookup retries on the next page load.
          </motion.p>
        )}

        {!loading && !error && data && (
          <motion.div
            key="data"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Our own row */}
            <VenueRow
              source="foresight"
              label="Foresight"
              question={data.query}
              yes={ourProbability}
              note={
                isSample
                  ? "Curated reference probability · waitlist live"
                  : "Live probability · trade above"
              }
              brandColor="#020617"
              bg="bg-[var(--color-bg-card)] border-[var(--color-border-strong)]"
              accent={ourPct >= 50 ? "emerald" : "slate"}
            />

            {data.exclusiveToForesight ? (
              <div className="mt-4 rounded-2xl border border-dashed border-[var(--color-emerald)]/40 bg-[var(--color-emerald-tint)]/30 p-4">
                <p className="text-sm leading-[1.55] text-[var(--color-text)]">
                  <span className="font-semibold text-[var(--color-emerald-deep)]">
                    Not listed on Polymarket, Kalshi, or Manifold.
                  </span>{" "}
                  This is the kind of niche the giants overlook — regional,
                  vertical, or just unfamiliar to a US-and-crypto-focused
                  desk. Polymarket leans intraday / US politics / sports;
                  Kalshi is US fiat-only; Manifold is open-community but
                  thin on SEA/vet. Forecasting marketplace value is highest
                  where the question literally cannot be priced elsewhere.
                </p>
              </div>
            ) : (
              <div className="mt-3 space-y-2.5">
                {data.polymarket.map((m) => (
                  <VenueRow
                    key={`pm-${m.id}`}
                    source={m.source}
                    label={VENUE_META[m.source].label}
                    question={m.question}
                    yes={m.yesProbability}
                    liquidityUsd={m.liquidityUsd}
                    volumeUsd={m.volumeUsd}
                    url={m.url}
                    brandColor={VENUE_META[m.source].brandColor}
                    bg={VENUE_META[m.source].bg}
                  />
                ))}
                {data.kalshi.map((m) => (
                  <VenueRow
                    key={`ks-${m.id}`}
                    source={m.source}
                    label={VENUE_META[m.source].label}
                    question={m.question}
                    yes={m.yesProbability}
                    liquidityUsd={m.liquidityUsd}
                    volumeUsd={m.volumeUsd}
                    url={m.url}
                    brandColor={VENUE_META[m.source].brandColor}
                    bg={VENUE_META[m.source].bg}
                  />
                ))}
                {data.manifold.map((m) => (
                  <VenueRow
                    key={`mf-${m.id}`}
                    source={m.source}
                    label={VENUE_META[m.source].label}
                    question={m.question}
                    yes={m.yesProbability}
                    liquidityUsd={m.liquidityUsd}
                    volumeUsd={m.volumeUsd}
                    url={m.url}
                    brandColor={VENUE_META[m.source].brandColor}
                    bg={VENUE_META[m.source].bg}
                  />
                ))}
              </div>
            )}

            <p className="mt-4 text-[11px] text-[var(--color-text-faint)] font-mono">
              Cross-venue data via public Polymarket Gamma + Kalshi + Manifold
              APIs · cached 1h · no-auth, no-affiliation
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function VenueRow({
  source,
  label,
  question,
  yes,
  liquidityUsd,
  volumeUsd,
  url,
  brandColor,
  bg,
  note,
  accent,
}: {
  source: "foresight" | "polymarket" | "kalshi" | "manifold";
  label: string;
  question: string;
  yes?: number;
  liquidityUsd?: number;
  volumeUsd?: number;
  url?: string;
  brandColor: string;
  bg: string;
  note?: string;
  accent?: "emerald" | "slate";
}) {
  const pct = yes != null ? Math.round(yes * 100) : null;
  const liq = formatUsd(liquidityUsd);
  const vol = formatUsd(volumeUsd);

  const inner = (
    <div className={"rounded-2xl border p-4 sm:p-5 " + bg}>
      <div className="flex items-start gap-3 sm:gap-4">
        <span
          aria-hidden
          className="mt-1 inline-block h-2.5 w-2.5 rounded-full shrink-0"
          style={{ background: brandColor }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-semibold uppercase tracking-[0.16em]"
                style={{ color: brandColor }}
              >
                {label}
              </span>
              {url && (
                <span aria-hidden className="text-xs text-[var(--color-text-faint)]">
                  ↗
                </span>
              )}
            </div>
            {pct != null && (
              <div className="flex items-baseline gap-1.5">
                <span
                  className={
                    "text-2xl font-bold tabular-nums " +
                    (source === "foresight"
                      ? accent === "emerald"
                        ? "text-[var(--color-emerald-deep)]"
                        : "text-[var(--color-text-strong)]"
                      : "")
                  }
                  style={
                    source !== "foresight"
                      ? { color: brandColor }
                      : undefined
                  }
                >
                  {pct}%
                </span>
                <span className="text-xs text-[var(--color-text-faint)] tracking-[0.16em] uppercase font-semibold">
                  YES
                </span>
              </div>
            )}
          </div>
          <p className="mt-1.5 text-sm text-[var(--color-text)] leading-[1.5] line-clamp-2">
            {question}
          </p>
          {note ? (
            <p className="mt-2 text-[11px] text-[var(--color-text-faint)]">{note}</p>
          ) : (
            (liq || vol) && (
              <p className="mt-2 text-[11px] font-mono text-[var(--color-text-faint)] tabular-nums">
                {liq && <>liquidity {liq}</>}
                {liq && vol && " · "}
                {vol && <>vol {vol}</>}
              </p>
            )
          )}
        </div>
      </div>
    </div>
  );

  return url ? (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block hover:-translate-y-0.5 transition-transform"
    >
      {inner}
    </a>
  ) : (
    inner
  );
}
