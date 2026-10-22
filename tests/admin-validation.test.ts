import { describe, expect, it } from 'vitest';
import {
  banSchema,
  parseUserListQuery,
  setPasswordSchema,
  setRoleSchema
} from '../src/lib/features/admin/shared/admin-validation';

describe('admin action schemas', () => {
  it('accepts a known role and rejects unknown roles', () => {
    expect(setRoleSchema.safeParse({ userId: 'u1', role: 'instructor' }).success).toBe(true);
    expect(setRoleSchema.safeParse({ userId: 'u1', role: 'superuser' }).success).toBe(false);
  });

  it('rejects mass-assignment fields on every schema', () => {
    expect(setRoleSchema.safeParse({ userId: 'u1', role: 'student', banned: false }).success).toBe(
      false
    );
    expect(
      setPasswordSchema.safeParse({ userId: 'u1', newPassword: 'longenough1', role: 'admin' })
        .success
    ).toBe(false);
  });

  it('enforces the 8 to 128 character password window', () => {
    const base = { userId: 'u1' };
    expect(setPasswordSchema.safeParse({ ...base, newPassword: 'a'.repeat(7) }).success).toBe(false);
    expect(setPasswordSchema.safeParse({ ...base, newPassword: 'a'.repeat(8) }).success).toBe(true);
    expect(setPasswordSchema.safeParse({ ...base, newPassword: 'a'.repeat(128) }).success).toBe(true);
    expect(setPasswordSchema.safeParse({ ...base, newPassword: 'a'.repeat(129) }).success).toBe(
      false
    );
  });

  it('trims the ban reason and caps it at 200 characters', () => {
    const trimmed = banSchema.parse({ userId: 'u1', banReason: '  spam  ' });
    expect(trimmed.banReason).toBe('spam');
    expect(banSchema.safeParse({ userId: 'u1', banReason: 'x'.repeat(201) }).success).toBe(false);
    expect(banSchema.safeParse({ userId: 'u1' }).success).toBe(true);
  });
});

describe('parseUserListQuery', () => {
  it('defaults to page 1 and an empty search', () => {
    expect(parseUserListQuery(new URLSearchParams())).toEqual({ page: 1, q: '' });
  });

  it('clamps invalid page numbers and trims the search text', () => {
    expect(parseUserListQuery(new URLSearchParams('page=0')).page).toBe(1);
    expect(parseUserListQuery(new URLSearchParams('page=-4')).page).toBe(1);
    expect(parseUserListQuery(new URLSearchParams('page=abc')).page).toBe(1);
    expect(parseUserListQuery(new URLSearchParams('page=3')).page).toBe(3);
    expect(parseUserListQuery(new URLSearchParams('q=%20Ann%20')).q).toBe('Ann');
    expect(parseUserListQuery(new URLSearchParams(`q=${'a'.repeat(300)}`)).q).toHaveLength(100);
  });
});
