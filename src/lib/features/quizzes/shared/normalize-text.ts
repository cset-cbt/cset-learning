export function normalizeAnswerText(value: string, caseSensitive: boolean): string {
  const normalized = value.normalize('NFC').trim().replace(/\s+/gu, ' ');
  return caseSensitive ? normalized : normalized.toLowerCase();
}
