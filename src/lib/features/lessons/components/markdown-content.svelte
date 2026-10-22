<script lang="ts">
  import 'katex/dist/katex.min.css';
  import { Skeleton } from 'cset-ui';
  import { renderMarkdown } from '../markdown/render-markdown';

  let { source }: { source: string } = $props();

  let html = $state<string | null>(null);
  let failed = $state(false);
  let latest = 0;

  // A slower, older render must never overwrite a newer one (live preview while typing).
  $effect(() => {
    const current = ++latest;
    renderMarkdown(source)
      .then((result) => {
        if (current !== latest) return;
        html = result;
        failed = false;
      })
      .catch(() => {
        if (current === latest) failed = true;
      });
  });
</script>

{#if failed}
  <pre class="whitespace-pre-wrap text-sm text-ink">{source}</pre>
{:else if html === null}
  <Skeleton variant="text" lines={4} />
{:else}
  <!-- The HTML is the DOMPurify-sanitized output of renderMarkdown (raw HTML is disabled). -->
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  <div class="lesson-prose">{@html html}</div>
{/if}
