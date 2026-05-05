# ai-phrase-check Skill MVP — Implementation Plan A

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Claude Code skill — bilingual (EN/DE) AI-phrase detector with three-stage flow (Detect → Suggest → Apply), user gates between stages, curated phrase lists, helper bash scripts, automated tests, and a green CI pipeline.

**Architecture:** Pure bash scripts driven by a Markdown-only `SKILL.md`. Phrase lists are Markdown files with multi-document YAML frontmatter — one block per phrase. Helper scripts (`detect.sh`, `apply.sh`, `parse-phrases.sh`) consume the lists at runtime. Stage 2 (LLM suggestions) is invoked via prompt templates that the skill loads and asks Claude to execute. No JS, no Node, no frontend in this plan.

**Tech Stack:** Bash 4+, `yq` (mikefarah/yq v4+, multi-doc YAML support), `bats-core` (test framework), `shellcheck` (lint), `cspell` (notes-field spellcheck), GitHub Actions for CI.

**Repo:** `https://github.com/neckarshore-ai/ai-phrase-check` — already initialized, currently has only `README.md`, `LICENSE`, `.gitignore`, and the design spec.

**Working dir for this plan:** `~/Developer/projects/neckarshore-ai/ai-phrase-check/`

---

## File Structure (will be created by this plan)

```
ai-phrase-check/
├── CLAUDE.md                                    [Task 1]
├── README.md                                    [Task 1 — modify existing]
├── docs/
│   └── philosophy.md                            [Task 1]
├── skills/ai-phrase-check/
│   └── SKILL.md                                 [Task 7]
├── references/
│   ├── ai-phrases-en.md                         [Task 2 + 8 expand]
│   ├── ai-phrases-de.md                         [Task 2 + 8 expand]
│   └── prompt-templates/
│       ├── stage2-suggest.md                    [Task 7]
│       └── language-detect.md                   [Task 7]
├── scripts/
│   ├── detect.sh                                [Task 4 + 5]
│   ├── apply.sh                                 [Task 6]
│   └── lib/
│       └── parse-phrases.sh                     [Task 3]
├── tests/
│   ├── fixtures/
│   │   ├── en-positive/                         [Tasks 2, 4, 5, 8]
│   │   ├── en-negative/                         [Tasks 2, 4, 8]
│   │   ├── de-positive/                         [Tasks 2, 5, 8]
│   │   └── de-negative/                         [Tasks 2, 8]
│   ├── parse-phrases.bats                       [Task 3]
│   ├── detect.bats                              [Tasks 4, 5]
│   └── apply.bats                               [Task 6]
├── logs/
│   ├── changelog.md                             [Task 1]
│   └── run-history.md                           [Task 1]
└── .github/workflows/
    └── ci.yml                                   [Task 9]
```

**Total tasks:** 10. Estimated effort: 1-2 focused sessions.

---

## Conventions (read once, applies to all tasks)

1. **No hardcoded paths.** All scripts resolve `REPO_ROOT` via `git rev-parse --show-toplevel` or relative-to-script.
2. **All shell content in English.** German only in DE phrase lists and DE-fixture content.
3. **Every commit message follows:** `<type>(<scope>): <subject>` — types: `feat`, `fix`, `test`, `docs`, `chore`, `ci`.
4. **End every commit message with:** `Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>`
5. **Run shellcheck locally before commit:** `shellcheck scripts/**/*.sh tests/**/*.bats` (bats files are mostly bash).
6. **Bats invocation:** `bats tests/<name>.bats` from repo root.
7. **No emoji in skill files** (per `obsidian-vault-autopilot` convention).

---

## Task 1: Repo Skeleton & Documentation

**Files:**
- Create: `CLAUDE.md`
- Create: `docs/philosophy.md`
- Create: `logs/changelog.md`
- Create: `logs/run-history.md`
- Modify: `README.md` (status update)

- [ ] **Step 1: Write `CLAUDE.md` with repo conventions**

```markdown
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
```

- [ ] **Step 2: Write `docs/philosophy.md`**

```markdown
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
```

- [ ] **Step 3: Create `logs/changelog.md` and `logs/run-history.md`**

```markdown
# logs/changelog.md
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Initial repository scaffolding (this commit)
- Design spec under `docs/superpowers/specs/`
- Implementation plan A (skill MVP) under `docs/superpowers/plans/`
```

```markdown
# logs/run-history.md
# Run History

This log records skill executions against real vaults / texts. Each entry: date, scope, duration, findings, notes.

(Empty until first execution.)
```

- [ ] **Step 4: Update `README.md`**

Edit `README.md`. Replace the line `**Status:** Pre-v0.1 — design phase. See [the design spec]...` with:

```markdown
**Status:** v0.1 — implementation in progress. See [the design spec](docs/superpowers/specs/2026-05-05-ai-phrase-check-design.md) and [Plan A (skill MVP)](docs/superpowers/plans/2026-05-05-plan-a-skill-mvp.md).
```

- [ ] **Step 5: Commit**

```bash
cd ~/Developer/projects/neckarshore-ai/ai-phrase-check
git add CLAUDE.md docs/philosophy.md logs/ README.md
git commit -m "docs(skeleton): repo conventions, philosophy, logs

CLAUDE.md, docs/philosophy.md, logs/{changelog,run-history}.md.
README updated to reflect v0.1 implementation.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
git push origin main
```

Verify push reached origin: `git log origin/main --oneline -1` should show this commit.

---

## Task 2: Seed Phrase Lists and Fixtures

**Goal:** Create initial 3 EN + 3 DE phrase entries in the lists, with one positive fixture per phrase and one shared negative fixture per language. Tasks 3-7 build the engine; Task 8 expands the lists.

**Files:**
- Create: `references/ai-phrases-en.md`
- Create: `references/ai-phrases-de.md`
- Create: `tests/fixtures/en-positive/delve-into.md`
- Create: `tests/fixtures/en-positive/important-to-note.md`
- Create: `tests/fixtures/en-positive/tapestry.md`
- Create: `tests/fixtures/en-negative/clean-pre-2023.md`
- Create: `tests/fixtures/de-positive/tauchen-wir-ein.md`
- Create: `tests/fixtures/de-positive/im-bereich-der.md`
- Create: `tests/fixtures/de-positive/wichtig-zu-erwaehnen.md`
- Create: `tests/fixtures/de-negative/clean-classic-de.md`

- [ ] **Step 1: Create `references/ai-phrases-en.md`**

```markdown
# AI-Phrases — English

This file is consumed by `scripts/detect.sh` and `web/lib/phrases.ts`. Each entry is a YAML frontmatter block separated by `---`. Do not change the format without updating the parser.

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

---
phrase: "tapestry"
language: en
severity: high
category: lexical
pattern: "\\btapestry\\b"
suggestions:
  - "mix"
  - "range"
  - "collection"
  - "(remove entirely)"
notes: "Used metaphorically by LLMs to mean 'variety'. Almost always reads as AI-generated."
---
```

- [ ] **Step 2: Create `references/ai-phrases-de.md`**

