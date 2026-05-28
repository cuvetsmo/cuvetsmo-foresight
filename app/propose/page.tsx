import type { Metadata } from "next";
import Link from "next/link";
import { EcosystemBar } from "@/components/EcosystemBar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProposeForm } from "@/components/ProposeForm";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Propose a market",
  description: `Propose a forecasting market for ${BRAND.name}. Every proposal needs a machine-verifiable resolution criterion and a named primary source. Public review queue, no wallet, no signup.`,
};

export default function ProposePage() {
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
              <Link href="/" className="hover:text-[var(--color-emerald-deep)] transition-colors">
                Home
              </Link>
              <span aria-hidden>/</span>
              <span>Propose a market</span>
            </nav>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-emerald-deep)] mb-3">
              Anyone can propose · public review
            </p>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-[1.1] text-[var(--color-text-strong)]">
              Propose a market.
            </h1>
            <p className="mt-5 max-w-2xl text-[var(--color-text-muted)] leading-[1.65]">
              The only bar is resolvability: a clear yes/no question, a
              machine-verifiable criterion, and at least one named primary
              source. No vague &quot;most people think&quot; markets, no
              distress markets. Your proposal lands in the{" "}
              <Link href="/admin/proposals" className="text-[var(--color-emerald-deep)] hover:underline">
                public review queue
              </Link>{" "}
              — a moderator checks it before anything goes live.
            </p>
            <p className="mt-3 text-sm text-[var(--color-text-faint)]">
              Building an agent? The same submission is one MCP call —{" "}
              <Link href="/docs#propose-market" className="font-mono hover:text-[var(--color-emerald-deep)]">
                foresight_propose_market
              </Link>
              .
            </p>
          </div>
        </section>

        <section className="bg-[var(--color-bg-card)]">
          <div className="max-w-3xl mx-auto px-6 sm:px-8 py-14 sm:py-16">
            <ProposeForm />
          </div>
        </section>

        <section className="bg-[var(--color-bg)] border-t border-[var(--color-border)]">
          <div className="max-w-3xl mx-auto px-6 sm:px-8 py-14 text-sm leading-[1.7] text-[var(--color-text-muted)]">
            <h2 className="text-lg font-semibold tracking-tight text-[var(--color-text-strong)] mb-4">
              What makes a good criterion
            </h2>
            <ul className="space-y-2.5">
              <li>
                <strong className="text-[var(--color-text)]">Verifiable</strong>{" "}
                — a named source could settle it without judgment. &quot;BoT
                publishes a rate cut on bot.or.th&quot;, not &quot;the economy
                improves&quot;.
              </li>
              <li>
                <strong className="text-[var(--color-text)]">Time-anchored</strong>{" "}
                — contains a deadline or condition (by / before / on / when).
              </li>
              <li>
                <strong className="text-[var(--color-text)]">Sourced</strong>{" "}
                — at least one public primary source named up front, checked at
                resolution.
              </li>
              <li>
                <strong className="text-[var(--color-text)]">Non-distress</strong>{" "}
                — no markets predicting the death or harm of named people.
              </li>
            </ul>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
