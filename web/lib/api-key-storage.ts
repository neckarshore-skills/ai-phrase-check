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
