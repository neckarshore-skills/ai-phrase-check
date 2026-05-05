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
