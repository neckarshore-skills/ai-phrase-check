# ai-phrase-check — Design Spec

**Date:** 2026-05-05
**Status:** Draft for user review
**Repo:** `neckarshore-ai/ai-phrase-check` (to be created)
**License:** MIT

## What This Is

`ai-phrase-check` is an open-source writing tool that detects AI-typical phrases in text (English and German) and helps the writer replace them with more human alternatives. It ships in two forms from a single source of truth:

1. **A Claude Code skill** — full three-stage flow (Detect → Suggest → Apply) with user gates between stages, designed for live writing in Claude Code (paste) and single-file review.
2. **A Next.js web app** — a marketing landing page with an interactive in-browser demo. Stage 1 (regex detection) runs client-side without any API call. Stage 2 (LLM suggestions) is available via Bring-Your-Own-Key (BYOK) — the user supplies their own Anthropic API key, stored in `sessionStorage` only.

Both consumers read the same Markdown phrase lists. There is no backend. There are no recurring API costs for the maintainer.

## Why

Writers using LLM tools accumulate AI-typical phrases — "delve into," "tapestry," "navigate the landscape," "tauchen wir ein in," "im Bereich der." These tells weaken voice and signal lazy editing. Existing prose linters (`proselint`, `write-good`) do not target post-LLM tells specifically and do not support German. `ai-phrase-check` fills that gap with a curated, growing, bilingual list and a stage-flow that respects the principle "AI suggests, human decides."

## Scope

**In scope (v0.1):**
- Skill with three stages (Detect, Suggest, Apply) and user gates between each
- Two input modes: pasted text in chat, single-file argument
- Bilingual auto-detect (DE / EN)
- Curated initial lists: ~15 EN + ~12 DE phrases at severity `high` or `medium`
- Next.js landing page with client-side regex demo
- BYOK Stage 2 in the web demo (user-supplied Anthropic key, sessionStorage, no backend)
- Tests: bats for the bash detect, vitest for the JS port, parity test between them
- CI on push (GitHub Actions)
- Vercel deploy on merge to main

**Out of scope (v0.1):** see Section 7 below.

## Architecture Overview

```
┌──────────────────────────────────────┐
│  references/ai-phrases-{en,de}.md    │  ← Single source of truth.
│  Markdown with YAML frontmatter      │     Phrases plus metadata
│  per phrase entry                    │     (severity, category,
│                                      │     suggestions, regex pattern).
└──────────────────────────────────────┘
            ▲                ▲
            │                │
   ┌────────┴───────┐  ┌─────┴─────────┐
   │  Skill         │  │  Next.js Web  │
   │  (Claude Code) │  │  (Browser)    │
   │                │  │               │
   │  Stage 1: grep │  │  Stage 1: JS- │
   │  Stage 2: LLM  │  │  regex (free) │
   │  Stage 3: Apply│  │  Stage 2: LLM │
   │                │  │  via BYOK     │
   │  3 user gates  │  │               │
   └────────────────┘  └───────────────┘
```

**Key invariant:** Stage 1 detection in Bash and Stage 1 detection in the browser must produce identical findings for the same input. A parity test in CI enforces this.

## Section 1 — Architecture

The repository is a monorepo with two consumers (skill, web) sharing one truth source (the phrase lists). No package boundaries, no workspaces — Next.js reads the lists at build time directly from `references/`. The skill calls bash scripts in `scripts/` that parse the same files at runtime.

**Why no workspaces:** Premature for one frontend and one skill. Listed as future migration path if a `writing-toolkit` plugin emerges.

**Why no backend:** Stage 1 is pure regex and runs client-side. Stage 2 (LLM-powered suggestions) uses the user's own API key in the browser. No server code, no recurring API costs, no rate-limiting infrastructure.

## Section 2 — Skill Architecture

### File layout

```
skills/ai-phrase-check/
└── SKILL.md                       # Main skill, orchestrates the three stages
references/
├── ai-phrases-en.md               # EN list
├── ai-phrases-de.md               # DE list
└── prompt-templates/
    ├── stage2-suggest.md          # LLM prompt for Stage 2 suggestions
    └── language-detect.md         # LLM prompt for language detection edge cases
scripts/
├── detect.sh                      # Stage 1 (regex via grep)
├── apply.sh                       # Stage 3 (apply user-selected replacements)
└── lib/
    └── parse-phrases.sh           # Read phrase files, extract patterns
tests/
├── fixtures/                      # Sample texts EN + DE (positive + negative)
└── detect.bats                    # Stage 1 tests
```

