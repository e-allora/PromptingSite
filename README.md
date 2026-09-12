# Plainspoken

A prompting improvement site.

You type what you want in your own words. It rewrites that into a prompt an AI will
actually understand, then explains what it changed and why — so you gradually stop
needing it.

Built for people who keep being told this technology will change everything, and who
have so far found it mostly annoying.

---

## Run it

```bash
cp .env.example .env.local     # add your OPENROUTER_API_KEY
pnpm install
pnpm dev
```

Port 3000 is taken by Open WebUI on the original dev machine, so Next will pick another
port — watch the terminal for the URL.

## Commands

| Command | What it does |
|---|---|
| `pnpm dev` | Dev server |
| `pnpm build` | Production build |
| `pnpm test` | Unit tests (routing, validation, rate limiting) |
| `pnpm test:e2e` | Playwright, desktop + mobile, API mocked |
| `pnpm test:smoke` | Hits the real OpenRouter API — costs credit |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint |

## Environment

| Variable | Required | Notes |
|---|---|---|
| `OPENROUTER_API_KEY` | Yes | Server-side only. Never prefix `NEXT_PUBLIC_`. |
| `OPENROUTER_MODEL` | No | Force one model for all requests, e.g. `openrouter/free` for zero cost. Unset = per-intent routing below. |
| `SITE_URL` | No | Public URL, sent to OpenRouter for attribution. |

## How model routing works

`lib/routing.ts` maps a prompt to a model deterministically — same input, same model,
every time, which is what makes it testable.

| Intent | Model |
|---|---|
| `code` | `mistralai/devstral-2512` |
| `image` | `google/gemini-2.5-flash` |
| `write` / `analyze` / `general` | `anthropic/claude-haiku-4.5` |

Intent is detected by word-boundary keyword matching, most specific first. Picking a
category in the UI overrides detection.

## Documentation

Written as dated documents; the trail of changes lives in the record, not in edits.

| Document | Read it for |
|---|---|
| [Build report](docs/2026-07-14-build-report.md) | What was here, what got built, every decision and why |
| [Architecture](docs/2026-07-14-architecture.md) | Request flow, API contract, CSS contracts, gotchas |
| [Supabase plan](docs/2026-07-14-supabase-integration-plan.md) | The one unbuilt piece of the spec, with steps |
| [Deployment](docs/2026-07-14-deployment.md) | Vercel, Cloudflare, headers, renaming |

The original brief is `Breakdown for the AGENTS.txt`. Reference material sits alongside
it at the repository root.

## Status

Working and deployable. Not deployed. Auth and usage logging are specified but not
built — see the Supabase plan. "Plainspoken" is a placeholder name.
