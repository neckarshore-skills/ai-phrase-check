# CLAUDE.md — ai-phrase-check

## What This Repo Is

`ai-phrase-check` is an open-source bilingual (EN/DE) AI-phrase detector. It ships in two forms from a single source of truth: a Claude Code skill and a Next.js demo page. Both consume the same Markdown phrase lists in `references/`.

**Organization:** Neckarshore AI
**License:** MIT
**Status:** v0.1 — pre-release

## Repo Structure

See `docs/superpowers/specs/2026-05-05-ai-phrase-check-design.md` for the full design.

```
skills/ai-phrase-check/SKILL.md   <- Main skill, orchestrates 3 stages
references/                        <- Phrase lists + prompt templates
scripts/                           <- Bash helpers (detect, apply, parse)
tests/                             <- bats tests + fixtures
web/                               <- Next.js demo (Plan B)
logs/                              <- changelog + run-history
```

## Quality Checklist (before committing)

1. `shellcheck scripts/**/*.sh` — clean
2. `bats tests/*.bats` — green
3. New phrase added → 1 positive + 1 negative fixture exist
4. Commit message follows convention (see below)
5. No hardcoded paths; no emoji in skill files
6. All shell content in English

## Commit Message Format

`<type>(<scope>): <subject>` — types: `feat`, `fix`, `test`, `docs`, `chore`, `ci`.
End every commit message body with `Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>`.

## Phrase List Format

Multi-document YAML in Markdown. Each phrase is a YAML block separated by `---`. Required fields: `phrase`, `language`, `severity`, `category`, `pattern`, `suggestions`. Optional: `notes`. See `docs/philosophy.md` for the full schema.

## Three-Stage Flow

| Stage | Tool | Output | Gate |
|---|---|---|---|
| 1 | `detect.sh` | Findings list | "Want suggestions?" |
| 2 | LLM via `stage2-suggest.md` | Alternatives per finding | "Apply which?" |
| 3 | `apply.sh` (file) or inline (paste) | Modified text | (terminal step) |

## Token Efficiency

- Don't re-read files already read in the session
- Run independent commands in parallel
- Chain git commands: `git add ... && git commit ... && git push`
