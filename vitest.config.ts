import { defineConfig } from "vitest/config";
import path from "node:path";

/*
  The world engine is deliberately pure TypeScript with no React and no DOM, so
  the default node environment is all it needs. Anything that touches Pixi or
  the browser lives in `world/react/` and is verified by looking at it, not here.
*/
export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
  test: {
    environment: "node",
    include: ["world/**/*.test.ts", "constants/**/*.test.ts"],
  },
});
