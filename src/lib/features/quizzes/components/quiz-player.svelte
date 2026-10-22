<script lang="ts">
  import type { QuizPlayerData } from '../shared/contract';

  let { detail }: { detail: QuizPlayerData } = $props();
</script>

<div data-scaffold="quiz-player" data-size={JSON.stringify(detail).length}></div>