```markdown
# AI-Phrasen — Deutsch

Diese Datei wird von `scripts/detect.sh` und `web/lib/phrases.ts` gelesen. Jeder Eintrag ist ein YAML-Frontmatter-Block, getrennt durch `---`. Format nicht ändern ohne den Parser anzupassen.

---
phrase: "tauchen wir ein in"
language: de
severity: high
category: transition
pattern: "\\btauchen wir ein in\\b"
suggestions:
  - "schauen wir uns ... an"
  - "betrachten wir"
  - "(Satz neu beginnen)"
notes: "Direkte Übersetzung von 'let's dive into'. KI-Standardphrase."
---

---
phrase: "im Bereich der"
language: de
severity: medium
category: filler
pattern: "\\bim Bereich der\\b"
suggestions:
  - "in der ..."
  - "bei ..."
  - "(weglassen)"
notes: "Substantivierende Floskel. Meist ohne semantischen Wert."
---

---
phrase: "es ist wichtig zu erwähnen"
language: de
severity: medium
category: hedging
pattern: "\\bes ist wichtig zu erwähnen\\b"
suggestions:
  - "erwähnenswert:"
  - "(weglassen — meist Füllphrase)"
notes: "Übersetzung von 'it's important to note'. Selten substantiell."
---
```

- [ ] **Step 3: Create EN positive fixtures**

`tests/fixtures/en-positive/delve-into.md`:

```markdown
In this section, we will delve into the architecture of the system.
The components form a tapestry of interactions.
```

`tests/fixtures/en-positive/important-to-note.md`:

```markdown
It's important to note that the cache TTL is five minutes.
This affects how often the data refreshes.
```

`tests/fixtures/en-positive/tapestry.md`:

```markdown
The codebase is a rich tapestry of patterns and abstractions.
Each module weaves into the next.
```

- [ ] **Step 4: Create EN negative fixture**

`tests/fixtures/en-negative/clean-pre-2023.md`:

```markdown
The compiler reads the source file, parses it into an abstract syntax tree,
then walks the tree to emit bytecode. Errors are reported with line numbers.
There is no garbage collection in this phase.
```

This text uses no phrases from the EN list and must produce zero findings.

- [ ] **Step 5: Create DE positive fixtures**

`tests/fixtures/de-positive/tauchen-wir-ein.md`:

```markdown
Tauchen wir ein in die Funktionsweise des Caches.
Der TTL beträgt fünf Minuten.
```

`tests/fixtures/de-positive/im-bereich-der.md`:

```markdown
Im Bereich der Authentifizierung gibt es drei gängige Verfahren.
Jedes hat eigene Trade-offs.
```

`tests/fixtures/de-positive/wichtig-zu-erwaehnen.md`:

```markdown
Es ist wichtig zu erwähnen, dass der Cache pro Region läuft.
Cross-Region-Aufrufe sind nicht gecacht.
```

- [ ] **Step 6: Create DE negative fixture**

`tests/fixtures/de-negative/clean-classic-de.md`:

```markdown
Der Compiler liest die Quelldatei, parst sie in einen abstrakten Syntaxbaum
und läuft den Baum durch, um Bytecode zu erzeugen. Fehler werden mit
Zeilennummern gemeldet. Eine Garbage Collection findet in dieser Phase nicht statt.
```

- [ ] **Step 7: Commit**

```bash
git add references/ tests/fixtures/
git commit -m "feat(seed): 3 EN + 3 DE seed phrases with fixtures

Initial phrase lists (severity high/medium only) for ai-phrase-check.
Each phrase has one positive fixture; each language has one shared
negative fixture. Lists will be expanded in Task 8.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
git push origin main
```

---

## Task 3: Phrase Parser Library (TDD)

**Goal:** A bash function library that reads a phrase list (`references/ai-phrases-*.md`) and outputs the parsed phrases as TSV (tab-separated values), one phrase per line.

**Output format (TSV):** `phrase<TAB>language<TAB>severity<TAB>category<TAB>pattern`. The `suggestions` and `notes` are not in the TSV — they're looked up by `phrase` field downstream.

**Files:**
- Create: `scripts/lib/parse-phrases.sh`
- Create: `tests/parse-phrases.bats`

**Dependencies:** `yq` (mikefarah/yq v4+). Install: `brew install yq` (macOS) or `snap install yq` (Linux). CI installs in Task 9.

- [ ] **Step 1: Write the failing test**

Create `tests/parse-phrases.bats`:

```bash
#!/usr/bin/env bats

setup() {
    REPO_ROOT="$(git rev-parse --show-toplevel)"
    source "$REPO_ROOT/scripts/lib/parse-phrases.sh"
}

@test "parse_phrases reads EN list and outputs TSV" {
    run parse_phrases "$REPO_ROOT/references/ai-phrases-en.md"
    [ "$status" -eq 0 ]
    # Three phrases in seed list
    [ "$(echo "$output" | wc -l | tr -d ' ')" -eq 3 ]
    # First phrase is "delve into"
    first_line="$(echo "$output" | head -1)"
    [[ "$first_line" == "delve into"* ]]
    # Each line has exactly 4 tabs (5 fields)
    tab_count="$(echo "$first_line" | tr -cd '\t' | wc -c | tr -d ' ')"
    [ "$tab_count" -eq 4 ]
}

@test "parse_phrases reads DE list and outputs TSV" {
    run parse_phrases "$REPO_ROOT/references/ai-phrases-de.md"
    [ "$status" -eq 0 ]
    [ "$(echo "$output" | wc -l | tr -d ' ')" -eq 3 ]
    first_line="$(echo "$output" | head -1)"
    [[ "$first_line" == "tauchen wir ein in"* ]]
}

@test "parse_phrases extracts pattern field" {
    run parse_phrases "$REPO_ROOT/references/ai-phrases-en.md"
    [ "$status" -eq 0 ]
    # The pattern for "delve into" is "\bdelve into\b"
    [[ "$output" == *"\\bdelve into\\b"* ]]
}

@test "parse_phrases fails on missing file" {
    run parse_phrases "/nonexistent/file.md"
    [ "$status" -ne 0 ]
}
```

- [ ] **Step 2: Run the test, verify failure**

```bash
cd ~/Developer/projects/neckarshore-ai/ai-phrase-check
bats tests/parse-phrases.bats
```

Expected: 4 failures, all complaining `parse-phrases.sh` not found or `parse_phrases` not defined.

- [ ] **Step 3: Implement `scripts/lib/parse-phrases.sh`**

Create `scripts/lib/parse-phrases.sh`:

```bash
#!/usr/bin/env bash
# parse-phrases.sh — read a phrase list (Markdown with multi-doc YAML)
# and output TSV: phrase\tlanguage\tseverity\tcategory\tpattern (one per line)
#
# Dependencies: yq (mikefarah/yq v4+)
# Usage: parse_phrases <path-to-list.md>

set -euo pipefail

parse_phrases() {
    local list_file="${1:?usage: parse_phrases <list-file>}"

    if [[ ! -f "$list_file" ]]; then
        echo "parse_phrases: file not found: $list_file" >&2
        return 1
    fi

    # The list is multi-document YAML embedded in Markdown.
    # Strip leading lines until first '---', then yq eval-all on the rest.
    awk '/^---$/{found=1} found{print}' "$list_file" | \
        yq eval-all 'select(.phrase != null) | [.phrase, .language, .severity, .category, .pattern] | @tsv' -
}

# Allow direct invocation as well as sourcing
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    parse_phrases "$@"
fi
```

