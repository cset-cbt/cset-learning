<script lang="ts">
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import { t } from '$lib/core/i18n';
  import type { UserRole } from '$lib/core/auth/session-user';

  let { role, mobile = false }: { role: UserRole; mobile?: boolean } = $props();

  function isActive(href: string): boolean {
    return page.url.pathname === href || page.url.pathname.startsWith(`${href}/`);
  }

  const coursesHref = resolve('/courses');
  const manageHref = resolve('/manage');
  const adminHref = resolve('/admin/users');
</script>

<nav
  class={mobile ? 'flex overflow-x-auto border-t border-border sm:hidden' : 'hidden sm:flex'}
  aria-label={$t('nav.main')}
>
  <a
    href={resolve('/courses')}
    class="tab-nav-link"
    class:active={isActive(coursesHref)}
    aria-current={isActive(coursesHref) ? 'page' : undefined}
  >
    {$t('nav.courses')}
  </a>
  {#if role !== 'student'}
    <a
      href={resolve('/manage')}
      class="tab-nav-link"
      class:active={isActive(manageHref)}
      aria-current={isActive(manageHref) ? 'page' : undefined}
    >
      {$t('nav.manage')}
    </a>
  {/if}
  {#if role === 'admin'}
    <a
      href={resolve('/admin/users')}
      class="tab-nav-link"
      class:active={isActive(adminHref)}
      aria-current={isActive(adminHref) ? 'page' : undefined}
    >
      {$t('nav.admin')}
    </a>
  {/if}
</nav>
