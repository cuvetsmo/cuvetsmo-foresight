"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DEPLOY } from "@/lib/brand";
import type { Market } from "@/lib/types";

/**
 * TradePanel — the sticky panel on the right side of /markets/[slug].
 *
 * Phase 0/1 lives in "waitlist" mode: clicking Buy YES / Buy NO opens a
 * compact intent-capture modal (email + side + size). Submissions hit
 * /api/waitlist which stamps a row in audit-friendly storage.
 *
 * Phase 2 (DEPLOY.walletPhase === "live") will swap the modal for a
 * Privy connect flow + Pimlico-paymaster-sponsored UserOp. The buttons
 * and surrounding chrome stay identical — only the click handler changes.
 *
 * Why intent capture over fake-buy: founder discipline (memory rule
 * feedback_pre-revenue-capital-discipline) — pre-revenue we want
 * MEASURABLE signal, not vanity polish. Each captured email is a real
 * waitlist data point we can act on.
 */

interface TradePanelProps {
  market: Market;
}

export function TradePanel({ market }: TradePanelProps) {
  const yesPct = Math.round(market.yesProbability * 100);
  const noPct = 100 - yesPct;

  const [open, setOpen] = useState<"yes" | "no" | null>(null);

  return (
    <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-3xl p-7 shadow-[0_18px_60px_-24px_rgba(15,23,42,0.18)]">
      <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)] mb-5">
        Take a position
      </h3>
      <div className="grid grid-cols-2 gap-3 mb-5">
        <button className="btn-yes" type="button" onClick={() => setOpen("yes")}>
          <span>YES</span>
          <span className="font-mono text-sm tabular-nums">{yesPct}¢</span>
        </button>
        <button className="btn-no" type="button" onClick={() => setOpen("no")}>
          <span>NO</span>
          <span className="font-mono text-sm tabular-nums">{noPct}¢</span>
        </button>
      </div>

      <button
        type="button"
        onClick={() => setOpen("yes")}
        className="btn-emerald w-full"
      >
        {DEPLOY.walletPhase === "live"
          ? "Connect wallet to trade"
          : "Join the trading waitlist"}
      </button>

      <p className="mt-3 text-[11px] text-[var(--color-text-faint)] text-center leading-[1.5]">
        {DEPLOY.walletPhase === "live"
          ? "Real-money trading is live. Buy YES or NO above."
          : "Real-money trading turns on in Phase 2. Join the waitlist to be the first to know."}
      </p>

      <AnimatePresence>
        {open && (
          <WaitlistModal
            market={market}
            side={open}
            yesPct={yesPct}
            onClose={() => setOpen(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function WaitlistModal({
  market,
  side,
  yesPct,
  onClose,
}: {
  market: Market;
  side: "yes" | "no";
  yesPct: number;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [intentSizeUsd, setIntentSizeUsd] = useState(50);
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const sidePrice = side === "yes" ? yesPct : 100 - yesPct;
  const estShares = Math.round((intentSizeUsd / sidePrice) * 100) / 1;

  async function submit() {
    if (!isValidEmail(email)) {
      setErrMsg("Please enter a valid email.");
      return;
    }
    setStatus("submitting");
    setErrMsg(null);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          marketId: market.id,
          side,
          sizeUsd: intentSizeUsd,
          source: "trade-panel",
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setErrMsg(err instanceof Error ? err.message : "Submission failed");
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/40 px-4 pb-6 sm:pb-0"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 24, opacity: 0 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-3xl p-6 w-full max-w-md shadow-[0_24px_60px_-12px_rgba(15,23,42,0.4)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h4 className="text-lg font-semibold tracking-tight text-[var(--color-text-strong)]">
            Reserve {side.toUpperCase()} on this market
          </h4>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-[var(--color-text-faint)] hover:text-[var(--color-text)] cursor-pointer text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {status === "done" ? (
          <>
            <div className="rounded-2xl bg-[var(--color-emerald-tint)] border border-[var(--color-emerald)]/30 p-4 mb-4">
              <div className="flex items-start gap-3">
                <span
                  aria-hidden
                  className="mt-0.5 w-5 h-5 rounded-full bg-[var(--color-emerald)] text-white flex items-center justify-center text-xs font-bold"
                >
                  ✓
                </span>
                <div className="text-sm leading-[1.6]">
                  <div className="font-semibold text-[var(--color-emerald-deep)]">
                    Saved your intent.
                  </div>
                  <p className="text-[var(--color-text)] mt-1">
                    We&apos;ll email you when {side.toUpperCase()} positions open
                    on this market. No spam, no shilling.
                  </p>
                </div>
              </div>
            </div>
            <button type="button" onClick={onClose} className="btn-outline w-full">
              Done
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-[var(--color-text-muted)] leading-[1.6] mb-5">
              Real-money trading turns on in Phase 2. Save your size + side
              so we can email you the moment positions are open — and use
              your intent to size the first live order book.
            </p>

            <div className="mb-4">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.16em] font-semibold text-[var(--color-text-muted)] mb-2">
                <span>Intended size (USDC)</span>
                <span className="tabular-nums text-[var(--color-text)]">
                  ${intentSizeUsd}
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={1000}
                step={5}
                value={intentSizeUsd}
                onChange={(e) => setIntentSizeUsd(Number(e.target.value))}
                aria-label="Intended size in USDC"
                className="w-full accent-[var(--color-emerald)]"
              />
              <div className="mt-1 text-[11px] text-[var(--color-text-faint)] tabular-nums">
                ≈ {estShares.toFixed(0)} {side.toUpperCase()} shares @ {sidePrice}¢
              </div>
            </div>

            <label className="block text-xs uppercase tracking-[0.16em] font-semibold text-[var(--color-text-muted)] mb-2">
              Email
            </label>
            <input
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errMsg) setErrMsg(null);
              }}
              className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-emerald)]"
            />

            {errMsg && (
              <p className="mt-2 text-xs text-[#B91C1C]">{errMsg}</p>
            )}

            <button
              type="button"
              onClick={submit}
              disabled={status === "submitting"}
              className="btn-emerald w-full mt-5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === "submitting" ? "Saving..." : `Save my ${side.toUpperCase()} intent`}
            </button>

            <p className="mt-3 text-[11px] text-[var(--color-text-faint)] text-center leading-[1.5]">
              We never sell or share your email. One launch ping, then you
              opt in if you want more.
            </p>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}
