"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
} from "motion/react";

/* ────────────────────────────────────────────────────────────
   Parallax — element drifts against the scroll while it crosses
   the viewport. Spring-smoothed so the motion has weight instead
   of tracking the scrollbar 1:1.
   ──────────────────────────────────────────────────────────── */

interface ParallaxProps {
  children: ReactNode;
  className?: string;
  /** Total vertical travel in px across the full crossing. Negative moves up. */
  speed?: number;
}

export function Parallax({ children, className, speed = -60 }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const rawY = useTransform(scrollYProgress, [0, 1], [-speed / 2, speed / 2]);
  const y = useSpring(rawY, { stiffness: 120, damping: 30, mass: 0.4 });

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div ref={ref} className={className} style={{ y }}>
      {children}
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────
   ScrollScale — image/media grows and settles as it enters.
   Paired with an overflow-hidden parent this reads as the frame
   revealing more of the picture rather than the picture moving.
   ──────────────────────────────────────────────────────────── */

export function ScrollScale({
  children,
  className,
  from = 1.18,
  to = 1,
}: {
  children: ReactNode;
  className?: string;
  from?: number;
  to?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [from, to]);

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div ref={ref} className={className} style={{ scale }}>
      {children}
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────
   ScrollRotate — continuous rotation driven by scroll position.
   Used for the decorative rings behind section headings.
   ──────────────────────────────────────────────────────────── */

export function ScrollRotate({
  children,
  className,
  degrees = 90,
}: {
  children: ReactNode;
  className?: string;
  degrees?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const rawRotate = useTransform(scrollYProgress, [0, 1], [0, degrees]);
  const rotate = useSpring(rawRotate, { stiffness: 90, damping: 28 });

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div ref={ref} className={className} style={{ rotate }}>
      {children}
    </motion.div>
  );
}
