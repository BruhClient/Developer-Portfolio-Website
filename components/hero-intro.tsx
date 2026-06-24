"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

const BOOT_LINES = [
  { tag: "OK", text: "Loading system modules..." },
  { tag: "OK", text: "Initializing network interface..." },
  { tag: "OK", text: "Mounting filesystem..." },
  { tag: "OK", text: "Starting portfolio service..." },
  { tag: "OK", text: "Welcome to travis-ang.dev" },
];

const ASCII_ART = `
████████╗██████╗  █████╗ ██╗   ██╗██╗███████╗
╚══██╔══╝██╔══██╗██╔══██╗██║   ██║██║██╔════╝
   ██║   ██████╔╝███████║██║   ██║██║███████╗
   ██║   ██╔══██╗██╔══██║╚██╗ ██╔╝██║╚════██║
   ██║   ██║  ██║██║  ██║ ╚████╔╝ ██║███████║
   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝  ╚═══╝  ╚═╝╚══════╝`.trim();

type Stage = "idle" | "boot" | "ascii" | "exit";

export function HeroIntro({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState<Stage>("idle");
  const [visibleLines, setVisibleLines] = useState(0);
  const [showAscii, setShowAscii] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const stableOnComplete = useCallback(onComplete, [onComplete]);

  useEffect(() => {
    if (shouldReduceMotion || sessionStorage.getItem("intro-seen")) {
      stableOnComplete();
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(setTimeout(() => setStage("boot"), 300));

    BOOT_LINES.forEach((_, i) => {
      timers.push(setTimeout(() => setVisibleLines(i + 1), 600 + i * 400));
    });

    const bootEnd = 600 + BOOT_LINES.length * 400;
    timers.push(setTimeout(() => { setStage("ascii"); setShowAscii(true); }, bootEnd + 200));
    timers.push(setTimeout(() => setStage("exit"), bootEnd + 1400));
    timers.push(
      setTimeout(() => {
        sessionStorage.setItem("intro-seen", "true");
        stableOnComplete();
      }, bootEnd + 2200)
    );

    return () => timers.forEach(clearTimeout);
  }, [stableOnComplete, shouldReduceMotion]);

  if (shouldReduceMotion) return null;
  if (stage === "idle") {
    return <div className="fixed inset-0 z-50 bg-[#0D1117]" aria-hidden="true" />;
  }

  return (
    <AnimatePresence>
      <motion.div
        key="intro-overlay"
        className="fixed inset-0 z-50 flex flex-col items-start justify-center bg-[#0D1117] overflow-hidden px-6 md:px-16"
        initial={{ opacity: 1 }}
        animate={stage === "exit" ? { y: "-100%" } : { y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        aria-hidden="true"
      >
        <div className="max-w-3xl w-full space-y-1 font-mono">
          {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.1 }}
              className="text-sm md:text-base"
            >
              <span className="text-[#586069]">[{line.tag}]</span>{" "}
              <span className="text-[#C9D1D9]">{line.text}</span>
            </motion.div>
          ))}

          {showAscii && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mt-6"
            >
              <pre
                className="text-[#E2E8F0] text-[0.35rem] leading-tight sm:text-[0.5rem] md:text-xs lg:text-sm font-bold whitespace-pre"
                style={{
                  textShadow:
                    "0 1px 0 #cbd5e1, 0 2px 0 #94a3b8, 0 3px 8px rgba(0,0,0,0.3)",
                }}
              >
                {ASCII_ART}
              </pre>
              <div className="mt-3 text-[#586069] text-sm">
                visitor@travis:~$ <span className="cursor-blink text-[#E2E8F0]">|</span>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