### Stage flow

| Stage | Tool | Output | Gate after |
|---|---|---|---|
| 1 | `detect.sh` | Findings list: line, phrase, severity, category | "Want suggestions for these findings?" |
| 2 | LLM call (template `stage2-suggest.md`) | 1–3 contextual alternatives per finding | "Apply which suggestions — all / individually / none?" |
| 3 | `apply.sh` (file mode) or inline output (paste mode) | Modified text, with diff in file mode | (Apply is the terminal step — user already chose to apply) |

### Language detection

`detect.sh` runs both lists in parallel against the input. The list with more findings wins. On a tie or zero findings, Stage 2 prompt template `language-detect.md` decides via a small LLM call (~200 tokens).

### Input mode switch

- Argument matches an existing file path (`*.md`, `*.txt`) → file mode. Stage 3 produces a diff and writes the modified file after explicit confirmation.
- Otherwise → paste mode. Output is rendered inline in the chat. Stage 3 emits the modified text without touching any file.

### Conventions

- No hardcoded paths. All references resolved relative to the repo root.
- Scripts work from any CWD.
- All skill content in English (per Obi convention).

## Section 3 — Phrase List Schema

Each list file contains multiple YAML frontmatter blocks separated by `---`. Each block is one phrase entry. The format is human-readable, PR-friendly, and parseable with `yq` or `awk` in bash.

### Example entries

```markdown
---
phrase: "delve into"
language: en
severity: high
category: lexical
pattern: "\\bdelve into\\b"
suggestions:
  - "explore"
  - "examine"
  - "study"
  - "look at"
notes: "Almost never used in pre-2023 writing. Strong AI tell."
---

---
phrase: "it's important to note"
language: en
severity: medium
category: hedging
pattern: "\\b[Ii]t['']s important to note\\b"
suggestions:
  - "note that"
  - "(remove entirely — usually filler)"
notes: "Filler phrase. Most occurrences can be deleted without loss."
---
```

### Field reference

| Field | Required | Purpose |
|---|---|---|
| `phrase` | yes | Human-readable name shown in reports |
| `language` | yes | `en` or `de` |
| `severity` | yes | `high` / `medium` / `low` — sorts reports |
| `category` | yes | `lexical` / `hedging` / `triplet` / `transition` / `sycophantic` / `filler` |
| `pattern` | yes | POSIX-extended regex with word boundaries |
| `suggestions` | yes | 1–N alternatives. One may be `(remove entirely — ...)` |
| `notes` | no | Context for PR reviewers and reports |

### Why YAML frontmatter and not JSON

- Consistent with `obsidian-vault-autopilot` conventions
- GitHub renders the lists as browseable Markdown
- `yq` and bash parse it trivially; Next.js parses it with `gray-matter` (standard library)

### v0.1 initial list

Obi delivers ~15 EN + ~12 DE phrases at severity `high` or `medium` with notes and tested patterns. User reviews via PR before first release.

## Section 4 — Frontend Architecture

### Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS
- Deployment: Vercel
- Design tokens: from neckarshore.ai design system (Linus owns this — see "Open Items" below)

### Pages

| Route | Purpose |
|---|---|
| `/` | Landing: hero, problem statement, features, try-it demo, install section, GitHub CTA |

`/about` and other routes are out of scope for v0.1.

### Component layout

```
web/
├── app/
│   ├── page.tsx                      # Landing
│   ├── layout.tsx                    # neckarshore.ai design tokens
│   └── globals.css                   # Tailwind + neckarshore theme
├── components/
│   ├── Hero.tsx                      # Headline, tagline, CTA
│   ├── PhraseDemo.tsx                # Try-it box (textarea + findings)
│   ├── PhraseList.tsx                # Excerpt of curated lists, browseable
│   ├── InstallSnippet.tsx            # Code block with install instructions
│   ├── ApiKeyModal.tsx               # BYOK key input + safety messaging
│   ├── ApiKeyIndicator.tsx           # Status badge (Stage 1 only / LLM active)
│   └── Footer.tsx                    # Links to GitHub, license, neckarshore.ai
├── lib/
│   ├── phrases.ts                    # Build-time loader: reads references/*.md, parses YAML, exports typed array
│   ├── detect.ts                     # JS port of detect.sh — same patterns, JS regex
│   ├── llm-suggest.ts                # Anthropic SDK call (dangerouslyAllowBrowser: true)
│   └── api-key-storage.ts            # sessionStorage wrapper, clears on tab close
├── content/
│   └── examples.ts                   # Pre-filled demo texts EN + DE
└── public/
    └── og-image.png                  # Open Graph image for social sharing
```

