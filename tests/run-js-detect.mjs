#!/usr/bin/env node
// run-js-detect.mjs — run the JS detect on a fixture, print output that
// matches detect.sh exactly:
//   # language: en|de
//   # findings: <count>
//   <line>\t<phrase>\t<severity>\t<category>\t<matched>
//
// Must be invoked via tsx so the .ts import resolves:
//   cd web && npx tsx ../tests/run-js-detect.mjs <fixture-path>

import fs from 'node:fs';

const fixturePath = process.argv[2];
if (!fixturePath) {
  console.error('usage: run-js-detect.mjs <fixture-path>');
  process.exit(1);
}
const text = fs.readFileSync(fixturePath, 'utf8');

// Dynamic import so tsx can resolve the .ts source from the web/ workspace
const { detect } = await import('../web/lib/detect.ts');
const result = detect(text);

console.log(`# language: ${result.language}`);
console.log(`# findings: ${result.findings.length}`);
for (const f of result.findings) {
  console.log(`${f.line}\t${f.phrase}\t${f.severity}\t${f.category}\t${f.matched}`);
}
