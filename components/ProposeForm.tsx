"use client";

import { useState } from "react";

const CATEGORIES = [
  { key: "thai-politics", label: "Thai Politics" },
  { key: "thai-climate", label: "Thai Climate" },
  { key: "thai-vet", label: "Thai Vet / Agri" },
  { key: "sea-elections", label: "SEA Elections" },
  { key: "crypto", label: "Crypto" },
  { key: "global-tech", label: "Global Tech" },
  { key: "global-sports", label: "Global Sports" },
  { key: "ai-research", label: "AI Research" },
] as const;

/**
 * ProposeForm — the browser equivalent of the foresight_propose_market
 * MCP tool. Posts to POST /api/proposals with the identical Iron Rule 0
 * contract. Live client-side hints mirror the server validation so the
 * user isn't surprised by a rejection.
 */
export function ProposeForm() {
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState<string>("thai-politics");
  const [closesAt, setClosesAt] = useState("");
  const [criteria, setCriteria] = useState("");
  const [sources, setSources] = useState("");
  const [tags, setTags] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [draftId, setDraftId] = useState<string | null>(null);

  const TEMPORAL = /(\bif\b|\bwhen\b|\bbefore\b|\bafter\b|\bon\b|\bby\b)/i;
  const criteriaHasAnchor = TEMPORAL.test(criteria);
  const sourceList = sources
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const qOk = question.trim().length >= 10 && question.trim().length <= 280;
  const cOk = criteria.trim().length >= 40 && criteria.trim().length <= 1000 && criteriaHasAnchor;
  const sOk = sourceList.length >= 1 && sourceList.length <= 5;
  const dateOk = closesAt !== "" && new Date(closesAt).getTime() > Date.now();
  const canSubmit = qOk && cOk && sOk && dateOk && state !== "sending";

  async function submit() {
    setState("sending");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.trim(),
          category,
          closesAt: new Date(closesAt).toISOString(),
          resolutionCriteria: criteria.trim(),
          resolutionSources: sourceList,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          email: email.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg("error" in data ? data.error : `HTTP ${res.status}`);
        setState("error");
        return;
      }
      setDraftId(data.draftId ?? null);
      setState("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Network error");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="rounded-3xl border border-[var(--color-emerald)]/30 bg-[var(--color-emerald-tint)]/30 p-8">
        <h2 className="text-xl font-bold tracking-tight text-[var(--color-text-strong)]">
          Proposal received — in the review queue.
        </h2>
        <p className="mt-3 text-sm leading-[1.7] text-[var(--color-text-muted)]">
          A moderator verifies resolvability against your named sources and
          either approves, requests edits, or rejects — typically within 48
          hours. It is <strong>not</strong> listed automatically.
        </p>
        {draftId && (
          <p className="mt-3 text-xs font-mono text-[var(--color-text-faint)]">
            draft id: {draftId}
          </p>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <a href="/admin/proposals" className="btn-outline text-sm py-2 px-4">
            See the public queue →
          </a>
          <button
            type="button"
            onClick={() => {
              setQuestion("");
              setCriteria("");
              setSources("");
              setTags("");
              setClosesAt("");
              setDraftId(null);
              setState("idle");
            }}
            className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-emerald-deep)]"
          >
            Propose another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <FormField
        label="Question"
        hint={`${question.trim().length}/280 · yes/no phrasing`}
        ok={question.length === 0 ? undefined : qOk}
      >
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Will the Bank of Thailand cut its policy rate at the December 2026 MPC meeting?"
          className="fs-input"
        />
      </FormField>

      <FormField label="Category">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setCategory(c.key)}
              className={
                "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors border " +
                (category === c.key
                  ? "bg-[var(--color-emerald)] text-white border-[var(--color-emerald)]"
                  : "bg-[var(--color-bg-card)] text-[var(--color-text-muted)] border-[var(--color-border-strong)] hover:border-[var(--color-emerald)]")
              }
            >
              {c.label}
            </button>
          ))}
        </div>
      </FormField>

      <FormField
        label="Resolution criterion"
        hint={
          criteria.length === 0
            ? "≥40 chars · must be machine-verifiable"
            : !criteriaHasAnchor
              ? "needs a time/condition word (if/when/before/after/on/by)"
              : `${criteria.trim().length}/1000`
        }
        ok={criteria.length === 0 ? undefined : cOk}
      >
        <textarea
          value={criteria}
          onChange={(e) => setCriteria(e.target.value)}
          rows={3}
          placeholder="Resolves YES if the BoT MPC December 2026 statement records a policy rate decrease vs the previous meeting, as published on bot.or.th. NO otherwise."
          className="fs-input resize-y"
        />
      </FormField>

      <FormField
        label="Named primary sources"
        hint={`${sourceList.length}/5 · one per line`}
        ok={sources.length === 0 ? undefined : sOk}
      >
        <textarea
          value={sources}
          onChange={(e) => setSources(e.target.value)}
          rows={2}
          placeholder={"https://www.bot.or.th/en/our-roles/monetary-policy/mpc-meeting.html"}
          className="fs-input font-mono text-[13px] resize-y"
        />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FormField label="Closes at" ok={closesAt === "" ? undefined : dateOk} hint={dateOk || closesAt === "" ? "when trading closes" : "must be in the future"}>
          <input
            type="datetime-local"
            value={closesAt}
            onChange={(e) => setClosesAt(e.target.value)}
            className="fs-input"
          />
        </FormField>
        <FormField label="Tags" hint="optional · comma-separated">
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="thailand, monetary-policy"
            className="fs-input"
          />
        </FormField>
      </div>

      <FormField label="Email" hint="optional · for review follow-up">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="fs-input"
        />
      </FormField>

      {state === "error" && errorMsg && (
        <div className="rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]">
          {errorMsg}
        </div>
      )}

      <div className="flex items-center gap-4 pt-2">
        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit}
          className="btn-emerald text-sm py-2.5 px-5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {state === "sending" ? "Submitting…" : "Submit for review"}
          <span aria-hidden>→</span>
        </button>
        <span className="text-xs text-[var(--color-text-faint)]">
          No wallet, no signup. Goes to the public queue.
        </span>
      </div>
    </div>
  );
}

function FormField({
  label,
  hint,
  ok,
  children,
}: {
  label: string;
  hint?: string;
  ok?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
          {label}
        </span>
        {hint && (
          <span
            className={
              "text-[11px] text-right " +
              (ok === false
                ? "text-[#B91C1C]"
                : ok === true
                  ? "text-[var(--color-emerald-deep)]"
                  : "text-[var(--color-text-faint)]")
            }
          >
            {hint}
          </span>
        )}
      </div>
      {children}
    </label>
  );
}
