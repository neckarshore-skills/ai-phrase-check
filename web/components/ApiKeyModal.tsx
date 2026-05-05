'use client';

import { useState } from 'react';
import { setApiKey } from '@/lib/api-key-storage';

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function ApiKeyModal({ open, onClose, onSaved }: Props) {
  const [value, setValue] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  function save() {
    try {
      setApiKey(value);
      setError(null);
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid key');
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-zinc-950 border border-zinc-800 rounded-lg p-6 max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4">Bring your Anthropic API key</h2>
        <ul className="text-sm text-zinc-400 mb-4 space-y-1 list-disc pl-4">
          <li>Stored only in your browser session — cleared when you close this tab.</li>
          <li>Direct call to api.anthropic.com — we never see your key.</li>
          <li>Recommended: workspace-scoped key with a spending limit.</li>
          <li>
            Get a key at{' '}
            <a
              className="underline text-indigo-400"
              href="https://console.anthropic.com/"
              target="_blank"
              rel="noreferrer"
            >
              console.anthropic.com
            </a>
            .
          </li>
        </ul>
        <input
          type="password"
          placeholder="sk-ant-..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full p-2 bg-zinc-900 border border-zinc-800 rounded font-mono text-sm mb-2"
        />
        {error && <p className="text-sm text-red-400 mb-2">{error}</p>}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 rounded"
          >
            Save key (this session only)
          </button>
        </div>
      </div>
    </div>
  );
}
