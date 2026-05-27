import type { Metadata } from "next";
import Link from "next/link";
import { EcosystemBar } from "@/components/EcosystemBar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BRAND, DEPLOY } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Brand kit",
  description: `Press-ready brand kit for ${BRAND.name} — logo, colors, typography, voice. Use these assets when writing about or linking to ${BRAND.name}.`,
};

const SWATCHES: { name: string; hex: string; role: string; onBg?: "dark" }[] = [
  { name: "Emerald primary", hex: "#10B981", role: "CTA, YES outcome, live pulse" },
  { name: "Emerald deep", hex: "#047857", role: "Hover + pressed states" },
  { name: "Emerald tint", hex: "#D1FAE5", role: "Soft highlights + badges" },
  { name: "Slate 950", hex: "#020617", role: "Headlines", onBg: "dark" },
  { name: "Slate 900", hex: "#0F172A", role: "Body text + dark sections", onBg: "dark" },
  { name: "Slate 500 — NO outcome", hex: "#64748B", role: "NO outcome (intentional non-red)" },
  { name: "Off-white surface", hex: "#FAFAFA", role: "Page surface" },
  { name: "Amber accent", hex: "#F59E0B", role: "Closing-soon badges" },
];

const PRESS_LINES = [
  `${BRAND.name} is a forecasting marketplace for the events the world's biggest exchanges overlook — regional politics, climate, disease outbreaks, frontier research.`,
  `Every market on ${BRAND.name} carries a public, machine-verifiable resolution criterion and at least one named primary source — no anonymous oracle votes, no after-the-fact reinterpretation.`,
  `${BRAND.name} is the first prediction marketplace exposed natively over the Model Context Protocol — any MCP-aware agent can browse, propose, and dry-run resolutions without a proprietary SDK.`,
];

