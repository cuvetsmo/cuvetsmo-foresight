/**
 * Brand + deployment configuration.
 *
 * Centralized so spin-off to a standalone domain is one env-var change away.
 * Every user-facing surface reads from here. Never hard-code the brand name,
 * URL, or social handles inline.
 *
 * To spin off to an apex domain (e.g., foresight.market):
 *   1. set NEXT_PUBLIC_BASE_URL=https://foresight.market
 *   2. set NEXT_PUBLIC_X_HANDLE=foresight (or whatever)
 *   3. flip NEXT_PUBLIC_SHOW_ECOSYSTEM_BAR to "false" (already default)
 *   4. update DNS, redeploy
 *
 * No code changes required.
 */

export const BRAND = {
  /** Canonical product name shown in UI. */
  name: "Foresight",
  /** One-line tagline — used in metadata + OG. */
  tagline: "Forecast the things that matter",
  /** Long-form positioning — used in hero + meta description. */
  description:
    "A forecasting marketplace for the events the world's biggest exchanges overlook — regional politics, climate, vet outbreaks, frontier research. Every question carries a public resolution criterion and named primary source.",
  /** Short description for SEO. */
  shortDescription:
    "A forecasting marketplace for the events the world's biggest exchanges overlook. Public resolution criteria. Named sources. No anonymous oracle votes.",
} as const;

/**
 * Deployment-driven config — reads from env at build time. Defaults are
 * tuned for the current foresight.cuvetsmo.com subdomain phase; the apex-
 * domain spin-off path flips the env vars without touching code.
 */
export const DEPLOY = {
  /** Canonical absolute URL of the deployed site (no trailing slash). */
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL ?? "https://foresight.cuvetsmo.com",
  /** Whether to show the cross-product navigation bar in the layout. */
  showEcosystemBar:
    (process.env.NEXT_PUBLIC_SHOW_ECOSYSTEM_BAR ?? "false") === "true",
  /** Optional X / Twitter handle (without the @). Empty = hide social links. */
  xHandle: process.env.NEXT_PUBLIC_X_HANDLE ?? "",
  /** Educational beta banner. Flip off when real money trading turns on. */
  educationalBeta: true,
} as const;

/** Helper to build a fully-qualified URL from a path. */
export function absUrl(path: string): string {
  if (path.startsWith("http")) return path;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${DEPLOY.baseUrl}${cleanPath}`;
}
