"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

interface SectionTitleProps {
  title: string;
  /** Anchor id — defaults to the slugified title. */
  id?: string;
  /** Small monospace kicker above the heading. */
  kicker?: string;
  /** Two-digit index rendered to the side, e.g. "01". */
  index?: string;
}

const SectionTitle = ({ title, id, kicker, index }: SectionTitleProps) => {
  const slug = id ?? title.toLowerCase().replace(/\s+/g, "-");
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const shouldReduceMotion = useReducedMotion();

  return (
    <div ref={ref} id={slug} className="mb-12 scroll-mt-28">
      <div className="flex items-baseline gap-4">
        {index && (
          <motion.span
            aria-hidden="true"
            className="label-mono text-primary"
            initial={shouldReduceMotion ? undefined : { opacity: 0, x: -8 }}
            animate={inView && !shouldReduceMotion ? { opacity: 1, x: 0 } : undefined}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {index}
          </motion.span>
        )}

        <div className="flex-1">
          {kicker && (
            <motion.p
              className="label-mono mb-2 text-muted-foreground"
              initial={shouldReduceMotion ? undefined : { opacity: 0 }}
              animate={inView && !shouldReduceMotion ? { opacity: 1 } : undefined}
              transition={{ duration: 0.5 }}
            >
              {kicker}
            </motion.p>
          )}

          {/* Rides the same `inView` as the index and the rule beside it */}
          <motion.h2
            className="text-3xl font-semibold tracking-tight sm:text-4xl"
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
            animate={
              inView && !shouldReduceMotion ? { opacity: 1, y: 0 } : undefined
            }
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {title}
          </motion.h2>
        </div>
      </div>

      {/* Rule that draws itself out from the left as the heading lands */}
      <motion.div
        aria-hidden="true"
        className="mt-6 h-px origin-left bg-border"
        initial={shouldReduceMotion ? undefined : { scaleX: 0 }}
        animate={inView && !shouldReduceMotion ? { scaleX: 1 } : undefined}
        transition={{ duration: 1.1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
};

export default SectionTitle;