export default function BrandPage() {
  return (
    <>
      <EcosystemBar current="foresight" />
      <Header />

      <main className="flex-1">
        <section className="bg-[var(--color-bg)] border-b border-[var(--color-border)]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-14 pb-12">
            <nav
              aria-label="Breadcrumb"
              className="mb-5 text-sm text-[var(--color-text-muted)] flex items-center gap-2"
            >
              <Link href="/" className="hover:text-[var(--color-emerald-deep)] transition-colors">
                Home
              </Link>
              <span aria-hidden>/</span>
              <span>Brand</span>
            </nav>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-emerald-deep)] mb-3">
              Press + brand kit
            </p>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-[1.1] text-[var(--color-text-strong)]">
              Everything you need to write about {BRAND.name}.
            </h1>
            <p className="mt-4 max-w-2xl text-[var(--color-text-muted)] leading-[1.65]">
              Logo, colors, typography, voice. Lift any of this directly —
              no permission required for editorial use. For partnerships
              and media inquiries see the bottom of the page.
            </p>
          </div>
        </section>

        {/* Logo */}
        <section className="bg-[var(--color-bg-card)]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16">
            <SectionHead eyebrow="Logo" title="The mark." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <LogoTile kind="light" />
              <LogoTile kind="dark" />
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
              <a
                href="/icon"
                download="foresight-mark-32.png"
                className="btn-outline text-xs py-2 px-3"
              >
                Download 32×32 PNG
              </a>
              <a
                href="/apple-icon"
                download="foresight-mark-180.png"
                className="btn-outline text-xs py-2 px-3"
              >
                Download 180×180 PNG
              </a>
              <a
                href="/api/brand/mark"
                download="foresight-mark.svg"
                className="btn-outline text-xs py-2 px-3"
              >
                Download SVG
              </a>
            </div>
            <p className="mt-4 text-xs text-[var(--color-text-faint)] max-w-2xl leading-[1.6]">
              The mark is a single-stroke upward chart with an emerald dot at
              the inflection — forecasting (the line), the moment of
              resolution (the dot). Use the dark-on-light variant on light
              surfaces; flip for dark.
            </p>
          </div>
        </section>

        {/* Colors */}
        <section className="bg-[var(--color-bg)]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16">
            <SectionHead
              eyebrow="Colors"
              title="Emerald lead, slate body, amber for time pressure only."
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {SWATCHES.map((s) => (
                <SwatchTile key={s.hex} swatch={s} />
              ))}
            </div>
            <p className="mt-6 text-xs text-[var(--color-text-faint)] max-w-2xl leading-[1.6]">
              NO outcomes use slate, not red — intentional non-gambling
              signal. Reserve amber for closing-soon urgency, never decorative.
            </p>
          </div>
        </section>

        {/* Typography */}
        <section className="bg-[var(--color-bg-card)]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16">
            <SectionHead eyebrow="Typography" title="Inter for everything." />
            <div className="space-y-4 max-w-3xl">
              <TypeSpec label="Display · 56 / 64 · 700" sample="Forecast the things that matter." />
              <TypeSpec label="H2 · 36 / 44 · 700" sample="Markets the giants will never list." />
              <TypeSpec label="Body · 16 / 26 · 400" sample="Every market on Foresight carries a public, machine-verifiable resolution criterion and at least one named primary source." />
              <TypeSpec label="Caption / eyebrow · 12 · 600 · uppercase tracking 0.18em" sample="A FORECASTING MARKETPLACE" />
              <TypeSpec
                label="Mono · IBM Plex Mono / SF Mono"
                sample="foresight_list_markets({ category: 'thai-politics' })"
                mono
              />
            </div>
            <p className="mt-6 text-xs text-[var(--color-text-faint)] max-w-2xl leading-[1.6]">
              Inter (300, 400, 500, 600, 700) is the only sans family. IBM
              Plex Sans Thai covers Thai script. Mono is reserved for code,
              ids, and resolution-source citations.
            </p>
          </div>
        </section>

        {/* Voice */}
        <section className="bg-[var(--color-bg)]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16">
            <SectionHead eyebrow="Voice + tone" title="Forecasting, not gambling." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
              <VoiceCard kind="do" body="We list. We resolve. We cite sources." />
              <VoiceCard kind="dont" body="We bet. We win. We crush the house." />
              <VoiceCard
                kind="do"
                body="Forecast the things that matter."
              />
              <VoiceCard kind="dont" body="Cash in on your hot takes." />
              <VoiceCard
                kind="do"
                body="The verifier is allowed to say 'I don't know with high confidence.'"
              />
              <VoiceCard
                kind="dont"
                body="Our oracle is always right."
              />
            </div>
            <p className="mt-8 max-w-3xl text-[var(--color-text-muted)] leading-[1.65]">
              Three rules: name the source, refuse the unverifiable, never
              flex on confidence we don&apos;t have. The product is built
              by people who&apos;d rather be right slowly than confidently
              wrong fast.
            </p>
          </div>
        </section>

        {/* Press lines */}
        <section className="bg-[var(--color-bg-card)]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16">
            <SectionHead
              eyebrow="One-liners"
              title="Drop-in copy for headlines, intros, and pitches."
            />
            <ul className="space-y-4 max-w-3xl">
              {PRESS_LINES.map((line, i) => (
                <li
                  key={i}
                  className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl p-5 text-[15px] leading-[1.65] text-[var(--color-text)]"
                >
                  <span className="text-xs font-mono text-[var(--color-text-faint)] block mb-1.5">
                    Press line {i + 1}
                  </span>
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Contact */}
        <section className="bg-[var(--color-bg-dark)] text-[var(--color-text-on-dark)] section-curve-top section-curve-bottom">
          <div className="max-w-4xl mx-auto px-6 sm:px-8 py-16 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-emerald-tint)] mb-4">
              Press + partnerships
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Reach out for editorial, partnerships, or licensing.
            </h2>
            <p className="mt-4 text-white/70 leading-[1.65] max-w-xl mx-auto">
              We respond fastest to specific asks. Tell us the publication,
              the angle, and the deadline.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm">
              <a
                href={`mailto:press@${hostFromBase()}`}
                className="btn-emerald"
              >
                press@{hostFromBase()}
              </a>
              <a href="/api/health" className="btn-outline text-white/90 border-white/25 hover:bg-white/10 hover:border-white/60">
                Status
              </a>
            </div>
            <p className="mt-6 text-xs text-white/40 max-w-md mx-auto leading-[1.55]">
              Educational beta — please flag this in any feature coverage.
              No real-money trading is live yet.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

function hostFromBase(): string {
  try {
    return new URL(DEPLOY.baseUrl).host;
  } catch {
    return "foresight";
  }
}

function SectionHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-10">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-emerald-deep)] mb-3">
        {eyebrow}
      </p>
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-text-strong)]">
        {title}
      </h2>
    </div>
  );
}

