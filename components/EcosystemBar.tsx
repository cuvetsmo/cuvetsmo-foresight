/**
 * EcosystemBar — shared CUVETSMO ecosystem switcher.
 *
 * Same DNA as labs.cuvetsmo.com / imaging.cuvetsmo.com / web3.cuvetsmo.com
 * so visitors recognize the family. Foresight gets its own tinted accent.
 *
 * 7 surfaces:
 *   cuvetsmo.com (main)
 *   labs.cuvetsmo.com
 *   imaging.cuvetsmo.com
 *   web3.cuvetsmo.com
 *   foresight.cuvetsmo.com  ← current
 *   ai.cuvetsmo.com         (coming)
 *   vettobe.cuvetsmo.com    (coming)
 */
type SurfaceKey =
  | "main"
  | "labs"
  | "imaging"
  | "web3"
  | "foresight"
  | "ai"
  | "vettobe";

const SURFACES: { key: SurfaceKey; label: string; url: string; live: boolean }[] = [
  { key: "main", label: "cuvetsmo", url: "https://cuvetsmo.com", live: true },
  { key: "foresight", label: "foresight", url: "https://foresight.cuvetsmo.com", live: true },
  { key: "imaging", label: "imaging", url: "https://imaging.cuvetsmo.com", live: true },
  { key: "web3", label: "web3", url: "https://web3.cuvetsmo.com", live: true },
  { key: "labs", label: "labs", url: "https://labs.cuvetsmo.com", live: true },
  { key: "ai", label: "ai", url: "https://ai.cuvetsmo.com", live: false },
  { key: "vettobe", label: "vettobe", url: "https://vettobe.cuvetsmo.com", live: false },
];

export function EcosystemBar({ current }: { current: SurfaceKey }) {
  return (
    <div className="w-full bg-[var(--color-bg-dark)] text-[var(--color-text-on-dark)] text-[12px]">
      <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center gap-x-4 gap-y-1 overflow-x-auto">
        <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-white/55 shrink-0">
          CUVETSMO·OS
        </span>
        <div className="flex items-center gap-3 flex-wrap">
          {SURFACES.map((s) => {
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
