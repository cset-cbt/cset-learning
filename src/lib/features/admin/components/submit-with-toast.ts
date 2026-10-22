import type { SubmitFunction } from '@sveltejs/kit';
import { toast } from 'cset-ui';
import { get } from 'svelte/store';
import { isMessageKey, t, type MessageKey } from '$lib/core/i18n';

// `use:enhance` callback shared by the admin forms: toast the outcome, keep the form values and
// refresh the page data. The translator is read when the result arrives, not when the action
// mounts, so the toast follows the language chosen after the page was hydrated. Failure keys
// come from the server and are checked before translation.
export function submitWithToast(successKey: MessageKey, onSuccess?: () => void): SubmitFunction {
  return () =>
    async ({ result, update }) => {
      const translate = get(t);
      if (result.type === 'success') {
        toast.success(translate(successKey));
        onSuccess?.();
      } else if (result.type === 'failure') {
        const key = result.data?.error;
        toast.error(translate(isMessageKey(key) ? key : 'common.error.generic'));
      } else if (result.type === 'error') {
        toast.error(translate('common.error.generic'));
      }
      await update({ reset: false });
    };
}
