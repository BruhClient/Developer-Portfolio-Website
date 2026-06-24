"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

export function TypingEffect({
  text,
  speed = 40,
  delay = 0,
  onComplete,
  showCursor = true,
  className,
  as: Tag = "span",
}: {
  text: string;
  speed?: number;
  delay?: number;
  onComplete?: () => void;
  showCursor?: boolean;
  className?: string;
  as?: "span" | "p" | "div";
}) {
  const [charCount, setCharCount] = useState(0);
  const [started, setStarted] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) {
      setCharCount(text.length);
      setStarted(true);
      onComplete?.();
      return;
    }

    const delayTimer = setTimeout(() => {
      setStarted(true);
    }, delay);

    return () => clearTimeout(delayTimer);
  }, [delay, shouldReduceMotion, text.length, onComplete]);

  useEffect(() => {
    if (!started || shouldReduceMotion) return;
    if (charCount >= text.length) {
      onComplete?.();
      return;
    }

    const timer = setTimeout(() => {
      setCharCount((c) => c + 1);
    }, speed);

    return () => clearTimeout(timer);
  }, [started, charCount, text.length, speed, onComplete, shouldReduceMotion]);

  if (!started && !shouldReduceMotion) return null;

  const displayed = shouldReduceMotion ? text : text.slice(0, charCount);
  const isTyping = charCount < text.length && !shouldReduceMotion;

  return (
    <Tag className={className}>
      {displayed}
      {showCursor && (isTyping || charCount === text.length) && (
        <span className={`cursor-blink ${isTyping ? "" : "ml-0.5"}`}>
          |
        </span>
      )}
    </Tag>
  );
}
