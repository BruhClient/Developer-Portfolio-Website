import { defineConfig } from "vitest/config";
import path from "node:path";

/*
  The room's logic - swivel, focus framing, tab order, the attract sweep and the
  room state store - is deliberately pure TypeScript with no React and no DOM,
  so the default node environment is all it needs. Anything that touches three.js
  or the browser lives in `room/engine/` and `room/ui/` and is verified by
  looking at it, not here.
*/
export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
  test: {
    environment: "node",
    include: [
      "room/**/*.test.ts",
      "constants/**/*.test.ts",
      "lib/**/*.test.ts",
    ],
  },
});
