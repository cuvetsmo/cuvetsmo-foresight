"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ResolveCitedSource {
  source: string;
  checked: boolean;
  note: string;
  url?: string;
}

interface ResolveResult {
  status: "verifiable" | "pending" | "ambiguous" | "refused";
  proposedOutcome?: "yes" | "no" | "void";
  confidence?: number;
  reasoning: string;
  citedSources: ResolveCitedSource[];
  appealAvailable: boolean;
  providerUsed?: string;
  refusalReason?: string;
}

interface Example {
  label: string;
  question: string;
  resolutionCriteria: string;
  resolutionSources: string[];
  closesAt: string;
}

const EXAMPLES: Example[] = [
  {
    label: "Thai election (open · pending expected)",
    question: "Will Thailand hold a general election before Q4 2027?",
    resolutionCriteria:
      "Resolves YES if the Election Commission of Thailand (ECT) holds a general election with results announced before 2027-10-01. Snap elections count.",
    resolutionSources: ["ect.go.th", "Royal Thai Government Gazette"],
    closesAt: "2027-10-01T00:00:00Z",
  },
  {
    label: "Past US election (verifiable expected)",
    question: "Did the 2024 US presidential election occur in November 2024?",
    resolutionCriteria:
      "Resolves YES if the US held a presidential general election in November 2024 as reported by the Associated Press and the Federal Election Commission.",
    resolutionSources: ["AP", "Federal Election Commission"],
    closesAt: "2024-11-30T00:00:00Z",
  },
  {
    label: "Vague criterion (ambiguous expected)",
    question: "Will Thailand's economy improve next year?",
    resolutionCriteria:
      "Resolves YES if the economy generally improves and people are happier with the situation overall.",
    resolutionSources: ["news headlines", "social media sentiment"],
    closesAt: "2027-12-31T00:00:00Z",
  },
  {
    label: "Distress prompt (refused expected)",
    question: "Will the head of state of country X die before December?",
    resolutionCriteria:
      "Resolves YES if the named person dies before the stated deadline as reported by Reuters.",
    resolutionSources: ["Reuters"],
    closesAt: "2027-12-31T00:00:00Z",
  },
];

const STATUS_META: Record<
  ResolveResult["status"],
  { label: string; tone: string; bg: string; emoji: string }
> = {
  verifiable: {
    label: "VERIFIABLE",
    tone: "text-[var(--color-emerald-deep)]",
    bg: "bg-[var(--color-emerald-tint)] border-[var(--color-emerald)]/40",
    emoji: "✓",
  },
  pending: {
    label: "PENDING",
    tone: "text-[#92400E]",
    bg: "bg-[var(--color-amber-tint)] border-[var(--color-amber)]/40",
    emoji: "⧗",
  },
  ambiguous: {
    label: "AMBIGUOUS · APPEAL",
    tone: "text-[#92400E]",
    bg: "bg-[var(--color-amber-tint)] border-[var(--color-amber)]/40",
    emoji: "?",
  },
  refused: {
    label: "REFUSED",
    tone: "text-[#B91C1C]",
    bg: "bg-[#FEE2E2] border-[#FCA5A5]",
    emoji: "✕",
  },
};

