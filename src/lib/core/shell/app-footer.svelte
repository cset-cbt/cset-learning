<script lang="ts">
  import { resolve } from '$app/paths';
  import { t } from '$lib/core/i18n';

  const SOURCE_URL = 'https://github.com/cset-cbt/cset-learning';
</script>

<footer class="mt-auto border-t border-border bg-surface/40">
  <div
    class="flex w-full flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-8 lg:px-12"
  >
    <div class="mono-label flex items-center gap-5 text-[0.68rem]">
      <a
        href={SOURCE_URL}
        class="text-ink-muted hover:text-ink"
        rel="noopener noreferrer"
        target="_blank"
      >
        {$t('footer.source')}
      </a>
      <a href={resolve('/legal')} class="text-ink-muted hover:text-ink">
        {$t('footer.licenses')}
      </a>
    </div>
  </div>
</footer>
