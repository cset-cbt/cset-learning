<script lang="ts">
  import { t } from '$lib/core/i18n';

  let { onAction }: { onAction: (action: string, param?: string) => void } = $props();
  let headingOpen = $state(false), currentHeading = $state('p');

  function selectHeading(level: 'p' | 'h1' | 'h2' | 'h3') {
    currentHeading = level;
    headingOpen = false;
    onAction('heading', level);
  }

  const headingLabels = $derived<Record<string, string>>({
    p: $t('lesson.toolbar.paragraph'),
    h1: $t('lesson.toolbar.heading1'),
    h2: $t('lesson.toolbar.heading2'),
    h3: $t('lesson.toolbar.heading3')
  });
</script>

<div class="flex flex-wrap items-center gap-1 border-b border-border bg-surface-muted/30 p-2 text-ink">
  <!-- Custom Blueprint Heading Dropdown -->
  <div class="relative mr-1">
    <button
      type="button"
      class="flex h-8 items-center gap-1.5 rounded border border-border bg-surface px-2.5 font-sans text-xs font-semibold text-ink hover:border-accent hover:text-accent cursor-pointer transition-colors"
      onclick={() => (headingOpen = !headingOpen)}
      aria-label={$t('lesson.toolbar.heading')}
    >
      <span>{headingLabels[currentHeading] || $t('lesson.toolbar.paragraph')}</span>
      <svg class="h-3 w-3 text-ink-muted transition-transform {headingOpen ? 'rotate-180' : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6" /></svg>
    </button>

    {#if headingOpen}
      <div class="absolute left-0 top-full z-40 mt-1 w-44 rounded-md border border-border bg-surface p-1 shadow-xl backdrop-blur-md">
        <button type="button" class="flex w-full items-center justify-between rounded px-2.5 py-1.5 text-left text-xs font-semibold text-ink hover:bg-surface-muted hover:text-accent cursor-pointer {currentHeading === 'p' ? 'bg-accent/10 text-accent font-bold' : ''}" onclick={() => selectHeading('p')}>
          <span>{$t('lesson.toolbar.paragraph')}</span>
        </button>
        <button type="button" class="flex w-full items-center justify-between rounded px-2.5 py-1.5 text-left text-xs text-ink hover:bg-surface-muted hover:text-accent cursor-pointer {currentHeading === 'h1' ? 'bg-accent/10 text-accent font-bold' : ''}" onclick={() => selectHeading('h1')}>
          <span class="font-bold text-sm">{$t('lesson.toolbar.heading1')}</span>
          <span class="font-mono text-[0.65rem] text-accent"># H1</span>
        </button>
        <button type="button" class="flex w-full items-center justify-between rounded px-2.5 py-1.5 text-left text-xs text-ink hover:bg-surface-muted hover:text-accent cursor-pointer {currentHeading === 'h2' ? 'bg-accent/10 text-accent font-bold' : ''}" onclick={() => selectHeading('h2')}>
          <span class="font-bold">{$t('lesson.toolbar.heading2')}</span>
          <span class="font-mono text-[0.65rem] text-accent">## H2</span>
        </button>
        <button type="button" class="flex w-full items-center justify-between rounded px-2.5 py-1.5 text-left text-xs text-ink hover:bg-surface-muted hover:text-accent cursor-pointer {currentHeading === 'h3' ? 'bg-accent/10 text-accent font-bold' : ''}" onclick={() => selectHeading('h3')}>
          <span class="font-medium">{$t('lesson.toolbar.heading3')}</span>
          <span class="font-mono text-[0.65rem] text-accent">### H3</span>
        </button>
      </div>
    {/if}
  </div>

  <div class="h-4 w-px bg-border mx-1" aria-hidden="true"></div>

  <!-- Format Group: Bold, Italic, Strike, Code -->
  <button type="button" class="grid h-8 w-8 place-items-center rounded hover:bg-surface hover:text-accent cursor-pointer transition-colors" onclick={() => onAction('bold')} title="{$t('lesson.toolbar.bold')} (Ctrl+B)">
    <span class="font-sans font-bold text-sm">B</span>
  </button>
  <button type="button" class="grid h-8 w-8 place-items-center rounded hover:bg-surface hover:text-accent cursor-pointer transition-colors" onclick={() => onAction('italic')} title="{$t('lesson.toolbar.italic')} (Ctrl+I)">
    <span class="font-serif italic font-bold text-sm">I</span>
  </button>
  <button type="button" class="grid h-8 w-8 place-items-center rounded hover:bg-surface hover:text-accent cursor-pointer transition-colors" onclick={() => onAction('strikethrough')} title={$t('lesson.toolbar.strikethrough')}>
    <span class="font-sans line-through text-xs font-bold">S</span>
  </button>
  <button type="button" class="grid h-8 w-8 place-items-center rounded hover:bg-surface hover:text-accent cursor-pointer transition-colors" onclick={() => onAction('code')} title={$t('lesson.toolbar.code')}>
    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
  </button>

  <div class="h-4 w-px bg-border mx-1" aria-hidden="true"></div>

  <!-- Structure Group: Quote, Lists, Rule -->
  <button type="button" class="grid h-8 w-8 place-items-center rounded hover:bg-surface hover:text-accent cursor-pointer transition-colors" onclick={() => onAction('quote')} title={$t('lesson.toolbar.quote')}>
    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21c3 0 7-1 7-8V5c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v6c0 7 1 8 3 8z" /><path d="M15 21c3 0 7-1 7-8V5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v6c0 7 1 8 3 8z" /></svg>
  </button>
  <button type="button" class="grid h-8 w-8 place-items-center rounded hover:bg-surface hover:text-accent cursor-pointer transition-colors" onclick={() => onAction('bulletList')} title={$t('lesson.toolbar.bulletList')}>
    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
  </button>
  <button type="button" class="grid h-8 w-8 place-items-center rounded hover:bg-surface hover:text-accent cursor-pointer transition-colors" onclick={() => onAction('numberList')} title={$t('lesson.toolbar.numberList')}>
    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="10" y1="6" x2="21" y2="6" /><line x1="10" y1="12" x2="21" y2="12" /><line x1="10" y1="18" x2="21" y2="18" /><path d="M4 6h1v4M4 10h2M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" /></svg>
  </button>
  <button type="button" class="grid h-8 w-8 place-items-center rounded hover:bg-surface hover:text-accent cursor-pointer transition-colors" onclick={() => onAction('taskList')} title={$t('lesson.toolbar.taskList')}>
    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
  </button>
  <button type="button" class="grid h-8 w-8 place-items-center rounded hover:bg-surface hover:text-accent cursor-pointer transition-colors" onclick={() => onAction('hr')} title={$t('lesson.toolbar.hr')}>
    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="2" y1="12" x2="22" y2="12" /></svg>
  </button>

  <div class="h-4 w-px bg-border mx-1" aria-hidden="true"></div>

  <!-- Advanced Group: Math, Code Block, Table, Link, Image -->
  <button type="button" class="flex h-8 items-center gap-1 rounded px-2 hover:bg-surface hover:text-accent cursor-pointer transition-colors font-mono text-xs font-bold" onclick={() => onAction('math')} title={$t('lesson.toolbar.math')}>
    <span>fx</span>
  </button>
  <button type="button" class="grid h-8 w-8 place-items-center rounded hover:bg-surface hover:text-accent cursor-pointer transition-colors" onclick={() => onAction('codeBlock')} title={$t('lesson.toolbar.codeBlock')}>
    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="m10 10-2 2 2 2m4-4 2 2-2 2" /></svg>
  </button>
  <button type="button" class="grid h-8 w-8 place-items-center rounded hover:bg-surface hover:text-accent cursor-pointer transition-colors" onclick={() => onAction('table')} title={$t('lesson.toolbar.table')}>
    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18M3 15h18M9 3v18M15 3v18" /></svg>
  </button>
  <button type="button" class="grid h-8 w-8 place-items-center rounded hover:bg-surface hover:text-accent cursor-pointer transition-colors" onclick={() => onAction('link')} title="{$t('lesson.toolbar.link')} (Ctrl+K)">
    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
  </button>
  <button type="button" class="grid h-8 w-8 place-items-center rounded hover:bg-surface hover:text-accent cursor-pointer transition-colors" onclick={() => onAction('image')} title={$t('lesson.toolbar.image')}>
    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
  </button>
</div>
