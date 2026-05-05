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
    expect(r.findings.some((f) => f.phrase === 'delve into')).toBe(true);
    expect(r.findings.some((f) => f.phrase === 'tapestry')).toBe(true);
  });

  it('produces no findings for EN negative fixture', () => {
    expect(detect(fx('en-negative/clean-pre-2023.md')).findings).toHaveLength(0);
  });

  it('finds tauchen wir ein in DE positive fixture', () => {
    const r = detect(fx('de-positive/tauchen-wir-ein.md'));
    expect(r.language).toBe('de');
    expect(r.findings.some((f) => f.phrase === 'tauchen wir ein in')).toBe(true);
  });

  it('output shape matches the contract from detect.sh', () => {
    const r = detect(fx('en-positive/delve-into.md'));
    for (const f of r.findings) {
      expect(typeof f.line).toBe('number');
      expect(typeof f.phrase).toBe('string');
      expect(['high', 'medium', 'low']).toContain(f.severity);
      expect(typeof f.matched).toBe('string');
    }
  });
});
