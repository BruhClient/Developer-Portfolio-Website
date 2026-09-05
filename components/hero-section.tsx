"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, Download } from "lucide-react";
import { Button } from "./ui/button";
import { DeviceHero } from "./device-hero";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

const FACTS = [
  { value: "NTU", label: "Nanyang Technological University" },
  { value: "DSAI", label: "Data Science & AI" },
  { value: "3+", label: "Shipped projects" },
];

export function HeroSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative flex min-h-svh flex-col overflow-hidden pt-24 pb-8 lg:pt-28">
      {/* Blueprint grid, dissolved at the edges */}
      <div
        aria-hidden="true"
        className="grid-backdrop mask-radial-fade pointer-events-none absolute inset-0 -z-10"
      />
      {/* ── Copy ── */}
      <div className="relative z-10 mx-auto w-full max-w-4xl px-5 text-center sm:px-8">
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

        <motion.h1
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: EASE_OUT }}
          className="text-5xl font-semibold tracking-tight sm:text-6xl"
        >
          Travis Ang
        </motion.h1>

        <motion.p
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 16 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.26, ease: EASE_OUT }}
          className="mx-auto mt-5 max-w-2xl text-xl leading-snug text-muted-foreground sm:text-2xl"
        >
          I build agentic AI systems and the products around them.
        </motion.p>

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
      </div>

      {/*
        ── The device ──
        Large, centred, and directly under the copy. It owns its own container
        height and its own capability checks — see `components/device-hero.tsx`.
      */}
      <DeviceHero />
    </section>
  );
}
