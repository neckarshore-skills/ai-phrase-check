import Anthropic from '@anthropic-ai/sdk';
import type { Finding } from './detect';
import type { Language } from './phrases';

export interface Suggestion {
  finding: Finding;
  alternatives: string[];
}

const SYSTEM_PROMPT = `You suggest alternatives for AI-typical phrases.
For each finding given, propose 1-3 concise alternatives that fit the surrounding context.
Output strict JSON: {"suggestions": [{"line": <n>, "phrase": "<phrase>", "alternatives": ["<alt1>", "<alt2>"]}, ...]}.
No prose, no markdown — only the JSON object.`;

export async function llmSuggest(
  apiKey: string,
  text: string,
  findings: Finding[],
  language: Language,
): Promise<Suggestion[]> {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

  const userPrompt = [
    `Language: ${language}`,
    '',
    'Text:',
    '```',
    text,
    '```',
    '',
    'Findings:',
    findings.map((f) => `- L${f.line} "${f.phrase}" matched: "${f.matched}"`).join('\n'),
  ].join('\n');

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const block = response.content[0];
  if (block.type !== 'text') {
    throw new Error('Unexpected response type from Anthropic API');
  }
  const parsed = JSON.parse(block.text) as {
    suggestions: Array<{ line: number; phrase: string; alternatives: string[] }>;
  };

  return parsed.suggestions
    .map((s) => {
      const finding = findings.find((f) => f.line === s.line && f.phrase === s.phrase);
      return finding ? { finding, alternatives: s.alternatives } : null;
    })
    .filter((s): s is Suggestion => s !== null);
}
