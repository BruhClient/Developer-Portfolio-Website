"use client";

import { motion, useReducedMotion } from "motion/react";

import type { TargetAndTransition } from "motion/react";

type Variant = "fade-up" | "fade-left" | "fade-right" | "scale";

const variants: Record<Variant, { initial: TargetAndTransition; whileInView: TargetAndTransition }> = {
  "fade-up": {
    initial: { opacity: 0, y: 40, rotateX: 5 },
    whileInView: { opacity: 1, y: 0, rotateX: 0 },
  },
  "fade-left": {
    initial: { opacity: 0, x: -60 },
    whileInView: { opacity: 1, x: 0 },
  },
  "fade-right": {
    initial: { opacity: 0, x: 60 },
    whileInView: { opacity: 1, x: 0 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.9 },
    whileInView: { opacity: 1, scale: 1 },
  },
};

export function AnimatedSection({
  children,
  className,
  delay = 0,
  variant = "fade-up",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  variant?: Variant;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const v = variants[variant];

  return (
    <motion.div
      initial={v.initial}
      whileInView={v.whileInView}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
      className={className}
      style={{ perspective: "800px", transformOrigin: "center top" }}
    >
      {children}
    </motion.div>
  );
}
