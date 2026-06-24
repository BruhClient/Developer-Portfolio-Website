"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useReducedMotion } from "motion/react";
import { useTheme } from "next-themes";

const LUMINANCE = ".,-~:;=!*#$@";
const COLORS_DARK = [
  "#78350f",
  "#92400e",
  "#a16207",
  "#b45309",
  "#ca8a04",
  "#d97706",
  "#e5a040",
  "#f0b96a",
  "#f5c98a",
  "#fad6a5",
  "#fde8c8",
  "#fef3e0",
];
const COLORS_LIGHT = [
  "#1c0a00",
  "#3b1a08",
  "#5c2d0e",
  "#713f12",
  "#854d0e",
  "#a16207",
  "#b45309",
  "#ca8a04",
  "#d97706",
  "#e5a040",
  "#f0b96a",
  "#f5c98a",
];

export function AsciiDonut() {
  const preRef = useRef<HTMLPreElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const shouldReduceMotion = useReducedMotion();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const aRef = useRef(0);
  const bRef = useRef(0);
  const sizeRef = useRef({ width: 50, height: 26 });

  const updateSize = useCallback(() => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth;
    const charWidth = window.innerWidth < 640 ? 6 : 8;
    const maxCols = Math.floor(containerWidth / charWidth);
    const w = Math.min(maxCols, 70);
    const h = Math.floor(w * 0.5);
    sizeRef.current = { width: w, height: h };
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !preRef.current) return;

    updateSize();
    window.addEventListener("resize", updateSize);

    const render = () => {
      const A = aRef.current;
      const B = bRef.current;
      const { width, height } = sizeRef.current;

      const cosA = Math.cos(A), sinA = Math.sin(A);
      const cosB = Math.cos(B), sinB = Math.sin(B);

      const chars = new Array(width * height).fill(" ");
      const nvals = new Array(width * height).fill(-1);
      const zbuf = new Array(width * height).fill(0);

      for (let j = 0; j < 6.28; j += 0.07) {
        const cosJ = Math.cos(j), sinJ = Math.sin(j);
        for (let i = 0; i < 6.28; i += 0.02) {
          const cosI = Math.cos(i), sinI = Math.sin(i);
          const h2 = cosJ + 2;
          const D = 1 / (sinI * h2 * sinA + sinJ * cosA + 5);
          const t = sinI * h2 * cosA - sinJ * sinA;

          const x = Math.floor(width / 2 + (width / 2.5) * D * (cosI * h2 * cosB - t * sinB));
          const y = Math.floor(height / 2 + (height / 2.5) * D * (cosI * h2 * sinB + t * cosB));

          const N = Math.floor(
            8 * ((sinJ * sinA - sinI * cosJ * cosA) * cosB -
              sinI * cosJ * sinA -
              sinJ * cosA -
              cosI * cosJ * sinB)
          );

          const idx = x + width * y;
          if (y >= 0 && y < height && x >= 0 && x < width && D > zbuf[idx]) {
            zbuf[idx] = D;
            const ci = Math.max(0, Math.min(N, LUMINANCE.length - 1));
            chars[idx] = LUMINANCE[ci] || ".";
            nvals[idx] = ci;
          }
        }
      }

      let html = "";
      for (let k = 0; k < width * height; k++) {
        if (k % width === width - 1) {
          html += "\n";
        } else if (nvals[k] >= 0) {
          const palette = resolvedTheme === "dark" ? COLORS_DARK : COLORS_LIGHT;
          const color = palette[nvals[k]];
          html += `<span style="color:${color}">${chars[k]}</span>`;
        } else {
          html += " ";
        }
      }

      if (preRef.current) {
        preRef.current.innerHTML = html;
      }

      if (!shouldReduceMotion) {
        aRef.current += 0.015;
        bRef.current += 0.008;
      }

      animRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", updateSize);
      cancelAnimationFrame(animRef.current);
    };
  }, [mounted, shouldReduceMotion, updateSize]);

  if (!mounted) return null;

  return (
    <div ref={containerRef} className="flex justify-center overflow-hidden w-full">
      <pre
        ref={preRef}
        className="text-[0.5rem] sm:text-xs md:text-sm leading-tight select-none"
        aria-hidden="true"
      />
    </div>
  );
}