Make it executable:

```bash
chmod +x scripts/lib/parse-phrases.sh
```

- [ ] **Step 4: Run the test, verify pass**

```bash
bats tests/parse-phrases.bats
```

Expected: 4 of 4 tests pass.

If `yq` is missing: `brew install yq` (macOS) or `snap install yq` (Linux).

- [ ] **Step 5: shellcheck**

```bash
shellcheck scripts/lib/parse-phrases.sh
```

Expected: no warnings.

- [ ] **Step 6: Commit**

```bash
git add scripts/lib/parse-phrases.sh tests/parse-phrases.bats
git commit -m "feat(parse): phrase-list parser to TSV

Reads multi-doc YAML phrase lists and outputs TSV (phrase, language,
severity, category, pattern). Tests cover EN, DE, pattern extraction,
and missing-file error handling.

Dependencies: yq (mikefarah/yq v4+)

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
git push origin main
```

---

## Task 4: Stage 1 Detect Script — Single Language (TDD)

**Goal:** `scripts/detect.sh <input-file> <list-file>` reads input text + phrase list, runs each phrase's regex against each line, outputs findings. Findings format: TSV with `line_number\tphrase\tseverity\tcategory\tmatched_text`.

**Files:**
- Create: `scripts/detect.sh`
- Create: `tests/detect.bats`

- [ ] **Step 1: Write the failing test**

Create `tests/detect.bats`:

```bash
#!/usr/bin/env bats

setup() {
    REPO_ROOT="$(git rev-parse --show-toplevel)"
}

@test "detect.sh finds 'delve into' in EN positive fixture" {
    run "$REPO_ROOT/scripts/detect.sh" \
        "$REPO_ROOT/tests/fixtures/en-positive/delve-into.md" \
        "$REPO_ROOT/references/ai-phrases-en.md"
    [ "$status" -eq 0 ]
    # Output should contain the phrase
    [[ "$output" == *"delve into"* ]]
    # Output should contain "tapestry" (also in fixture)
    [[ "$output" == *"tapestry"* ]]
}

@test "detect.sh produces no findings for EN negative fixture" {
    run "$REPO_ROOT/scripts/detect.sh" \
        "$REPO_ROOT/tests/fixtures/en-negative/clean-pre-2023.md" \
        "$REPO_ROOT/references/ai-phrases-en.md"
    [ "$status" -eq 0 ]
    [ -z "$output" ]
}

@test "detect.sh outputs line numbers" {
    run "$REPO_ROOT/scripts/detect.sh" \
        "$REPO_ROOT/tests/fixtures/en-positive/delve-into.md" \
        "$REPO_ROOT/references/ai-phrases-en.md"
    [ "$status" -eq 0 ]
    # First column of any output line is a number
    first_field="$(echo "$output" | head -1 | cut -f1)"
    [[ "$first_field" =~ ^[0-9]+$ ]]
}

@test "detect.sh fails on missing input file" {
    run "$REPO_ROOT/scripts/detect.sh" \
        "/nonexistent.md" \
        "$REPO_ROOT/references/ai-phrases-en.md"
    [ "$status" -ne 0 ]
}

@test "detect.sh DE list finds 'tauchen wir ein' in DE fixture" {
    run "$REPO_ROOT/scripts/detect.sh" \
        "$REPO_ROOT/tests/fixtures/de-positive/tauchen-wir-ein.md" \
        "$REPO_ROOT/references/ai-phrases-de.md"
    [ "$status" -eq 0 ]
    [[ "$output" == *"tauchen wir ein in"* ]]
}
```

- [ ] **Step 2: Run the test, verify failure**

```bash
bats tests/detect.bats
```

Expected: 5 failures (script not yet present).

- [ ] **Step 3: Implement `scripts/detect.sh`**

Create `scripts/detect.sh`:

```bash
#!/usr/bin/env bash
# detect.sh — Stage 1 phrase detection
#
# Usage: detect.sh <input-file> <list-file>
# Output (TSV, one per finding): line_number\tphrase\tseverity\tcategory\tmatched_text
#
# Exit codes:
#   0 — completed (output may be empty, that's OK)
#   1 — input file missing or unreadable
#   2 — list file missing or parse error

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/parse-phrases.sh
source "$SCRIPT_DIR/lib/parse-phrases.sh"

main() {
    local input_file="${1:?usage: detect.sh <input-file> <list-file>}"
    local list_file="${2:?usage: detect.sh <input-file> <list-file>}"

    if [[ ! -f "$input_file" ]]; then
        echo "detect.sh: input file not found: $input_file" >&2
        return 1
    fi

    if [[ ! -f "$list_file" ]]; then
        echo "detect.sh: list file not found: $list_file" >&2
        return 2
    fi

    # Stream phrases from the list. For each, scan the input with grep -nE.
    while IFS=$'\t' read -r phrase language severity category pattern; do
        # grep -n: line number; grep -E: extended regex; grep -o: only matched part
        # We want: line_number<TAB>phrase<TAB>severity<TAB>category<TAB>matched_text
        # grep outputs "lineNum:matched". Split on first colon.
        if grep -nEo "$pattern" "$input_file" 2>/dev/null | \
            while IFS=: read -r line_num matched; do
                printf '%s\t%s\t%s\t%s\t%s\n' \
                    "$line_num" "$phrase" "$severity" "$category" "$matched"
            done; then
            :
        fi
    done < <(parse_phrases "$list_file")
}

main "$@"
```

Make executable:

```bash
chmod +x scripts/detect.sh
```

- [ ] **Step 4: Run the test, verify pass**

```bash
bats tests/detect.bats
```

Expected: 5 of 5 pass.

If a test fails because of a regex-engine issue (e.g., `\b` not supported in grep on macOS), switch to `grep -E -P` is not portable; instead, use `grep -E` and rely on the patterns we wrote with `\b`. macOS BSD grep supports `\b` as word boundary in `-E` mode. If failures persist, document the alternative: install GNU grep (`brew install grep` then use `ggrep` in `detect.sh`).

- [ ] **Step 5: shellcheck**

```bash
shellcheck scripts/detect.sh scripts/lib/parse-phrases.sh
```

Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add scripts/detect.sh tests/detect.bats
git commit -m "feat(detect): Stage 1 single-language phrase detection

scripts/detect.sh runs each phrase's regex against the input file and
emits TSV findings: line_number, phrase, severity, category, matched_text.
Tests cover positive fixtures (EN+DE) and negative fixtures.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
git push origin main
```

---

## Task 5: Multi-Language Auto-Detect (TDD)

**Goal:** Extend `detect.sh` to take a single argument (the input file). It runs both lists in parallel, picks the language with more findings, and outputs only that language's findings.

**Files:**
- Modify: `scripts/detect.sh`
- Modify: `tests/detect.bats`

- [ ] **Step 1: Add failing tests for auto-detect mode**

Append to `tests/detect.bats`:

```bash
@test "detect.sh auto-mode picks EN for English fixture" {
    run "$REPO_ROOT/scripts/detect.sh" \
        "$REPO_ROOT/tests/fixtures/en-positive/delve-into.md"
    [ "$status" -eq 0 ]
    [[ "$output" == *"delve into"* ]]
    # First line should include language marker
    [[ "$output" == *"# language: en"* ]]
}

