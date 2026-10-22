<script lang="ts">
  import { Button, InputField } from 'cset-ui';
  import { t } from '$lib/core/i18n';

  let { course }: { course: { title: string; summary: string; slug: string; coverImageUrl?: string | null } } = $props();
</script>

<form method="POST" action="?/updateCourse" class="grid gap-4 md:grid-cols-2">
  <InputField label={$t('manage.courseTitle')} name="title" value={course.title} required maxlength="120" />
  <InputField label={$t('manage.courseSlug')} name="slug" value={course.slug} required maxlength="80" pattern="[a-z0-9]+(-[a-z0-9]+)*" />
  <InputField label={$t('manage.courseCoverImage')} name="coverImageUrl" value={course.coverImageUrl ?? ''} maxlength={500} placeholder="https://..." />
  <div class="md:col-span-2">
    <InputField label={$t('manage.courseSummary')} name="summary" value={course.summary} maxlength={280} multiline />
  </div>
  <div class="md:col-span-2"><Button type="submit">{$t('common.save')}</Button></div>
</form>
