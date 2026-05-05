# ai-phrase-check

> Detect AI-typical phrases in your writing — in English and German — and replace them with more human alternatives.

**Status:** Pre-v0.1 — design phase. See [the design spec](docs/superpowers/specs/2026-05-05-ai-phrase-check-design.md) for what is being built.

## What This Is

`ai-phrase-check` is an open-source writing tool that ships in two forms from a single source of truth:

1. **A Claude Code skill** — three-stage flow (Detect → Suggest → Apply) with user gates between stages, designed for live writing in Claude Code (paste) and single-file review.
2. **A Next.js web app** — a marketing landing page with an interactive in-browser demo. Stage 1 (regex detection) runs client-side without any API call. Stage 2 (LLM-powered suggestions) is available via Bring-Your-Own-Key — the user supplies their own Anthropic API key, stored in `sessionStorage` only.

Both consumers read the same Markdown phrase lists in [`references/`](references/). There is no backend.

## Why

Writers using LLM tools accumulate AI-typical phrases — "delve into," "tapestry," "navigate the landscape," "tauchen wir ein in," "im Bereich der." These tells weaken voice and signal lazy editing. Existing prose linters (`proselint`, `write-good`) do not target post-LLM tells specifically and do not support German. `ai-phrase-check` fills that gap with a curated, growing, bilingual list and a stage-flow that respects the principle "AI suggests, human decides."

## Status

The repository currently contains the design spec only. Implementation begins after spec approval.

## License

[MIT](LICENSE)

## Maintainer

[Neckarshore AI](https://neckarshore.ai) — sister project of [`obsidian-vault-autopilot`](https://github.com/neckarshore-ai/obsidian-vault-autopilot).
