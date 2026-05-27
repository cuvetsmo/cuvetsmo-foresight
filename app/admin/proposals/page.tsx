import type { Metadata } from "next";
import Link from "next/link";
import { EcosystemBar } from "@/components/EcosystemBar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BRAND } from "@/lib/brand";
import { CATEGORIES } from "@/lib/types";
import { listProposals, type MarketProposal, type ReviewStatus } from "@/lib/proposals";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Proposal queue",
  description: `Public review queue for ${BRAND.name} market proposals. Transparency is the moat — every proposal, every decision, every reason is on the record.`,
};

const STATUS_META: Record<
  ReviewStatus,
  { label: string; tone: string; bg: string }
> = {
  pending: {
    label: "Pending review",
    tone: "text-[#92400E]",
    bg: "bg-[var(--color-amber-tint)] border-[var(--color-amber)]/40",
  },
  approved: {
    label: "Approved",
    tone: "text-[var(--color-emerald-deep)]",
    bg: "bg-[var(--color-emerald-tint)] border-[var(--color-emerald)]/40",
  },
  rejected: {
    label: "Rejected",
    tone: "text-[#B91C1C]",
    bg: "bg-[#FEE2E2] border-[#FCA5A5]",
  },
  "revisions-requested": {
    label: "Revisions requested",
    tone: "text-[#4338CA]",
    bg: "bg-[#EEF2FF] border-[#A5B4FC]",
  },
};

export default async function AdminProposalsPage() {
  const proposals = await listProposals();
  const pending = proposals.filter((p) => p.reviewStatus === "pending");
  const decided = proposals.filter((p) => p.reviewStatus !== "pending");

  return (
    <>
      <EcosystemBar current="foresight" />
      <Header />

      <main className="flex-1">
        <section className="bg-[var(--color-bg)] border-b border-[var(--color-border)]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-14 pb-10">
            <nav
              aria-label="Breadcrumb"
              className="mb-5 text-sm text-[var(--color-text-muted)] flex items-center gap-2"
            >
              <Link
                href="/"
                className="hover:text-[var(--color-emerald-deep)] transition-colors"
              >
                Home
              </Link>
              <span aria-hidden>/</span>
              <span>Proposal queue</span>
            </nav>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-emerald-deep)] mb-3">
              Transparency queue
            </p>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-[1.1] text-[var(--color-text-strong)]">
              Every proposal, on the record.
            </h1>
            <p className="mt-4 max-w-2xl text-[var(--color-text-muted)] leading-[1.65]">
              Anyone can propose a market via the {BRAND.name} MCP{" "}
              <code className="font-mono text-[13px] bg-[var(--color-emerald-tint)] text-[var(--color-emerald-deep)] px-1.5 py-0.5 rounded">
                foresight_propose_market
              </code>
              . Every proposal lands here for human review against the
              Iron-Rule-0 verifiable-criterion bar. Decisions are public —
              what was approved, what was rejected, and why.
            </p>
            <div className="mt-6 flex flex-wrap items-baseline gap-6 text-sm">
              <Stat label="pending" value={pending.length} tone="amber" />
              <Stat
                label="decided"
                value={decided.length}
                tone="muted"
              />
              <Stat label="total" value={proposals.length} tone="default" />
            </div>
          </div>
        </section>

        <section className="bg-[var(--color-bg-card)]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 py-14 sm:py-16 space-y-10">
            {proposals.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                {pending.length > 0 && (
                  <ProposalGroup
                    title="Pending review"
                    sub={`${pending.length} ${pending.length === 1 ? "proposal" : "proposals"} awaiting decision`}
                    proposals={pending}
                  />
                )}
                {decided.length > 0 && (
                  <ProposalGroup
                    title="Decided"
                    sub={`${decided.length} prior ${decided.length === 1 ? "decision" : "decisions"} · transparency log`}
                    proposals={decided}
                  />
                )}
              </>
            )}
          </div>
        </section>

        <section className="bg-[var(--color-bg)] border-t border-[var(--color-border)]">
          <div className="max-w-3xl mx-auto px-6 sm:px-8 py-12 text-sm text-[var(--color-text-muted)] leading-[1.65]">
            <h2 className="text-lg font-semibold tracking-tight text-[var(--color-text-strong)] mb-3">
              How proposals get approved
            </h2>
            <ol className="space-y-2 list-decimal list-inside">
              <li>
                Anyone with an MCP-aware agent calls{" "}
                <code className="font-mono text-[13px]">foresight_propose_market</code>{" "}
                with question + criterion + sources + closes-at.
              </li>
              <li>
                The MCP server applies Iron-Rule-0 guards at the protocol
                surface — distress/assassination markets refused, criteria
                without a temporal anchor refused, past close-dates refused.
              </li>
              <li>
                Surviving proposals land in this queue. A moderator checks
                the criterion against the named sources — can a third party
                actually verify the resolution from the listed sources alone?
              </li>
              <li>
                Decisions are written back to the proposal row with reviewer
                + reasoning. Public log here so reviewers stay accountable.
              </li>
            </ol>
            <p className="mt-5 text-[var(--color-text-faint)] text-[13px]">
              Phase 1 — proposal actions (approve/reject) require a moderator
              account. Auth flow lands with the wallet integration in Phase 2.
              The read surface is public from day one.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "amber" | "muted" | "default";
}) {
  const cls =
    tone === "amber"
      ? "text-[#92400E]"
      : tone === "muted"
        ? "text-[var(--color-text-faint)]"
        : "text-[var(--color-text-strong)]";
  return (
    <div className="flex items-baseline gap-2">
      <span className={"text-3xl font-bold tabular-nums " + cls}>{value}</span>
      <span className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[var(--color-text-muted)]">
        {label}
      </span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-[var(--color-bg)] border border-dashed border-[var(--color-border-strong)] rounded-3xl p-10 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-emerald-deep)] mb-3">
        Empty queue
      </p>
      <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-text-strong)]">
        Zero proposals yet.
      </h3>
      <p className="mt-3 max-w-md mx-auto text-[var(--color-text-muted)] leading-[1.65]">
        Be the first. Install the MCP server and call{" "}
        <code className="font-mono text-[13px] bg-[var(--color-bg-card)] border border-[var(--color-border)] px-1.5 py-0.5 rounded">
          foresight_propose_market
        </code>{" "}
        with a question your data sources can verify.
      </p>
      <div className="mt-6 inline-block bg-[var(--color-text-strong)] text-white px-5 py-3 rounded-2xl font-mono text-xs">
        $ npm install -g foresight-mcp
      </div>
    </div>
  );
}

