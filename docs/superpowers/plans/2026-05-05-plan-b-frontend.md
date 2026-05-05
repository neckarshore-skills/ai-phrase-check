# ai-phrase-check Frontend — Implementation Plan B

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Next.js landing page for `ai-phrase-check` — Hero, interactive Stage 1 demo (regex, client-side, no backend), Stage 2 demo via BYOK (Bring-Your-Own-Key), install instructions, and Vercel deploy. Parity test ensures the JS detection produces identical findings to the Bash `detect.sh` from Plan A.

**Architecture:** Next.js 16 App Router, TypeScript, Tailwind CSS, deployed as a static site to Vercel. Phrase lists are baked into the JS bundle at build time. No API routes, no server code. BYOK Stage 2 calls Anthropic API directly from the browser.

**Tech Stack:** Next.js 16, TypeScript 5+, Tailwind CSS 4, gray-matter (YAML frontmatter parser), @anthropic-ai/sdk, Vitest, Vercel.

**Prerequisite:** Plan A complete and tagged v0.1.0. Specifically, `scripts/detect.sh` must be stable — its output format (`line\tphrase\tseverity\tcategory\tmatched`) is the contract that `lib/detect.ts` must match.

**Working dir:** `~/Developer/projects/neckarshore-ai/ai-phrase-check/web/` (created in Task 1)

---

## File Structure (will be created by this plan)

See spec Section 4 for full layout. Key files:

- `web/lib/phrases.ts` — build-time phrase loader
- `web/lib/detect.ts` — JS port of detect.sh (must match output)
- `web/lib/api-key-storage.ts` — sessionStorage wrapper for BYOK
- `web/lib/llm-suggest.ts` — Anthropic SDK call from browser
- `web/components/Hero.tsx`, `PhraseDemo.tsx`, `PhraseList.tsx`, `InstallSnippet.tsx`, `ApiKeyModal.tsx`, `ApiKeyIndicator.tsx`, `Footer.tsx`
- `web/app/layout.tsx`, `page.tsx`, `globals.css`, `tokens.css`
- `tests/run-js-detect.mjs` (repo root, not `web/`)
- `tests/parity-test.bats` (repo root)
- `.github/workflows/deploy-web.yml`

**Total tasks:** 9.

---

## Conventions

1. Phrase lists live at repo root in `references/`. Never duplicate; web imports them via `lib/phrases.ts`.
2. No backend code. No API routes, no server actions for the LLM call.
3. Commit format: `<type>(<scope>): <subject>` ending with `Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>`.
4. ESLint + Prettier (Next.js defaults) before commit.
5. Vitest for components + libs.
6. Design tokens come from Linus (Task 2).

---

## Task 1: Next.js Scaffolding

**Files:** `web/` directory tree

- [ ] **Step 1: Bootstrap Next.js**

```bash
cd ~/Developer/projects/neckarshore-ai/ai-phrase-check
npx create-next-app@latest web \
  --typescript --tailwind --app \
  --no-src-dir --import-alias "@/*" \
  --turbopack --use-npm
```

- [ ] **Step 2: Verify dev server runs**

```bash
cd web && npm run dev
```

Open http://localhost:3000 — Next.js welcome page renders. Stop with Ctrl-C.

- [ ] **Step 3: Add dependencies**

```bash
cd web
npm install --save-exact gray-matter @anthropic-ai/sdk
npm install --save-exact --save-dev vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom tsx
```

(User preference: exact versions, no `^` or `~`.)

- [ ] **Step 4: Configure Vitest**

Create `web/vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './') },
  },
});
```

Create `web/tests/setup.ts`:

```typescript
import '@testing-library/jest-dom';
```

Add to `web/package.json` scripts:

```json
"scripts": {
  "dev": "next dev --turbopack",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 5: Smoke build**

```bash
cd web && npm run build
```

Expected: clean build.

- [ ] **Step 6: Commit**

```bash
cd ~/Developer/projects/neckarshore-ai/ai-phrase-check
git add web/
git commit -m "feat(web): Next.js 16 scaffolding with Tailwind + Vitest

App Router, TypeScript, Tailwind 4, Vitest with jsdom for component
tests. Dependencies pinned to exact versions.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
git push origin main
```

---

## Task 2: neckarshore.ai Design Tokens

**Goal:** Pull design tokens from the neckarshore.ai design system into `web/app/tokens.css`. Linus owns the design system.

**Files:** `web/app/globals.css`, `web/app/tokens.css`

**Two paths — Linus owns the choice:**

**Path A — Linus delivers `tokens.css`:** MASCHIN dispatches a briefing requesting colors, typography, spacing, radii, shadows. Linus writes `tokens.css`. Engineer drops it into `web/app/tokens.css`.

**Path B — Engineer extracts from neckarshore-website (fallback):** Read `~/Developer/projects/neckarshore-ai/neckarshore-website/app/globals.css` (or design tokens file). Copy CSS variables into `web/app/tokens.css`.

- [ ] **Step 1: Confirm path**

Check if Linus briefing arrived:

```bash
ls ~/Developer/projects/omnopsis-ai/omnopsis-planning/docs/process/handoffs/linus-to-obi-tokens-* 2>/dev/null
```

If exists → Path A. Else → request via FOR-MASCHIN block in next session report, fall back to Path B for unblocking.

- [ ] **Step 2: Write `web/app/tokens.css`**

Path A (Linus delivered): paste contents of briefing.

Path B (extracted fallback) — example shape:

```css
:root {
  --color-bg: #0a0a0a;
  --color-fg: #fafafa;
  --color-accent: #6366f1;
  --color-muted: #71717a;
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-4: 1rem;
  --space-8: 2rem;
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
}
```

- [ ] **Step 3: Import tokens from globals.css**

Edit `web/app/globals.css`:

```css
@import './tokens.css';
@import 'tailwindcss';

