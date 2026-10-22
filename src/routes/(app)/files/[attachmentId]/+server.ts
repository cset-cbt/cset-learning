import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { requireUser } from '$lib/core/auth/guards';
import { canAccessItems } from '$lib/core/policy/access-control';
import { attachment, course, courseItem } from '$lib/core/db/schema';
import { isEnrolled } from '$lib/features/courses/server/item-access';
import type { RequestHandler } from './$types';

const INLINE_CONTENT_TYPES: Record<string, true> = {
  'application/pdf': true,
  'image/png': true,
  'image/jpeg': true,
  'image/webp': true,
  'image/gif': true
};

export const GET: RequestHandler = async ({ locals, params, url }) => {
  const actor = requireUser(locals, url);
  const rows = await locals.runtime.db
    .select({ attachment, item: courseItem, course })
    .from(attachment)
    .innerJoin(courseItem, eq(attachment.itemId, courseItem.id))
    .innerJoin(course, eq(courseItem.courseId, course.id))
    .where(eq(attachment.id, params.attachmentId))
    .limit(1);
  const row = rows[0];
  if (!row) error(404, 'Not found');
  const enrolled = await isEnrolled(locals.runtime.db, actor.id, row.course.id);
  if (!canAccessItems(actor, row.course, enrolled)) error(404, 'Not found');
  const object = await locals.runtime.files.get(row.attachment.r2Key);
  if (!object) error(404, 'Not found');
  const reader = object.body.getReader();
  const body = new ReadableStream<Uint8Array>({
    async pull(controller) {
      const chunk = await reader.read();
      if (chunk.done) controller.close();
      else controller.enqueue(chunk.value);
    },
    cancel(reason) {
      return reader.cancel(reason);
    }
  });
  const disposition = INLINE_CONTENT_TYPES[row.attachment.contentType] ? 'inline' : 'attachment';
  const fileName = encodeURIComponent(row.attachment.fileName).replace(/[!'()*]/g, (character) =>
    `%${character.charCodeAt(0).toString(16).toUpperCase()}`
  );
  return new Response(body, {
    headers: {
      'Content-Type': row.attachment.contentType,
      'Content-Length': String(row.attachment.sizeBytes),
      'Content-Disposition': `${disposition}; filename*=UTF-8''${fileName}`,
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "sandbox; default-src 'none'",
      'Cache-Control': 'private, max-age=300'
    }
  });
};
