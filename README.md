# ai-phrase-check

> Detect AI-typical phrases in your writing — in English and German — and replace them with more human alternatives.

**Status:** v0.1.0 shipped — the Claude Code skill is stable and tagged. The Next.js demo site is in progress (core detection + BYOK logic built; landing page and deploy not yet live). See [the design spec](docs/superpowers/specs/2026-05-05-ai-phrase-check-design.md), [Plan A (skill MVP, shipped)](docs/superpowers/plans/2026-05-05-plan-a-skill-mvp.md), and [Plan B (web demo, in progress)](docs/superpowers/plans/2026-05-05-plan-b-frontend.md).

## What This Is

`ai-phrase-check` is an open-source writing tool that ships in two forms from a single source of truth:

1. **A Claude Code skill** — three-stage flow (Detect → Suggest → Apply) with user gates between stages, designed for live writing in Claude Code (paste) and single-file review.
2. **A Next.js web app** — a marketing landing page with an interactive in-browser demo. Stage 1 (regex detection) runs client-side without any API call. Stage 2 (LLM-powered suggestions) is available via Bring-Your-Own-Key — the user supplies their own Anthropic API key, stored in `sessionStorage` only.

Both consumers read the same Markdown phrase lists in [`references/`](references/). There is no backend.

## Why

Writers using LLM tools accumulate AI-typical phrases — "delve into," "tapestry," "navigate the landscape," "tauchen wir ein in," "im Bereich der." These tells weaken voice and signal lazy editing. Existing prose linters (`proselint`, `write-good`) do not target post-LLM tells specifically and do not support German. `ai-phrase-check` fills that gap with a curated, growing, bilingual list and a stage-flow that respects the principle "AI suggests, human decides."

## Status

- **Claude Code skill (Plan A):** shipped and stable. Tagged `v0.1.0`. Three-stage flow (Detect → Suggest → Apply), 27 curated phrases (15 EN + 12 DE), full test coverage (bats + parity tests), CI green.
- **Web demo (Plan B):** in progress. Scaffolding, JS-port detection with parity testing, Stage 1 client-side demo, and BYOK Stage 2 (storage + Anthropic SDK call) are built and committed. Landing page assembly and the Vercel deploy pipeline are not yet done — the demo is not live at a public URL yet.
- **Repo hardening:** CI covers shell + JS tests, cspell, and CodeQL SAST; Dependabot manages dependency updates; branch protection is active.

## Estate test-scope stats

This repo is a **producer** for the neckarshore.ai estate test-count. On every `push:main`, CI counts the two gated test suites (bats bash-detector + vitest web-detector) from each runner's own reporter — never grep — and publishes a contract-valid `stats.json` to the dedicated [`stats-data`](../../tree/stats-data/stats.json) branch: a single-file data branch, **not** `main`. `main` is a protected branch (a bot cannot push to it without weakening its protection), so the machine artifact lives on its own unprotected branch instead. The neckarshore.ai aggregator fetches it via `contents/stats.json?ref=stats-data`. Contract: [`stats-json-contract.md`](https://github.com/neckarshore-ai/neckarshore-planning/blob/main/docs/reference/stats-json-contract.md).

## License

[MIT](LICENSE)

## Maintainer

[Neckarshore AI](https://neckarshore.ai) — sister project of [`obsidian-vault-autopilot`](https://github.com/neckarshore-ai/obsidian-vault-autopilot).
