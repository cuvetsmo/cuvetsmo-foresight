import Link from "next/link";
import { EcosystemBar } from "@/components/EcosystemBar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <EcosystemBar current="foresight" />
      <Header />

      <main className="flex-1 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center px-6 py-24">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-emerald-deep)] mb-4">
            404 — no signal
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[var(--color-text-strong)]">
            That market doesn&apos;t exist.
          </h1>
          <p className="mt-4 text-[var(--color-text-muted)] leading-[1.65]">
            It may have been resolved, removed, or the link is wrong.
          </p>
          <div className="mt-10 flex items-center justify-center gap-3">
            <Link href="/markets" className="btn-emerald">
              All markets
              <span aria-hidden>→</span>
            </Link>
            <Link href="/" className="btn-outline">
              Home
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
