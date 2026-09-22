export const BLOCKED_WORDS: string[] = [
  'stupid',
  'dumb',
  'idiot'
];

const INJECTION_PATTERNS: RegExp[] = [
  /\b(ignore|disregard|forget)\b.{0,25}\b(all|any|prior|previous|above|earlier|the)\b.{0,15}\b(instructions?|rules?|prompt|guidelines?)\b/i,
  /\b(reveal|show|print|repeat|output|leak)\b.{0,20}\b(system prompt|your (instructions|rules|prompt)|reference material)\b/i,
  /\byou are now\b/i,
  /\bact as (a|an|if)\b/i,
  /\bpretend (you('re| are)|to be)\b/i,
  /\b(developer|debug|god|admin) mode\b/i,
  /\bjailbreak\b/i,
  /\bnew (instructions?|rules?|system prompt)\s*:/i,
  /\bdisregard (your|the) (rules?|instructions?)\b/i,
];

export function isBlocked(text: string): boolean {
  const lower = text.toLowerCase();

  const hitsWordlist = BLOCKED_WORDS.some((word) => {
    const escaped = word.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\b${escaped}\\b`, 'i').test(lower);
  });
  if (hitsWordlist) return true;

  return INJECTION_PATTERNS.some((pattern) => pattern.test(text));
}
