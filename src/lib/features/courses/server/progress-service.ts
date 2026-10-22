import type { LearningDb } from '$lib/core/db/client';
import type { SessionUser } from '$lib/core/auth/session-user';
import { NotFoundError } from '$lib/core/errors';
import { itemProgress } from '../schema';
import type { OutlineSection } from './outline-service';
import { resolveLearnerItem } from './item-access';

export function getContinueItemId(
  outline: Pick<OutlineSection, 'items'>[],
  completed: ReadonlySet<string>
): string | null {
  const itemIds = outline.flatMap((section) => section.items.map((item) => item.id));
  return itemIds.find((itemId) => !completed.has(itemId)) ?? itemIds[0] ?? null;
}

export async function markItemComplete(
  db: LearningDb,
  actor: SessionUser,
  itemId: string,
  slug?: string
): Promise<void> {
  const { item } = await resolveLearnerItem(db, actor, itemId, slug);
  if (item.type !== 'lesson') throw new NotFoundError();
  await db.insert(itemProgress).values({ userId: actor.id, itemId }).onConflictDoNothing();
}