### Demo logic

1. Textarea pre-filled with an example AI-tell-heavy paragraph. User can edit or paste their own text.
2. On input change (debounced 300ms) or "Check" button: `detect(text)` from `lib/detect.ts` runs synchronously in the browser.
3. Output: annotated text with `<mark>` tags per finding, plus a sidebar listing each phrase with severity and suggestions.
4. Footer of demo: "Want LLM-powered Stage 2/3 with context-aware suggestions? Either install the skill (link to GitHub) or bring your own Anthropic key (BYOK)."

### BYOK Stage 2 in the browser

**User flow:**

1. Demo loads — Stage 1 active immediately, no key required.
2. User clicks "Enable LLM-powered suggestions" toggle → `ApiKeyModal` opens.
3. Modal contents:
   - Input field for `sk-ant-...` key
   - Safety messaging: "Stored only in your browser session. Cleared when you close this tab. Direct call to `api.anthropic.com` — we never see your key. Recommended: create a workspace-scoped key with a spending limit."
   - Link to `console.anthropic.com`
4. Key saved → Stage 2 calls active. `ApiKeyIndicator` shows "LLM active."
5. On each Stage 2 call: visible hint "calling api.anthropic.com directly."

**Technical:**

- `@anthropic-ai/sdk` initialized with `dangerouslyAllowBrowser: true`
- `sessionStorage` (not localStorage) so the key disappears on tab close — safer default
- Rate-limiting comes from the user's own Anthropic quota — no maintainer code needed
- Error cases (invalid key, 401, network failure): clear error message; Stage 1 continues to work

### Build and deploy

- Lists are read at build time via `lib/phrases.ts` and baked into the JS bundle.
- No runtime server code, no API routes.
- Static site deploy to Vercel via `deploy-web.yml` workflow.

## Section 5 — Repository Structure

```
ai-phrase-check/
├── README.md                          # What it is, install, quickstart
├── LICENSE                            # MIT
├── CLAUDE.md                          # Repo conventions for Claude
├── docs/
│   ├── philosophy.md                  # Why, principles, stage-flow explained
│   └── superpowers/specs/
│       └── 2026-05-05-ai-phrase-check-design.md   # this spec
├── skills/ai-phrase-check/
│   └── SKILL.md
├── references/
│   ├── ai-phrases-en.md
│   ├── ai-phrases-de.md
│   └── prompt-templates/
│       ├── stage2-suggest.md
│       └── language-detect.md
├── scripts/
│   ├── detect.sh
│   ├── apply.sh
│   └── lib/parse-phrases.sh
├── tests/
│   ├── fixtures/                      # Sample texts EN/DE for bats tests
│   ├── detect.bats                    # Stage 1 bash detection tests
│   ├── parity-test.bats               # Bash-vs-JS parity (drift protection)
│   └── run-js-detect.mjs              # Helper for parity test: invokes lib/detect.ts via Node
├── web/                               # Next.js app (see Section 4)
│   ├── package.json                   # Only place package.json lives — skill has no JS deps
│   └── ...
├── .github/workflows/
│   ├── ci.yml                         # bats + lint + Next.js build + parity test
│   └── deploy-web.yml                 # Vercel deploy on merge to main
├── .gitignore
└── logs/
    ├── changelog.md
    └── run-history.md                 # convention from obsidian-vault-autopilot
```

## Section 6 — Testing and Quality

### Three test layers

| Layer | Tool | What it tests | When |
|---|---|---|---|
| 1 | `bats` | `detect.sh` against `tests/fixtures/*.md` — every known phrase must be detected; every negative fixture must not trigger | CI on push |
| 2 | Vitest (web) | `lib/detect.ts` produces identical findings to `detect.sh` for the same fixtures | CI on push |
| 3 | Manual | Skill run against real texts (specs, emails) | Pre-release, by user |

### Fixture structure

```
tests/fixtures/
├── en-positive/                # Texts that should produce findings
│   ├── delve-paragraph.md
│   ├── triplet-list.md
│   └── filler-heavy.md
├── en-negative/                # Texts that must NOT trigger
│   ├── pre-2023-sample.md
│   └── plain-clean.md
├── de-positive/
└── de-negative/
```

### Drift protection (critical)

