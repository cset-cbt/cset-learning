import { error } from '@sveltejs/kit';
import { ForbiddenError, NotFoundError } from '$lib/core/errors';

export function rethrowRouteError(cause: unknown): never {
  if (cause instanceof NotFoundError) error(404, 'Not found');
  if (cause instanceof ForbiddenError) error(403, 'Forbidden');
  throw cause;
}
