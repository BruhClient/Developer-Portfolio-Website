"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "motion/react";
import { ArrowUpRight, Download } from "lucide-react";
import { Button } from "./ui/button";
import { MaskText } from "./reveal";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

const FACTS = [
  { value: "NTU", label: "Nanyang Technological University" },
  { value: "DSAI", label: "Data Science & AI" },
  { value: "3+", label: "Shipped projects" },
];

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Copy drifts up and dims faster than the page scrolls away, so the device
  // below is left alone on screen as the hero exits.
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -110]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const copyStyle = shouldReduceMotion
    ? undefined
    : { y: copyY, opacity: copyOpacity };

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-svh flex-col overflow-hidden pt-24 pb-8 lg:pt-28"
    >
      {/* Blueprint grid, dissolved at the edges */}
      <div
        aria-hidden="true"
        className="grid-backdrop mask-radial-fade pointer-events-none absolute inset-0 -z-10"
      />
      {/* ── Copy ── */}
      <motion.div
        style={copyStyle}
        className="relative z-10 mx-auto w-full max-w-4xl px-5 text-center sm:px-8"
      >
        <motion.p
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 12 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_OUT }}
          className="label-mono mb-6 flex items-center justify-center gap-3 text-muted-foreground"
        >
          <span className="h-px w-8 bg-primary" aria-hidden="true" />
          Singapore · Open to internships
          <span className="h-px w-8 bg-primary" aria-hidden="true" />
        </motion.p>

        <MaskText
          as="h1"
          text="Travis Ang"
          className="text-5xl font-semibold tracking-tight sm:text-6xl"
          stagger={0.06}
        />

        <MaskText
          as="p"
          text="I build agentic AI systems and the products around them."
          className="mx-auto mt-5 max-w-2xl text-xl leading-snug text-muted-foreground sm:text-2xl"
          delay={0.18}
          stagger={0.028}
        />

        {/* ── Actions ── */}
        <motion.div
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease: EASE_OUT }}
          className="mt-9 flex flex-wrap items-center justify-center gap-3"
        >
          <Button
            size="lg"
            className="group h-12 cursor-pointer rounded-full px-6 text-sm font-medium transition-colors duration-200"
            asChild
          >
            <a href="#projects">
              View selected work
              <ArrowUpRight className="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="group h-12 cursor-pointer rounded-full px-6 text-sm font-medium transition-colors duration-200"
            asChild
          >
            <a href="/files/resume.pdf" download>
              <Download className="mr-1.5 h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" />
              Résumé
            </a>
          </Button>
        </motion.div>

        {/*
          Facts as one compact line rather than a bordered grid — the vertical
          space it used to take now goes to the device below.
        */}
        <motion.p
          initial={shouldReduceMotion ? undefined : { opacity: 0 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.75 }}
          className="mt-7 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground"
        >
          {FACTS.map((fact, i) => (
            <span key={fact.value} className="flex items-center gap-3">
              {i > 0 && (
                <span aria-hidden="true" className="text-border">
                  ·
                </span>
              )}
              <span>
                <span className="font-medium text-foreground">{fact.value}</span>{" "}
                {fact.label}
              </span>
            </span>
          ))}
        </motion.p>
      </motion.div>

      {/*
        ── Device berth ──
        The Surface Pro itself is rendered by `DeviceStage` on a fixed layer
        behind the page, because it now travels the whole document rather than
        living here. What stays behind is the space it occupies: a fixed canvas
        contributes no layout height, so without this the hero would collapse
        around the copy — taking the framing, the resting position of the
        device, and the hero-relative scroll progress with it.

        Deliberately taller than the leftover space: the device is the point,
        and letting it run past the fold invites the scroll that starts the
        journey. On narrow screens the device is already width-bound, so extra
        height would only add empty space — hence the smaller mobile value.
      */}
      <div
        aria-hidden="true"
        data-device-berth=""
        className="relative mt-6 h-[44svh] w-full sm:h-[54svh] lg:mt-4 lg:h-[70svh]"
      />
    </section>
  );
}
