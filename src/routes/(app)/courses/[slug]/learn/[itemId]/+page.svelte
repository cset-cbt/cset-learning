<script lang="ts">
  import { resolve } from '$app/paths';
  import { Breadcrumb, Button, Collapsible, PageHeader } from 'cset-ui';
  import { t } from '$lib/core/i18n';
  import PlayerSidebar from '$lib/features/courses/components/player-sidebar.svelte';
  import LessonView from '$lib/features/lessons/components/lesson-view.svelte';
  import QuizPlayer from '$lib/features/quizzes/components/quiz-player.svelte';
  import ExercisePlayer from '$lib/features/exercises/components/exercise-player.svelte';
  import type { ExercisePlayerData } from '$lib/features/exercises/shared/contract';
  import type { QuizPlayerData } from '$lib/features/quizzes/shared/contract';
  import type { LessonAttachment } from '$lib/features/lessons/server/lesson-service';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
  type LessonDetail = { bodyMd: string; attachments: LessonAttachment[] };
  function isLessonDetail(detail: PageData['detail']): detail is LessonDetail {
    return 'bodyMd' in detail;
  }
  function isQuizDetail(detail: PageData['detail']): detail is QuizPlayerData {
    return 'questions' in detail;
  }
  function isExerciseDetail(detail: PageData['detail']): detail is ExercisePlayerData {
    return 'language' in detail;
  }
</script>

<div class="space-y-6">
  <Breadcrumb
    items={[
      { label: data.course.title, href: resolve('/(app)/courses/[slug]', { slug: data.course.slug }) },
      { label: data.item.title }
    ]}
  />
  <div class="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
    <div class="lg:hidden">
      <Collapsible title={$t('courses.outline')}>
        <PlayerSidebar
          sections={data.outline}
          slug={data.course.slug}
          currentItemId={data.item.id}
          completedItemIds={data.completedItemIds}
        />
      </Collapsible>
    </div>
    <div class="hidden lg:block">
      <PlayerSidebar
        sections={data.outline}
        slug={data.course.slug}
        currentItemId={data.item.id}
        completedItemIds={data.completedItemIds}
      />
    </div>
    <section class="min-w-0 space-y-6">
      <PageHeader eyebrow={$t('courses.playerEyebrow')} title={data.item.title} />
      {#if isLessonDetail(data.detail)}
        <LessonView detail={data.detail} completed={data.completed} />
      {:else if isQuizDetail(data.detail)}
        <QuizPlayer detail={data.detail} />
      {:else if isExerciseDetail(data.detail)}
        <ExercisePlayer detail={data.detail} />
      {/if}
      <nav class="flex flex-wrap justify-between gap-3 border-t border-border pt-5" aria-label={$t('courses.itemNavigation')}>
        {#if data.previousItemId}
          <Button
            variant="secondary"
            href={resolve('/(app)/courses/[slug]/learn/[itemId]', { slug: data.course.slug, itemId: data.previousItemId })}
          >
            {$t('common.previous')}
          </Button>
        {:else}
          <span></span>
        {/if}
        {#if data.nextItemId}
          <Button
            href={resolve('/(app)/courses/[slug]/learn/[itemId]', { slug: data.course.slug, itemId: data.nextItemId })}
          >
            {$t('common.next')}
          </Button>
        {/if}
      </nav>
    </section>
  </div>
</div>
