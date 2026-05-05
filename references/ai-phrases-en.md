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
pattern: "\\b[Ii]n the realm of\\b"
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
