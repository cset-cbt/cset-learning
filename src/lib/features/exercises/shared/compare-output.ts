export function normalizeOutput(text: string): string {
  const lines = text.replace(/\r\n?/g, '\n').split('\n').map((line) => line.trimEnd());
  while (lines.at(-1) === '') lines.pop();
  return lines.join('\n');
}

export function compareOutput(expected: string, actual: string): boolean {
  return normalizeOutput(expected) === normalizeOutput(actual);
}
