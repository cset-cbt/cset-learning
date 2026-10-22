import { error, fail } from '@sveltejs/kit';

// Services throw these typed errors. `message` of a ValidationError is an i18n key so the UI
// can localize it; NotFound and Forbidden never carry user-visible text.
export class NotFoundError extends Error {
  constructor(message = 'Not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class ValidationError extends Error {
  readonly details: string[];

  constructor(messageKey: string, details: string[] = []) {
    super(messageKey);
    this.name = 'ValidationError';
    this.details = details;
  }
}

// Maps a thrown service error to the SvelteKit action result. Unknown errors are rethrown so
// SvelteKit renders its generic 500 page without leaking internals.
export function actionFailure(cause: unknown) {
  if (cause instanceof ValidationError) {
    return fail(400, { error: cause.message, details: cause.details });
  }
  if (cause instanceof NotFoundError) error(404, 'Not found');
  if (cause instanceof ForbiddenError) error(403, 'Forbidden');
  throw cause;
}