Stage 1 in Bash and Stage 1 in JavaScript must return identical findings. The CI runs a `parity-test.bats` step that:

1. Runs `detect.sh fixture.md` → findings list A
2. Runs `node tests/run-js-detect.mjs fixture.md` → findings list B
3. Diffs A and B — any difference fails CI.

This catches list drift, regex-engine differences, and runtime divergence early.

### Quality gates

1. Bash linted with `shellcheck`
2. TypeScript linted with `eslint` and formatted with `prettier`
3. `cspell` over `references/*.md` — phrases are domain vocabulary (allowed); `notes` fields must be clean prose
4. PR template requires: every new phrase ships with one positive fixture and one negative fixture

### Smoke tests

- **Stage 1** (regex): automated smoke test against a known mini-text. Runs in CI on every push. Must produce non-empty findings.
- **Stage 2** (LLM suggestions): smoke test uses a recorded fixture response (mock) so CI does not call the real Anthropic API. A separate manual smoke test runs against the live API before each release tag — the user runs it locally with their own key. CI never spends tokens.
- **Stage 3** (apply): automated smoke test against a known input + chosen suggestions, asserts the output text matches a golden file.

This is the minimum bar before any commit is considered "in-review."

## Section 7 — Out of Scope (YAGNI)

| # | Feature | Why not v0.1 | Reconsider when |
|---|---|---|---|
| 1 | Pre-commit hook integration | Complexity; the skill itself is enough value for v0.1 | v0.2, if users request it |
| 2 | Browser extension (detection in Gmail, Notion, Substack) | High effort, different tech stack, no clear demand | Idea logged; not planned |
| 3 | Multi-language support beyond DE/EN | Lists need curated native pflege — maintainer is not native in FR/ES/etc. | Community PRs welcome but not promoted |
| 4 | Tone profile / style adaptation to user voice | Different skill scope ("voice-clone"), too large for v0.1 | Future skill |
| 5 | Plugin marketplace distribution (`.claude-plugin/plugin.json`) | Wait until 2–3 writing skills exist, then bundle | When `writing-toolkit` emerges |
| 6 | Self-growing list via user corrections | Nice-to-have, not v0.1 blocker | v0.3 with `learn-from-corrections` flow |

**Note:** BYOK Stage 2 in the web demo was originally listed out of scope and has been moved into v0.1 scope (see Section 4).

## Definition of Done for v0.1

1. Skill runs end-to-end with Stage 1 + 2 + 3 against test fixtures (manually verified by the user).
2. Frontend deployed to Vercel with a working try-it demo.
3. Initial lists: ~15 EN + ~12 DE phrases, all severity high or medium, all with positive and negative fixtures.
4. CI green: bats + vitest + parity test + lint.
5. README with install instructions, quickstart, and demo link.
6. Linus briefing for design tokens exists, or tokens are committed in the repo.

## Open Items (For MASCHIN / Linus)

1. **Design tokens for the frontend.** Linus owns the neckarshore.ai design system. Linus is on the Red List (a category of personas in the user's ecosystem that may only be invoked in dedicated terminal sessions, not via subagent dispatch). Two paths:
   - (a) Obi extracts tokens (colors, typography, spacing) from the existing `neckarshore-website` repo at build time
   - (b) Linus writes a briefing or `tokens.css` for Obi to drop into `web/app/globals.css`
   - Recommendation: path (b) — cleaner ownership boundary. MASCHIN dispatches the briefing to Linus when implementation starts.

2. **GitHub repo creation.** Repo `neckarshore-ai/ai-phrase-check` does not yet exist. Needs to be created on GitHub before first push. MASCHIN to confirm: standard public template (MIT, Issues enabled, Discussions optional)?

3. **Vercel project setup.** Once repo exists, MASCHIN or user creates the Vercel project pointing at `web/`. Environment variables: none (no backend).

4. **Initial list curation.** Obi delivers ~15 EN + ~12 DE phrases as a first PR after the repo exists. User reviews and trims before tagging v0.1.0.

## Key Principles (from Obi)

1. **Do no harm.** No skill stage modifies user text without an explicit gate. The Apply stage is the only stage that writes anything, and it requires the user to have explicitly chosen suggestions to apply.
2. **AI suggests, human decides.** Every stage transition is a user gate. No automatic chaining from Detect to Apply.
3. **Honesty over presentation.** Reports list everything detected, not only the "interesting" findings. False positives are reported back so the list can be tuned, not silently filtered.
