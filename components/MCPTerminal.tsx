"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const QUERIES = [
  {
    user: "What's moving in regional politics?",
    response: `foresight_list_markets({ category: "thai-politics" })

Top by 24h volume:
  • Thailand snap election before Q4 2027
    YES 42% · $184k volume · 16mo left
  • Indonesia 2029 — Coalition A wins
    YES 31% · $6k volume · 32mo left`,
  },
  {
    user: "Any vet disease markets closing soon?",
    response: `foresight_list_markets({
  category: "thai-vet", sortBy: "closing-soonest"
})

  • New ASF outbreak in Thai pig farm
    YES 55% · $19k volume · 89 days left
    sources: dld.go.th · WOAH`,
  },
  {
    user: "Propose a market on ChulaGENIE shipping a vet agent.",
    response: `foresight_propose_market({
  question: "Will ChulaGENIE ship a vet agent by 2026?",
  category: "ai-research",
  resolutionCriteria: "YES if chula.ai lists a
    veterinary-labeled agent before 2026-12-31",
  resolutionSources: ["chula.ai"],
  closesAt: "2026-12-31"
})

  → draft accepted · pending review · 48h SLA`,
  },
  {
    user: "Run the verifier on the BTC $200K market.",
    response: `foresight_resolve_check({
  identifier: "btc-touch-200k-by-eoy-2026"
})

  status:   pending  (market still open)
  appealAvailable: true
  reasoning: market closes 2026-12-31. Verifier
    will consult Coinbase Pro + Kraken at close.`,
  },
];

/**
 * MCPTerminal — typewriter animation cycling through four sample MCP
 * interactions. Each cycle: type the user line at ~36ms/char, beat,
 * stream the agent response at ~12ms/char, pause for 3.6s, fade out,
 * advance to next. Respects prefers-reduced-motion (just shows the
 * static last frame of the first example).
 */
export function MCPTerminal() {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [idx, setIdx] = useState(0);
  const [typedUser, setTypedUser] = useState("");
  const [typedResponse, setTypedResponse] = useState("");
  const [phase, setPhase] = useState<"user" | "gap" | "response" | "hold">("user");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    const q = QUERIES[idx];
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    async function run() {
      // Reset
      setTypedUser("");
      setTypedResponse("");
      setPhase("user");
      // Type user
      for (let i = 1; i <= q.user.length; i++) {
        if (cancelled) return;
        setTypedUser(q.user.slice(0, i));
        await wait(34 + Math.random() * 16);
      }
      setPhase("gap");
      await wait(450);
      setPhase("response");
      for (let i = 1; i <= q.response.length; i++) {
        if (cancelled) return;
        setTypedResponse(q.response.slice(0, i));
        await wait(7 + Math.random() * 5);
      }
      setPhase("hold");
      timeoutId = setTimeout(() => {
        if (!cancelled) setIdx((n) => (n + 1) % QUERIES.length);
      }, 3800);
    }

    run();
    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [idx, reduceMotion]);

  const q = QUERIES[idx];
  const displayUser = reduceMotion ? q.user : typedUser;
  const displayResponse = reduceMotion ? q.response : typedResponse;

  return (
    <div className="rounded-2xl bg-[var(--color-text-strong)] text-white border border-[var(--color-border-strong)] overflow-hidden font-mono text-[13px] leading-[1.6] shadow-[0_24px_60px_-24px_rgba(15,23,42,0.45)]">
      {/* Window chrome */}
      <div className="flex items-center gap-1.5 px-4 py-2.5 bg-black/30 border-b border-white/10">
        <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" aria-hidden />
        <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" aria-hidden />
        <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" aria-hidden />
        <span className="ml-3 text-[11px] text-white/45 tracking-wide">
          foresight-mcp · stdio
        </span>
        <span className="ml-auto text-[11px] text-white/35">
          {idx + 1} / {QUERIES.length}
        </span>
      </div>

      {/* Body */}
      <div className="p-5 min-h-[280px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <div className="flex gap-2">
              <span className="text-[var(--color-emerald-tint)] shrink-0">$</span>
              <span className="whitespace-pre-wrap">{displayUser}</span>
              {!reduceMotion && phase === "user" && <Caret />}
            </div>
            {(phase === "gap" || phase === "response" || phase === "hold" || reduceMotion) && (
              <div className="mt-3 pl-3 border-l-2 border-[var(--color-emerald)]/40 text-white/85 whitespace-pre-wrap">
                {displayResponse}
                {!reduceMotion && phase === "response" && <Caret />}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function Caret() {
  return (
    <motion.span
      aria-hidden
      animate={{ opacity: [1, 0.2, 1] }}
      transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
      className="inline-block w-[7px] h-[14px] bg-[var(--color-emerald)] align-middle ml-[2px] translate-y-[-1px]"
    />
  );
}

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
