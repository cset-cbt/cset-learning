export function formatPythonError(message: string): string {
  const lines = message.split('\n');
  const entry = lines.findIndex((line) => line.includes('File "main.py"'));
  if (entry < 0) return message;
  return ['Traceback (most recent call last):', ...lines.slice(entry)].join('\n');
}

export function limitText(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max)}\n...(truncated)` : text;
}
