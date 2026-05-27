/**
 * EcosystemBar — optional cross-product nav bar.
 *
 * Default OFF in production (DEPLOY.showEcosystemBar). Render-side gated on
 * the caller passing a list of siblings to render — when none provided, the
 * component returns null. This makes the foresight surface 100% standalone
 * by default and lets a sibling-network deployment opt back in.
 */
import { DEPLOY } from "@/lib/brand";

export interface EcosystemSurface {
  key: string;
  label: string;
  url: string;
  live: boolean;
}

export function EcosystemBar({
  current,
  surfaces,
  rail = "",
}: {
  current: string;
  surfaces?: EcosystemSurface[];
  rail?: string;
}) {
  if (!DEPLOY.showEcosystemBar) return null;
  if (!surfaces || surfaces.length === 0) return null;

  return (
    <div className="w-full bg-[var(--color-bg-dark)] text-[var(--color-text-on-dark)] text-[12px]">
      <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center gap-x-4 gap-y-1 overflow-x-auto">
        {rail ? (
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-white/55 shrink-0">
            {rail}
          </span>
        ) : null}
        <div className="flex items-center gap-3 flex-wrap">
          {surfaces.map((s) => {
            const isCurrent = s.key === current;
            return (
              <a
                key={s.key}
                href={s.url}
                aria-current={isCurrent ? "page" : undefined}
                className={
                  "inline-flex items-center gap-1.5 transition-colors px-2 py-1 rounded-md " +
                  (isCurrent
                    ? "bg-[var(--color-emerald)]/15 text-[var(--color-emerald-tint)]"
                    : "text-white/65 hover:text-white")
                }
              >
                <span
                  className={
                    "w-1.5 h-1.5 rounded-full " +
                    (s.live ? "bg-[var(--color-emerald)]" : "bg-white/30")
                  }
                  aria-hidden
                />
                <span>{s.label}</span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
