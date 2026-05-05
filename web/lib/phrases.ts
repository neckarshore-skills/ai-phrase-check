import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

export type Severity = 'high' | 'medium' | 'low';
export type Category =
  | 'lexical'
  | 'hedging'
  | 'triplet'
  | 'transition'
  | 'sycophantic'
  | 'filler';
export type Language = 'en' | 'de';

export interface Phrase {
  phrase: string;
  language: Language;
  severity: Severity;
  category: Category;
  pattern: string;
  suggestions: string[];
  notes?: string;
}

const REPO_ROOT = path.resolve(process.cwd(), '..');
const LIST_PATHS: Record<Language, string> = {
  en: path.join(REPO_ROOT, 'references', 'ai-phrases-en.md'),
  de: path.join(REPO_ROOT, 'references', 'ai-phrases-de.md'),
};

/**
 * Reads a phrase list (Markdown with multi-doc YAML frontmatter)
 * and returns a typed array of Phrase objects.
 *
 * Format: blocks separated by `---`, each block is YAML frontmatter
 * (delimited internally by another pair of `---`).
 */
export function getPhrases(language: Language): Phrase[] {
  const filePath = LIST_PATHS[language];
  const raw = fs.readFileSync(filePath, 'utf8');

  // Strip Markdown header (everything before the first `---` line)
  const firstDelimiter = raw.indexOf('\n---\n');
  if (firstDelimiter === -1) return [];
  const content = raw.slice(firstDelimiter + 1);

  // Split into YAML blocks. Our format is `---\n<yaml>\n---`.
  const blocks: Phrase[] = [];
  const blockRegex = /---\n([\s\S]*?)\n---/g;
  let m: RegExpExecArray | null;
  while ((m = blockRegex.exec(content)) !== null) {
    try {
      const parsed = matter(`---\n${m[1]}\n---\n`);
      const data = parsed.data as Partial<Phrase>;
      if (data.phrase && data.pattern && data.severity && data.suggestions) {
        blocks.push(data as Phrase);
      }
    } catch {
      continue;
    }
  }
  return blocks;
}
