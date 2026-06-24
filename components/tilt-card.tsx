"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export function TiltCard({
  children,
  className,
  tiltDegree = 6,
}: {
  children: React.ReactNode;
  className?: string;
  tiltDegree?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("");
  const shouldReduceMotion = useReducedMotion();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -tiltDegree;
    const rotateY = ((x - centerX) / centerX) * tiltDegree;

    setTransform(
      `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
    );
  };

  const handleMouseLeave = () => {
    setTransform("");
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
      className={cn("transition-transform duration-200 ease-out", className)}
      style={{ transform: transform || undefined }}
    >
      {children}
    </motion.div>
  );
}
