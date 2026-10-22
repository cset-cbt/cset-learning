import { eq } from 'drizzle-orm';
import type { R2Bucket } from '@cloudflare/workers-types';
import type { LearningDb } from '$lib/core/db/client';
import { user as userTable } from '$lib/core/db/better-auth-schema';
import { ValidationError } from '$lib/core/errors';
import type { SessionUser } from './session-user';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
const MAX_AVATAR_BYTES = 3 * 1024 * 1024; // 3 MB

export async function uploadAvatar(
  db: LearningDb,
  files: R2Bucket,
  user: SessionUser,
  file: File
): Promise<{ avatarUrl: string }> {
  if (!file || file.size === 0) {
    throw new ValidationError('account.error.noFileSelected');
  }
  if (!ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])) {
    throw new ValidationError('account.error.invalidAvatarFormat');
  }

  const r2Key = `avatars/${user.id}.webp`;
  const buffer = await file.arrayBuffer();

  await files.put(r2Key, buffer, {
    httpMetadata: { contentType: file.type }
  });

  const avatarUrl = `/api/avatars/${user.id}?v=${Date.now()}`;

  await db
    .update(userTable)
    .set({ image: avatarUrl, updatedAt: new Date() })
    .where(eq(userTable.id, user.id));

  return { avatarUrl };
}

export async function removeAvatar(
  db: LearningDb,
  files: R2Bucket,
  user: SessionUser
): Promise<void> {
  const r2Key = `avatars/${user.id}.webp`;
  try {
    await files.delete(r2Key);
  } catch {
    // Ignore R2 deletion error if file did not exist
  }

  await db
    .update(userTable)
    .set({ image: null, updatedAt: new Date() })
    .where(eq(userTable.id, user.id));
}
