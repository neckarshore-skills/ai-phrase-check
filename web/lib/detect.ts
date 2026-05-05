import { getPhrases, type Phrase, type Language } from './phrases';

export interface Finding {
  line: number;
  phrase: string;
  severity: 'high' | 'medium' | 'low';
  category: string;
  matched: string;
}

export interface DetectResult {
  language: Language;
  findings: Finding[];
}

function scanWithList(text: string, phrases: Phrase[]): Finding[] {
  const findings: Finding[] = [];
  const lines = text.split('\n');
  for (const phrase of phrases) {
    // POSIX-extended pattern from the YAML; JS RegExp accepts the same syntax
    // for the constructs we use (\b, character classes, anchors).
    const re = new RegExp(phrase.pattern, 'g');
    for (let i = 0; i < lines.length; i++) {
      let mm: RegExpExecArray | null;
      re.lastIndex = 0;
      while ((mm = re.exec(lines[i])) !== null) {
        findings.push({
          line: i + 1,
          phrase: phrase.phrase,
          severity: phrase.severity,
          category: phrase.category,
          matched: mm[0],
        });
        // Avoid infinite loops on zero-width matches
        if (mm.index === re.lastIndex) re.lastIndex++;
      }
    }
  }
  // Sort to match detect.sh ordering: by line, then by phrase definition order
  findings.sort((a, b) => a.line - b.line);
  return findings;
}

export function detect(text: string): DetectResult {
  const en = scanWithList(text, getPhrases('en'));
  const de = scanWithList(text, getPhrases('de'));
  const language: Language = de.length > en.length ? 'de' : 'en';
  return { language, findings: language === 'de' ? de : en };
}
