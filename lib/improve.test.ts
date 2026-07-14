import { describe, expect, it } from "vitest";
import {
  ImproveError,
  MAX_PROMPT_LENGTH,
  validateIntent,
  validatePrompt,
} from "./improve";

describe("validatePrompt", () => {
  it("returns the trimmed prompt", () => {
    expect(validatePrompt("  write me an email  ")).toBe("write me an email");
  });

  it("rejects non-strings", () => {
    for (const bad of [undefined, null, 42, {}, [], true]) {
      expect(() => validatePrompt(bad)).toThrow(ImproveError);
    }
  });

  it("rejects empty and whitespace-only input", () => {
    expect(() => validatePrompt("")).toThrow(ImproveError);
    expect(() => validatePrompt("     ")).toThrow(ImproveError);
  });

  it("rejects input over the length cap, measured after trimming", () => {
    const tooLong = "a".repeat(MAX_PROMPT_LENGTH + 1);
    expect(() => validatePrompt(tooLong)).toThrow(ImproveError);

    const atCapWithSpaces = `  ${"a".repeat(MAX_PROMPT_LENGTH)}  `;
    expect(validatePrompt(atCapWithSpaces)).toHaveLength(MAX_PROMPT_LENGTH);
  });

  it("carries a 400 status for bad input", () => {
    try {
      validatePrompt("");
      expect.unreachable("should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(ImproveError);
      expect((error as ImproveError).status).toBe(400);
    }
  });
});

describe("validateIntent", () => {
  it("accepts known intents", () => {
    expect(validateIntent("code")).toBe("code");
    expect(validateIntent("write")).toBe("write");
  });

  it("treats absent and auto as undefined so detection runs", () => {
    expect(validateIntent(undefined)).toBeUndefined();
    expect(validateIntent(null)).toBeUndefined();
    expect(validateIntent("auto")).toBeUndefined();
    expect(validateIntent("")).toBeUndefined();
  });

  it("rejects unknown values", () => {
    expect(() => validateIntent("hack")).toThrow(ImproveError);
    expect(() => validateIntent(123)).toThrow(ImproveError);
  });
});