@test "detect.sh auto-mode picks DE for German fixture" {
    run "$REPO_ROOT/scripts/detect.sh" \
        "$REPO_ROOT/tests/fixtures/de-positive/tauchen-wir-ein.md"
    [ "$status" -eq 0 ]
    [[ "$output" == *"tauchen wir ein in"* ]]
    [[ "$output" == *"# language: de"* ]]
}

@test "detect.sh auto-mode reports zero findings for clean text" {
    run "$REPO_ROOT/scripts/detect.sh" \
        "$REPO_ROOT/tests/fixtures/en-negative/clean-pre-2023.md"
    [ "$status" -eq 0 ]
    # Should report language detection but no findings
    [[ "$output" == *"# language: "* ]]
    [[ "$output" == *"# findings: 0"* ]]
}
```

- [ ] **Step 2: Run, verify the 3 new tests fail (script doesn't yet handle 1-arg form)**

```bash
bats tests/detect.bats
```

Expected: 3 new failures, original 5 still pass.

- [ ] **Step 3: Refactor `scripts/detect.sh` to support 1-arg auto-detect**

Replace `scripts/detect.sh` with:

```bash
#!/usr/bin/env bash
# detect.sh — Stage 1 phrase detection
#
# Usage:
#   detect.sh <input-file>                 # auto-detect language
#   detect.sh <input-file> <list-file>     # explicit list
#
# Output (TSV, one per finding): line_number\tphrase\tseverity\tcategory\tmatched_text
# In auto-mode, output starts with metadata comments:
#   # language: en|de
#   # findings: <count>
#
# Exit codes: 0 ok, 1 input missing, 2 list missing

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
# shellcheck source=lib/parse-phrases.sh
source "$SCRIPT_DIR/lib/parse-phrases.sh"

scan_with_list() {
    local input_file="$1"
    local list_file="$2"

    while IFS=$'\t' read -r phrase _language severity category pattern; do
        grep -nEo "$pattern" "$input_file" 2>/dev/null | \
        while IFS=: read -r line_num matched; do
            printf '%s\t%s\t%s\t%s\t%s\n' \
                "$line_num" "$phrase" "$severity" "$category" "$matched"
        done
    done < <(parse_phrases "$list_file")
}

