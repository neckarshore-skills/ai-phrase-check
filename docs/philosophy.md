# Product Philosophy — ai-phrase-check

## Why This Exists

LLM-assisted writing leaks AI-typical phrases into prose: "delve into," "tapestry," "navigate the landscape," "tauchen wir ein in," "im Bereich der." These tells weaken voice and signal lazy editing. Existing prose linters target academic style, not post-LLM tells, and rarely support German.

`ai-phrase-check` fills the gap with a curated, bilingual list and a stage-flow that respects the principle "AI suggests, human decides."

## Core Principles

### 1. Three-Stage Flow with User Gates

Every check has three stages. Each transition is a user gate.

- **Stage 1 — Detect:** Pure regex. Fast, deterministic, zero token cost. Output: list of findings.
- **Stage 2 — Suggest:** LLM-powered. Generates context-aware alternatives per finding. Costs tokens. Optional.
- **Stage 3 — Apply:** Apply user-selected replacements. The only stage that modifies text. Always preceded by user choice.

The skill never auto-chains from Detect to Apply. The user always decides.

### 2. Quality Over Tokens

Stage 1 is free and reproducible. Stage 2 is the expensive layer — the user opts in explicitly. We never call the LLM "just in case."

### 3. Curated, Slow-Growing Lists

The lists start small (~15 EN + ~12 DE) and grow only when a phrase passes review: clear AI tell, real-world examples, regex pattern, suggestions. False positives erode trust faster than missed phrases.

### 4. Single Source of Truth

The skill (bash) and the web demo (JS) read the same Markdown phrase lists. A parity test in CI fails if Stage 1 detection diverges between bash and JS.

### 5. Open Source, MIT

The lists, scripts, and skill are public. Contributions follow the PR template: every new phrase ships with one positive and one negative fixture.

## Phrase List Schema

Each list file (`references/ai-phrases-{en,de}.md`) contains multiple YAML frontmatter blocks. Each block is one phrase entry separated by `---` markers.

| Field | Required | Type | Purpose |
|---|---|---|---|
| `phrase` | yes | string | Human-readable name shown in reports |
| `language` | yes | enum | `en` or `de` |
| `severity` | yes | enum | `high` / `medium` / `low` — sort key for reports |
| `category` | yes | enum | `lexical` / `hedging` / `triplet` / `transition` / `sycophantic` / `filler` |
| `pattern` | yes | string | POSIX-extended regex with word boundaries |
| `suggestions` | yes | array | 1-N alternatives. One may be `(remove entirely — ...)` |
| `notes` | no | string | Context for PR reviewers and reports |
