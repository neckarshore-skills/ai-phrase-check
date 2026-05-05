'use client';

import { useState, useEffect } from 'react';
import { hasApiKey, clearApiKey } from '@/lib/api-key-storage';

export default function ApiKeyIndicator({ onClear }: { onClear: () => void }) {
  const [active, setActive] = useState<boolean>(false);

  useEffect(() => {
    setActive(hasApiKey());
  }, []);

  if (!active) {
    return <span className="text-xs text-zinc-500">Stage 1 only</span>;
  }

  return (
    <span className="text-xs text-emerald-400">
      LLM active —{' '}
      <button
        type="button"
        className="underline hover:text-emerald-300"
        onClick={() => {
          clearApiKey();
          setActive(false);
          onClear();
        }}
      >
        clear key
      </button>
    </span>
  );
}