main() {
    local input_file="${1:?usage: detect.sh <input-file> [<list-file>]}"

    if [[ ! -f "$input_file" ]]; then
        echo "detect.sh: input file not found: $input_file" >&2
        return 1
    fi

    # Two-arg explicit-list mode
    if [[ $# -ge 2 ]]; then
        local list_file="$2"
        if [[ ! -f "$list_file" ]]; then
            echo "detect.sh: list file not found: $list_file" >&2
            return 2
        fi
        scan_with_list "$input_file" "$list_file"
        return 0
    fi

    # Auto-detect mode: scan with both lists, pick the one with more findings
    local en_list="$REPO_ROOT/references/ai-phrases-en.md"
    local de_list="$REPO_ROOT/references/ai-phrases-de.md"

    local en_findings de_findings
    en_findings="$(scan_with_list "$input_file" "$en_list")"
    de_findings="$(scan_with_list "$input_file" "$de_list")"

    local en_count de_count
    en_count="$(printf '%s' "$en_findings" | grep -c . || true)"
    de_count="$(printf '%s' "$de_findings" | grep -c . || true)"

    local picked_language picked_findings picked_count
    if [[ "$de_count" -gt "$en_count" ]]; then
        picked_language="de"
        picked_findings="$de_findings"
        picked_count="$de_count"
    else
        # Tie or EN-leading goes to EN. Stage 2 LLM resolves true ties downstream.
        picked_language="en"
        picked_findings="$en_findings"
        picked_count="$en_count"
    fi

    echo "# language: $picked_language"
    echo "# findings: $picked_count"
    if [[ -n "$picked_findings" ]]; then
        echo "$picked_findings"
    fi
}

main "$@"
```

- [ ] **Step 4: Run all detect tests, verify pass**

```bash
bats tests/detect.bats
```

Expected: 8 of 8 pass (5 original + 3 new).

- [ ] **Step 5: shellcheck**

```bash
shellcheck scripts/detect.sh
```

Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add scripts/detect.sh tests/detect.bats
git commit -m "feat(detect): auto-detect language from finding count

detect.sh with one argument runs both lists, picks the language
with more findings. Output prefixed with '# language:' and
'# findings:' metadata. Tie goes to EN; Stage 2 LLM resolves true
ambiguity downstream.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
git push origin main
```

---

## Task 6: Stage 3 Apply Script (TDD)

**Goal:** `scripts/apply.sh <input-file> <substitutions-tsv>` reads the input and a TSV of `pattern\treplacement` lines, applies each substitution, and writes the result to stdout. The skill builds the TSV from user-confirmed Stage 2 suggestions.

**Files:**
- Create: `scripts/apply.sh`
- Create: `tests/apply.bats`

- [ ] **Step 1: Write the failing test**

Create `tests/apply.bats`:

```bash
#!/usr/bin/env bats

setup() {
    REPO_ROOT="$(git rev-parse --show-toplevel)"
    TMP_INPUT="$(mktemp)"
    TMP_SUBS="$(mktemp)"
}

teardown() {
    rm -f "$TMP_INPUT" "$TMP_SUBS"
}

@test "apply.sh substitutes a single phrase" {
    cat > "$TMP_INPUT" <<EOF
We will delve into the system.
EOF
    cat > "$TMP_SUBS" <<EOF
\bdelve into\b	explore
EOF
    run "$REPO_ROOT/scripts/apply.sh" "$TMP_INPUT" "$TMP_SUBS"
    [ "$status" -eq 0 ]
    [[ "$output" == *"We will explore the system."* ]]
}

@test "apply.sh substitutes multiple phrases" {
    cat > "$TMP_INPUT" <<EOF
We will delve into the tapestry of ideas.
EOF
    cat > "$TMP_SUBS" <<EOF
\bdelve into\b	explore
\btapestry\b	mix
EOF
    run "$REPO_ROOT/scripts/apply.sh" "$TMP_INPUT" "$TMP_SUBS"
    [ "$status" -eq 0 ]
    [[ "$output" == *"explore"* ]]
    [[ "$output" == *"mix"* ]]
}

@test "apply.sh leaves unmatched text unchanged" {
    cat > "$TMP_INPUT" <<EOF
This text has no AI tells.
EOF
    cat > "$TMP_SUBS" <<EOF
\bdelve into\b	explore
EOF
    run "$REPO_ROOT/scripts/apply.sh" "$TMP_INPUT" "$TMP_SUBS"
    [ "$status" -eq 0 ]
    [[ "$output" == *"This text has no AI tells."* ]]
}

@test "apply.sh fails on missing input" {
    cat > "$TMP_SUBS" <<EOF
\bdelve into\b	explore
EOF
    run "$REPO_ROOT/scripts/apply.sh" "/nonexistent.md" "$TMP_SUBS"
    [ "$status" -ne 0 ]
}
```

- [ ] **Step 2: Run, verify failure**

```bash
bats tests/apply.bats
```

Expected: 4 failures (script not present).

- [ ] **Step 3: Implement `scripts/apply.sh`**

Create `scripts/apply.sh`:

```bash
#!/usr/bin/env bash
# apply.sh — Stage 3: apply user-chosen substitutions to text
#
# Usage: apply.sh <input-file> <substitutions-tsv>
#
# substitutions-tsv format: each line is "<regex>\t<replacement>"
# Output: modified text on stdout
#
# Exit: 0 ok, 1 input missing, 2 subs file missing

set -euo pipefail

main() {
    local input_file="${1:?usage: apply.sh <input-file> <subs-tsv>}"
    local subs_file="${2:?usage: apply.sh <input-file> <subs-tsv>}"

    if [[ ! -f "$input_file" ]]; then
        echo "apply.sh: input not found: $input_file" >&2
        return 1
    fi
    if [[ ! -f "$subs_file" ]]; then
        echo "apply.sh: substitutions file not found: $subs_file" >&2
        return 2
    fi

    # Build a sed expression from the TSV. Each line: regex\treplacement.
    # We use `|` as sed delimiter to avoid escaping `/` inside patterns.
    local sed_expr=""
    while IFS=$'\t' read -r pattern replacement; do
        # Skip empty lines
        [[ -z "$pattern" ]] && continue
        # Append: s|pattern|replacement|g
        sed_expr+="s|${pattern}|${replacement}|g;"
    done < "$subs_file"

    if [[ -z "$sed_expr" ]]; then
        # No subs — pass through unchanged
        cat "$input_file"
        return 0
    fi

    # macOS sed needs -E for extended regex (POSIX-ERE). Linux sed too.
    sed -E "$sed_expr" "$input_file"
}

main "$@"
```

Make executable:

```bash
chmod +x scripts/apply.sh
```

- [ ] **Step 4: Run, verify pass**

```bash
bats tests/apply.bats
```

Expected: 4 of 4 pass.

- [ ] **Step 5: shellcheck**

```bash
shellcheck scripts/apply.sh
```

Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add scripts/apply.sh tests/apply.bats
git commit -m "feat(apply): Stage 3 substitution script

apply.sh reads input + TSV of (regex, replacement) and emits the
modified text on stdout. Used by the skill's Stage 3 after the user
selects which suggestions to apply.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
git push origin main
```

---

## Task 7: SKILL.md and Prompt Templates

**Goal:** The user-facing skill file. Orchestrates the three stages with explicit user gates. Includes prompt templates Claude reads for Stage 2 and language-detection edge cases.

**Files:**
- Create: `skills/ai-phrase-check/SKILL.md`
- Create: `references/prompt-templates/stage2-suggest.md`
- Create: `references/prompt-templates/language-detect.md`

- [ ] **Step 1: Write `skills/ai-phrase-check/SKILL.md`**

```markdown
---
name: ai-phrase-check
description: Use when text needs review for AI-typical phrases (English or German) and replacement with more human alternatives. Trigger phrases - "check this for AI phrases", "AI-Phrasen prüfen", "lint this text", "remove AI tells", "make this sound less AI", "clean up this draft". Bilingual auto-detect. Three-stage flow with user gates: Detect (regex, free) → Suggest (LLM, optional) → Apply (only with explicit user choice).
---

# ai-phrase-check

A bilingual (English / German) detector for AI-typical phrases. Runs in three stages with user gates between each.

## When to Use

Trigger this skill when the user:
- Pastes text and asks for AI-phrase review
- Provides a file path (`*.md`, `*.txt`) and asks to check it
- Says "lint this," "clean up this draft," "remove AI tells," "AI-Phrasen prüfen"

## Inputs

Two input modes:

| Input | Mode | Output |
|---|---|---|
| Pasted text in the conversation | `paste` | Inline output |
| Path to an existing file | `file` | Diff + apply gate |

Detect input mode automatically: if the argument matches an existing file path, use `file` mode; otherwise treat the input as pasted text and write it to a temp file for processing.

## Three-Stage Flow

### Stage 1 — Detect

Run `scripts/detect.sh <input-file>` (auto-detects language). Output is TSV findings. Parse and present:

```
Found N findings (language: en|de)

| Line | Phrase | Severity | Matched text |
|------|--------|----------|--------------|
| 14   | delve into | high | delve into |
| 22   | tapestry | high | tapestry |
```

If 0 findings: "No AI phrases found. Stop here?" and stop. Otherwise:

**Gate:** "Want context-aware suggestions for these N findings? (Stage 2 calls Claude — costs tokens.)"

### Stage 2 — Suggest

If user accepts: load `references/prompt-templates/stage2-suggest.md`, build the prompt with the input text + findings + language, ask Claude (yourself) to produce contextual alternatives. Present per finding:

```
Line 14: "delve into"
  1. explore (natural in technical contexts)
  2. examine (better for analytical writing)
  3. (remove — sentence works without it)

Line 22: "tapestry"
  1. mix
  2. (remove — sentence flows without it)
```

**Gate:** "Apply which suggestions? Reply with one of:
- `all` — apply suggestion #1 for every finding
- `1.2 2.1` — apply suggestion 2 for finding 1, suggestion 1 for finding 2
- `none` — stop here"

### Stage 3 — Apply

Build a substitutions TSV from the user's choices and run:

```bash
scripts/apply.sh <input-file> <subs.tsv>
```

For paste mode: print the modified text inline.
For file mode: show a diff against the original. Then ask: "Write the modified file? (yes/no)" — only on `yes` do you actually write.

## Edge Cases

- **Tie or zero findings in language detection:** Run the language-detect prompt template (`references/prompt-templates/language-detect.md`) — Claude classifies and chooses.
- **Very short input (<20 words):** Skip auto-detect, ask the user "EN or DE?"
- **File mode but file is read-only:** Stop and report.
- **No phrase list found:** This is a setup error — fail with a clear message pointing to `references/`.

## Reports

After every run, output a summary:

```
## ai-phrase-check Report — YYYY-MM-DD

### Done
- Detected: 5 phrases (3 high, 2 medium)
- Suggested: alternatives for 5 phrases
- Applied: 3 substitutions (user-chosen)

### Findings (not applied)
- Line 22 "tapestry": user chose to keep

### Unchanged
- 142 lines (no AI tells found)
```

Append the report to `logs/run-history.md`.

## Conventions

- All shell content, code, and report output in English
- No emoji in skill output
- No hardcoded paths — scripts resolve via `git rev-parse --show-toplevel`
- Always honor the user gates — never auto-chain Detect to Apply
```

- [ ] **Step 2: Write `references/prompt-templates/stage2-suggest.md`**

```markdown
# Stage 2 Suggestion Prompt

You are reviewing AI-typical phrases in a text. For each finding below, propose 1-3 alternative phrasings or recommend deletion. Alternatives should:

1. Match the surrounding text's tone and register
2. Be more concise than the original where possible
3. Sound natural for a human writer of the given language

## Input

**Language:** {{LANGUAGE}}

**Original text:**
```
{{INPUT_TEXT}}
```

**Findings to address (TSV):**
```
{{FINDINGS_TSV}}
```

## Output Format

For each finding, output a YAML block:

```yaml
---
line: <line_number>
phrase: "<phrase>"
suggestions:
  - text: "<alternative 1>"
    rationale: "<why this works in context>"
  - text: "<alternative 2>"
    rationale: "<why this works in context>"
  - text: "(remove entirely)"
    rationale: "<why deletion improves the text>"
---
```

Output only the YAML blocks. No prose around them.
```

- [ ] **Step 3: Write `references/prompt-templates/language-detect.md`**

```markdown
# Language Detection Prompt

Classify the following text as English (`en`) or German (`de`). Use only structural features (vocabulary, syntax) — do not infer from content.

## Input

```
{{INPUT_TEXT}}
```

## Output

A single line: `language: en` or `language: de`. Nothing else.
```

- [ ] **Step 4: Smoke-test the SKILL.md manually**

```bash
# From the repo root
cat skills/ai-phrase-check/SKILL.md | head -10
```

Verify YAML frontmatter has `name` and `description`, and `description` starts with "Use when...".

- [ ] **Step 5: Commit**

```bash
git add skills/ references/prompt-templates/
git commit -m "feat(skill): SKILL.md + Stage 2/language prompt templates

The user-facing skill orchestrates the three-stage flow with explicit
user gates. Prompt templates live under references/prompt-templates/
so the skill can load and fill them at runtime.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
git push origin main
```

---

## Task 8: Phrase List Expansion to v0.1 Target

**Goal:** Reach the v0.1 list size: ~15 EN + ~12 DE phrases, all severity `high` or `medium`. Each new phrase ships with one positive fixture. Each language keeps its single shared negative fixture (already exists from Task 2).

**Files (create):**
- 12 new entries in `references/ai-phrases-en.md`
- 9 new entries in `references/ai-phrases-de.md`
- 12 new files in `tests/fixtures/en-positive/`
- 9 new files in `tests/fixtures/de-positive/`

**Process per phrase (repeat for each):**

1. Add the YAML block to the list file
2. Create the fixture file (one short paragraph containing the phrase)
3. Run `bats tests/parse-phrases.bats tests/detect.bats`
4. Verify all green

Commit groupings: 4 per language per commit (3 commits total for EN, 2 for DE).

### EN phrases to add (12)

- [ ] **Step 1: Add EN batch 1 (4 phrases) — lexical / strong tells**

Append to `references/ai-phrases-en.md`:

```markdown
---
phrase: "navigate the landscape"
language: en
severity: high
category: lexical
pattern: "\\bnavigate the landscape\\b"
suggestions:
  - "work in this space"
  - "operate in this market"
  - "(rephrase concretely)"
notes: "Empty business-speak metaphor. Almost always vague."
---

---
phrase: "in the realm of"
language: en
severity: high
category: filler
pattern: "\\bin the realm of\\b"
suggestions:
  - "in"
  - "for"
  - "(remove)"
notes: "Stilted. 'In' or 'for' is almost always sufficient."
---

---
phrase: "moreover"
language: en
severity: medium
category: transition
pattern: "\\b[Mm]oreover\\b"
suggestions:
  - "(start a new sentence with the actual point)"
  - "Also,"
  - "And"
notes: "Used to artificially link unrelated points. Often signals filler."
---

---
phrase: "intricate"
language: en
severity: medium
category: lexical
pattern: "\\bintricate\\b"
suggestions:
  - "complex"
  - "detailed"
  - "involved"
notes: "Overused LLM adjective. 'Complex' or 'detailed' is usually more honest."
---
```

Create fixtures:

`tests/fixtures/en-positive/navigate-landscape.md`:
```markdown
Companies must navigate the landscape of regulations carefully.
```

`tests/fixtures/en-positive/realm.md`:
```markdown
In the realm of distributed systems, consistency is hard.
```

`tests/fixtures/en-positive/moreover.md`:
```markdown
The plan ships in two phases. Moreover, it requires user testing.
```

`tests/fixtures/en-positive/intricate.md`:
```markdown
The intricate interplay of components produces emergent behavior.
```

Run tests:
```bash
bats tests/parse-phrases.bats tests/detect.bats
```

Expected: parse-phrases test for EN now expects 7 phrases (3 seed + 4 new) — update the test:

In `tests/parse-phrases.bats`, change `[ "$(echo "$output" | wc -l | tr -d ' ')" -eq 3 ]` to `[ "$(echo "$output" | wc -l | tr -d ' ')" -eq 7 ]` for the EN test.

Re-run: all green.

Commit:
```bash
git add references/ai-phrases-en.md tests/fixtures/en-positive/ tests/parse-phrases.bats
git commit -m "feat(phrases-en): batch 1 — landscape, realm, moreover, intricate

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
git push origin main
```

- [ ] **Step 2: Add EN batch 2 (4 phrases) — hedging / sycophantic**

Append to `references/ai-phrases-en.md`:

```markdown
---
phrase: "it's worth noting"
language: en
severity: medium
category: hedging
pattern: "\\b[Ii]t['']s worth noting\\b"
suggestions:
  - "(remove — usually filler)"
  - "Note:"
notes: "Filler. The next sentence carries the actual content."
---

---
phrase: "great question"
language: en
severity: high
category: sycophantic
pattern: "\\b[Gg]reat question\\b"
suggestions:
  - "(remove — answer the question directly)"
notes: "Empty validation. Common LLM opener."
---

---
phrase: "certainly"
language: en
severity: medium
category: sycophantic
pattern: "^Certainly[!,]"
suggestions:
  - "(remove — start with the answer)"
notes: "LLM opener. Almost always strippable."
---

---
phrase: "in conclusion"
language: en
severity: medium
category: transition
pattern: "\\b[Ii]n conclusion\\b"
suggestions:
  - "(remove — let the conclusion stand on its own)"
  - "So"
notes: "School-essay phrase. Reads as AI when concluding short pieces."
---
```

Create fixtures (one paragraph each):

`tests/fixtures/en-positive/worth-noting.md`:
```markdown
The cache TTL is 5 minutes. It's worth noting that this affects refresh frequency.
```

`tests/fixtures/en-positive/great-question.md`:
```markdown
Great question! The architecture relies on event sourcing.
```

`tests/fixtures/en-positive/certainly.md`:
```markdown
Certainly! Here is the implementation.
```

`tests/fixtures/en-positive/in-conclusion.md`:
```markdown
The plan has three phases. In conclusion, we ship in Q3.
```

Update `tests/parse-phrases.bats` EN count to 11.

Run tests, all green.

Commit:
```bash
git add references/ai-phrases-en.md tests/fixtures/en-positive/ tests/parse-phrases.bats
git commit -m "feat(phrases-en): batch 2 — hedging + sycophantic

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
git push origin main
```

- [ ] **Step 3: Add EN batch 3 (4 phrases) — filler / triplet patterns**

Append to `references/ai-phrases-en.md`:

```markdown
---
phrase: "robust, scalable, and efficient"
language: en
severity: high
category: triplet
pattern: "\\brobust,? scalable,? and efficient\\b"
suggestions:
  - "(rephrase with concrete claims)"
notes: "Marketing-buzzword triplet. Replace with specifics."
---

---
phrase: "leverage"
language: en
severity: medium
category: lexical
pattern: "\\bleverage\\b"
suggestions:
  - "use"
  - "rely on"
  - "build on"
notes: "Business-speak verb. 'Use' is usually clearer."
---

---
phrase: "seamlessly"
language: en
severity: medium
category: lexical
pattern: "\\bseamlessly\\b"
suggestions:
  - "(remove — almost always padding)"
  - "smoothly"
notes: "Empty intensifier. Strip and verify the sentence still works."
---

---
phrase: "comprehensive"
language: en
severity: medium
category: lexical
pattern: "\\bcomprehensive\\b"
suggestions:
  - "complete"
  - "thorough"
  - "full"
notes: "Overused. 'Complete' or 'thorough' is usually more concrete."
---
```

Create fixtures:

`tests/fixtures/en-positive/triplet.md`:
```markdown
Our platform is robust, scalable, and efficient at any load.
```

`tests/fixtures/en-positive/leverage.md`:
```markdown
We leverage the existing auth library to handle sessions.
```

`tests/fixtures/en-positive/seamlessly.md`:
```markdown
The integration works seamlessly with existing tools.
```

`tests/fixtures/en-positive/comprehensive.md`:
```markdown
This is a comprehensive guide to the API.
```

Update `tests/parse-phrases.bats` EN count to 15.

Run tests, all green.

Commit:
```bash
git add references/ai-phrases-en.md tests/fixtures/en-positive/ tests/parse-phrases.bats
git commit -m "feat(phrases-en): batch 3 — triplet, leverage, seamlessly, comprehensive

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
git push origin main
```

### DE phrases to add (9)

- [ ] **Step 4: Add DE batch 1 (5 phrases)**

Append to `references/ai-phrases-de.md`:

```markdown
---
phrase: "nicht nur ... sondern auch"
language: de
severity: medium
category: triplet
pattern: "\\bnicht nur .{1,80}? sondern auch\\b"
suggestions:
  - "(in zwei Sätze splitten)"
notes: "Korrelative Konstruktion, oft KI-Zwang. Manuell prüfen ob beide Aspekte wirklich gleichwertig sind."
---

---
phrase: "es lässt sich festhalten"
language: de
severity: medium
category: hedging
pattern: "\\bes lässt sich festhalten\\b"
suggestions:
  - "(weglassen — sag direkt was)"
  - "Festzuhalten:"
notes: "Akademische Floskel. Selten substanziell."
---

---
phrase: "darüber hinaus"
language: de
severity: medium
category: transition
pattern: "\\b[Dd]arüber hinaus\\b"
suggestions:
  - "(neuen Satz beginnen)"
  - "Außerdem"
notes: "Übergangsfloskel. Oft ohne logische Verbindung."
---

---
phrase: "vielfältig"
language: de
severity: medium
category: lexical
pattern: "\\bvielfältig\\b"
suggestions:
  - "verschieden"
  - "(konkret aufzählen)"
notes: "Allzweck-Adjektiv. Mit konkreten Beispielen ersetzen."
---

---
phrase: "robust und skalierbar"
language: de
severity: high
category: triplet
pattern: "\\brobust und skalierbar\\b"
suggestions:
  - "(mit konkreten Aussagen ersetzen)"
notes: "Marketing-Phrase. Konkret werden oder weglassen."
---
```

Create fixtures:

`tests/fixtures/de-positive/nicht-nur.md`:
```markdown
Das System ist nicht nur schnell sondern auch wartbar.
```

`tests/fixtures/de-positive/festhalten.md`:
```markdown
Es lässt sich festhalten, dass der Cache pro Region läuft.
```

`tests/fixtures/de-positive/darueber-hinaus.md`:
```markdown
Der Plan hat zwei Phasen. Darüber hinaus erfordert er User-Tests.
```

`tests/fixtures/de-positive/vielfaeltig.md`:
```markdown
Die Anwendungsfelder sind vielfältig und reichen von ... bis ...
```

`tests/fixtures/de-positive/robust-skalierbar.md`:
```markdown
Unsere Plattform ist robust und skalierbar bei jeder Last.
```

Update `tests/parse-phrases.bats` DE count to 8.

Run tests, all green.

Commit:
```bash
git add references/ai-phrases-de.md tests/fixtures/de-positive/ tests/parse-phrases.bats
git commit -m "feat(phrases-de): batch 1 — nicht-nur, festhalten, darüber-hinaus, vielfältig, robust-skalierbar

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
git push origin main
```

- [ ] **Step 5: Add DE batch 2 (4 phrases)**

Append to `references/ai-phrases-de.md`:

```markdown
---
phrase: "nahtlos"
language: de
severity: medium
category: lexical
pattern: "\\bnahtlos\\b"
suggestions:
  - "(weglassen — meist Füllwort)"
  - "reibungslos"
notes: "Direkte Übersetzung von 'seamlessly'. Selten substanziell."
---

---
phrase: "umfassend"
language: de
severity: low
category: lexical
pattern: "\\bumfassend\\b"
suggestions:
  - "vollständig"
  - "gründlich"
  - "(weglassen)"
notes: "Allzweck-Adjektiv. Meist durch konkretere Aussage ersetzbar."
---

---
phrase: "in der heutigen Zeit"
language: de
severity: high
category: filler
pattern: "\\bin der heutigen Zeit\\b"
suggestions:
  - "heute"
  - "(weglassen)"
notes: "Übersetzung von 'in today's world'. Floskel."
---

---
phrase: "spielt eine wichtige Rolle"
language: de
severity: medium
category: hedging
pattern: "\\bspielt eine wichtige Rolle\\b"
suggestions:
  - "ist wichtig für"
  - "(konkret werden — wofür?)"
notes: "Vage Wichtigkeits-Behauptung. Konkretisieren."
---
```

Hinweis: DE-Liste hat damit 12 Phrasen. Eine `severity: low` ist enthalten (umfassend) — bewusst, um die Severity-Sortierung im Report zu testen.

Create fixtures:

`tests/fixtures/de-positive/nahtlos.md`:
```markdown
Die Integration funktioniert nahtlos mit bestehenden Tools.
```

`tests/fixtures/de-positive/umfassend.md`:
```markdown
Dies ist ein umfassender Leitfaden zur API.
```

`tests/fixtures/de-positive/heutige-zeit.md`:
```markdown
In der heutigen Zeit sind verteilte Systeme Standard.
```

`tests/fixtures/de-positive/wichtige-rolle.md`:
```markdown
Caching spielt eine wichtige Rolle bei der Performance.
```

Update `tests/parse-phrases.bats` DE count to 12.

Run tests, all green.

Commit:
```bash
git add references/ai-phrases-de.md tests/fixtures/de-positive/ tests/parse-phrases.bats
git commit -m "feat(phrases-de): batch 2 — nahtlos, umfassend, heutige-zeit, wichtige-rolle

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
git push origin main
```

---

## Task 9: CI Pipeline

**Goal:** GitHub Actions runs `bats`, `shellcheck`, and `cspell` on every push to `main` and on pull requests. CI must be green before any release.

**Files:**
- Create: `.github/workflows/ci.yml`
- Create: `.cspell.json`

- [ ] **Step 1: Create `.cspell.json`**

```json
{
  "version": "0.2",
  "language": "en,de",
  "files": [
    "references/**/*.md",
    "docs/**/*.md",
    "README.md",
    "CLAUDE.md"
  ],
  "ignorePaths": [
    "node_modules/",
    ".git/",
    "tests/fixtures/**"
  ],
  "words": [
    "neckarshore",
    "obsidian",
    "kebab",
    "shellcheck",
    "yq",
    "POSIX",
    "TSV",
    "BYOK",
    "regex",
    "frontmatter",
    "Claude",
    "vercel",
    "tapestry",
    "Substantivierung",
    "Floskel",
    "Floskeln",
    "tauchen",
    "Bandwurmsätze"
  ]
}
```

- [ ] **Step 2: Create `.github/workflows/ci.yml`**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install yq
        run: |
          sudo wget -qO /usr/local/bin/yq https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64
          sudo chmod +x /usr/local/bin/yq
          yq --version

      - name: Install bats
        run: |
          sudo apt-get update -y
          sudo apt-get install -y bats

      - name: Install shellcheck
        run: sudo apt-get install -y shellcheck

      - name: Run shellcheck
        run: |
          shellcheck scripts/*.sh scripts/lib/*.sh

      - name: Run bats tests
        run: |
          bats tests/parse-phrases.bats
          bats tests/detect.bats
          bats tests/apply.bats

  cspell:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install cspell
        run: npm install -g cspell@8
      - name: Run cspell
        run: cspell --no-progress "references/**/*.md" "docs/**/*.md" "README.md" "CLAUDE.md"
```

- [ ] **Step 3: Commit and watch CI run**

```bash
git add .github/workflows/ci.yml .cspell.json
git commit -m "ci: bats + shellcheck + cspell on push/PR

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
git push origin main
```

Then watch the run:

```bash
sleep 10
gh run list --limit 3
gh run watch  # or gh run view --log
```

Expected: green build. If red, debug per failure (most common: missing word in cspell, missing dependency in CI image).

- [ ] **Step 4: Mark CI green in run-history**

Append to `logs/run-history.md`:

```markdown
## 2026-05-XX (replace with actual date) — Plan A complete

- Skill MVP shipped: 15 EN + 12 DE phrases, 3-stage flow, full bats coverage
- CI green: <link to first green run>
- Ready for manual smoke test (Task 10)
```

Commit:
```bash
git add logs/run-history.md
git commit -m "docs(run-history): plan A complete, CI green

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
git push origin main
```

---

## Task 10: Manual End-to-End Smoke Test and v0.1.0 Tag

**Goal:** Run the skill against a real text (paste mode and file mode, EN and DE). User verifies the experience and tags v0.1.0.

This is a **manual test** — only the user can declare it PASS (per the user's "completion rules" in global CLAUDE.md). The agent runs the steps and reports results objectively.

- [ ] **Step 1: Paste-mode smoke test (EN)**

The user pastes this text in a Claude Code session that has the skill loaded:

```
We will delve into the architecture of the system. The components form a tapestry of patterns. It's important to note that caching plays a comprehensive role.
```

Expected behavior:
1. Skill detects 4 findings (delve into, tapestry, important to note, comprehensive)
2. User sees Stage 1 report with 4 findings, language=en
3. Skill asks the Stage 2 gate ("Want suggestions?")
4. User says yes → Stage 2 produces alternatives via the prompt template
5. User picks alternatives
6. Stage 3 outputs the rewritten text inline

User verifies: the rewritten text reads better and matches their intent.

- [ ] **Step 2: Paste-mode smoke test (DE)**

The user pastes this text:

```
Tauchen wir ein in die Architektur des Systems. Im Bereich der Caching-Strategien gibt es vielfältige Ansätze.
```

Expected: 3 findings (tauchen wir ein, im Bereich der, vielfältig), language=de, full flow.

- [ ] **Step 3: File-mode smoke test**

User picks a real markdown file from their work (a draft, a spec, an email). Run:

```
ai-phrase-check check this file: /path/to/draft.md
```

Expected:
1. Stage 1 report
2. Stage 2 gate honored
3. Stage 3 shows a **diff** — does NOT write the file until user confirms
4. User confirms → file is written; user can verify with `git diff` if file is in a repo

- [ ] **Step 4: Manual report**

Append a manual smoke-test report to `logs/run-history.md`:

```markdown
## YYYY-MM-DD — Manual smoke test (Plan A)

### Done
- Paste mode EN: <findings/applied counts>
- Paste mode DE: <findings/applied counts>
- File mode: <findings/applied counts, file written: yes/no>

### User verdict
<PASS / changes requested>

### Open issues
<list any false positives, missing detections, or UX problems>
```

Commit:
```bash
git add logs/run-history.md
git commit -m "docs(smoke): manual end-to-end test results

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
git push origin main
```

- [ ] **Step 5: Tag v0.1.0 (only if user verdict = PASS)**

```bash
git tag -a v0.1.0 -m "v0.1.0 — Skill MVP

- Bilingual EN/DE detection (15 EN + 12 DE phrases)
- Three-stage flow with user gates
- bats + shellcheck + cspell green in CI
- Manual smoke test passed"
git push origin v0.1.0
```

Verify on GitHub: Releases tab shows v0.1.0.

---

## Self-Review Notes (read before starting)

- **Spec coverage:** All sections of the design spec that concern the skill (Sections 1, 2, 3, 6, 7) are covered by Tasks 1-10. Section 4 (Frontend) and Section 5 web-portion (Frontend repo tree) are explicitly Plan B.
- **Out of scope (per design spec Section 7):** No pre-commit hook, no marketplace plugin packaging, no list auto-growth. These will not appear in any task in this plan.
- **Type/name consistency:**
  - Function: `parse_phrases` (Task 3, used in Task 4 + 5)
  - Function: `scan_with_list` (Task 5, internal to detect.sh)
  - File: `references/ai-phrases-en.md`, `-de.md` (consistent across all tasks)
  - Output format: `phrase\tlanguage\tseverity\tcategory\tpattern` from parse, `line\tphrase\tseverity\tcategory\tmatched` from detect — these are different formats by design (one describes phrase definitions, the other describes findings)
- **Drift protection:** Plan A delivers a `detect.sh` whose output format is fixed (TSV `line\tphrase\tseverity\tcategory\tmatched`). Plan B's `lib/detect.ts` JS port must produce identical output for the same fixtures — the parity test in Plan B enforces this.
- **Manual test isolation:** Task 10 explicitly notes the user is the only one who can declare PASS. The agent runs steps and reports objectively per the user's global completion rules.
