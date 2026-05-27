import Link from "next/link";
import type { Market } from "@/lib/types";
import { CATEGORIES } from "@/lib/types";
import { Sparkline } from "./Sparkline";

function formatUsd(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${n.toFixed(0)}`;
}

function formatDeadline(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const ms = d.getTime() - now.getTime();
  const days = Math.round(ms / 86_400_000);
  if (days < 0) return "Closed";
  if (days === 0) return "Closes today";
  if (days === 1) return "Closes tomorrow";
  if (days < 30) return `${days}d left`;
  if (days < 365) return `${Math.round(days / 30)}mo left`;
  return `${(days / 365).toFixed(1)}y left`;
}

export function MarketCard({ market }: { market: Market }) {
  const yesPct = Math.round(market.yesProbability * 100);
  const noPct = 100 - yesPct;
  const cat = CATEGORIES.find((c) => c.key === market.category);
  const recent = market.priceHistory ?? [];
  const trendingYes = recent.length >= 2 && recent[recent.length - 1] > recent[0];

  return (
    <Link
      href={`/markets/${market.slug}`}
      className="group block bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-3xl p-6 transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-18px_rgba(15,23,42,0.18)] hover:border-[var(--color-border-strong)]"
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-text-muted)]">
          <span aria-hidden>{cat?.emoji}</span>
          <span>{cat?.labelEn}</span>
        </span>
        <span
          className={
            "badge " +
            (market.status === "open"
              ? "badge--open"
              : market.status === "closing-soon"
                ? "badge--closing"
                : "badge--resolved")
          }
        >
          <span className="pulse-dot" aria-hidden />
          {market.status === "open"
            ? "Live"
            : market.status === "closing-soon"
              ? "Closing soon"
              : "Resolved"}
        </span>
      </div>

      <h3 className="text-[17px] font-semibold leading-[1.35] tracking-tight text-[var(--color-text-strong)] line-clamp-3 min-h-[3.65rem]">
        {market.question}
      </h3>

      <div className="mt-5 flex items-end justify-between gap-4">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tabular-nums text-[var(--color-emerald-deep)]">
              {yesPct}%
            </span>
            <span className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-faint)] font-semibold">
              YES
            </span>
          </div>
          <div className="text-xs text-[var(--color-text-faint)] mt-0.5 tabular-nums">
            NO {noPct}%
          </div>
        </div>
        <Sparkline
          data={recent}
          width={84}
          height={28}
          stroke={trendingYes ? "var(--color-emerald)" : "var(--color-slate-no)"}
          fill={trendingYes ? "rgba(16, 185, 129, 0.10)" : "rgba(100, 116, 139, 0.10)"}
        />
      </div>

      <div className="mt-5 pt-5 border-t border-[var(--color-border)] flex items-center justify-between text-xs text-[var(--color-text-muted)] tabular-nums">
        <span>
          <span className="font-semibold text-[var(--color-text)]">{formatUsd(market.volumeUsd)}</span>{" "}
          volume
        </span>
        <span>{formatDeadline(market.closesAt)}</span>
      </div>
    </Link>
  );
}
