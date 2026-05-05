'use client';

import { useState, useEffect, useMemo } from 'react';
import { detect, type Finding } from '@/lib/detect';
import { llmSuggest, type Suggestion } from '@/lib/llm-suggest';
import { getApiKey, hasApiKey } from '@/lib/api-key-storage';
import { EXAMPLES } from '@/content/examples';
import ApiKeyModal from './ApiKeyModal';
import ApiKeyIndicator from './ApiKeyIndicator';

export default function PhraseDemo() {
  const [text, setText] = useState<string>(EXAMPLES.en);
  const [debounced, setDebounced] = useState<string>(text);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [, setKeyVersion] = useState<number>(0);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(text), 300);
    return () => clearTimeout(t);
  }, [text]);

  const result = useMemo(() => detect(debounced), [debounced]);

  async function runSuggest() {
    const key = getApiKey();
    if (!key) {
      setModalOpen(true);
      return;
    }
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
        <ApiKeyIndicator onClear={() => setKeyVersion((v) => v + 1)} />
        <button
          type="button"
          onClick={() => (hasApiKey() ? runSuggest() : setModalOpen(true))}
          className="text-sm bg-indigo-600 hover:bg-indigo-500 px-3 py-1 rounded disabled:opacity-50"
          disabled={result.findings.length === 0 || loading}
        >
          {loading ? 'Calling api.anthropic.com…' : 'Get suggestions (Stage 2)'}
        </button>
      </div>

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
            {result.findings.map((f, idx) => (
              <FindingRow key={idx} finding={f} suggestions={suggestions} />
            ))}
            {result.findings.length === 0 && (
              <li className="text-sm text-zinc-500">No AI phrases detected.</li>
            )}
          </ul>
          {error && <p className="text-sm text-red-400 mt-2">Error: {error}</p>}
        </div>
      </div>

      <ApiKeyModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={() => {
          setModalOpen(false);
          setKeyVersion((v) => v + 1);
          runSuggest();
        }}
      />
    </div>
  );
}

function FindingRow({
  finding,
  suggestions,
}: {
  finding: Finding;
  suggestions: Suggestion[] | null;
}) {
  const matched = suggestions?.find((s) => s.finding === finding);
  const sevColor = {
    high: 'text-red-400',
    medium: 'text-amber-400',
    low: 'text-zinc-400',
  }[finding.severity];
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
          {matched.alternatives.map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ul>
      )}
    </li>
  );
}
