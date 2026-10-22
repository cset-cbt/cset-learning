const DECIMAL_PATTERN = /^[+-]?(\d+([.]\d*)?|[.]\d+)([eE][+-]?\d+)?$/;

export function parseDecimal(raw: string): number | null {
  const value = raw.trim().replaceAll(' ', '');
  if (!value || (value.includes('.') && value.includes(','))) return null;
  const normalized = value.replace(',', '.');
  if (!DECIMAL_PATTERN.test(normalized)) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}
