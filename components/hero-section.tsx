"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "./ui/button";
import { Download } from "lucide-react";
import { TypingEffect } from "./typing-effect";

export function HeroSection() {
  const shouldReduceMotion = useReducedMotion();
  const [nameDone, setNameDone] = useState(false);
  const [subtitleDone, setSubtitleDone] = useState(false);

  const container = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.3, delayChildren: 0.2 },
    },
  };

  const item = shouldReduceMotion
    ? { hidden: {}, visible: {} }
    : {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { duration: 0.4 },
        },
      };

  return (
    <motion.div
      className="space-y-4 py-8"
      variants={container}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={item}>
        <p className="text-muted-foreground">Hello, I&apos;m</p>
        <h1
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mt-1"
          style={{
            textShadow: "0 1px 0 #94a3b8, 0 2px 0 #64748b, 0 3px 6px rgba(0,0,0,0.15)",
            perspective: "800px",
          }}
        >
          <TypingEffect
            text="Travis Ang"
            speed={80}
            delay={300}
            onComplete={() => setNameDone(true)}
          />
        </h1>
      </motion.div>

      <motion.div variants={item} className="space-y-0.5">
        {nameDone && (
          <TypingEffect
            as="p"
            text="Nanyang Technological University"
            speed={30}
            className="text-foreground"
            onComplete={() => setSubtitleDone(true)}
          />
        )}
        {subtitleDone && (
          <TypingEffect
            as="p"
            text="Majoring in Data Science and Artificial Intelligence"
            speed={20}
            className="text-muted-foreground"
            showCursor={false}
          />
        )}
      </motion.div>

      <motion.div variants={item}>
        <Button
          size="lg"
          variant="outline"
          className="border-primary text-primary hover:bg-primary/10 transition-all duration-300"
          asChild
        >
          <a href="/files/resume.pdf" download>
            <Download className="mr-2 h-4 w-4" />
            Download CV
          </a>
        </Button>
      </motion.div>
    </motion.div>
  );
}
