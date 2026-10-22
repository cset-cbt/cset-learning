<script lang="ts">
  import { resolve } from '$app/paths';
  import { Breadcrumb, Button, FormMessage, PageHeader } from 'cset-ui';
  import { isMessageKey, t } from '$lib/core/i18n';
  import LessonEditor from '$lib/features/lessons/components/lesson-editor.svelte';
  import QuizEditor from '$lib/features/quizzes/components/quiz-editor.svelte';
  import ExerciseEditor from '$lib/features/exercises/components/exercise-editor.svelte';
  import type { ExerciseEditorData } from '$lib/features/exercises/shared/contract';
  import type { QuizEditorData } from '$lib/features/quizzes/shared/contract';
  import type { LessonAttachment } from '$lib/features/lessons/server/lesson-service';
  import ItemTitleForm from '$lib/features/courses/components/item-title-form.svelte';
  import type { ActionData, PageData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  type LessonDetail = { bodyMd: string; attachments: LessonAttachment[] };
  function isLessonDetail(detail: PageData['detail']): detail is LessonDetail {
    return 'bodyMd' in detail;
  }
  function isQuizDetail(detail: PageData['detail']): detail is QuizEditorData {
    return 'questions' in detail;
  }

  function isExerciseDetail(detail: PageData['detail']): detail is ExerciseEditorData {
    return 'language' in detail;
  }
</script>

<div class="space-y-6">
  <Breadcrumb
    items={[
      { label: $t('nav.manage'), href: resolve('/manage') },
      { label: data.course.title, href: resolve('/(app)/manage/[courseId]', { courseId: data.course.id }) },
      { label: data.item.title }
    ]}
  />
  <div class="flex flex-wrap items-end justify-between gap-4">
    <PageHeader eyebrow={$t('manage.itemEyebrow')} title={data.item.title}>
      {$t('manage.itemDescription')}
    </PageHeader>
    <Button variant="secondary" href={resolve('/(app)/manage/[courseId]', { courseId: data.course.id })}>
      {$t('common.back')}
    </Button>
  </div>
  <ItemTitleForm title={data.item.title} />
  {#if form?.error}
    <FormMessage variant="error">{$t(isMessageKey(form.error) ? form.error : 'manage.error.generic')}</FormMessage>
  {/if}
  {#if isLessonDetail(data.detail)}
    <LessonEditor detail={data.detail} />
  {:else if isQuizDetail(data.detail)}
    <QuizEditor detail={data.detail} />
  {:else if isExerciseDetail(data.detail)}
    <ExerciseEditor detail={data.detail} />
  {/if}
</div>
