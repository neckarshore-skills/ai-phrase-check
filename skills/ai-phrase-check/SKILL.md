---
name: ai-phrase-check
description: Use when text needs review for AI-typical phrases (English or German) and replacement with more human alternatives. Trigger phrases - "check this for AI phrases", "AI-Phrasen prüfen", "lint this text", "remove AI tells", "make this sound less AI", "clean up this draft". Bilingual auto-detect. Three-stage flow with user gates - Detect (regex, free), then Suggest (LLM, optional), then Apply (only with explicit user choice).
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

Run `scripts/detect.sh <input-file>` (auto-detects language). Output is TSV findings prefixed by `# language:` and `# findings:` metadata. Parse and present:

```
Found N findings (language: en|de)

| Line | Phrase | Severity | Matched text |
|------|--------|----------|--------------|
| 14   | delve into | high | delve into |
| 22   | tapestry | high | tapestry |
```

If 0 findings: report "No AI phrases found." and stop. Otherwise:

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
