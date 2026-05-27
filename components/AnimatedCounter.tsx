"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";

/**
 * AnimatedCounter — counts from `from` to `to` over `durationMs` when the
 * element first scrolls into view. Respects `prefers-reduced-motion` and
 * tabular-nums so width doesn't jitter mid-animation.
 *
 * Use `format` for non-trivial number formatting (e.g., '$' + 'k'). Keep
 * the prefix/suffix as plain string props for the simple cases.
 */
export function AnimatedCounter({
  to,
  durationMs = 1400,
  prefix = "",
  suffix = "",
  decimals = 0,
  className = "",
  format,
}: {
  to: number;
  durationMs?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  format?: (v: number) => string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -64px 0px" });
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) =>
    format ? format(v) : `${prefix}${v.toFixed(decimals)}${suffix}`,
  );
  const [text, setText] = useState(() =>
    format ? format(0) : `${prefix}${(0).toFixed(decimals)}${suffix}`,
  );

  useEffect(() => {
    const unsub = rounded.on("change", setText);
    return () => unsub();
  }, [rounded]);

  useEffect(() => {
    if (!inView) return;
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      mv.set(to);
      return;
    }
    const controls = animate(mv, to, {
      duration: durationMs / 1000,
      ease: [0.22, 1, 0.36, 1], // cubic-out
    });
    return () => controls.stop();
  }, [inView, to, durationMs, mv]);

  return (
    <span
      ref={ref}
      className={`tabular-nums inline-block ${className}`}
      style={{ fontVariantNumeric: "tabular-nums" }}
    >
      {text}
    </span>
  );
}

/**
 * FadeInSection — wraps content in a stagger-friendly fade-up reveal.
 * Honors prefers-reduced-motion automatically via Framer's defaults.
 */
export function FadeInSection({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -80px 0px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
