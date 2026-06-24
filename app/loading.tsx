"use client";

import { useEffect, useState } from "react";

const SPINNER = "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏";

export default function Loading() {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((f) => (f + 1) % SPINNER.length);
    }, 80);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background gap-3 z-50 font-mono">
      <span className="text-2xl terminal-green terminal-glow">
        {SPINNER[frame]}
      </span>
      <span className="text-xs text-muted-foreground">
        Loading...
      </span>
    </div>
  );
}
