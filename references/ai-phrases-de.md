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
