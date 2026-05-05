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
