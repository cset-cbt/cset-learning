<script lang="ts">
  import { goto, invalidateAll } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { Avatar, Badge, DropdownMenu } from 'cset-ui';
  import { authClient } from '$lib/core/auth/auth-client';
  import type { SessionUser } from '$lib/core/auth/session-user';
  import { t } from '$lib/core/i18n';

  let { user }: { user: SessionUser } = $props();
  let open = $state(false);

  async function signOut() {
    await authClient.signOut();
    await invalidateAll();
    await goto(resolve('/login'));
  }

  const roleColor = $derived<'rose' | 'purple' | 'emerald'>(
    user.role === 'admin' ? 'rose' : user.role === 'instructor' ? 'purple' : 'emerald'
  );
</script>

<DropdownMenu items={[]} bind:open align="end" sideOffset={8} class="w-72 sm:w-[22rem] p-2 shadow-2xl">
  <div
    slot="trigger"
    class="flex h-10 w-72 sm:w-[22rem] items-center justify-between gap-2 rounded-full border border-border-strong bg-surface px-3 py-1 text-xs shadow-xs transition-colors hover:border-accent hover:bg-surface-muted/60 cursor-pointer select-none"
    aria-label={$t('nav.userMenu')}
  >
    <div class="flex min-w-0 items-center gap-2.5">
      <Avatar src={user.image} name={user.name} size="xs" />
      <span class="truncate font-sans text-xs font-semibold text-ink">
        {user.name}
      </span>
    </div>
    <div class="flex shrink-0 items-center gap-2">
      <Badge variant="soft" color={roleColor} size="sm">
        {$t(`account.role.${user.role}`)}
      </Badge>
      <svg
        class="h-3.5 w-3.5 shrink-0 text-ink-muted transition-transform duration-200 {open
          ? 'rotate-180'
          : ''}"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  </div>

  <div class="space-y-1">
    <!-- Profile header matching the trigger capsule -->
    <div class="rounded-lg border border-border bg-surface-muted/40 p-3">
      <div class="flex items-center gap-3">
        <Avatar src={user.image} name={user.name} size="md" />
        <div class="min-w-0 flex-1">
          <p class="truncate font-sans text-xs font-bold text-ink leading-tight">{user.name}</p>
          <p class="truncate font-mono text-[0.68rem] text-ink-muted mt-0.5">{user.email}</p>
          <div class="mt-1.5">
            <Badge variant="soft" color={roleColor} size="sm">
              {$t(`account.role.${user.role}`)}
            </Badge>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation links -->
    <div class="space-y-0.5 pt-1">
      <a
        href={resolve('/(app)/account')}
        class="flex items-center gap-2.5 rounded-lg px-3 py-2 font-mono text-xs text-ink transition-colors hover:bg-surface-muted hover:text-accent"
        onclick={() => (open = false)}
      >
        <svg class="h-4 w-4 text-ink-muted shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
        </svg>
        <span>{$t('nav.account')}</span>
      </a>

      {#if user.role !== 'student'}
        <a
          href={resolve('/(app)/manage')}
          class="flex items-center gap-2.5 rounded-lg px-3 py-2 font-mono text-xs text-ink transition-colors hover:bg-surface-muted hover:text-accent"
          onclick={() => (open = false)}
        >
          <svg class="h-4 w-4 text-ink-muted shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" /><path d="M6 6h10" /><path d="M6 10h10" />
          </svg>
          <span>{$t('nav.manage')}</span>
        </a>
      {/if}

      {#if user.role === 'admin'}
        <a
          href={resolve('/(app)/admin/users')}
          class="flex items-center gap-2.5 rounded-lg px-3 py-2 font-mono text-xs text-ink transition-colors hover:bg-surface-muted hover:text-accent"
          onclick={() => (open = false)}
        >
          <svg class="h-4 w-4 text-ink-muted shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span>{$t('nav.admin')}</span>
        </a>
      {/if}
    </div>

    <!-- Sign out -->
    <div class="border-t border-border pt-1">
      <button
        type="button"
        class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 font-mono text-xs text-rose-500 transition-colors hover:bg-rose-500/10 cursor-pointer text-left"
        onclick={signOut}
      >
        <svg class="h-4 w-4 text-rose-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" />
        </svg>
        <span>{$t('nav.signOut')}</span>
      </button>
    </div>
  </div>
</DropdownMenu>
