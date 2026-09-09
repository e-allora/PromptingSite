import { routePrompt, type Intent } from "./routing";

export type Improvement = {
  /** Short label, e.g. "Added a role" */
  label: string;
  /** Plain-language reason a beginner can act on. */
  why: string;
};

export type ImproveResult = {
  improvedPrompt: string;
  improvements: Improvement[];
  intent: Intent;
  modelUsed: string;
  usage?: { tokens?: number; costUsd?: number };
  requestId?: string;
};

export const MAX_PROMPT_LENGTH = 2000;
const MIN_PROMPT_LENGTH = 3;

export class ImproveError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ImproveError";
  }
}

/**
 * Validate untrusted input from the request body.
 * Returns a clean prompt or throws an ImproveError with a user-safe message.
 */
export function validatePrompt(raw: unknown): string {
  if (typeof raw !== "string") {
    throw new ImproveError("Please type a prompt first.", 400);
  }

  const trimmed = raw.trim();

  if (trimmed.length < MIN_PROMPT_LENGTH) {
    throw new ImproveError("That's a little too short — tell us a bit more.", 400);
  }

  if (trimmed.length > MAX_PROMPT_LENGTH) {
    throw new ImproveError(
      `That's longer than ${MAX_PROMPT_LENGTH} characters. Try trimming it down.`,
      400,
    );
  }

  return trimmed;
}

const VALID_INTENTS: readonly Intent[] = ["code", "image", "write", "analyze", "general"];

export function validateIntent(raw: unknown): Intent | undefined {
  if (raw === undefined || raw === null || raw === "auto" || raw === "") return undefined;
  if (typeof raw === "string" && (VALID_INTENTS as readonly string[]).includes(raw)) {
    return raw as Intent;
  }
  throw new ImproveError("Unknown category.", 400);
}

const SYSTEM_PROMPT = `You are a prompt coach for people who are new to AI. You rewrite a user's rough prompt into a clear, effective one — and you teach them why.

Rules for the rewritten prompt:
- Write it in plain English, addressed to an AI assistant.
- Add a relevant role, concrete context, a clear task, and a desired output format.
- Keep every fact the user gave you. Never invent specifics they did not state (no fake names, numbers, or deadlines).
- Where a real detail is genuinely missing, insert a short bracketed placeholder like [your city] for them to fill in.
- Do not make it longer than it needs to be. Clarity beats length.
- Do not answer the user's prompt. Only rewrite it.

Rules for the explanations:
- Give 2 to 4 items, each naming one concrete change you made.
- Write "why" for someone who has never heard the word "prompt engineering". No jargon.
- Speak to the user as "you".

Respond with ONLY valid JSON matching this shape, no markdown fence:
{"improvedPrompt": "...", "improvements": [{"label": "...", "why": "..."}]}`;

/** Strip a ```json fence if the model adds one despite instructions. */
function stripFence(text: string): string {
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  return (fence ? fence[1] : text).trim();
}

function parseModelJson(content: string): {
  improvedPrompt: string;
  improvements: Improvement[];
} {
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripFence(content));
  } catch {
    throw new ImproveError("The AI returned something we couldn't read. Please try again.", 502);
  }

  if (typeof parsed !== "object" || parsed === null) {
    throw new ImproveError("The AI returned something we couldn't read. Please try again.", 502);
  }

  const record = parsed as Record<string, unknown>;
  const improvedPrompt = record.improvedPrompt;

  if (typeof improvedPrompt !== "string" || improvedPrompt.trim().length === 0) {
    throw new ImproveError("The AI returned an empty prompt. Please try again.", 502);
  }

  const improvements: Improvement[] = Array.isArray(record.improvements)
    ? record.improvements
        .filter(
          (item): item is { label: string; why: string } =>
            typeof item === "object" &&
            item !== null &&
            typeof (item as Record<string, unknown>).label === "string" &&
            typeof (item as Record<string, unknown>).why === "string",
        )
        .map((item) => ({ label: item.label, why: item.why }))
        .slice(0, 4)
    : [];

  return { improvedPrompt: improvedPrompt.trim(), improvements };
}

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const REQUEST_TIMEOUT_MS = 45_000;

/**
 * Rewrite a prompt via OpenRouter. Any upstream failure is converted into an
 * ImproveError carrying a message that is safe to show a user.
 */
export async function improvePrompt(
  prompt: string,
  explicitIntent?: Intent,
): Promise<ImproveResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new ImproveError("The prompt improver isn't configured yet.", 503);
  }

  const { intent, model } = routePrompt(prompt, explicitIntent);

  let response: Response;
  try {
    response = await fetch(OPENROUTER_URL, {
      method: "POST",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.SITE_URL ?? "http://localhost:3000",
        "X-Title": "Plainspoken",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        temperature: 0.4,
        max_tokens: 1200,
        response_format: { type: "json_object" },
      }),
    });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    throw new ImproveError(
      timedOut
        ? "That took too long. Please try again."
        : "We couldn't reach the AI service. Please try again.",
      504,
    );
  }

  if (!response.ok) {
    // Log the upstream detail server-side; never leak it to the client.
    console.error("[improve] OpenRouter error", response.status, await response.text().catch(() => ""));

    if (response.status === 429) {
      throw new ImproveError("The AI service is busy right now. Please try again shortly.", 429);
    }
    if (response.status === 402) {
      throw new ImproveError("The prompt improver is out of credit. Please check back later.", 503);
    }
    throw new ImproveError("The AI service had a problem. Please try again.", 502);
  }

  const payload = (await response.json().catch(() => null)) as {
    choices?: Array<{ message?: { content?: string } }>;
    usage?: { total_tokens?: number; cost?: number };
    id?: string;
  } | null;

  const content = payload?.choices?.[0]?.message?.content;
  if (!content) {
    throw new ImproveError("The AI returned an empty answer. Please try again.", 502);
  }

  const { improvedPrompt, improvements } = parseModelJson(content);

  return {
    improvedPrompt,
    improvements,
    intent,
    modelUsed: model,
    usage: { tokens: payload?.usage?.total_tokens, costUsd: payload?.usage?.cost },
    requestId: payload?.id,
  };
}
