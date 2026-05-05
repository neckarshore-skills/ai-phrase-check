import { describe, it, expect, beforeEach } from 'vitest';
import { setApiKey, getApiKey, clearApiKey, hasApiKey } from '@/lib/api-key-storage';

describe('api-key-storage', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

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

  it('rejects keys that do not start with sk-ant-', () => {
    expect(() => setApiKey('sk-foo-123')).toThrow(/sk-ant-/);
  });

  it('returns null when nothing stored', () => {
    expect(getApiKey()).toBeNull();
    expect(hasApiKey()).toBe(false);
  });
});
