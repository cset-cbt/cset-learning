<script lang="ts">
  let { value, max, label }: { value: number; max: number; label: string } = $props();

  const percent = $derived(max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0);
</script>

<div
  class="h-2 w-full border border-border bg-surface-muted"
  role="progressbar"
  aria-label={label}
  aria-valuemin={0}
  aria-valuemax={max}
  aria-valuenow={value}
>
  <div class="h-full bg-accent-solid" style:width="{percent}%"></div>
</div>
