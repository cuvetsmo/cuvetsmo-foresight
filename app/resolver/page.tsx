import type { Metadata } from "next";
import Link from "next/link";
import { EcosystemBar } from "@/components/EcosystemBar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ResolverPlayground } from "@/components/ResolverPlayground";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Verifier · try the resolver",
  description:
    "Run the Foresight multi-source verifier on any market question. Public dry-run — no signup. Returns a structured result with confidence, reasoning, and cited sources.",
};

export default function ResolverPage() {
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
              <span>Verifier</span>
            </nav>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-emerald-deep)] mb-3">
              Multi-source verifier · dry-run
            </p>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-[1.1] text-[var(--color-text-strong)]">
              Try the verifier on any question.
            </h1>
            <p className="mt-4 max-w-2xl text-[var(--color-text-muted)] leading-[1.65]">
              Paste a forecasting question, the resolution criterion you&apos;d
              write for it, and the public sources you&apos;d cite at
              resolution. The verifier returns a structured result —{" "}
              <span className="font-mono text-[var(--color-text)]">
                verifiable · pending · ambiguous · refused
              </span>{" "}
              — with confidence and reasoning. It&apos;s allowed to say
              &quot;I don&apos;t know with high confidence&quot; when the
              criterion doesn&apos;t yield a determinate answer.
            </p>
          </div>
        </section>

        <section className="bg-[var(--color-bg-card)]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 py-14 sm:py-16">
            <ResolverPlayground />
          </div>
        </section>

        <section className="bg-[var(--color-bg)] border-t border-[var(--color-border)]">
          <div className="max-w-3xl mx-auto px-6 sm:px-8 py-16 text-sm leading-[1.7] text-[var(--color-text-muted)]">
            <h2 className="text-lg font-semibold tracking-tight text-[var(--color-text-strong)] mb-4">
              How the verifier decides
            </h2>
            <ul className="space-y-2.5">
              <li>
                <strong className="text-[var(--color-text)]">verifiable</strong>{" "}
                — criterion + sources unambiguously yield YES or NO at this
                point in time. Confidence ≥ 0.85 required; lower confidence
                auto-downgrades to ambiguous.
              </li>
              <li>
                <strong className="text-[var(--color-text)]">pending</strong>{" "}
                — market is still open OR the deadline has not passed yet
                OR the event has not happened yet.
              </li>
              <li>
                <strong className="text-[var(--color-text)]">ambiguous</strong>{" "}
                — criterion is real but the answer requires interpretation
                beyond what the criterion + sources alone can settle. Routes
                to the human appeal panel.
              </li>
              <li>
                <strong className="text-[var(--color-text)]">refused</strong> —
                criterion is malformed, distress-coded, or unverifiable in
                principle. The verifier refuses rather than guesses.
              </li>
            </ul>
            <p className="mt-6 text-[var(--color-text-faint)]">
              Same surface is exposed via the {BRAND.name} MCP server (
              <code className="font-mono text-[13px]">foresight_resolve_check</code>
              ) so AI agents can call it without writing a UI.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