body {
  background: var(--color-bg);
  color: var(--color-fg);
  font-family: var(--font-sans);
}
```

- [ ] **Step 4: Smoke test**

`npm run dev` → http://localhost:3000 — colors reflect tokens.

- [ ] **Step 5: Commit**

```bash
git add web/app/
git commit -m "feat(web): integrate neckarshore.ai design tokens

Path: <A: Linus delivery / B: extracted from neckarshore-website>

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
git push origin main
```

---

## Task 3: Phrase Loader, JS Detect Port, Parity Test (TDD)

**Goal:** Build-time phrase loader. JS port of `detect.sh` that produces byte-identical findings. Parity test in `tests/parity-test.bats` (repo-root) runs both implementations and diffs output.

**Files:** `web/lib/phrases.ts`, `web/lib/detect.ts`, `web/tests/detect.test.ts`, `tests/run-js-detect.mjs`, `tests/parity-test.bats`

- [ ] **Step 1: Failing Vitest for `lib/phrases.ts`**

`web/tests/phrases.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { getPhrases } from '@/lib/phrases';

describe('phrases loader', () => {
  it('loads English phrases', () => {
    const phrases = getPhrases('en');
    expect(phrases.length).toBeGreaterThanOrEqual(15);
    expect(phrases[0]).toHaveProperty('phrase');
    expect(phrases[0]).toHaveProperty('pattern');
    expect(phrases[0].language).toBe('en');
  });

  it('loads German phrases', () => {
    const phrases = getPhrases('de');
    expect(phrases.length).toBeGreaterThanOrEqual(12);
    expect(phrases[0].language).toBe('de');
  });

  it('every phrase has required fields', () => {
    const phrases = [...getPhrases('en'), ...getPhrases('de')];
    for (const p of phrases) {
      expect(p.phrase).toBeTruthy();
      expect(p.pattern).toBeTruthy();
      expect(['high', 'medium', 'low']).toContain(p.severity);
      expect(p.suggestions.length).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 2: Run, verify failure**

```bash
cd web && npm test
```

- [ ] **Step 3: Implement `web/lib/phrases.ts`**

```typescript
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

export type Severity = 'high' | 'medium' | 'low';
export type Category =
  | 'lexical' | 'hedging' | 'triplet'
  | 'transition' | 'sycophantic' | 'filler';
export type Language = 'en' | 'de';

export interface Phrase {
  phrase: string;
  language: Language;
  severity: Severity;
  category: Category;
  pattern: string;
  suggestions: string[];
  notes?: string;
}

const REPO_ROOT = path.resolve(process.cwd(), '..');
const LIST_PATHS: Record<Language, string> = {
  en: path.join(REPO_ROOT, 'references', 'ai-phrases-en.md'),
  de: path.join(REPO_ROOT, 'references', 'ai-phrases-de.md'),
};

export function getPhrases(language: Language): Phrase[] {
  const filePath = LIST_PATHS[language];
  const raw = fs.readFileSync(filePath, 'utf8');
  const firstDelimiter = raw.indexOf('\n---\n');
  if (firstDelimiter === -1) return [];
  const content = raw.slice(firstDelimiter + 1);

  const blocks: Phrase[] = [];
  const blockRegex = /---\n([\s\S]*?)\n---/g;
  let m: RegExpExecArray | null;
  while ((m = blockRegex.exec(content)) !== null) {
    try {
      const parsed = matter(`---\n${m[1]}\n---\n`);
      const data = parsed.data as Partial<Phrase>;
      if (data.phrase && data.pattern && data.severity && data.suggestions) {
        blocks.push(data as Phrase);
      }
    } catch {
      continue;
    }
  }
  return blocks;
}
```

- [ ] **Step 4: Run, verify pass**

```bash
npm test -- phrases.test.ts
```

Expected: 3 of 3 pass.

- [ ] **Step 5: Failing test for `lib/detect.ts`**

`web/tests/detect.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { detect } from '@/lib/detect';

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const fx = (rel: string) =>
  fs.readFileSync(path.join(REPO_ROOT, 'tests', 'fixtures', rel), 'utf8');

describe('detect', () => {
  it('finds delve into in EN positive fixture', () => {
    const r = detect(fx('en-positive/delve-into.md'));
    expect(r.language).toBe('en');
    expect(r.findings.some(f => f.phrase === 'delve into')).toBe(true);
  });
  it('produces no findings for EN negative fixture', () => {
    expect(detect(fx('en-negative/clean-pre-2023.md')).findings).toHaveLength(0);
  });
  it('finds tauchen wir ein in DE positive fixture', () => {
    const r = detect(fx('de-positive/tauchen-wir-ein.md'));
    expect(r.language).toBe('de');
    expect(r.findings.some(f => f.phrase === 'tauchen wir ein in')).toBe(true);
  });
});
```

- [ ] **Step 6: Implement `web/lib/detect.ts`**

```typescript
import { getPhrases, type Phrase, type Language } from './phrases';

export interface Finding {
  line: number;
  phrase: string;
  severity: 'high' | 'medium' | 'low';
  category: string;
  matched: string;
}

export interface DetectResult {
  language: Language;
  findings: Finding[];
}

function scanWithList(text: string, phrases: Phrase[]): Finding[] {
  const findings: Finding[] = [];
  const lines = text.split('\n');
  for (const phrase of phrases) {
    const re = new RegExp(phrase.pattern, 'g');
    for (let i = 0; i < lines.length; i++) {
      let mm: RegExpExecArray | null;
      re.lastIndex = 0;
      while ((mm = re.exec(lines[i])) !== null) {
        findings.push({
          line: i + 1,
          phrase: phrase.phrase,
          severity: phrase.severity,
          category: phrase.category,
          matched: mm[0],
        });
      }
    }
  }
  // Sort to match detect.sh ordering
  findings.sort((a, b) => a.line - b.line || a.phrase.localeCompare(b.phrase));
  return findings;
}

export function detect(text: string): DetectResult {
  const en = scanWithList(text, getPhrases('en'));
  const de = scanWithList(text, getPhrases('de'));
  const language: Language = de.length > en.length ? 'de' : 'en';
  return { language, findings: language === 'de' ? de : en };
}
```

- [ ] **Step 7: Run, verify pass**

```bash
npm test -- detect.test.ts
```

- [ ] **Step 8: Create `tests/run-js-detect.mjs` (repo root)**

```javascript
#!/usr/bin/env node
import fs from 'node:fs';
import { detect } from '../web/lib/detect.ts';

const fixturePath = process.argv[2];
if (!fixturePath) {
  console.error('usage: run-js-detect.mjs <fixture-path>');
  process.exit(1);
}
const text = fs.readFileSync(fixturePath, 'utf8');
const result = detect(text);
console.log(`# language: ${result.language}`);
console.log(`# findings: ${result.findings.length}`);
for (const f of result.findings) {
  console.log(`${f.line}\t${f.phrase}\t${f.severity}\t${f.category}\t${f.matched}`);
}
```

Run via `tsx`: `cd web && npx tsx ../tests/run-js-detect.mjs <fixture>`.

- [ ] **Step 9: Create `tests/parity-test.bats`**

```bash
#!/usr/bin/env bats

setup() {
    REPO_ROOT="$(git rev-parse --show-toplevel)"
}

assert_parity_for_dir() {
    for fixture in "$REPO_ROOT"/tests/fixtures/"$1"/*.md; do
        bash_out="$("$REPO_ROOT/scripts/detect.sh" "$fixture")"
        js_out="$(cd "$REPO_ROOT/web" && npx tsx "$REPO_ROOT/tests/run-js-detect.mjs" "$fixture")"
        if [ "$bash_out" != "$js_out" ]; then
            echo "PARITY FAILURE on $fixture" >&2
            echo "BASH:" >&2; echo "$bash_out" >&2
            echo "JS:" >&2;   echo "$js_out" >&2
            return 1
        fi
    done
}

@test "parity: EN positive fixtures" { assert_parity_for_dir en-positive; }
@test "parity: DE positive fixtures" { assert_parity_for_dir de-positive; }
@test "parity: EN negative fixtures" { assert_parity_for_dir en-negative; }
@test "parity: DE negative fixtures" { assert_parity_for_dir de-negative; }
```

- [ ] **Step 10: Run parity test**

```bash
cd ~/Developer/projects/neckarshore-ai/ai-phrase-check
bats tests/parity-test.bats
```

If divergence: inspect both outputs side-by-side. Common causes: `\b` semantics, regex flags, sort order. Fix the JS side (Bash is canonical).

- [ ] **Step 11: Commit**

```bash
git add web/lib/ web/tests/ web/package.json web/package-lock.json tests/parity-test.bats tests/run-js-detect.mjs
git commit -m "feat(web): phrase loader + JS detect port + parity test

lib/phrases.ts loads multi-doc YAML. lib/detect.ts ports detect.sh
with identical output. Parity test enforces no drift between bash
and JS implementations.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
git push origin main
```

---

## Task 4: Demo Component (Stage 1)

**Files:** `web/components/PhraseDemo.tsx`, `web/content/examples.ts`

- [ ] **Step 1: `web/content/examples.ts`**

```typescript
export const EXAMPLES = {
  en: `In this section, we will delve into the architecture of the system.
The components form a tapestry of patterns. It's important to note
that caching plays a comprehensive role.`,
  de: `Tauchen wir ein in die Architektur des Systems.
Im Bereich der Caching-Strategien gibt es vielfältige Ansätze.
Darüber hinaus spielt die Konsistenz eine wichtige Rolle.`,
} as const;
```

- [ ] **Step 2: Failing Vitest**

`web/tests/PhraseDemo.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PhraseDemo from '@/components/PhraseDemo';

describe('PhraseDemo', () => {
  it('renders with EN example', () => {
    render(<PhraseDemo />);
    expect(screen.getByRole('textbox')).toHaveValue(expect.stringContaining('delve into'));
  });
  it('shows findings counter', async () => {
    render(<PhraseDemo />);
    await waitFor(() => expect(screen.getByText(/findings/i)).toBeInTheDocument());
  });
  it('updates on text change', async () => {
    render(<PhraseDemo />);
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'A clean sentence with no AI tells.' },
    });
    await waitFor(() => expect(screen.getByText(/0 findings/i)).toBeInTheDocument());
  });
});
```

- [ ] **Step 3: Implement `PhraseDemo.tsx`** (Stage 1 only — Stage 2 added in Task 6)

```tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { detect, type Finding } from '@/lib/detect';
import { EXAMPLES } from '@/content/examples';

export default function PhraseDemo() {
  const [text, setText] = useState(EXAMPLES.en);
  const [debounced, setDebounced] = useState(text);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(text), 300);
    return () => clearTimeout(t);
  }, [text]);

  const result = useMemo(() => detect(debounced), [debounced]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-lg border border-zinc-800">
      <div>
        <label className="block text-sm font-medium mb-2">Your text</label>
        <textarea
          className="w-full h-64 p-3 bg-zinc-950 border border-zinc-800 rounded font-mono text-sm"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>
      <div>
        <div className="text-sm font-medium mb-2">
          {result.findings.length} findings (language: {result.language})
        </div>
        <ul className="space-y-2">
          {result.findings.map((f, idx) => <FindingRow key={idx} finding={f} />)}
          {result.findings.length === 0 && (
            <li className="text-sm text-zinc-500">No AI phrases detected.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

function FindingRow({ finding }: { finding: Finding }) {
  const sevColor = {
    high: 'text-red-400', medium: 'text-amber-400', low: 'text-zinc-400',
  }[finding.severity];
  return (
    <li className="text-sm">
      <span className="text-zinc-500">L{finding.line}</span>{' '}
      <span className={sevColor}>[{finding.severity}]</span>{' '}
      <span className="font-mono">{finding.matched}</span>{' '}
      <span className="text-zinc-500">({finding.phrase})</span>
    </li>
  );
}
```

- [ ] **Step 4: Run, verify pass + commit**

```bash
cd web && npm test -- PhraseDemo.test.tsx
git add web/components/PhraseDemo.tsx web/content/ web/tests/
git commit -m "feat(web): PhraseDemo Stage 1 — textarea + findings sidebar

Client-side detection, debounced 300ms. Initial example shows EN
findings. Severity color-coded.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
git push origin main
```

---

## Task 5: API Key Storage and LLM Suggest Library (TDD)

**Files:** `web/lib/api-key-storage.ts`, `web/lib/llm-suggest.ts`, `web/tests/api-key-storage.test.ts`

- [ ] **Step 1: Failing test for storage**

```typescript
// web/tests/api-key-storage.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { setApiKey, getApiKey, clearApiKey, hasApiKey } from '@/lib/api-key-storage';

describe('api-key-storage', () => {
  beforeEach(() => sessionStorage.clear());

  it('round-trips a key', () => {
    setApiKey('sk-ant-test123');
    expect(getApiKey()).toBe('sk-ant-test123');
    expect(hasApiKey()).toBe(true);
  });
  it('clears the key', () => {
    setApiKey('sk-ant-test123');
    clearApiKey();
    expect(getApiKey()).toBeNull();
    expect(hasApiKey()).toBe(false);
  });
  it('rejects keys not starting with sk-ant-', () => {
    expect(() => setApiKey('sk-foo-123')).toThrow(/sk-ant-/);
  });
  it('returns null when nothing stored', () => {
    expect(getApiKey()).toBeNull();
  });
});
```

- [ ] **Step 2: Implement `api-key-storage.ts`**

```typescript
const KEY = 'ai-phrase-check.anthropic-api-key';

export function setApiKey(key: string): void {
  if (!key.startsWith('sk-ant-')) {
    throw new Error('API key must start with sk-ant-');
  }
  sessionStorage.setItem(KEY, key);
}
export function getApiKey(): string | null {
  return sessionStorage.getItem(KEY);
}
export function clearApiKey(): void {
  sessionStorage.removeItem(KEY);
}
export function hasApiKey(): boolean {
  return sessionStorage.getItem(KEY) !== null;
}
```

Run test: 4 of 4 pass.

- [ ] **Step 3: Implement `llm-suggest.ts`**

```typescript
import Anthropic from '@anthropic-ai/sdk';
import type { Finding } from './detect';
import type { Language } from './phrases';

export interface Suggestion {
  finding: Finding;
  alternatives: string[];
}

const SYSTEM = `You suggest alternatives for AI-typical phrases.
For each finding, propose 1-3 concise alternatives that fit context.
Output strict JSON: {"suggestions": [{"line": <n>, "phrase": "<p>", "alternatives": ["<a1>", "<a2>"]}]}.
No prose, no markdown — only the JSON object.`;

export async function llmSuggest(
  apiKey: string,
  text: string,
  findings: Finding[],
  language: Language,
): Promise<Suggestion[]> {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
  const userPrompt = [
    `Language: ${language}`, '',
    'Text:', '```', text, '```', '',
    'Findings:',
    findings.map(f => `- L${f.line} "${f.phrase}" matched: "${f.matched}"`).join('\n'),
  ].join('\n');

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1024,
    system: SYSTEM,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const block = response.content[0];
  if (block.type !== 'text') throw new Error('Unexpected response type');
  const parsed = JSON.parse(block.text) as {
    suggestions: Array<{ line: number; phrase: string; alternatives: string[] }>;
  };
  return parsed.suggestions
    .map(s => ({
      finding: findings.find(f => f.line === s.line && f.phrase === s.phrase)!,
      alternatives: s.alternatives,
    }))
    .filter(s => s.finding !== undefined);
}
```

(No separate test for `llm-suggest.ts` — relies on Anthropic SDK; mocked at component level.)

- [ ] **Step 4: Commit**

```bash
git add web/lib/api-key-storage.ts web/lib/llm-suggest.ts web/tests/api-key-storage.test.ts
git commit -m "feat(web): BYOK storage + Anthropic SDK suggest call

api-key-storage: sessionStorage wrapper with sk-ant- validation and
clear-on-demand. llm-suggest: direct browser call to Anthropic with
dangerouslyAllowBrowser, returns typed Suggestion[].

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
git push origin main
```

---

## Task 6: BYOK UI — Modal, Indicator, Demo Stage 2 Integration

**Files:** `web/components/ApiKeyModal.tsx`, `web/components/ApiKeyIndicator.tsx`, modify `web/components/PhraseDemo.tsx`

- [ ] **Step 1: `ApiKeyModal.tsx`**

```tsx
'use client';
import { useState } from 'react';
import { setApiKey } from '@/lib/api-key-storage';

interface Props { open: boolean; onClose: () => void; onSaved: () => void; }

export default function ApiKeyModal({ open, onClose, onSaved }: Props) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  if (!open) return null;

  function save() {
    try { setApiKey(value); setError(null); onSaved(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Invalid key'); }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold mb-4">Bring your Anthropic API key</h2>
        <ul className="text-sm text-zinc-400 mb-4 space-y-1 list-disc pl-4">
          <li>Stored only in your browser session — cleared when you close this tab.</li>
          <li>Direct call to api.anthropic.com — we never see your key.</li>
          <li>Recommended: workspace-scoped key with a spending limit.</li>
          <li>Get a key at <a className="underline text-indigo-400" href="https://console.anthropic.com/" target="_blank" rel="noreferrer">console.anthropic.com</a>.</li>
        </ul>
        <input type="password" placeholder="sk-ant-..." value={value} onChange={(e) => setValue(e.target.value)}
          className="w-full p-2 bg-zinc-900 border border-zinc-800 rounded font-mono text-sm mb-2" />
        {error && <p className="text-sm text-red-400 mb-2">{error}</p>}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200">Cancel</button>
          <button onClick={save} className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 rounded">
            Save key (this session only)
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: `ApiKeyIndicator.tsx`**

```tsx
'use client';
import { useState, useEffect } from 'react';
import { hasApiKey, clearApiKey } from '@/lib/api-key-storage';

export default function ApiKeyIndicator({ onClear }: { onClear: () => void }) {
  const [active, setActive] = useState(false);
  useEffect(() => setActive(hasApiKey()), []);
  if (!active) return <span className="text-xs text-zinc-500">Stage 1 only</span>;
  return (
    <span className="text-xs text-emerald-400">
      LLM active —{' '}
      <button className="underline hover:text-emerald-300"
        onClick={() => { clearApiKey(); setActive(false); onClear(); }}>
        clear key
      </button>
    </span>
  );
}
```

- [ ] **Step 3: Extend `PhraseDemo.tsx`** with Stage 2 button + suggestions display

Replace the entire file with the version that adds:
- A "Get suggestions (Stage 2)" button that opens modal if no key, else calls `llmSuggest()`
- `ApiKeyIndicator` at the top
- `ApiKeyModal` rendered conditionally
- Suggestions displayed nested under their finding

```tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { detect, type Finding } from '@/lib/detect';
import { llmSuggest, type Suggestion } from '@/lib/llm-suggest';
import { getApiKey, hasApiKey } from '@/lib/api-key-storage';
import { EXAMPLES } from '@/content/examples';
import ApiKeyModal from './ApiKeyModal';
import ApiKeyIndicator from './ApiKeyIndicator';

export default function PhraseDemo() {
  const [text, setText] = useState(EXAMPLES.en);
  const [debounced, setDebounced] = useState(text);
  const [modalOpen, setModalOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setKeyVersion] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(text), 300);
    return () => clearTimeout(t);
  }, [text]);

  const result = useMemo(() => detect(debounced), [debounced]);

  async function runSuggest() {
    const key = getApiKey();
    if (!key) { setModalOpen(true); return; }
    setLoading(true);
    setError(null);
    try {
      const sugs = await llmSuggest(key, debounced, result.findings, result.language);
      setSuggestions(sugs);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <ApiKeyIndicator onClear={() => setKeyVersion(v => v + 1)} />
        <button onClick={() => (hasApiKey() ? runSuggest() : setModalOpen(true))}
          className="text-sm bg-indigo-600 hover:bg-indigo-500 px-3 py-1 rounded disabled:opacity-50"
          disabled={result.findings.length === 0 || loading}>
          {loading ? 'Calling api.anthropic.com…' : 'Get suggestions (Stage 2)'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-lg border border-zinc-800">
        <div>
          <label className="block text-sm font-medium mb-2">Your text</label>
          <textarea className="w-full h-64 p-3 bg-zinc-950 border border-zinc-800 rounded font-mono text-sm"
            value={text} onChange={(e) => setText(e.target.value)} />
        </div>
        <div>
          <div className="text-sm font-medium mb-2">
            {result.findings.length} findings (language: {result.language})
          </div>
          <ul className="space-y-2">
            {result.findings.map((f, idx) => <FindingRow key={idx} finding={f} suggestions={suggestions} />)}
            {result.findings.length === 0 && <li className="text-sm text-zinc-500">No AI phrases detected.</li>}
          </ul>
          {error && <p className="text-sm text-red-400 mt-2">Error: {error}</p>}
        </div>
      </div>

      <ApiKeyModal open={modalOpen} onClose={() => setModalOpen(false)}
        onSaved={() => { setModalOpen(false); setKeyVersion(v => v + 1); runSuggest(); }} />
    </div>
  );
}

function FindingRow({ finding, suggestions }: { finding: Finding; suggestions: Suggestion[] | null }) {
  const matched = suggestions?.find(s => s.finding === finding);
  const sevColor = { high: 'text-red-400', medium: 'text-amber-400', low: 'text-zinc-400' }[finding.severity];
  return (
    <li className="text-sm">
      <div>
        <span className="text-zinc-500">L{finding.line}</span>{' '}
        <span className={sevColor}>[{finding.severity}]</span>{' '}
        <span className="font-mono">{finding.matched}</span>{' '}
        <span className="text-zinc-500">({finding.phrase})</span>
      </div>
      {matched && (
        <ul className="ml-4 mt-1 text-xs text-zinc-400 list-disc">
          {matched.alternatives.map((a, i) => <li key={i}>{a}</li>)}
        </ul>
      )}
    </li>
  );
}
```

- [ ] **Step 4: Smoke test in dev**

`npm run dev` → click "Get suggestions" → modal opens → cancel works → indicator shows "Stage 1 only" status.

- [ ] **Step 5: Commit**

```bash
git add web/components/
git commit -m "feat(web): BYOK modal + indicator + Stage 2 in PhraseDemo

Modal explains safety, sessionStorage holds key, indicator shows
status with one-click clear. PhraseDemo gains opt-in 'Get
suggestions' button calling Anthropic via the user's own key.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
git push origin main
```

---

## Task 7: Landing Page Assembly

**Files:** `web/components/{Hero,PhraseList,InstallSnippet,Footer}.tsx`, `web/app/page.tsx`, `web/app/layout.tsx`

- [ ] **Step 1: Hero**

```tsx
// web/components/Hero.tsx
export default function Hero() {
  return (
    <section className="py-20 text-center">
      <h1 className="text-5xl font-bold mb-4">ai-phrase-check</h1>
      <p className="text-xl text-zinc-400 mb-2">Detect AI-typical phrases in your writing.</p>
      <p className="text-zinc-500">English &amp; German. Open source. Claude Code skill plus a browser demo.</p>
      <div className="mt-8 flex gap-3 justify-center">
        <a href="https://github.com/neckarshore-ai/ai-phrase-check"
          className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded text-sm">
          View on GitHub
        </a>
        <a href="#demo" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded text-sm">
          Try the demo
        </a>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: PhraseList**

```tsx
// web/components/PhraseList.tsx
import { getPhrases } from '@/lib/phrases';

export default function PhraseList() {
  const en = getPhrases('en').slice(0, 5);
  const de = getPhrases('de').slice(0, 5);
  return (
    <section className="py-12">
      <h2 className="text-2xl font-semibold mb-6">A taste of the lists</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Column title="English" phrases={en} />
        <Column title="Deutsch" phrases={de} />
      </div>
      <p className="text-sm text-zinc-500 mt-4">
        Full lists: <a className="underline" href="https://github.com/neckarshore-ai/ai-phrase-check/tree/main/references">references/</a>
      </p>
    </section>
  );
}

function Column({ title, phrases }: { title: string; phrases: ReturnType<typeof getPhrases> }) {
  return (
    <div>
      <h3 className="font-medium mb-3">{title}</h3>
      <ul className="space-y-1 text-sm">
        {phrases.map((p) => (
          <li key={p.phrase} className="font-mono text-zinc-300">
            {p.phrase}
            <span className="text-zinc-500 ml-2 text-xs">[{p.severity}]</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 3: InstallSnippet**

```tsx
// web/components/InstallSnippet.tsx
export default function InstallSnippet() {
  return (
    <section className="py-12">
      <h2 className="text-2xl font-semibold mb-6">Install</h2>
      <pre className="p-4 bg-zinc-950 border border-zinc-800 rounded text-sm overflow-x-auto">
        <code>{`# Clone and add to your Claude Code skills
git clone https://github.com/neckarshore-ai/ai-phrase-check.git
cd ai-phrase-check

# Install dependencies (yq for parsing)
brew install yq          # macOS
# or: snap install yq    # Linux

# In Claude Code, ask: "Check this for AI phrases" + paste text or file path`}</code>
      </pre>
    </section>
  );
}
```

- [ ] **Step 4: Footer**

```tsx
// web/components/Footer.tsx
export default function Footer() {
  return (
    <footer className="py-12 border-t border-zinc-800 text-sm text-zinc-500">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          ai-phrase-check ·{' '}
          <a className="underline" href="https://github.com/neckarshore-ai/ai-phrase-check">GitHub</a> ·{' '}
          <a className="underline" href="https://github.com/neckarshore-ai/ai-phrase-check/blob/main/LICENSE">MIT</a>
        </div>
        <div>Maintained by <a className="underline" href="https://neckarshore.ai">Neckarshore AI</a></div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 5: Assemble `app/page.tsx`**

```tsx
import Hero from '@/components/Hero';
import PhraseDemo from '@/components/PhraseDemo';
import PhraseList from '@/components/PhraseList';
import InstallSnippet from '@/components/InstallSnippet';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="max-w-4xl mx-auto px-4">
      <Hero />
      <section id="demo" className="py-12">
        <h2 className="text-2xl font-semibold mb-6">Try it</h2>
        <PhraseDemo />
      </section>
      <PhraseList />
      <InstallSnippet />
      <Footer />
    </main>
  );
}
```

- [ ] **Step 6: Update `app/layout.tsx` with metadata**

```tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ai-phrase-check — Detect AI-typical phrases in your writing',
  description: 'Open-source bilingual (EN/DE) detector for AI-typical phrases. Claude Code skill plus a browser demo.',
  openGraph: {
    title: 'ai-phrase-check',
    description: 'Detect AI-typical phrases. EN + DE. Open source.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
```

(Real OG image is a Linus deliverable — log as open item.)

- [ ] **Step 7: Build and smoke test**

```bash
cd web && npm run build && npm start
```

Visit http://localhost:3000:
- Hero with proper colors (tokens applied)
- Demo Stage 1 immediate, Stage 2 prompts for key
- PhraseList shows 5 EN + 5 DE samples
- InstallSnippet readable
- Footer links work

- [ ] **Step 8: Commit**

```bash
git add web/components/ web/app/page.tsx web/app/layout.tsx
git commit -m "feat(web): landing page — hero, demo, samples, install, footer

Full landing assembled. Hero CTA scrolls to demo. PhraseList shows
5 phrases per language. Footer links to GitHub, MIT license, neckarshore.ai.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
git push origin main
```

---

## Task 8: CI Extension and Vercel Deploy

**Files:** modify `.github/workflows/ci.yml`, create `.github/workflows/deploy-web.yml`

- [ ] **Step 1: Extend `ci.yml` with `web-test` and `parity` jobs**

Append after the existing `cspell` job:

```yaml
  web-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm, cache-dependency-path: web/package-lock.json }
      - name: Install web deps
        working-directory: web
        run: npm ci
      - name: Lint
        working-directory: web
        run: npm run lint
      - name: Vitest
        working-directory: web
        run: npm test
      - name: Next build
        working-directory: web
        run: npm run build

  parity:
    runs-on: ubuntu-latest
    needs: [test, web-test]
    steps:
      - uses: actions/checkout@v4
      - name: Install yq
        run: |
          sudo wget -qO /usr/local/bin/yq https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64
          sudo chmod +x /usr/local/bin/yq
      - name: Install bats
        run: sudo apt-get update -y && sudo apt-get install -y bats
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm, cache-dependency-path: web/package-lock.json }
      - name: Install web deps
        working-directory: web
        run: npm ci
      - name: Run parity test
        run: bats tests/parity-test.bats
```

- [ ] **Step 2: Create `deploy-web.yml`**

```yaml
name: Deploy web

on:
  push:
    branches: [main]
    paths: ['web/**', 'references/**', '.github/workflows/deploy-web.yml']
  pull_request:
    branches: [main]
    paths: ['web/**', 'references/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install Vercel CLI
        run: npm install -g vercel@latest
      - name: Pull Vercel env
        run: |
          vercel pull --yes \
            --environment=${{ github.ref == 'refs/heads/main' && 'production' || 'preview' }} \
            --token=${{ secrets.VERCEL_TOKEN }} \
            --cwd web
      - name: Build
        run: vercel build ${{ github.ref == 'refs/heads/main' && '--prod' || '' }} --token=${{ secrets.VERCEL_TOKEN }} --cwd web
      - name: Deploy
        run: vercel deploy --prebuilt ${{ github.ref == 'refs/heads/main' && '--prod' || '' }} --token=${{ secrets.VERCEL_TOKEN }} --cwd web
```

- [ ] **Step 3: Set up Vercel project (manual, one-time)**

```bash
cd ~/Developer/projects/neckarshore-ai/ai-phrase-check/web
npx vercel link
# Select neckarshore-ai team, create new project named ai-phrase-check
cat .vercel/project.json
# Output has orgId and projectId
```

In GitHub repo settings → Secrets:
- `VERCEL_TOKEN` from https://vercel.com/account/tokens
- `VERCEL_ORG_ID` from `.vercel/project.json`
- `VERCEL_PROJECT_ID` from `.vercel/project.json`

`.vercel/` is already in `.gitignore` (from Task 1 of Plan A scaffolding).

- [ ] **Step 4: Commit and watch CI + first deploy**

```bash
cd ~/Developer/projects/neckarshore-ai/ai-phrase-check
git add .github/workflows/
git commit -m "ci: web-test, parity, and Vercel deploy workflows

CI now runs bats + shellcheck + cspell + Vitest + parity test +
Next.js build. Deploy workflow ships preview on PR, prod on main.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
git push origin main

sleep 10
gh run list --limit 3
gh run watch
```

Expected: all jobs green. Deploy job emits a Vercel URL.

- [ ] **Step 5: Verify production URL**

```bash
gh run view --log | grep -oE 'https://[^ ]*\.vercel\.app' | head -1
```

Visit URL. Site responds 200. (Custom domain `ai-phrase-check.neckarshore.ai` is a Vercel-dashboard configuration — log as open item if user wants it.)

---

## Task 9: Manual Smoke Test and v0.2.0 Tag

Only the user can declare PASS (per global completion rules).

- [ ] **Step 1: Live demo Stage 1**

User visits production URL:
1. Hero with neckarshore tokens
2. Demo loads with EN example pre-filled
3. Findings appear immediately
4. Editing textarea updates findings (debounced)
5. Pasting clean text → 0 findings
6. Pasting DE text → language label switches

- [ ] **Step 2: Live demo Stage 2 (BYOK)**

User clicks "Get suggestions":
1. Modal with safety messaging
2. Wrong key format → inline validation error
3. Real key → modal closes, suggestions appear nested under findings
4. Indicator: "LLM active"
5. Clear key → indicator returns to "Stage 1 only"

User judgment: are the suggestions reasonable?

- [ ] **Step 3: Cross-browser quick check**

Safari, Chrome, mobile viewport. Look for layout breaks. File issues; do not block tag if cosmetic.

- [ ] **Step 4: Append manual smoke report**

Append to `logs/run-history.md`:

```markdown
## YYYY-MM-DD — Manual smoke test (Plan B / v0.2.0)

### Done
- Live URL: <production URL>
- Stage 1 verified on EN, DE, clean text
- Stage 2 verified with real Anthropic key
- BYOK modal flow correct
- Cross-browser: Safari ✓, Chrome ✓, Mobile ✓

### User verdict
<PASS / changes requested>

### Open issues
<list any cosmetic or functional problems>
```

```bash
git add logs/run-history.md
git commit -m "docs(smoke): plan B manual test + verdict

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
git push origin main
```

- [ ] **Step 5: Tag v0.2.0 (only on PASS)**

```bash
git tag -a v0.2.0 -m "v0.2.0 — Frontend MVP

- Next.js 16 landing page
- Stage 1 client-side regex demo
- Stage 2 BYOK with Anthropic SDK direct browser call
- Parity test in CI ensures bash↔JS detection consistency
- Vercel deploy on push, preview on PR
- Manual smoke test passed"
git push origin v0.2.0
```

---

## Self-Review Notes

- **Spec coverage:** Section 4 (Frontend) and Section 6 (parity test) covered. Section 7 (Out of Scope) honored: no backend, no LLM in CI.
- **Type/name consistency:**
  - `Phrase` interface matches spec Section 3 schema (`phrase`, `language`, `severity`, `category`, `pattern`, `suggestions`, `notes`)
  - `Finding` interface matches `detect.sh` TSV columns (`line`, `phrase`, `severity`, `category`, `matched`)
  - `Suggestion` interface (`finding`, `alternatives`) used consistently
- **Drift protection:** Bash and JS read same Markdown lists; output formats identical: language metadata + `line\tphrase\tseverity\tcategory\tmatched`. JS sorts to match Bash ordering. Parity test enforces.
- **No backend:** confirmed — `dangerouslyAllowBrowser: true` makes browser-direct explicit per spec Section 4.
- **Open items for MASCHIN/Linus:**
  1. Path A vs B for design tokens (Task 2) — prefer Linus delivery
  2. Real OG image (Task 7 Step 6) — Linus deliverable
  3. Custom domain decision — user/MASCHIN
