import { error, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals, params }) => {
  const userId = params.userId;
  if (!userId) error(400, 'User ID is required');

  const files = locals.runtime?.files;
  if (!files) error(500, 'Storage binding is unavailable');

  // Try fetching the user's avatar from R2
  const object = await files.get(`avatars/${userId}.webp`);
  if (!object) {
    error(404, 'Avatar not found');
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
