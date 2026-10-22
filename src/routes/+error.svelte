<script lang="ts">
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import { Button, Card } from 'cset-ui';
  import { t } from '$lib/core/i18n';

  const messageKey = $derived(
    page.status === 404
      ? 'error.notFound'
      : page.status === 403
        ? 'error.forbidden'
        : 'error.generic'
  );
</script>

<main class="mx-auto flex min-h-[100dvh] w-full max-w-lg items-center px-4">
  <Card class="w-full space-y-4 p-8">
    <p class="mono-label text-xs text-accent">{page.status}</p>
    <h1 class="text-xl font-bold text-ink">{$t(messageKey)}</h1>
    <Button href={resolve('/')} variant="secondary">{$t('error.backHome')}</Button>
  </Card>
</main>
