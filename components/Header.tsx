import Link from "next/link";

export function Header() {
  return (
    <header className="bg-[var(--color-bg)] sticky top-0 z-30 border-b border-[var(--color-border)]/60 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 h-16 flex items-center justify-between">
        <Link
          href="/"
          aria-label="Foresight home"
          className="flex items-center gap-2.5 shrink-0"
        >
          <ForesightMark />
          <span className="text-base sm:text-lg font-semibold tracking-tight text-[var(--color-text-strong)]">
            Foresight
          </span>
          <span className="hidden sm:inline text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-faint)] ml-1.5">
            beta
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden md:flex items-center gap-7 text-sm">
          <Link
            href="/markets"
            className="text-[var(--color-text-muted)] hover:text-[var(--color-emerald-deep)] transition-colors"
          >
            Markets
          </Link>
          <Link
            href="/resolver"
            className="text-[var(--color-text-muted)] hover:text-[var(--color-emerald-deep)] transition-colors"
          >
            Verifier
          </Link>
          <Link
            href="/#how-it-works"
            className="text-[var(--color-text-muted)] hover:text-[var(--color-emerald-deep)] transition-colors"
          >
            How it works
          </Link>
          <Link
            href="/#mcp"
            className="text-[var(--color-text-muted)] hover:text-[var(--color-emerald-deep)] transition-colors"
          >
            MCP
          </Link>
          <Link
            href="/#roadmap"
            className="text-[var(--color-text-muted)] hover:text-[var(--color-emerald-deep)] transition-colors"
          >
            Roadmap
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/markets" className="btn-emerald text-sm py-2 px-4">
            Explore markets
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

function ForesightMark() {
  return (
    <span
      aria-hidden
      className="relative inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--color-text-strong)] text-white"
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
  );
}
