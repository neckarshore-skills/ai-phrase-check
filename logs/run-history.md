# Run History

This log records skill executions against real vaults / texts. Each entry: date, scope, duration, findings, notes.

## 2026-05-05 — Plan A skill MVP shipped, CI green

- Skill MVP: 15 EN + 12 DE phrases, 27 fixtures (2 negative shared), 16 bats tests, 3 bash scripts (detect, apply, parse), 1 SKILL.md, 2 prompt templates
- CI green on first stable run: https://github.com/neckarshore-ai/ai-phrase-check/actions/runs/25400437354
- Pipeline jobs: shellcheck + bats (test job), cspell with @cspell/dict-de-de (cspell job)
- Ready for manual smoke test (Task 10)

CI iteration notes:
- Run #1: bats + shellcheck green, cspell rot (159 unknown DE words — no German dictionary loaded)
- Run #2: imported @cspell/dict-de-de — down to 8 unknowns (regex fragments + domain words)
- Run #3: added regex fragments and domain words to wordlist — green

## 2026-05-05 — Manual smoke test (Plan A) — User verdict: PASS

- User ran the skill end-to-end and confirmed expected behavior
- Tagged v0.1.0
- Plan A complete
