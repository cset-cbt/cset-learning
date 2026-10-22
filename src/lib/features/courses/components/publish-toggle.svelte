<script lang="ts">
  import { Badge, Button } from 'cset-ui';
  import { t } from '$lib/core/i18n';

  let { status }: { status: 'draft' | 'published' } = $props();
  const nextStatus = $derived(status === 'published' ? 'draft' : 'published');
</script>

<div class="flex flex-wrap items-center gap-3">
  <Badge variant="soft" color={status === 'published' ? 'emerald' : 'amber'}>
    {$t(status === 'published' ? 'manage.status.published' : 'manage.status.draft')}
  </Badge>
  <form method="POST" action="?/setStatus">
    <input type="hidden" name="status" value={nextStatus} />
    <Button type="submit" variant={status === 'published' ? 'secondary' : 'primary'}>
      {$t(status === 'published' ? 'manage.unpublish' : 'manage.publish')}
    </Button>
  </form>
</div>
