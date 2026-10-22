<script lang="ts">
  import { resolve } from '$app/paths';
  import { Button, Card } from 'cset-ui';
  import type { SessionUser } from '$lib/core/auth/session-user';
  import { t } from '$lib/core/i18n';

  let { user }: { user: SessionUser } = $props();

  const privilegeKey = $derived<'account.privileges.admin' | 'account.privileges.instructor' | 'account.privileges.student'>(
    user.role === 'admin'
      ? 'account.privileges.admin'
      : user.role === 'instructor'
        ? 'account.privileges.instructor'
        : 'account.privileges.student'
  );
</script>

<Card class="space-y-4 p-6">
  <div>
    <h2 class="text-lg font-bold text-ink">{$t('account.privileges.title')}</h2>
    <p class="mt-1 text-sm text-ink-muted leading-relaxed">
      {$t(privilegeKey)}
    </p>
  </div>

  <div class="flex flex-wrap gap-2.5 pt-2 border-t border-border">
    <Button href={resolve('/(app)/courses')} variant="secondary">
      {$t('nav.courses')}
    </Button>
    {#if user.role !== 'student'}
      <Button href={resolve('/(app)/manage')} variant="secondary">
        {$t('nav.manage')}
      </Button>
    {/if}
    {#if user.role === 'admin'}
      <Button href={resolve('/(app)/admin/users')} variant="secondary">
        {$t('nav.admin')}
      </Button>
    {/if}
  </div>
</Card>
