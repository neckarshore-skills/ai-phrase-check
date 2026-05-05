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
