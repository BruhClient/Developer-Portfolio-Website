"use client";

import { motion, useScroll, useSpring, useReducedMotion } from "motion/react";

/**
 * Hairline read-progress bar pinned to the top of the viewport.
 * Springs so it trails the scroll slightly instead of snapping.
 */
export function ScrollProgress() {
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 40,
    restDelta: 0.001,
  });

  if (shouldReduceMotion) return null;

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 z-50 h-0.5 origin-left bg-primary"
    />
  );
}
