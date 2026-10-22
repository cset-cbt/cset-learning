import { describe, expect, it } from 'vitest';
import { getContinueItemId } from '../src/lib/features/courses/server/progress-service';

const outline = [
  { id: 'section-a', title: 'A', position: 1, items: [{ id: 'item-a', type: 'lesson' as const, title: 'A', position: 1 }, { id: 'item-b', type: 'quiz' as const, title: 'B', position: 2 }] },
  { id: 'section-b', title: 'B', position: 2, items: [{ id: 'item-c', type: 'exercise' as const, title: 'C', position: 1 }] }
];

describe('getContinueItemId', () => {
  it('returns the first uncompleted item in outline order', () => {
    expect(getContinueItemId(outline, new Set(['item-a']))).toBe('item-b');
  });

  it('returns the first item when everything is complete', () => {
    expect(getContinueItemId(outline, new Set(['item-a', 'item-b', 'item-c']))).toBe('item-a');
  });

  it('returns null for an empty outline', () => {
    expect(getContinueItemId([], new Set())).toBeNull();
  });
});
