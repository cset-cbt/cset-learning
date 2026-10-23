import { eq } from 'drizzle-orm';
import type { AuthInstance } from '$lib/core/auth/auth';
import { isUserRole, type SessionUser, type UserRole } from '$lib/core/auth/session-user';
import type { LearningDb } from '$lib/core/db/client';
import { user } from '$lib/core/db/better-auth-schema';
import { NotFoundError, ValidationError } from '$lib/core/errors';
import type { AdminUserPage } from '../shared/admin-types';
import { ADMIN_PAGE_SIZE, type UserListQuery } from '../shared/admin-validation';
import { writeAudit } from './audit-service';

// The acting administrator cannot demote or ban themselves: that would lock the last admin out.
function assertNotSelf(actor: SessionUser, targetId: string): void {
  if (actor.id === targetId) throw new ValidationError('admin.error.self');
}

export async function listAdminUsers(
  auth: AuthInstance,
  headers: Headers,
  query: UserListQuery
): Promise<AdminUserPage> {
  const result = await auth.api.listUsers({
    headers,
    query: {
      limit: ADMIN_PAGE_SIZE,
      offset: (query.page - 1) * ADMIN_PAGE_SIZE,
      sortBy: 'createdAt',
      sortDirection: 'desc',
      ...(query.q
        ? { searchField: 'email' as const, searchOperator: 'contains' as const, searchValue: query.q }
        : {})
    }
  });
  return {
    total: result.total,
    users: result.users.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      role: isUserRole(row.role) ? row.role : 'student',
      image: row.image ?? null,
      banned: row.banned === true,
      banReason: row.banReason ?? null,
      createdAt: new Date(row.createdAt).toISOString()
    }))
  };
}

export async function setUserRole(
  db: LearningDb,
  actor: SessionUser,
  input: { userId: string; role: UserRole }
): Promise<void> {
  assertNotSelf(actor, input.userId);
  const updated = await db
    .update(user)
    .set({ role: input.role, updatedAt: new Date() })
    .where(eq(user.id, input.userId))
    .returning({ id: user.id });
  if (updated.length === 0) throw new NotFoundError();
  await writeAudit(db, actor.id, 'admin.user.set_role', input.userId, { role: input.role });
}

export async function resetUserPassword(
  auth: AuthInstance,
  headers: Headers,
  db: LearningDb,
  actor: SessionUser,
  input: { userId: string; newPassword: string }
): Promise<void> {
  await auth.api.setUserPassword({
    headers,
    body: { userId: input.userId, newPassword: input.newPassword }
  });
  await auth.api.revokeUserSessions({
    headers,
    body: { userId: input.userId }
  });
  await writeAudit(db, actor.id, 'admin.user.set_password', input.userId);
}

export async function banUser(
  auth: AuthInstance,
  headers: Headers,
  db: LearningDb,
  actor: SessionUser,
  input: { userId: string; banReason?: string }
): Promise<void> {
  assertNotSelf(actor, input.userId);
  await auth.api.banUser({
    headers,
    body: { userId: input.userId, ...(input.banReason ? { banReason: input.banReason } : {}) }
  });
  await writeAudit(db, actor.id, 'admin.user.ban', input.userId, {
    reason: input.banReason ?? null
  });
}

export async function unbanUser(
  auth: AuthInstance,
  headers: Headers,
  db: LearningDb,
  actor: SessionUser,
  input: { userId: string }
): Promise<void> {
  assertNotSelf(actor, input.userId);
  await auth.api.unbanUser({ headers, body: { userId: input.userId } });
  await writeAudit(db, actor.id, 'admin.user.unban', input.userId);
}
