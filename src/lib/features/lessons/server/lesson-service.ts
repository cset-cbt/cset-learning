import { and, asc, eq } from 'drizzle-orm';
import type { R2Bucket } from '@cloudflare/workers-types';
import type { SessionUser } from '$lib/core/auth/session-user';
import type { LearningDb } from '$lib/core/db/client';
import { NotFoundError, ValidationError } from '$lib/core/errors';
import { attachment, courseItem, lesson } from '$lib/core/db/schema';
import { resolveLearnerItem, resolveManagedItem } from '$lib/features/courses/server/item-access';

const FILE_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  txt: 'text/plain; charset=utf-8',
  zip: 'application/zip'
};

export interface LessonAttachment {
  id: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
}

async function listAttachments(db: LearningDb, itemId: string): Promise<LessonAttachment[]> {
  return db
    .select({
      id: attachment.id,
      fileName: attachment.fileName,
      contentType: attachment.contentType,
      sizeBytes: attachment.sizeBytes
    })
    .from(attachment)
    .where(eq(attachment.itemId, itemId))
    .orderBy(asc(attachment.createdAt));
}

async function lessonBody(db: LearningDb, itemId: string): Promise<string> {
  const rows = await db.select({ bodyMd: lesson.bodyMd }).from(lesson).where(eq(lesson.itemId, itemId)).limit(1);
  if (!rows[0]) throw new NotFoundError();
  return rows[0].bodyMd;
}

export async function loadLessonEditor(db: LearningDb, actor: SessionUser, itemId: string) {
  const { item } = await resolveManagedItem(db, actor, itemId);
  if (item.type !== 'lesson') throw new NotFoundError();
  const [bodyMd, attachments] = await Promise.all([lessonBody(db, itemId), listAttachments(db, itemId)]);
  return { bodyMd, attachments };
}

export async function loadLessonPlayer(db: LearningDb, actor: SessionUser, itemId: string, slug: string) {
  const { item } = await resolveLearnerItem(db, actor, itemId, slug);
  if (item.type !== 'lesson') throw new NotFoundError();
  const [bodyMd, attachments] = await Promise.all([lessonBody(db, itemId), listAttachments(db, itemId)]);
  return { bodyMd, attachments };
}

export async function saveLesson(db: LearningDb, actor: SessionUser, itemId: string, bodyMd: string) {
  const { item } = await resolveManagedItem(db, actor, itemId);
  if (item.type !== 'lesson') throw new NotFoundError();
  await db.batch([
    db.update(lesson).set({ bodyMd }).where(eq(lesson.itemId, item.id)),
    db.update(courseItem).set({ updatedAt: new Date() }).where(eq(courseItem.id, item.id))
  ]);
}

export async function addAttachment(db: LearningDb, files: R2Bucket, actor: SessionUser, itemId: string, file: File) {
  const { item } = await resolveManagedItem(db, actor, itemId);
  if (item.type !== 'lesson') throw new NotFoundError();
  if (file.size < 1 || file.size > 10 * 1024 * 1024) {
    throw new ValidationError('lesson.error.fileSize');
  }
  const safeName = sanitizeFileName(file.name);
  const extension = safeName.includes('.') ? safeName.split('.').pop()?.toLowerCase() : undefined;
  const contentType = extension ? FILE_TYPES[extension] : undefined;
  if (!contentType) throw new ValidationError('lesson.error.fileType');
  if (!(await matchesFileType(file, extension))) throw new ValidationError('lesson.error.fileContent');
  const current = await db
    .select({ id: attachment.id })
    .from(attachment)
    .where(eq(attachment.itemId, itemId))
    .limit(20);
  if (current.length >= 20) throw new ValidationError('lesson.error.tooManyFiles');
  const id = crypto.randomUUID();
  const r2Key = `attachments/${itemId}/${id}`;
  await files.put(r2Key, await file.arrayBuffer(), { httpMetadata: { contentType } });
  try {
    await db.insert(attachment).values({
      id,
      itemId,
      fileName: safeName,
      contentType,
      sizeBytes: file.size,
      r2Key,
      uploadedBy: actor.id
    });
  } catch (cause) {
    await files.delete(r2Key);
    throw cause;
  }
  return { id, fileName: safeName, contentType, sizeBytes: file.size } satisfies LessonAttachment;
}

function sanitizeFileName(raw: string): string {
  const basename = raw.replace(/[\\/]/g, '/').split('/').pop() ?? '';
  const safe = basename.replace(/\p{Cc}/gu, '').trim().slice(0, 120);
  if (!safe || safe === '.' || safe === '..') throw new ValidationError('lesson.error.fileName');
  return safe;
}

async function matchesFileType(file: File, extension: string | undefined): Promise<boolean> {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const startsWith = (...values: number[]) => values.every((value, index) => bytes[index] === value);
  if (extension === 'png') return startsWith(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
  if (extension === 'jpg' || extension === 'jpeg') return startsWith(0xff, 0xd8, 0xff);
  if (extension === 'gif') return String.fromCharCode(...bytes.slice(0, 6)).startsWith('GIF8');
  if (extension === 'webp') return String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';
  if (extension === 'pdf') return String.fromCharCode(...bytes.slice(0, 5)) === '%PDF-';
  if (extension === 'zip') return startsWith(0x50, 0x4b) && [0x03, 0x05, 0x07].includes(bytes[2]);
  if (extension === 'txt') return !bytes.includes(0);
  return false;
}

export async function deleteAttachment(db: LearningDb, files: R2Bucket, actor: SessionUser, attachmentId: string) {
  const rows = await db
    .select({ row: attachment, itemId: courseItem.id })
    .from(attachment)
    .innerJoin(courseItem, eq(attachment.itemId, courseItem.id))
    .where(eq(attachment.id, attachmentId))
    .limit(1);
  const found = rows[0];
  if (!found) throw new NotFoundError();
  const { item } = await resolveManagedItem(db, actor, found.itemId);
  if (item.type !== 'lesson') throw new NotFoundError();
  await files.delete(found.row.r2Key);
  await db.delete(attachment).where(and(eq(attachment.id, attachmentId), eq(attachment.itemId, found.itemId)));
}