function ProposalGroup({
  title,
  sub,
  proposals,
}: {
  title: string;
  sub: string;
  proposals: MarketProposal[];
}) {
  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text-strong)]">
          {title}
        </h2>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">{sub}</p>
      </div>
      <ul className="space-y-4">
        {proposals.map((p) => (
          <ProposalCard key={p.id} proposal={p} />
        ))}
      </ul>
    </div>
  );
}

function ProposalCard({ proposal }: { proposal: MarketProposal }) {
  const cat = CATEGORIES.find((c) => c.key === proposal.category);
  const status = STATUS_META[proposal.reviewStatus];
  const proposedAt = new Date(proposal.proposedAt);
  const closesAt = new Date(proposal.closesAt);

  return (
    <li
      className={"rounded-3xl border p-6 sm:p-7 " + status.bg}
    >
      <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="inline-block w-2 h-2 rounded-full bg-[var(--color-text-muted)]"
          />
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
            {cat?.emoji} {cat?.labelEn}
          </span>
          <span
            className={
              "text-xs font-semibold uppercase tracking-[0.16em] " + status.tone
            }
          >
            · {status.label}
          </span>
        </div>
        <span className="font-mono text-[11px] text-[var(--color-text-faint)]">
          {proposal.draftId}
        </span>
      </div>

      <h3 className="text-lg sm:text-xl font-semibold leading-[1.4] tracking-tight text-[var(--color-text-strong)]">
        {proposal.questionEn ?? proposal.question}
      </h3>
      {proposal.questionEn && proposal.question !== proposal.questionEn && (
        <p className="mt-1 text-sm text-[var(--color-text-muted)] italic">
          {proposal.question}
        </p>
      )}

      <div className="mt-4 space-y-3 text-sm text-[var(--color-text)] leading-[1.6]">
        <div>
          <div className="text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-text-muted)] mb-1">
            Resolution criterion
          </div>
          {proposal.resolutionCriteria}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[var(--color-text-faint)] font-semibold uppercase tracking-[0.16em]">
            Sources
          </span>
          {proposal.resolutionSources.map((src) => (
            <span
              key={src}
              className="font-mono text-[12px] px-2 py-0.5 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-md text-[var(--color-text-muted)]"
            >
              {src}
            </span>
          ))}
        </div>
        {proposal.reviewNotes && (
          <div>
            <div className="text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-text-muted)] mb-1">
              Reviewer notes
            </div>
            {proposal.reviewNotes}
          </div>
        )}
      </div>

      <div className="mt-5 pt-5 border-t border-[var(--color-border)]/40 flex items-baseline justify-between gap-3 flex-wrap text-xs text-[var(--color-text-muted)]">
        <span>
          Proposed{" "}
          <time dateTime={proposal.proposedAt}>
            {proposedAt.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </time>
          {proposal.proposedBy && (
            <>
              {" "}· by{" "}
              <span className="font-mono text-[11px]">
                {proposal.proposedBy.slice(0, 8)}…
              </span>
            </>
          )}
        </span>
        <span>
          Closes{" "}
          {closesAt.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>

      {proposal.reviewStatus === "pending" && (
        <div className="mt-5 pt-5 border-t border-[var(--color-border)]/40">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)] mb-3">
            Moderator actions
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled
              className="btn-emerald text-xs py-2 px-4 opacity-60 cursor-not-allowed"
              title="Auth flow lands in Phase 2"
            >
              Approve
            </button>
            <button
              type="button"
              disabled
              className="btn-outline text-xs py-2 px-4 opacity-60 cursor-not-allowed"
              title="Auth flow lands in Phase 2"
            >
              Request revisions
            </button>
            <button
              type="button"
              disabled
              className="btn-outline text-xs py-2 px-4 opacity-60 cursor-not-allowed"
              title="Auth flow lands in Phase 2"
            >
              Reject
            </button>
            <span className="text-[11px] text-[var(--color-text-faint)] self-center">
              · sign-in lands in Phase 2
            </span>
          </div>
        </div>
      )}
    </li>
  );
}
