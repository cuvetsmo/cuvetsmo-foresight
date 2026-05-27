"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkline } from "./Sparkline";
import type { Market } from "@/lib/types";

/**
 * LiveTickPreview — the hero card that ticks. Mock data, deterministic
 * walks bounded to +/- 2 ppt around the seed probability so it looks
 * alive without misleading anyone about real liquidity.
 *
 * Phase 1 will swap the walker for a Supabase realtime subscription to
 * the live order book; the visual stays identical.
 */
export function LiveTickPreview({ market }: { market: Market }) {
  const seedYes = market.yesProbability;
  const seedHistory = useMemo(
    () => (market.priceHistory && market.priceHistory.length > 0 ? market.priceHistory : [seedYes]),
    [market.priceHistory, seedYes],
  );

  const [yes, setYes] = useState(seedYes);
  const [history, setHistory] = useState<number[]>(seedHistory);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);
  const [volumeUsd, setVolumeUsd] = useState(market.volumeUsd);

  useEffect(() => {
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const id = setInterval(() => {
      setYes((prev) => {
        const drift = (Math.random() - 0.5) * 0.012; // +-0.6pp
        const next = clamp(prev + drift, Math.max(0.02, seedYes - 0.02), Math.min(0.98, seedYes + 0.02));
        setFlash(next > prev ? "up" : next < prev ? "down" : null);
        setHistory((h) => {
          const trimmed = h.length >= 24 ? h.slice(1) : h;
          return [...trimmed, next];
        });
        return next;
      });
      setVolumeUsd((v) => v + Math.round(Math.random() * 60));
      window.setTimeout(() => setFlash(null), 220);
    }, 2400);

    return () => clearInterval(id);
  }, [seedYes]);

  const yesPct = Math.round(yes * 100);
  const noPct = 100 - yesPct;
  const trendingUp =
    history.length >= 2 && history[history.length - 1] > history[0];

  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-3xl p-6 sm:p-8 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.18)]">
      <div className="flex items-center justify-between gap-3 mb-5">
        <span className="badge badge--open">
          <span className="pulse-dot" aria-hidden />
          Live
        </span>
        <span className="text-[11px] font-mono text-[var(--color-text-faint)]">
          {market.id}
        </span>
      </div>

      <h3 className="text-lg sm:text-xl font-semibold leading-[1.4] tracking-tight text-[var(--color-text-strong)]">
        {market.question}
      </h3>

      <div className="mt-6 flex items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-faint)] font-semibold">
            YES probability
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={yesPct}
                initial={{ y: -8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 8, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className={
                  "text-5xl font-bold tabular-nums " +
                  (flash === "up"
                    ? "text-[var(--color-emerald)]"
                    : flash === "down"
                      ? "text-[var(--color-slate-no)]"
                      : "text-[var(--color-emerald-deep)]")
                }
              >
                {yesPct}%
              </motion.span>
            </AnimatePresence>
            {flash && (
              <span
                aria-hidden
                className={
                  "text-xs font-mono " +
                  (flash === "up" ? "text-[var(--color-emerald)]" : "text-[var(--color-slate-no)]")
                }
              >
                {flash === "up" ? "▲" : "▼"}
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-faint)] font-semibold">
            Volume
          </div>
          <div className="mt-1 text-2xl font-semibold tabular-nums text-[var(--color-text)]">
            ${(volumeUsd / 1000).toFixed(1)}k
          </div>
        </div>
      </div>

      <div className="mt-4 -mx-1">
        <Sparkline
          data={history}
          width={320}
          height={48}
          stroke={trendingUp ? "var(--color-emerald)" : "var(--color-slate-no)"}
          fill={trendingUp ? "rgba(16, 185, 129, 0.12)" : "rgba(100, 116, 139, 0.10)"}
        />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button className="btn-yes" type="button" aria-label="Buy YES">
          <span>Buy YES</span>
          <span className="font-mono text-sm tabular-nums">{yesPct}¢</span>
        </button>
        <button className="btn-no" type="button" aria-label="Buy NO">
          <span>Buy NO</span>
          <span className="font-mono text-sm tabular-nums">{noPct}¢</span>
        </button>
      </div>

      <p className="mt-5 pt-5 border-t border-[var(--color-border)] text-xs text-[var(--color-text-faint)] leading-[1.6]">
        Sample data ticks every 2.4s for the preview. Real-money trading
        is not yet live — resolves via {market.resolutionSources[0]}.
      </p>
    </div>
  );
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}
