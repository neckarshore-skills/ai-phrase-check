# AI-Phrasen — Deutsch

Diese Datei wird von `scripts/detect.sh` und `web/lib/phrases.ts` gelesen. Jeder Eintrag ist ein YAML-Frontmatter-Block, getrennt durch `---`. Format nicht ändern ohne den Parser anzupassen.

---
phrase: "tauchen wir ein in"
language: de
severity: high
category: transition
pattern: "\\b[Tt]auchen wir ein in\\b"
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
pattern: "\\b[Ii]m Bereich der\\b"
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
pattern: "\\b[Ee]s ist wichtig zu erwähnen\\b"
suggestions:
  - "erwähnenswert:"
  - "(weglassen — meist Füllphrase)"
notes: "Übersetzung von 'it's important to note'. Selten substantiell."
---

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
pattern: "\\b[Ee]s lässt sich festhalten\\b"
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
pattern: "\\bumfassend\\w*\\b"
suggestions:
  - "vollständig"
  - "gründlich"
  - "(weglassen)"
notes: "Allzweck-Adjektiv. Pattern matcht inflektierte Formen (umfassend, umfassende, umfassender, umfassendes). Meist durch konkretere Aussage ersetzbar."
---

---
phrase: "in der heutigen Zeit"
language: de
severity: high
category: filler
pattern: "\\b[Ii]n der heutigen Zeit\\b"
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