function LogoTile({ kind }: { kind: "light" | "dark" }) {
  const isDark = kind === "dark";
  return (
    <div
      className={
        "rounded-3xl border p-10 flex items-center justify-center gap-5 " +
        (isDark
          ? "bg-[var(--color-bg-dark)] border-white/10"
          : "bg-[var(--color-bg)] border-[var(--color-border)]")
      }
    >
      <span
        aria-hidden
        className={
          "relative inline-flex h-16 w-16 items-center justify-center rounded-2xl " +
          (isDark ? "bg-white" : "bg-[var(--color-text-strong)]")
        }
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke={isDark ? "var(--color-text-strong)" : "white"}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-9 w-9"
        >
          <path d="M3 17 L9 11 L13 14 L21 5" />
          <circle cx="21" cy="5" r="1.8" fill="#10B981" stroke="none" />
        </svg>
      </span>
      <span
        className={
          "text-2xl font-bold tracking-tight " +
          (isDark ? "text-white" : "text-[var(--color-text-strong)]")
        }
      >
        Foresight
      </span>
    </div>
  );
}

function SwatchTile({
  swatch,
}: {
  swatch: { name: string; hex: string; role: string; onBg?: "dark" };
}) {
  return (
    <div className="rounded-2xl overflow-hidden border border-[var(--color-border)]">
      <div
        className="h-20 sm:h-24"
        style={{ background: swatch.hex }}
        aria-label={`Color swatch ${swatch.hex}`}
      />
      <div className="p-4 bg-[var(--color-bg-card)]">
        <div className="text-sm font-semibold text-[var(--color-text-strong)] tracking-tight">
          {swatch.name}
        </div>
        <div className="mt-1 font-mono text-[12px] text-[var(--color-text-muted)] tabular-nums">
          {swatch.hex.toUpperCase()}
        </div>
        <div className="mt-2 text-[12px] text-[var(--color-text-faint)] leading-[1.5]">
          {swatch.role}
        </div>
      </div>
    </div>
  );
}

function TypeSpec({
  label,
  sample,
  mono = false,
}: {
  label: string;
  sample: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)] px-5 py-4">
      <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-[var(--color-text-faint)] mb-2">
        {label}
      </div>
      <div
        className={
          "text-[var(--color-text-strong)] " +
          (mono ? "font-mono text-sm" : "font-semibold text-lg")
        }
      >
        {sample}
      </div>
    </div>
  );
}

function VoiceCard({ kind, body }: { kind: "do" | "dont"; body: string }) {
  const isDo = kind === "do";
  return (
    <div
      className={
        "rounded-2xl p-5 border " +
        (isDo
          ? "bg-[var(--color-emerald-tint)] border-[var(--color-emerald)]/30"
          : "bg-[#FEE2E2] border-[#FCA5A5]")
      }
    >
      <div
        className={
          "text-xs font-semibold uppercase tracking-[0.18em] mb-2 " +
          (isDo ? "text-[var(--color-emerald-deep)]" : "text-[#B91C1C]")
        }
      >
        {isDo ? "Do" : "Don't"}
      </div>
      <p
        className={
          "text-[15px] leading-[1.55] " +
          (isDo ? "text-[var(--color-text)]" : "text-[#7F1D1D]")
        }
      >
        “{body}”
      </p>
    </div>
  );
}
