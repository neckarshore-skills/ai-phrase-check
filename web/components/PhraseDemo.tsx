'use client';

import { useState, useEffect, useMemo } from 'react';
import { detect, type Finding } from '@/lib/detect';
import { EXAMPLES } from '@/content/examples';

export default function PhraseDemo() {
  const [text, setText] = useState<string>(EXAMPLES.en);
  const [debounced, setDebounced] = useState<string>(text);

  // 300ms debounce
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
          {result.findings.map((f, idx) => (
            <FindingRow key={idx} finding={f} />
          ))}
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
    high: 'text-red-400',
    medium: 'text-amber-400',
    low: 'text-zinc-400',
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
