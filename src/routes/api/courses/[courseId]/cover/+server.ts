import { error, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals, params }) => {
  const courseId = params.courseId;
  if (!courseId) error(400, 'Course ID is required');

  const files = locals.runtime?.files;
  if (!files) error(500, 'Storage binding is unavailable');

  // Fetch course cover from R2
  const object = await files.get(`course-covers/${courseId}.webp`);
  if (!object) {
    error(404, 'Cover image not found');
  }

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

  return new Response(body, {
    headers: {
      'Content-Type': object.httpMetadata?.contentType || 'image/webp',
      'Content-Length': String(object.size),
      'Cache-Control': 'public, max-age=86400, immutable',
      'X-Content-Type-Options': 'nosniff'
    }
  });
};
