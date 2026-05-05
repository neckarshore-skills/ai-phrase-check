import { describe, it, expect } from 'vitest';
import { getPhrases } from '@/lib/phrases';

describe('phrases loader', () => {
  it('loads English phrases', () => {
    const phrases = getPhrases('en');
    expect(phrases.length).toBeGreaterThanOrEqual(15);
    expect(phrases[0]).toHaveProperty('phrase');
    expect(phrases[0]).toHaveProperty('pattern');
    expect(phrases[0]).toHaveProperty('severity');
    expect(phrases[0]).toHaveProperty('suggestions');
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
      expect(p.phrase, `${JSON.stringify(p)}`).toBeTruthy();
      expect(p.pattern, `${JSON.stringify(p)}`).toBeTruthy();
      expect(['high', 'medium', 'low']).toContain(p.severity);
      expect(p.suggestions.length).toBeGreaterThan(0);
    }
  });
});
