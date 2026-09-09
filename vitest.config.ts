import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Unit tests only. `e2e/` belongs to Playwright, and *.smoke.test.ts calls
    // the live OpenRouter API — both are run by their own scripts.
    include: ["lib/**/*.test.ts"],
    exclude: ["**/node_modules/**", "**/*.smoke.test.ts", "e2e/**"],
  },
});
