import { z } from 'zod';
import { USER_ROLES } from '$lib/core/auth/session-user';

// Every schema is strict: unexpected fields (for example `role` on a password reset) are
// rejected instead of silently ignored, which blocks mass-assignment attempts.
const userId = z.string().min(1).max(64);

export const setRoleSchema = z.object({ userId, role: z.enum(USER_ROLES) }).strict();

export const setPasswordSchema = z
  .object({ userId, newPassword: z.string().min(8).max(128) })
  .strict();

export const banSchema = z
  .object({ userId, banReason: z.string().trim().max(200).optional() })
  .strict();

export const unbanSchema = z.object({ userId }).strict();

export const ADMIN_PAGE_SIZE = 20;

export interface UserListQuery {
  page: number;
  q: string;
}

// Page numbers and the search text come straight from the URL: clamp and trim them.
export function parseUserListQuery(params: URLSearchParams): UserListQuery {
  const rawPage = Number.parseInt(params.get('page') ?? '1', 10);
  const page = Number.isFinite(rawPage) && rawPage >= 1 && rawPage <= 100000 ? rawPage : 1;
  const q = (params.get('q') ?? '').trim().slice(0, 100);
  return { page, q };
}
