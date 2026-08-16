"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
} from "motion/react";

const ROW_ONE = [
  "Python",
  "TypeScript",
  "PyTorch",
  "LangGraph",
  "Next.js",
  "React",
  "Pandas",
  "scikit-learn",
];

const ROW_TWO = [
  "PostgreSQL",
  "Docker",
  "FastAPI",
  "ChromaDB",
  "Tailwind CSS",
  "Three.js",
  "Git",
  "Vercel",
];

function Row({
  items,
  reversed,
  reduced,
  scrollShift,
}: {
  items: string[];
  reversed?: boolean;
  reduced: boolean;
  scrollShift: ReturnType<typeof useSpring>;
}) {
  // Duplicated so the -50% keyframe lands exactly on a seam.
  const doubled = [...items, ...items];

  const content = (
    <div
      className={`flex w-max gap-3 ${
        reduced ? "flex-wrap justify-center" : "animate-marquee"
      }`}
      style={
        reduced || !reversed ? undefined : { animationDirection: "reverse" }
      }
    >
      {(reduced ? items : doubled).map((item, i) => (
        <span
          key={`${item}-${i}`}
          className="shrink-0 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium whitespace-nowrap"
        >
          {item}
        </span>
      ))}
    </div>
  );

  if (reduced) return content;

  return (
    <motion.div style={{ x: scrollShift }} className="flex">
      {content}
    </motion.div>
  );
}

/**
 * Two counter-scrolling bands of tooling. Each row loops continuously via CSS
 * and is additionally nudged by scroll position, so the two motions compound
 * into something less mechanical than a plain marquee.
 */
const ToolkitMarquee = () => {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion() ?? false;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const rawLeft = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const rawRight = useTransform(scrollYProgress, [0, 1], [-60, 60]);
  const shiftLeft = useSpring(rawLeft, { stiffness: 90, damping: 26 });
  const shiftRight = useSpring(rawRight, { stiffness: 90, damping: 26 });

  return (
    <section
      ref={ref}
      aria-label="Tools and technologies"
      className="relative overflow-hidden border-y border-border bg-surface-sunken py-14"
    >
      <p className="label-mono mb-8 text-center text-muted-foreground">
        Tools I reach for
      </p>

      <div className="space-y-3">
        <Row items={ROW_ONE} reduced={reduced} scrollShift={shiftLeft} />
        <Row items={ROW_TWO} reversed reduced={reduced} scrollShift={shiftRight} />
      </div>

      {/* Edge fades so items enter and leave instead of being clipped */}
      {!reduced && (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-linear-to-r from-surface-sunken to-transparent sm:w-40"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-linear-to-l from-surface-sunken to-transparent sm:w-40"
          />
        </>
      )}
    </section>
  );
};

export default ToolkitMarquee;
