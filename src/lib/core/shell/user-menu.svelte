<script lang="ts">
  import { goto, invalidateAll } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { DropdownMenu } from 'cset-ui';
  import { authClient } from '$lib/core/auth/auth-client';
  import type { SessionUser } from '$lib/core/auth/session-user';
  import { t } from '$lib/core/i18n';

  let { user }: { user: SessionUser } = $props();

  async function signOut() {
    await authClient.signOut();
    await invalidateAll();
    await goto(resolve('/login'));
  }

  const items = $derived([
    { id: 'account', label: $t('nav.account'), onSelect: () => goto(resolve('/account')) },
    'separator' as const,
    { id: 'sign-out', label: $t('nav.signOut'), danger: true, onSelect: signOut }
  ]);
</script>

<DropdownMenu {items}>
  <span
    slot="trigger"
    class="mono-label inline-flex max-w-[10rem] items-center gap-2 border border-border-strong px-3 py-1.5 text-[0.7rem] text-ink"
    aria-label={$t('nav.userMenu')}
  >
    <span class="truncate">{user.name}</span>
  </span>
</DropdownMenu>
