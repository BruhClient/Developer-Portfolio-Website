"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

const CHARS = "アイウエオカキクケコサシスセソタチツテト0123456789ABCDEF";

const PATCHES = [
  { top: "1%", left: "2%", cols: 8, rows: 14 },
  { top: "4%", left: "55%", cols: 6, rows: 10 },
  { top: "8%", left: "80%", cols: 10, rows: 18 },
  { top: "14%", left: "25%", cols: 7, rows: 12 },
  { top: "18%", left: "68%", cols: 9, rows: 16 },
  { top: "22%", left: "5%", cols: 12, rows: 20 },
  { top: "28%", left: "85%", cols: 7, rows: 12 },
  { top: "33%", left: "40%", cols: 8, rows: 14 },
  { top: "38%", left: "10%", cols: 6, rows: 10 },
  { top: "42%", left: "72%", cols: 10, rows: 18 },
  { top: "48%", left: "30%", cols: 8, rows: 14 },
  { top: "52%", left: "90%", cols: 7, rows: 12 },
  { top: "56%", left: "15%", cols: 9, rows: 16 },
  { top: "62%", left: "50%", cols: 6, rows: 10 },
  { top: "66%", left: "3%", cols: 10, rows: 18 },
  { top: "72%", left: "78%", cols: 8, rows: 14 },
  { top: "76%", left: "35%", cols: 7, rows: 12 },
  { top: "82%", left: "60%", cols: 12, rows: 20 },
  { top: "86%", left: "8%", cols: 6, rows: 10 },
  { top: "92%", left: "45%", cols: 9, rows: 16 },
];

function RainPatch({ cols, rows }: { cols: number; rows: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const columnsRef = useRef<number[]>([]);
  const animRef = useRef<number>(0);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const fontSize = 12;
    canvas.width = cols * fontSize;
    canvas.height = rows * fontSize;

    if (columnsRef.current.length !== cols) {
      columnsRef.current = Array.from({ length: cols }, () =>
        Math.random() * canvas.height
      );
    }

    if (prefersReducedMotion) return;

    let frame = 0;
    const draw = () => {
      frame++;
      if (frame % 3 !== 0) {
        animRef.current = requestAnimationFrame(draw);
        return;
      }

      const isDark = resolvedTheme === "dark";
      ctx.fillStyle = isDark
        ? "rgba(13, 17, 23, 0.12)"
        : "rgba(232, 236, 240, 0.18)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px "JetBrains Mono", monospace`;

      const columns = columnsRef.current;
      for (let i = 0; i < columns.length; i++) {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        const x = i * fontSize;
        const y = columns[i];

        const opacity = isDark
          ? 0.2 + Math.random() * 0.15
          : 0.25 + Math.random() * 0.15;

        ctx.fillStyle = isDark
          ? `rgba(148, 163, 184, ${opacity})`
          : `rgba(100, 116, 139, ${opacity})`;
        ctx.fillText(char, x, y);

        if (y > canvas.height && Math.random() > 0.95) {
          columns[i] = 0;
        }
        columns[i] += fontSize;
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [cols, rows, resolvedTheme]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: cols * 12, height: rows * 12 }}
    />
  );
}

export function GlitchBlocks() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {PATCHES.map((patch, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            top: patch.top,
            left: patch.left,
            maskImage: "radial-gradient(ellipse at center, black 20%, transparent 70%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, black 20%, transparent 70%)",
          }}
        >
          <RainPatch cols={patch.cols} rows={patch.rows} />
        </div>
      ))}
    </div>
  );
}