export function ResolverPlayground() {
  const [example, setExample] = useState<Example>(EXAMPLES[0]);
  const [question, setQuestion] = useState(EXAMPLES[0].question);
  const [criteria, setCriteria] = useState(EXAMPLES[0].resolutionCriteria);
  const [sources, setSources] = useState(
    EXAMPLES[0].resolutionSources.join("\n"),
  );
  const [closesAt, setClosesAt] = useState(EXAMPLES[0].closesAt);

  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<ResolveResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);

  function loadExample(ex: Example) {
    setExample(ex);
    setQuestion(ex.question);
    setCriteria(ex.resolutionCriteria);
    setSources(ex.resolutionSources.join("\n"));
    setClosesAt(ex.closesAt);
    setResult(null);
    setError(null);
  }

  async function runDryRun() {
    if (!question.trim() || !criteria.trim() || !sources.trim() || !closesAt) {
      setError("All four fields are required.");
      return;
    }
    setRunning(true);
    setResult(null);
    setError(null);
    const startedAt = performance.now();
    try {
      const res = await fetch("/api/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.trim(),
          resolutionCriteria: criteria.trim(),
          resolutionSources: sources
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
          closesAt,
        }),
      });
      const data = (await res.json()) as ResolveResult | { error: string };
      setElapsedMs(Math.round(performance.now() - startedAt));
      if (!res.ok || "error" in data) {
        setError("error" in data ? data.error : `HTTP ${res.status}`);
        return;
      }
      setResult(data as ResolveResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Examples row */}
      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex.label}
            type="button"
            onClick={() => loadExample(ex)}
            className={
              "text-xs font-medium px-3 py-1.5 rounded-full border transition-colors " +
              (example.label === ex.label
                ? "bg-[var(--color-text-strong)] text-white border-[var(--color-text-strong)]"
                : "bg-[var(--color-bg-card)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:border-[var(--color-emerald)] hover:text-[var(--color-emerald-deep)]")
            }
          >
            {ex.label}
          </button>
        ))}
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          <Field
            label="Question"
            hint="A yes/no question that can be answered definitively at resolution."
          >
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-emerald)]"
              placeholder="Will X happen by Y date?"
            />
          </Field>

          <Field
            label="Resolution criterion"
            hint="The exact rule the verifier will follow. Should name a concrete event + a comparison."
          >
            <textarea
              rows={4}
              value={criteria}
              onChange={(e) => setCriteria(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-emerald)] resize-y leading-[1.55]"
              placeholder="Resolves YES if ..."
            />
          </Field>

          <Field
            label="Named primary sources"
            hint="One source per line. Must be public + cite-able."
          >
            <textarea
              rows={3}
              value={sources}
              onChange={(e) => setSources(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-emerald)] resize-y font-mono text-sm leading-[1.55]"
              placeholder="ect.go.th&#10;Royal Thai Government Gazette"
            />
          </Field>

          <Field label="Market closes at" hint="ISO 8601 datetime.">
            <input
              type="text"
              value={closesAt}
              onChange={(e) => setClosesAt(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-emerald)] font-mono text-sm"
              placeholder="2027-10-01T00:00:00Z"
            />
          </Field>

          <button
            type="button"
            onClick={runDryRun}
            disabled={running}
            className="btn-emerald disabled:opacity-60 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            {running ? (
              <>
                <span className="animate-pulse">Running verifier...</span>
              </>
            ) : (
              <>
                Run dry-run
                <span aria-hidden>→</span>
              </>
            )}
          </button>
          {error && <p className="text-sm text-[#B91C1C]">{error}</p>}
        </div>

        {/* Result */}
        <div className="lg:sticky lg:top-24 self-start">
          <AnimatePresence mode="wait">
            {!result && !running && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-3xl border border-dashed border-[var(--color-border-strong)] bg-[var(--color-bg-card)] p-8 min-h-[360px] flex flex-col items-center justify-center text-center"
              >
                <div className="text-4xl mb-4 text-[var(--color-text-faint)]" aria-hidden>
                  ⌬
                </div>
                <p className="text-[var(--color-text-muted)] max-w-xs leading-[1.6]">
                  Fill the form and run the dry-run to see the structured
                  verifier output — status, confidence, reasoning, cited
                  sources.
                </p>
              </motion.div>
            )}

            {running && (
              <motion.div
                key="running"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-8 min-h-[360px]"
              >
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-3 rounded-md bg-[var(--color-border)] animate-pulse"
                      style={{ width: `${100 - i * 8}%`, animationDelay: `${i * 80}ms` }}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {result && !running && (
              <motion.div
                key={result.status}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className={
                  "rounded-3xl border p-7 min-h-[360px] " + STATUS_META[result.status].bg
                }
              >
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div className="flex items-center gap-2.5">
                    <span
                      aria-hidden
                      className={
                        "inline-flex w-7 h-7 items-center justify-center rounded-full font-bold " +
                        STATUS_META[result.status].tone
                      }
                    >
                      {STATUS_META[result.status].emoji}
                    </span>
                    <span
                      className={
                        "text-xs font-semibold uppercase tracking-[0.18em] " +
                        STATUS_META[result.status].tone
                      }
                    >
                      {STATUS_META[result.status].label}
                    </span>
                  </div>
                  {elapsedMs != null && (
                    <span className="text-[11px] font-mono text-[var(--color-text-faint)]">
                      {elapsedMs}ms
                    </span>
                  )}
                </div>

                {result.proposedOutcome && (
                  <div className="mb-5">
                    <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-faint)] font-semibold">
                      Proposed outcome
                    </div>
                    <div className="mt-1 flex items-baseline gap-3">
                      <span className="text-4xl font-bold tracking-tight text-[var(--color-text-strong)]">
                        {result.proposedOutcome.toUpperCase()}
                      </span>
                      {typeof result.confidence === "number" && (
                        <span className="text-sm text-[var(--color-text-muted)] tabular-nums">
                          confidence {result.confidence.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="mb-5">
                  <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-faint)] font-semibold mb-2">
                    Reasoning
                  </div>
                  <p className="text-[15px] leading-[1.65] text-[var(--color-text)]">
                    {result.reasoning}
                  </p>
                </div>

                {result.refusalReason && (
                  <div className="mb-5">
                    <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-faint)] font-semibold mb-2">
                      Refusal reason
                    </div>
                    <p className="text-[15px] leading-[1.65] text-[var(--color-text)]">
                      {result.refusalReason}
                    </p>
                  </div>
                )}

                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-faint)] font-semibold mb-2">
                    Cited sources
                  </div>
                  <ul className="space-y-1.5 text-sm font-mono">
                    {result.citedSources.map((s, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span
                          aria-hidden
                          className={
                            "mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 " +
                            (s.checked
                              ? "bg-[var(--color-emerald)]"
                              : "bg-[var(--color-text-faint)]")
                          }
                        />
                        <div>
                          <span className="text-[var(--color-text)]">{s.source}</span>
                          {s.note && (
                            <span className="ml-2 text-[var(--color-text-muted)]">
                              — {s.note}
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {result.providerUsed && (
                  <p className="mt-5 pt-4 border-t border-[var(--color-border)] text-[11px] font-mono text-[var(--color-text-faint)]">
                    verified via {result.providerUsed}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
          {label}
        </span>
        {hint && (
          <span className="text-[11px] text-[var(--color-text-faint)] text-right">
            {hint}
          </span>
        )}
      </div>
      {children}
    </label>
  );
}
