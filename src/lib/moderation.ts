const FLAGGED_KEYWORDS = [
  'racial slur',
  'kill you',
  'child porn',
  'underage sex',
  'home address',
  'revenge porn',
  'lynch',
  'nazi hate',
  'shoot up',
  'dox'
];

export function moderateContent(content: string) {
  const normalized = content.toLowerCase();
  const hits = FLAGGED_KEYWORDS.filter((word) => normalized.includes(word));

  return {
    flagged: hits.length > 0,
    hits
  };
}
