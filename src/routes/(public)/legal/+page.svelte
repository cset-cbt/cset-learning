<script lang="ts">
  import { resolve } from '$app/paths';
  import { Button, Card, PageHeader, Table } from 'cset-ui';
  import { LEGAL_COMPONENTS } from '$lib/core/legal/legal-components';
  import { t } from '$lib/core/i18n';

  const SOURCE_URL = 'https://github.com/cset-cbt/cset-learning';
</script>

<div class="space-y-6">
  <PageHeader eyebrow={$t('legal.eyebrow')} title={$t('legal.title')}>
    {$t('legal.intro')}
  </PageHeader>

  <Card class="space-y-2 p-6">
    <p class="text-sm text-ink">{$t('legal.appSource')}</p>
    <a
      href={SOURCE_URL}
      class="mono-label text-xs text-accent hover:underline"
      rel="noopener noreferrer"
      target="_blank"
    >
      {SOURCE_URL}
    </a>
  </Card>

  <Table striped>
    <thead>
      <tr class="mono-label border-b border-border text-[0.68rem] text-ink-muted">
        <th class="px-4 py-3">{$t('legal.col.component')}</th>
        <th class="px-4 py-3">{$t('legal.col.license')}</th>
        <th class="px-4 py-3">{$t('legal.col.source')}</th>
      </tr>
    </thead>
    <tbody>
      {#each LEGAL_COMPONENTS as component (component.name)}
        <tr class="border-b border-border align-top">
          <td class="px-4 py-3 font-semibold text-ink">{component.name}</td>
          <td class="px-4 py-3 text-ink-muted">{component.license}</td>
        <!-- eslint-disable svelte/no-navigation-without-resolve -- external source URLs, not app routes -->
          <td class="px-4 py-3">
            <a
              href={component.sourceUrl}
              class="break-all text-accent hover:underline"
              rel="noopener noreferrer"
              target="_blank"
            >
              {component.sourceUrl}
            </a>
        <!-- eslint-enable svelte/no-navigation-without-resolve -->
          </td>
        </tr>
      {/each}
    </tbody>
  </Table>

  <Button href={resolve('/')} variant="secondary">{$t('legal.back')}</Button>
</div>
