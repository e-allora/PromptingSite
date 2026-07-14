/**
 * Live smoke test — calls the real OpenRouter API and costs real credit.
 * Skipped unless RUN_SMOKE=1, so `pnpm test` stays free and offline.
 *
 *   RUN_SMOKE=1 npx vitest run lib/improve.smoke.test.ts
 */
import { describe, expect, it } from "vitest";
import { improvePrompt } from "./improve";

const live = process.env.RUN_SMOKE === "1" ? describe : describe.skip;

live("improvePrompt (live)", () => {
  it(
    "rewrites a beginner prompt and explains the changes",
    async () => {
      const result = await improvePrompt(
        "help me write an email to my landlord about my broken heater",
      );

      console.log("intent:", result.intent, "| model:", result.modelUsed);
      console.log("improved prompt:\n" + result.improvedPrompt);
      console.log("improvements:", JSON.stringify(result.improvements, null, 2));
      console.log("usage:", JSON.stringify(result.usage));

      expect(result.improvedPrompt.length).toBeGreaterThan(20);
      expect(result.improvements.length).toBeGreaterThan(0);
      expect(result.intent).toBe("write");
    },
    60_000,
  );

  it(
    "routes a coding prompt to the code model",
    async () => {
      const result = await improvePrompt("my python script keeps crashing");
      console.log("intent:", result.intent, "| model:", result.modelUsed);
      expect(result.intent).toBe("code");
      expect(result.improvedPrompt.length).toBeGreaterThan(20);
    },
    60_000,
  );
});
