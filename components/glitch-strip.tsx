"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

export function GlitchStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const shouldReduceMotion = useReducedMotion();
  const [glitchOffset, setGlitchOffset] = useState({ r: 0, c: 0 });

  useEffect(() => {
    if (!isInView || shouldReduceMotion) return;

    let frame = 0;
    let animId: number;

    const glitch = () => {
      frame++;
      if (frame % 6 === 0) {
        if (Math.random() > 0.6) {
          setGlitchOffset({
            r: (Math.random() - 0.5) * 8,
            c: (Math.random() - 0.5) * 8,
          });
        } else {
          setGlitchOffset({ r: 0, c: 0 });
        }
      }
      animId = requestAnimationFrame(glitch);
    };

    animId = requestAnimationFrame(glitch);
    return () => cancelAnimationFrame(animId);
  }, [isInView, shouldReduceMotion]);

  if (shouldReduceMotion) {
    return (
      <div ref={ref} className="w-full h-px bg-border opacity-30" />
    );
  }

  return (
    <div ref={ref} className="relative w-full h-3 overflow-hidden my-2">
      {isInView && (
        <>
          <motion.div
            className="absolute inset-0 h-px top-1/2 bg-red-500/30"
            style={{ transform: `translateX(${glitchOffset.r}px)` }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.4 }}
          />
          <motion.div
            className="absolute inset-0 h-px top-1/2 bg-cyan-400/30"
            style={{ transform: `translateX(${glitchOffset.c}px)` }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          />
          <motion.div
            className="absolute inset-0 h-px top-1/2 bg-foreground/10"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          />
        </>
      )}
    </div>
  );
}
