import Link from "next/link";
import { BRAND, DEPLOY } from "@/lib/brand";

export function Footer() {
  const host = (() => {
    try {
      return new URL(DEPLOY.baseUrl).host;
    } catch {
      return "foresight";
    }
  })();

  return (
    <footer className="bg-[var(--color-bg-dark)] text-[var(--color-text-on-dark)] section-curve-top mt-24">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1 max-w-md">
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[var(--color-text-strong)]"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M3 17 L9 11 L13 14 L21 5" />
                  <circle cx="21" cy="5" r="1.6" fill="#10B981" stroke="none" />
                </svg>
              </span>
              <span className="text-lg font-semibold tracking-tight">
                {BRAND.name}
              </span>
            </div>
            <p className="mt-5 text-sm leading-[1.7] text-white/70">
              {BRAND.shortDescription}
            </p>
            {DEPLOY.educationalBeta ? (
              <p className="mt-4 text-xs text-white/45">
                Educational beta. No real-money trading yet.
              </p>
            ) : null}
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55 mb-4">
              Product
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/markets"
                  className="text-white/80 hover:text-[var(--color-emerald-tint)] transition-colors"
                >
                  All markets
                </Link>
              </li>
              <li>
                <Link
                  href="/#how-it-works"
                  className="text-white/80 hover:text-[var(--color-emerald-tint)] transition-colors"
                >
                  How it works
                </Link>
              </li>
              <li>
                <Link
                  href="/resolver"
                  className="text-white/80 hover:text-[var(--color-emerald-tint)] transition-colors"
                >
                  Try the verifier
                </Link>
              </li>
              <li>
                <Link
                  href="/#trust"
                  className="text-white/80 hover:text-[var(--color-emerald-tint)] transition-colors"
                >
                  Trust + resolution
                </Link>
              </li>
              <li>
                <Link
                  href="/docs"
                  className="text-white/80 hover:text-[var(--color-emerald-tint)] transition-colors"
                >
                  Developer docs
                </Link>
              </li>
              <li>
                <Link
                  href="/#roadmap"
                  className="text-white/80 hover:text-[var(--color-emerald-tint)] transition-colors"
                >
                  Roadmap
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55 mb-4">
              Company
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/#about"
                  className="text-white/80 hover:text-[var(--color-emerald-tint)] transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/brand"
                  className="text-white/80 hover:text-[var(--color-emerald-tint)] transition-colors"
                >
                  Press + brand kit
                </Link>
              </li>
              <li>
                <Link
                  href="/changelog"
                  className="text-white/80 hover:text-[var(--color-emerald-tint)] transition-colors"
                >
                  Changelog
                </Link>
              </li>
              <li>
                <Link
                  href="/#trust"
                  className="text-white/80 hover:text-[var(--color-emerald-tint)] transition-colors"
                >
                  Transparency
                </Link>
              </li>
              {DEPLOY.xHandle ? (
                <li>
                  <a
                    href={`https://x.com/${DEPLOY.xHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/80 hover:text-[var(--color-emerald-tint)] transition-colors"
                  >
                    @{DEPLOY.xHandle} on X ↗
                  </a>
                </li>
              ) : null}
              <li>
                <a
                  href="/api/health"
                  className="text-white/80 hover:text-[var(--color-emerald-tint)] transition-colors"
                >
                  Status
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-white/45">
          <span>
            © {new Date().getFullYear()} {BRAND.name}
          </span>
          <span className="font-mono">
            {host}
            {DEPLOY.educationalBeta ? " · beta" : ""}
          </span>
        </div>
      </div>
    </footer>
  );
}
