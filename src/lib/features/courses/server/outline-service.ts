import { and, asc, eq, sql } from 'drizzle-orm';
import type { R2Bucket } from '@cloudflare/workers-types';
import type { SessionUser } from '$lib/core/auth/session-user';
import type { LearningDb } from '$lib/core/db/client';
import { attachment, courseItem, courseSection, exercise, lesson, quiz } from '$lib/core/db/schema';
import { resolveManagedCourse } from './item-access';
import { attachmentKeysForSection, deleteR2Objects } from './course-service';

export interface OutlineItem {
  id: string;
  type: 'lesson' | 'quiz' | 'exercise';
  title: string;
  position: number;
}

export interface OutlineSection {
  id: string;
  title: string;
  position: number;
  items: OutlineItem[];
}

export async function getOutline(db: LearningDb, courseId: string): Promise<OutlineSection[]> {
  const sections = await db
    .select({ id: courseSection.id, title: courseSection.title, position: courseSection.position })
    .from(courseSection)
    .where(eq(courseSection.courseId, courseId))
    .orderBy(asc(courseSection.position));
  const items = await db
    .select({
      id: courseItem.id,
      sectionId: courseItem.sectionId,
      type: courseItem.type,
      title: courseItem.title,
      position: courseItem.position
    })
    .from(courseItem)
    .where(eq(courseItem.courseId, courseId))
    .orderBy(asc(courseItem.position));
  return sections.map((section) => ({
    ...section,
    items: items.filter((item) => item.sectionId === section.id).map(({ sectionId: _sectionId, ...item }) => item)
  }));
}

export async function addSection(db: LearningDb, actor: SessionUser, courseId: string, title: string) {
  const managed = await resolveManagedCourse(db, actor, { courseId });
  await db.insert(courseSection).values({
    courseId: managed.id,
    title,
    position: sql`(SELECT COALESCE(MAX(position), 0) + 1 FROM course_section WHERE course_id = ${managed.id})`
  });
}

export async function renameSection(db: LearningDb, actor: SessionUser, sectionId: string, title: string) {
  await resolveManagedCourse(db, actor, { sectionId });
  await db.update(courseSection).set({ title }).where(eq(courseSection.id, sectionId));
}

export async function moveSection(
  db: LearningDb,
  actor: SessionUser,
  sectionId: string,
  direction: 'up' | 'down'
) {
  const managed = await resolveManagedCourse(db, actor, { sectionId });
  const rows = await db
    .select({ id: courseSection.id, position: courseSection.position })
    .from(courseSection)
    .where(eq(courseSection.courseId, managed.id))
    .orderBy(asc(courseSection.position));
  const index = rows.findIndex((row) => row.id === sectionId);
  const neighbor = rows[index + (direction === 'up' ? -1 : 1)];
  if (!neighbor) return;
  const current = rows[index];
  await db.batch([
    db.update(courseSection).set({ position: neighbor.position }).where(eq(courseSection.id, current.id)),
    db.update(courseSection).set({ position: current.position }).where(eq(courseSection.id, neighbor.id))
  ]);
}

export async function deleteSection(
  db: LearningDb,
  files: R2Bucket,
  actor: SessionUser,
  sectionId: string
) {
  await resolveManagedCourse(db, actor, { sectionId });
  const keys = await attachmentKeysForSection(db, sectionId);
  await deleteR2Objects(files, keys);
  await db.delete(courseSection).where(eq(courseSection.id, sectionId));
}

export async function addItem(
  db: LearningDb,
  actor: SessionUser,
  input: { sectionId: string; type: 'lesson' | 'quiz' | 'exercise'; title: string }
): Promise<string> {
  const managed = await resolveManagedCourse(db, actor, { sectionId: input.sectionId });
  const itemId = crypto.randomUUID();
  const insertItem = db.insert(courseItem).values({
    id: itemId,
    courseId: managed.id,
    sectionId: input.sectionId,
    type: input.type,
    title: input.title,
    position: sql`(SELECT COALESCE(MAX(position), 0) + 1 FROM course_item WHERE section_id = ${input.sectionId})`
  });
  const detail =
    input.type === 'lesson'
      ? db.insert(lesson).values({ itemId })
      : input.type === 'quiz'
        ? db.insert(quiz).values({ itemId, passPercent: 70, maxAttempts: null })
        : db.insert(exercise).values({ itemId, language: 'python', promptMd: '', starterCode: '', timeLimitMs: 3000 });
  await db.batch([insertItem, detail]);
  return itemId;
}

export async function renameItem(db: LearningDb, actor: SessionUser, itemId: string, title: string) {
  await resolveManagedCourse(db, actor, { itemId });
  await db.update(courseItem).set({ title, updatedAt: new Date() }).where(eq(courseItem.id, itemId));
}

export async function moveItem(
  db: LearningDb,
  actor: SessionUser,
  itemId: string,
  direction: 'up' | 'down'
) {
  const managed = await resolveManagedCourse(db, actor, { itemId });
  const currentRows = await db
    .select({ id: courseItem.id, sectionId: courseItem.sectionId, position: courseItem.position })
    .from(courseItem)
    .where(and(eq(courseItem.id, itemId), eq(courseItem.courseId, managed.id)))
    .limit(1);
  const current = currentRows[0];
  if (!current) return;
  const rows = await db
    .select({ id: courseItem.id, position: courseItem.position })
    .from(courseItem)
    .where(eq(courseItem.sectionId, current.sectionId))
    .orderBy(asc(courseItem.position));
  const index = rows.findIndex((row) => row.id === itemId);
  const neighbor = rows[index + (direction === 'up' ? -1 : 1)];
  if (!neighbor) return;
  const row = rows[index];
  await db.batch([
    db.update(courseItem).set({ position: neighbor.position, updatedAt: new Date() }).where(eq(courseItem.id, row.id)),
    db.update(courseItem).set({ position: row.position, updatedAt: new Date() }).where(eq(courseItem.id, neighbor.id))
  ]);
}

export async function deleteItem(db: LearningDb, files: R2Bucket, actor: SessionUser, itemId: string) {
  await resolveManagedCourse(db, actor, { itemId });
  const keys = await db.select({ key: attachment.r2Key }).from(attachment).where(eq(attachment.itemId, itemId));
  await deleteR2Objects(files, keys.map((row) => row.key));
  await db.delete(courseItem).where(eq(courseItem.id, itemId));
}
