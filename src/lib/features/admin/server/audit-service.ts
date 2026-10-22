import { auditLog } from '$lib/core/db/audit-schema';
import type { LearningDb } from '$lib/core/db/client';

// Metadata must never contain secrets (passwords, tokens): callers pass identifiers only.
export async function writeAudit(
  db: LearningDb,
  actorId: string,
  action: string,
  targetId: string,
  metadata: Record<string, string | number | boolean | null> = {}
): Promise<void> {
  await db.insert(auditLog).values({
    actorId,
    action,
    targetId,
    metadata: JSON.stringify(metadata)
  });
}
